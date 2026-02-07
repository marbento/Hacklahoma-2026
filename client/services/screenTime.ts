import type { DailyScreenTime, ScreenTimeEntry } from '@/store/types';

/** Mock app definitions: name and category. */
const MOCK_APPS: { appName: string; category: ScreenTimeEntry['category'] }[] = [
  { appName: 'Instagram', category: 'social' },
  { appName: 'TikTok', category: 'entertainment' },
  { appName: 'YouTube', category: 'entertainment' },
  { appName: 'Twitter', category: 'social' },
  { appName: 'Snapchat', category: 'social' },
  { appName: 'Reddit', category: 'social' },
  { appName: 'Chrome', category: 'productivity' },
  { appName: 'Gmail', category: 'productivity' },
  { appName: 'Slack', category: 'productivity' },
  { appName: 'Canvas', category: 'education' },
  { appName: 'Notes', category: 'productivity' },
  { appName: 'Netflix', category: 'entertainment' },
  { appName: 'Spotify', category: 'entertainment' },
  { appName: 'Duolingo', category: 'education' },
  { appName: 'Safari', category: 'productivity' },
];

/**
 * Generate mock screen time entries for a given day.
 * Uses a simple deterministic seed from the date string so the same date yields the same mock data.
 */
function generateMockEntriesForDate(date: string): ScreenTimeEntry[] {
  const baseSeed = date.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rng = (min: number, max: number, i: number) => {
    const x = Math.sin(baseSeed * 9999 + i * 1.1) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  const count = 5 + rng(0, 5, 0); // 5–10 apps per day
  const withRand = MOCK_APPS.map((app, i) => ({ app, r: rng(0, 999, i) }));
  const shuffled = withRand.sort((a, b) => a.r - b.r).map((x) => x.app);
  const chosen = shuffled.slice(0, count);

  return chosen.map((app, index) => ({
    appName: app.appName,
    category: app.category,
    minutes: 5 + rng(0, 55, index),
  }));
}

/**
 * Get mock screen time for a single day (today by default).
 * Returns entries and total minutes. Does not persist; use store.appendScreenTimeDay to save.
 */
export function getMockScreenTimeForDay(date?: string): DailyScreenTime {
  const d = date ?? new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const entries = generateMockEntriesForDate(d);
  const totalMinutes = entries.reduce((sum, e) => sum + e.minutes, 0);
  return { date: d, entries, totalMinutes };
}

/**
 * Get mock screen time for the last N days (for charts and history).
 * Each day gets its own deterministic mock data.
 */
export function getMockScreenTimeHistory(days: number = 7): DailyScreenTime[] {
  const result: DailyScreenTime[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    result.push(getMockScreenTimeForDay(dateStr));
  }

  return result.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
