// frontend/hooks/useGoals.ts
import { useState, useEffect, useCallback } from "react";
import { getGoals, createGoal, logGoalProgress, deleteGoal, Goal, GoalLogResult } from "../api";

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => { fetch(); }, []);

  const create = useCallback(async (goal: Parameters<typeof createGoal>[0]) => {
    const res = await createGoal(goal);
    await fetch(true);
    return res;
  }, [fetch]);

  const log = useCallback(async (goalId: string, value: number = 1): Promise<GoalLogResult> => {
    const res = await logGoalProgress(goalId, value);
    await fetch(true);
    return res;
  }, [fetch]);

  const remove = useCallback(async (goalId: string) => {
    await deleteGoal(goalId);
    await fetch(true);
  }, [fetch]);

  const refresh = useCallback(() => { setRefreshing(true); fetch(); }, [fetch]);

  return { goals, loading, refreshing, create, log, remove, refresh };
}
