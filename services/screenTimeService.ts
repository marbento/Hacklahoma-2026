// services/screenTimeService.ts
const DeviceActivity = require("react-native-device-activity");

const SELECTION_ID = "trail-blocked-apps";

export const ScreenTimeService = {
  // ── Auth ──────────────────────────────────────────────
  async requestAuth() {
    await DeviceActivity.requestAuthorization();
    return DeviceActivity.getAuthorizationStatus();
  },

  getAuthStatus(): number {
    return DeviceActivity.getAuthorizationStatus();
  },

  // ── Selection ─────────────────────────────────────────
  saveSelection(familyActivitySelection: string) {
    DeviceActivity.setFamilyActivitySelectionId({
      id: SELECTION_ID,
      familyActivitySelection,
    });
  },

  // ── Blocking ──────────────────────────────────────────
  blockApps() {
    DeviceActivity.blockSelection({ activitySelectionId: SELECTION_ID });
  },

  unblockApps() {
    DeviceActivity.unblockSelection({ activitySelectionId: SELECTION_ID });
  },

  blockAll() {
    DeviceActivity.enableBlockAllMode();
  },

  unblockAll() {
    DeviceActivity.disableBlockAllMode();
  },

  resetBlocks() {
    DeviceActivity.resetBlocks();
  },

  // ── Monitoring ────────────────────────────────────────
  startMonitoring(
    familyActivitySelection: string,
    timeLimitMinutes: number = 30,
  ) {
    const activityName = `trail_daily_${SELECTION_ID}`;

    this.saveSelection(familyActivitySelection);

    DeviceActivity.startMonitoring(
      activityName,
      {
        intervalStart: { hour: 0, minute: 0, second: 0 },
        intervalEnd: { hour: 23, minute: 59, second: 59 },
        repeats: true,
      },
      [
        {
          eventName: `limit_${timeLimitMinutes}min`,
          familyActivitySelection,
          threshold: { minute: timeLimitMinutes },
        },
      ],
    );

    // Auto-block when threshold is reached (runs in Swift extension even if app is killed)
    DeviceActivity.configureActions({
      activityName,
      callbackName: "eventDidReachThreshold",
      eventName: `limit_${timeLimitMinutes}min`,
      actions: [
        {
          type: "blockSelection",
          familyActivitySelectionId: SELECTION_ID,
        },
      ],
    });
  },

  stopMonitoring() {
    DeviceActivity.stopMonitoring();
  },

  // ── Shield UI ─────────────────────────────────────────
  /**
   * Update the shield with a nudge message.
   * Call this frequently (on app open, after goal changes, etc.)
   * so the shield always shows relevant context.
   *
   * Primary button: "Let me in" → unblocks (defer behavior lets the app handle it)
   * Secondary button: "I'll refocus" → closes the blocked app
   */
  updateNudge(title: string, subtitle: string) {
    DeviceActivity.updateShield(
      {
        title,
        subtitle,
        primaryButtonLabel: "Let me in anyway",
        secondaryButtonLabel: "You're right, I'll refocus",
        backgroundBlurStyle: 18, // systemMaterialDark
        titleColor: { red: 124, green: 111, blue: 247 }, // Trail purple
        subtitleColor: { red: 200, green: 200, blue: 200 },
        primaryButtonBackgroundColor: { red: 50, green: 50, blue: 50 },
        primaryButtonLabelColor: { red: 180, green: 180, blue: 180 },
        secondaryButtonLabelColor: { red: 124, green: 111, blue: 247 },
      },
      {
        // "Let me in" → unblock the app, then close shield
        primary: {
          behavior: "defer",
          actions: [
            {
              type: "unblockSelection",
              familyActivitySelectionId: SELECTION_ID,
            },
          ],
        },
        // "I'll refocus" → just close, keep it blocked
        secondary: {
          behavior: "close",
        },
      },
    );
  },

  isShieldActive(): boolean {
    return DeviceActivity.isShieldActive();
  },

  onEvent(callback: (event: any) => void) {
    return DeviceActivity.onDeviceActivityMonitorEvent(callback);
  },

  getEvents(activityName?: string) {
    return DeviceActivity.getEvents(activityName);
  },
};
