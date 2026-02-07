import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { DailyScreenTime, Goal, Settings } from './types';

type PersistedState = {
  goals: Goal[];
  settings: Settings;
  /** Last N days of screen time for progress charts. */
  screenTimeHistory: DailyScreenTime[];
};

type StoreState = PersistedState & {
  // Actions: goals
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  setGoals: (goals: Goal[]) => void;

  // Actions: settings
  setSettings: (updates: Partial<Settings>) => void;

  // Actions: screen time history (append today's summary from mock or real)
  appendScreenTimeDay: (day: DailyScreenTime) => void;
  setScreenTimeHistory: (history: DailyScreenTime[]) => void;
};

const defaultSettings: Settings = {
  notificationsEnabled: true,
  locationEnabled: false,
  voiceEnabled: true,
  calendarConnected: false,
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      goals: [],
      settings: defaultSettings,
      screenTimeHistory: [],

      addGoal: (goal) =>
        set((state) => ({
          goals: [
            ...state.goals,
            {
              ...goal,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),

      removeGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),

      setGoals: (goals) => set({ goals }),

      setSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      appendScreenTimeDay: (day) =>
        set((state) => {
          const filtered = state.screenTimeHistory.filter(
            (d) => d.date !== day.date
          );
          const next = [...filtered, day].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          return { screenTimeHistory: next.slice(0, 30) }; // keep last 30 days
        }),

      setScreenTimeHistory: (history) => set({ screenTimeHistory: history }),
    }),
    {
      name: 'productivity-coach-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        goals: state.goals,
        settings: state.settings,
        screenTimeHistory: state.screenTimeHistory,
      }),
    }
  )
);
