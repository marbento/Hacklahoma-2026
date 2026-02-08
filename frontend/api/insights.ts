// frontend/api/insights.ts
import { api } from "./client";

export interface DashboardGoal { id: string; title: string; target: number; unit: string; progress: number; met: boolean; streak: number; }
export interface DashboardAssignment { id: string; title: string; course: string; due_at?: string; days_left?: number; has_study_plan: boolean; time_spent: number; }
export interface Dashboard {
  user_name: string; date: string; goals: DashboardGoal[]; goals_completed: number;
  goals_total: number; upcoming_assignments: DashboardAssignment[]; assignments_count: number;
}
export interface NudgeData {
  title: string; subtitle: string; current_goal?: string; upcoming_assignment?: string;
  assignment_due?: string; redirect_links: Array<{ label: string; url: string }>; encouragement: string;
}

export interface BankedSteps {
  date: string;
  banked_steps: number;
  steps_from_time: number;
  steps_from_goals: number;
  productive_minutes: number;
  completed_goals: number;
}

export interface DailySteps {
  date: string;
  steps_from_time: number;
  steps_from_goals: number;
  total_steps: number;
  productive_minutes: number;
  completed_goals: number;
}

export interface ScreenTimeAnalysis {
  date: string;
  total_minutes: number;
  productive_minutes: number;
  unproductive_minutes: number;
  net_minutes: number;
  steps_from_time: number;
  app_breakdown: Array<{
    app: string;
    duration_minutes: number;
    wasted_minutes: number;
    productive_minutes: number;
    waste_score: number;
    category: string;
    is_productive: boolean;
  }>;
}

export const getDashboard = () => api.get<Dashboard>("/insights/dashboard");
export const getNudgeData = () => api.get<NudgeData>("/insights/nudge");
export const getEncouragement = () => api.get<{ encouragement: string }>("/insights/encouragement");
export const getEncouragementAudio = () => api.get<{ audio_base64: string; text: string }>("/insights/encouragement/audio");
export const getDailyBriefingAudio = () => api.get<{ audio_base64: string; script: string }>("/insights/daily-briefing/audio");
export const getBankedSteps = () => api.get<BankedSteps>("/insights/banked-steps");
export const getDailySteps = (date: string) => api.get<DailySteps>(`/insights/daily-steps/${date}`);
export const getScreenTimeAnalysis = (date: string) => api.get<ScreenTimeAnalysis>(`/insights/screen-time-analysis/${date}`);
