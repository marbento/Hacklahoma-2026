/**
 * Shared types for the productivity coach app store and services.
 */

export type Goal = {
  id: string;
  title: string;
  targetMinutes?: number;
  dueDate?: string; // ISO date
  linkedIntegration?: 'canvas' | 'calendar' | null;
  completed?: boolean;
  createdAt: string; // ISO
};

export type Settings = {
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  voiceEnabled: boolean;
  /** Canvas base URL (e.g. https://canvas.instructure.com) */
  canvasBaseUrl?: string;
  /** Whether user has connected Google Calendar */
  calendarConnected?: boolean;
};

export type ScreenTimeCategory =
  | 'social'
  | 'entertainment'
  | 'productivity'
  | 'education'
  | 'other';

export type ScreenTimeEntry = {
  appName: string;
  packageName?: string; // Android; optional for mock
  category: ScreenTimeCategory;
  minutes: number;
};

/** Per-day screen time summary (for charts and persistence). */
export type DailyScreenTime = {
  date: string; // YYYY-MM-DD
  entries: ScreenTimeEntry[];
  totalMinutes: number;
};
