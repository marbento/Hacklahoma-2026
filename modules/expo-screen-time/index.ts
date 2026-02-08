import { requireNativeModule } from 'expo-modules-core';

export interface AuthStatus {
  status: 'approved' | 'denied' | 'notDetermined' | 'unknown';
}

export interface AppUsageData {
  [packageName: string]: {
    packageName: string;
    timeInForeground: number;
    lastTimeUsed: number;
  };
}

const ScreenTimeModule = requireNativeModule('ScreenTime');

export async function requestAuthorization(): Promise<AuthStatus> {
  return await ScreenTimeModule.requestAuthorization();
}

export async function checkAuthorizationStatus(): Promise<AuthStatus> {
  return await ScreenTimeModule.checkAuthorizationStatus();
}

export async function getAppUsage(
  startTime: number,
  endTime: number
): Promise<AppUsageData> {
  return await ScreenTimeModule.getAppUsage(startTime, endTime);
}

export default {
  requestAuthorization,
  checkAuthorizationStatus,
  getAppUsage,
};
