// frontend/hooks/useGoals.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { NativeModules, Platform } from "react-native";
import {
  createGoal,
  deleteGoal,
  getGoals,
  Goal,
  GoalLogResult,
  HealthMetric,
  logGoalProgress,
  syncGoalProgress,
  updateGoal,
} from "../api/goals";
import { ActivitySummary, healthKit } from "../services/healthKitService";
import { refreshBankedSteps } from "./useBankedSteps";

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activitySummary, setActivitySummary] =
    useState<ActivitySummary | null>(null);
  const syncingRef = useRef(false);
  const bootstrappedRef = useRef(false);

  // ── Fetch goals from backend ────────────────────────────────
  const fetch = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getGoals();
      setGoals(data);
    } catch {
      if (!silent) setGoals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ── Bootstrap: auto-create Apple ring goals if user has none ──
  const bootstrapAppleRings = useCallback(async () => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    // Bail if native module not available
    if (!healthKit.isAvailable()) return;

    try {
      await healthKit.requestAuth([
        "active_calories",
        "exercise_minutes",
        "stand_hours",
        "steps",
        "sleep_duration",
      ]);

      const summary = await healthKit.queryActivitySummary();
      if (summary) setActivitySummary(summary);

      // Check which auto-tracked goals already exist
      const current = await getGoals();
      const existingMetrics = new Set(
        current.filter((g) => g.auto_track).map((g) => g.metric),
      );

      const ringGoals: Array<{
        metric: HealthMetric;
        title: string;
        target: number;
        unit: string;
        category: string;
      }> = [];

      // If we have activity summary (Apple Watch), use ring targets
      if (summary) {
        if (!existingMetrics.has("active_calories") && summary.moveGoal > 0) {
          ringGoals.push({
            metric: "active_calories",
            title: `Burn ${Math.round(summary.moveGoal)} cal (Move Ring)`,
            target: Math.round(summary.moveGoal),
            unit: "kcal",
            category: "fitness",
          });
        }
        if (
          !existingMetrics.has("exercise_minutes") &&
          summary.exerciseGoal > 0
        ) {
          ringGoals.push({
            metric: "exercise_minutes",
            title: `Exercise ${Math.round(summary.exerciseGoal)} min`,
            target: Math.round(summary.exerciseGoal),
            unit: "min",
            category: "fitness",
          });
        }
        if (!existingMetrics.has("stand_hours") && summary.standGoal > 0) {
          ringGoals.push({
            metric: "stand_hours",
            title: `Stand ${Math.round(summary.standGoal)} hours`,
            target: Math.round(summary.standGoal),
            unit: "hrs",
            category: "fitness",
          });
        }
      }

      // Always add steps (works from iPhone, no Watch needed)
      if (!existingMetrics.has("steps")) {
        ringGoals.push({
          metric: "steps",
          title: "Daily Steps",
          target: 8000,
          unit: "steps",
          category: "fitness",
        });
      }

      // Add sleep goal (8 hours default)
      if (!existingMetrics.has("sleep_duration")) {
        ringGoals.push({
          metric: "sleep_duration",
          title: "Sleep 8 hours",
          target: 8,
          unit: "hrs",
          category: "sleep",
        });
      }

      for (const g of ringGoals) {
        try {
          await createGoal({
            title: g.title,
            metric: g.metric,
            auto_track: true,
            target_value: g.target,
            target_unit: g.unit,
            category: g.category,
            frequency: "daily",
          });
        } catch {
          // Goal may already exist, ignore
        }
      }
    } catch (e) {
      console.warn("HealthKit bootstrap error:", e);
    }
  }, []);

  // ── HealthKit sync: query device + push to backend ──────────
  const syncHealthKit = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;

    try {
      const summary = await healthKit.queryActivitySummary();
      if (summary) setActivitySummary(summary);

      const currentGoals = await getGoals();
      const autoGoals = currentGoals.filter(
        (g) => g.auto_track && g.metric !== "manual",
      );

      if (autoGoals.length === 0) return;

      const metrics = autoGoals.map((g) => g.metric as HealthMetric);
      const uniqueMetrics = [...new Set(metrics)].filter(
        (m) => m !== "screentime",
      );
      if (uniqueMetrics.length > 0) {
        await healthKit.requestAuth(uniqueMetrics);
      }

      const logs: Array<{ goal_id: string; value: number; source: string }> =
        [];
      for (const goal of autoGoals) {
        if (goal.metric === "screentime") continue;
        try {
          const value = await healthKit.queryMetric(
            goal.metric as HealthMetric,
          );
          logs.push({ goal_id: goal.id, value, source: "healthkit" });
        } catch {
          // Skip failed metrics
        }
      }

      if (logs.length > 0) {
        await syncGoalProgress(logs);
      }
    } catch {
      // Sync failed silently
    } finally {
      syncingRef.current = false;
    }
  }, []);

  // ── Initial load ────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      await fetch();

      // Only attempt HealthKit if native module actually exists
      try {
        if (Platform.OS === "ios" && NativeModules.TrailHealthKit) {
          await bootstrapAppleRings();
          await syncHealthKit();
          await fetch(true);
        }
      } catch (e) {
        console.warn("HealthKit init skipped:", e);
      }
    })();
  }, []);

  // ── CRUD operations ─────────────────────────────────────────
  const create = useCallback(
    async (goal: Parameters<typeof createGoal>[0]) => {
      const res = await createGoal(goal);
      if (goal.auto_track && goal.metric && goal.metric !== "manual") {
        try {
          await healthKit.requestAuth([goal.metric as HealthMetric]);
        } catch {
          // Auth failed, goal still created
        }
      }
      await fetch(true);
      return res;
    },
    [fetch],
  );

  const log = useCallback(
    async (
      goalId: string,
      value: number = 1,
      notes?: string,
    ): Promise<GoalLogResult> => {
      const res = await logGoalProgress(goalId, value, notes, "manual");
      await fetch(true);

      // 🔥 REFRESH BANKED STEPS IMMEDIATELY AFTER LOGGING!
      // This updates the banked steps globally so all screens see the change
      await refreshBankedSteps();

      return res;
    },
    [fetch],
  );

  const update = useCallback(
    async (goalId: string, data: Partial<Goal>) => {
      await updateGoal(goalId, data);
      await fetch(true);
    },
    [fetch],
  );

  const remove = useCallback(
    async (goalId: string) => {
      await deleteGoal(goalId);
      await fetch(true);
    },
    [fetch],
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await syncHealthKit();
    await fetch();

    // Also refresh banked steps when goals are refreshed
    await refreshBankedSteps();
  }, [fetch, syncHealthKit]);

  return {
    goals,
    loading,
    refreshing,
    activitySummary,
    create,
    log,
    update,
    remove,
    refresh,
    syncHealthKit,
  };
}
