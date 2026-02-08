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

export const getDashboard = () => api.get<Dashboard>("/insights/dashboard");
export const getNudgeData = () => api.get<NudgeData>("/insights/nudge");
export const getEncouragement = () => api.get<{ encouragement: string }>("/insights/encouragement");
export const getEncouragementAudio = () => api.get<{ audio_base64: string; text: string }>("/insights/encouragement/audio");
export const getDailyBriefingAudio = () => api.get<{ audio_base64: string; script: string }>("/insights/daily-briefing/audio");
