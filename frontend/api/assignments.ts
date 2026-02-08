// frontend/api/assignments.ts
import { api } from "./client";

export interface SubTask { title: string; description: string; estimated_minutes: number; resources: string[]; is_completed: boolean; }
export interface StudyPlan { assignment_id: string; estimated_total_minutes: number; key_concepts: string[]; subtasks: SubTask[]; encouragement: string; }
export interface Assignment {
  id: string; course_name: string; title: string; description?: string;
  due_at?: string; points_possible?: number;
  status: "upcoming" | "in_progress" | "submitted" | "graded" | "missed";
  grade?: number; time_spent_minutes: number; study_plan?: StudyPlan; days_until_due?: number;
}

export const getAssignments = () => api.get<Assignment[]>("/assignments/");
export const syncCanvas = () => api.post<{ synced: number }>("/assignments/sync-canvas");
export const generateStudyPlan = (id: string) => api.post<StudyPlan>(`/assignments/${id}/study-plan`);
export const logStudyTime = (id: string, minutes: number) => api.post(`/assignments/${id}/log-time?minutes=${minutes}`);
