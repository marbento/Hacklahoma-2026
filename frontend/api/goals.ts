// frontend/api/goals.ts
import { api } from "./client";

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

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  frequency: string;
  target_value: number;
  target_unit: string;
  // HealthKit
  metric: HealthMetric;
  auto_track: boolean;
  // Time-bounded
  deadline?: string;
  total_target?: number;
  total_progress: number;
  // Progress
  is_active: boolean;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  today_progress: number;
  period_progress: number;
  created_at: string;
}

export interface GoalLogResult {
  id: string;
  today_total: number;
  period_total: number;
  target: number;
  met: boolean;
}

export interface SyncResult {
  synced: number;
  results: Array<{
    goal_id: string;
    log_id?: string;
    period_total: number;
    target: number;
    met: boolean;
    error?: string;
  }>;
}

// ── CRUD ─────────────────────────────────────────────────────────

export const getGoals = () => api.get<Goal[]>("/goals/");

export const createGoal = (goal: {
  title: string;
  description?: string;
  category?: string;
  frequency?: string;
  target_value?: number;
  target_unit?: string;
  metric?: HealthMetric;
  auto_track?: boolean;
  deadline?: string;
  total_target?: number;
}) => api.post<{ id: string }>("/goals/", goal);

export const updateGoal = (id: string, update: Partial<Goal>) =>
  api.put(`/goals/${id}`, update);

export const deleteGoal = (id: string) => api.delete(`/goals/${id}`);

// ── Logging ──────────────────────────────────────────────────────

export const logGoalProgress = (
  goalId: string,
  value: number,
  notes?: string,
  source: string = "manual",
) =>
  api.post<GoalLogResult>("/goals/log", {
    goal_id: goalId,
    value,
    notes,
    source,
  });

// ── HealthKit Bulk Sync ──────────────────────────────────────────

export const syncGoalProgress = (
  logs: Array<{
    goal_id: string;
    value: number;
    date?: string;
    source?: string;
  }>,
) => api.post<SyncResult>("/goals/sync", { logs });

// ── History ──────────────────────────────────────────────────────

export interface GoalHistory {
  goal_id: string;
  title: string;
  target_value: number;
  target_unit: string;
  days: number;
  history: Array<{
    date: string;
    value: number;
    logs_count: number;
    completed: boolean;
  }>;
}

export interface CompletedGoal {
  id: string;
  title: string;
  category: string;
  points: number;
  completed_at: string;
  progress: number;
  target: number;
  unit: string;
}

export interface CompletedToday {
  date: string;
  completed_count: number;
  total_steps: number;
  goals: CompletedGoal[];
}

export const getGoalHistory = (goalId: string, days: number = 7) =>
  api.get<GoalHistory>(`/goals/history/${goalId}?days=${days}`);

export const getCompletedToday = () =>
  api.get<CompletedToday>("/goals/completed-today");
