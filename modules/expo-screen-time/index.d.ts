export function requestAuthorization(): Promise<{ status: string }>;
export function checkAuthorizationStatus(): Promise<{ status: string }>;
export function getAppUsage(
  startTime: number,
  endTime: number,
): Promise<Record<string, { timeInForeground: number }>>;
