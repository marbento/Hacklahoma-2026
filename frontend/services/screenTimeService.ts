// services/screenTimeService.ts
// Wrapper around react-native-device-activity native module
const DeviceActivity = require("react-native-device-activity");

export const ScreenTimeService = {
  getAuthStatus(): number {
    return DeviceActivity.getAuthorizationStatus();
  },

  async requestAuth(): Promise<number> {
    return DeviceActivity.requestAuthorization();
  },

  saveSelection(selection: string): void {
    DeviceActivity.userDefaultsSave(selection, "familyActivitySelection");
  },

  updateNudge(title: string, subtitle: string): void {
    DeviceActivity.updateShieldConfiguration({ title, subtitle });
  },

  blockApps(): void {
    DeviceActivity.blockApps();
  },

  unblockApps(): void {
    DeviceActivity.unblockAllApps();
  },

  startMonitoring(selection: string, timeLimitMinutes: number): void {
    DeviceActivity.userDefaultsSave(selection, "familyActivitySelection");
    DeviceActivity.startMonitoring(
      "trail.daily.limit",
      {
        hours: Math.floor(timeLimitMinutes / 60),
        minutes: timeLimitMinutes % 60,
        seconds: 0,
      },
      { hours: 23, minutes: 59, seconds: 59 },
      false
    );
  },

  stopMonitoring(): void {
    try {
      DeviceActivity.stopMonitoring(["trail.daily.limit"]);
    } catch {}
  },

  resetBlocks(): void {
    try {
      DeviceActivity.unblockAllApps();
    } catch {}
  },
};
