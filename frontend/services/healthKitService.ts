// frontend/services/healthKitService.ts
// TypeScript wrapper for TrailHealthKit native module

import { NativeModules, Platform } from "react-native";

const { TrailHealthKit } = NativeModules;

export type HealthMetric =
  | "steps"
  | "active_calories"
  | "exercise_minutes"
  | "stand_hours"
  | "distance_walk_run"
  | "flights_climbed"
  | "workout_count"
  | "sleep_duration"
  | "mindful_minutes"
  | "water_intake"
  | "resting_heart_rate"
  | "hrv"
  | "vo2max"
  | "manual"
  | "screentime";

interface MetricDef {
  hkType: string;
  unit: string;
  label: string;
  emoji: string;
  defaultTarget: number;
  period: "daily" | "weekly";
}

export const METRIC_DEFS: Record<string, MetricDef> = {
  steps: {
    hkType: "steps",
    unit: "steps",
    label: "Steps",
    emoji: "🚶",
    defaultTarget: 8000,
    period: "daily",
  },
  active_calories: {
    hkType: "active_calories",
    unit: "kcal",
    label: "Active Calories",
    emoji: "🔥",
    defaultTarget: 500,
    period: "daily",
  },
  exercise_minutes: {
    hkType: "exercise_minutes",
    unit: "min",
    label: "Exercise Minutes",
    emoji: "⏱️",
    defaultTarget: 30,
    period: "daily",
  },
  stand_hours: {
    hkType: "stand_hours",
    unit: "hrs",
    label: "Stand Hours",
    emoji: "🧍",
    defaultTarget: 8,
    period: "daily",
  },
  distance_walk_run: {
    hkType: "distance_walk_run",
    unit: "mi",
    label: "Distance (mi)",
    emoji: "🏃",
    defaultTarget: 2,
    period: "daily",
  },
  flights_climbed: {
    hkType: "flights_climbed",
    unit: "flights",
    label: "Flights Climbed",
    emoji: "🪜",
    defaultTarget: 10,
    period: "daily",
  },
  workout_count: {
    hkType: "workout",
    unit: "workouts",
    label: "Workouts",
    emoji: "💪",
    defaultTarget: 4,
    period: "weekly",
  },
  sleep_duration: {
    hkType: "sleep",
    unit: "hrs",
    label: "Sleep (hours)",
    emoji: "😴",
    defaultTarget: 7,
    period: "daily",
  },
  mindful_minutes: {
    hkType: "mindful_minutes",
    unit: "min",
    label: "Mindful Minutes",
    emoji: "🧘",
    defaultTarget: 10,
    period: "daily",
  },
  water_intake: {
    hkType: "water_intake",
    unit: "fl oz",
    label: "Water (fl oz)",
    emoji: "💧",
    defaultTarget: 64,
    period: "daily",
  },
  resting_heart_rate: {
    hkType: "resting_heart_rate",
    unit: "bpm",
    label: "Resting HR",
    emoji: "❤️",
    defaultTarget: 0,
    period: "daily",
  },
  hrv: {
    hkType: "hrv",
    unit: "ms",
    label: "HRV",
    emoji: "💓",
    defaultTarget: 0,
    period: "daily",
  },
  vo2max: {
    hkType: "vo2max",
    unit: "mL/kg/min",
    label: "VO2 Max",
    emoji: "🫁",
    defaultTarget: 0,
    period: "daily",
  },
};

// Permission types needed per metric
const READ_TYPES: Record<string, string[]> = {
  steps: ["steps"],
  active_calories: ["active_calories"],
  exercise_minutes: ["exercise_minutes"],
  stand_hours: ["stand_hours"],
  distance_walk_run: ["distance_walk_run"],
  flights_climbed: ["flights_climbed"],
  workout_count: ["workout"],
  sleep_duration: ["sleep"],
  mindful_minutes: ["mindful_minutes"],
  water_intake: ["water_intake"],
  resting_heart_rate: ["resting_heart_rate"],
  hrv: ["hrv"],
  vo2max: ["vo2max"],
};

export interface ActivitySummary {
  activeCalories: number;
  exerciseMinutes: number;
  standHours: number;
  moveGoal: number;
  exerciseGoal: number;
  standGoal: number;
}

class HealthKitService {
  private authorized = false;

  isAvailable(): boolean {
    return Platform.OS === "ios" && !!TrailHealthKit;
  }

  async requestAuth(metrics: HealthMetric[]): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      const types = [
        ...new Set(
          metrics
            .filter((m) => m !== "manual" && m !== "screentime")
            .flatMap((m) => READ_TYPES[m] || []),
        ),
      ];
      if (types.length === 0) return true;
      this.authorized = await TrailHealthKit.requestAuthorization(types);
      return this.authorized;
    } catch {
      return false;
    }
  }

  async queryMetric(metric: HealthMetric, date?: Date): Promise<number> {
    if (!this.isAvailable() || metric === "manual" || metric === "screentime")
      return 0;
    const d = (date || new Date()).toISOString();
    const def = METRIC_DEFS[metric];
    if (!def) return 0;

    try {
      switch (metric) {
        case "sleep_duration":
          return await TrailHealthKit.querySleepDuration(d);
        case "stand_hours":
          return await TrailHealthKit.queryStandHours(d);
        case "workout_count": {
          const start = startOfWeek().toISOString();
          return await TrailHealthKit.queryWorkoutCount(start, d);
        }
        case "resting_heart_rate":
        case "hrv":
        case "vo2max":
          return (
            (await TrailHealthKit.queryLatestValue(def.hkType, def.unit)) ?? 0
          );
        default:
          return await TrailHealthKit.queryDailySum(def.hkType, d, def.unit);
      }
    } catch {
      return 0;
    }
  }

  async queryPeriod(
    metric: HealthMetric,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    if (!this.isAvailable() || metric === "manual" || metric === "screentime")
      return 0;
    const def = METRIC_DEFS[metric];
    if (!def) return 0;
    try {
      if (metric === "workout_count") {
        return await TrailHealthKit.queryWorkoutCount(
          startDate.toISOString(),
          endDate.toISOString(),
        );
      }
      return await TrailHealthKit.queryPeriodSum(
        def.hkType,
        startDate.toISOString(),
        endDate.toISOString(),
        def.unit,
      );
    } catch {
      return 0;
    }
  }

  /**
   * Query Apple's Activity Summary — returns the user's Move/Exercise/Stand
   * goals AND current progress. This is what the Apple Fitness rings show.
   */
  async queryActivitySummary(date?: Date): Promise<ActivitySummary | null> {
    if (!this.isAvailable()) return null;
    try {
      const d = (date || new Date()).toISOString();
      const result = await TrailHealthKit.queryActivitySummary(d);
      return result || null;
    } catch {
      return null;
    }
  }
}

function startOfWeek(): Date {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const healthKit = new HealthKitService();
