import type { DailyScreenTime, ScreenTimeCategory } from '@/store/types';

export type Insight = {
  suggestion: string;
  affirmation: string;
};

function sumByCategory(
  entries: DailyScreenTime['entries'],
  category: ScreenTimeCategory
): number {
  return entries
    .filter((e) => e.category === category)
    .reduce((sum, e) => sum + e.minutes, 0);
}

/**
 * Rule-based insights from today's screen time.
 * Evaluates 2–3 rules in order; first match wins. Fallback if none match.
 */
export function getInsight(data: DailyScreenTime): Insight {
  const { entries, totalMinutes } = data;
  const socialMinutes = sumByCategory(entries, 'social');
  const entertainmentMinutes = sumByCategory(entries, 'entertainment');
  const productivityMinutes = sumByCategory(entries, 'productivity');

  const socialPlusEnt = socialMinutes + entertainmentMinutes;

  // Rule 1: High social/entertainment
  if (socialPlusEnt > 0.6 * totalMinutes || socialPlusEnt > 90) {
    return {
      suggestion:
        'Consider a short break from social and entertainment apps.',
      affirmation: 'Small steps lead to big changes.',
    };
  }

  // Rule 2: Low productivity
  if (productivityMinutes < 30 && totalMinutes > 60) {
    return {
      suggestion: 'Block 30 minutes for focused work today.',
      affirmation: 'You have time for what matters.',
    };
  }

  // Rule 3: High total screen time
  if (totalMinutes > 240) {
    return {
      suggestion:
        "You've been on screen a lot today. A short walk could help.",
      affirmation: 'Rest is part of progress.',
    };
  }

  // Fallback
  return {
    suggestion: 'Keep a healthy balance of focus and breaks today.',
    affirmation: 'You are making progress.',
  };
}
