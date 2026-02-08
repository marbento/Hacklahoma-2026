// frontend/api/goals.ts
import { api } from "./client";

export interface Goal {
  id: string; title: string; description?: string; category: string;
  frequency: string; target_value: number; target_unit: string;
  is_active: boolean; current_streak: number; longest_streak: number;
  total_completions: number; today_progress: number; created_at: string;
}
export interface GoalLogResult { id: string; today_total: number; target: number; met: boolean; }

export const getGoals = () => api.get<Goal[]>("/goals/");
export const createGoal = (goal: { title: string; description?: string; category?: string; frequency?: string; target_value?: number; target_unit?: string }) =>
  api.post<{ id: string }>("/goals/", goal);
export const deleteGoal = (id: string) => api.delete(`/goals/${id}`);
export const logGoalProgress = (goalId: string, value: number, notes?: string) =>
  api.post<GoalLogResult>("/goals/log", { goal_id: goalId, value, notes });
