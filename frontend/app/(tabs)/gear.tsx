// frontend/app/(tabs)/gear.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { syncCanvas } from "../../api/assignments";
import { useAuth } from "../../context/AuthContext";
import { useServices } from "../../hooks/useServices";
import { healthKit } from "../../services/healthKitService";
import { ScreenTimeService } from "../../services/screenTimeService";
import { C } from "../../theme";

let DeviceActivity: any;
try {
  DeviceActivity = require("react-native-device-activity");
} catch {}

type AuthStatus = "notDetermined" | "denied" | "approved";

const GEAR_ITEMS = [
  {
    key: "screentime",
    emoji: "🛡️",
    name: "Shield",
    integration: "screentime",
    unlockText: "Enable Screen Time",
  },
  {
    key: "fitness",
    emoji: "💪",
    name: "Fitness Pack",
    integration: "fitness",
    unlockText: "Connect Apple Health",
  },
  {
    key: "notion",
    emoji: "🔭",
    name: "Telescope",
    integration: "notion",
    unlockText: "Connect Notion",
  },
  {
    key: "gcal",
    emoji: "🔦",
    name: "Flashlight",
    integration: "gcal",
    unlockText: "Connect Google Cal",
  },
  {
    key: "canvas",
    emoji: "🎒",
    name: "Sleeping Bag",
    integration: "canvas",
    unlockText: "Connect Canvas",
  },
  {
    key: "instagram",
    emoji: "🧭",
    name: "Compass",
    integration: "instagram",
    unlockText: "Connect Instagram",
  },
  {
    key: "microsoft",
    emoji: "🏮",
    name: "Lantern",
    integration: "microsoft",
    unlockText: "Connect Microsoft",
  },
];

const INTEGRATIONS = [
  {
    key: "notion",
    icon: "N",
    name: "Notion",
    category: "Tasks",
    color: "#3d3d3d",
  },
  {
    key: "gcal",
    icon: "G",
    name: "Google Calendar",
    category: "Events",
    color: "#3d6b3d",
  },
  {
    key: "canvas",
    icon: "C",
    name: "Canvas",
    category: "Assignments",
    color: "#8b3a3a",
  },
  {
    key: "instagram",
    icon: "I",
    name: "Instagram",
    category: "Usage signals",
    color: "#6b3a6b",
  },
  {
    key: "microsoft",
    icon: "M",
    name: "Microsoft 365",
    category: "Tasks",
    color: "#3a4a6b",
  },
];

export default function GearScreen() {
  const { services, connectCanvas, removeCanvas } = useServices();
  const { logout } = useAuth();

  const [authStatus, setAuthStatus] = useState<AuthStatus>("notDetermined");
  const [fitnessConnected, setFitnessConnected] = useState(false);
  const [selection, setSelection] = useState<string | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState<string | null>(null);
  const [canvasToken, setCanvasToken] = useState("");
  const [validating, setValidating] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    try {
      const m: Record<number, AuthStatus> = {
        0: "notDetermined",
        1: "denied",
        2: "approved",
      };
      setAuthStatus(m[ScreenTimeService.getAuthStatus()] ?? "notDetermined");
    } catch {}

    // Check if HealthKit is already available (user previously authorized)
    if (healthKit.isAvailable()) {
      // Try a lightweight query — if it works, user has authorized before
      healthKit
        .queryMetric("steps")
        .then((val) => {
          // If we get here without throwing, HealthKit is authorized
          setFitnessConnected(true);
        })
        .catch(() => {
          // Not authorized yet
        });
    }
  }, []);

  const connectedMap = useMemo(
    () => ({
      screentime: authStatus === "approved",
      fitness: fitnessConnected,
      canvas: services?.canvas?.connected || false,
      notion: false,
      gcal: false,
      instagram: false,
      microsoft: false,
    }),
    [services, authStatus, fitnessConnected],
  );

  const connectedCount = Object.values(connectedMap).filter(Boolean).length;

  const handleAuth = useCallback(async () => {
    try {
      const s = await ScreenTimeService.requestAuth();
      const m: Record<number, AuthStatus> = {
        0: "notDetermined",
        1: "denied",
        2: "approved",
      };
      setAuthStatus(m[s] ?? "notDetermined");
      if (s === 2)
        Alert.alert(
          "Shield Unlocked! 🛡️",
          "Screen Time is enabled. Now select apps to nudge about.",
        );
    } catch (e) {
      Alert.alert("Error", `Authorization failed: ${e}`);
    }
  }, []);

  const handleFitnessConnect = useCallback(async () => {
    if (!healthKit.isAvailable()) {
      Alert.alert(
        "Not Available",
        "HealthKit is not available on this device.",
      );
      return;
    }
    try {
      const ok = await healthKit.requestAuth([
        "steps",
        "active_calories",
        "exercise_minutes",
        "stand_hours",
      ]);
      if (ok) {
        setFitnessConnected(true);
        Alert.alert(
          "Fitness Pack Unlocked! 💪",
          "Apple Health connected. Your steps and activity rings will sync automatically.",
        );
      }
    } catch (e) {
      Alert.alert("Error", `HealthKit authorization failed: ${e}`);
    }
  }, []);

  const handleBlock = useCallback(() => {
    if (!selection) {
      Alert.alert("Select Apps", "Pick apps to nudge about first.");
      return;
    }
    ScreenTimeService.saveSelection(selection);
    ScreenTimeService.updateNudge(
      "Before you scroll...",
      "Is this how you want to spend your time?\n\nYour call — no judgment.",
    );
    ScreenTimeService.blockApps();
    setIsBlocking(true);
  }, [selection]);

  const handleUnblock = useCallback(() => {
    ScreenTimeService.stopMonitoring();
    ScreenTimeService.resetBlocks();
    ScreenTimeService.unblockApps();
    setIsBlocking(false);
    setIsMonitoring(false);
  }, []);

  const handleStartMonitoring = useCallback(() => {
    if (!selection) {
      Alert.alert("Select Apps", "Pick apps first.");
      return;
    }
    ScreenTimeService.updateNudge(
      "Time check",
      "You've hit your " +
        timeLimit +
        "-minute daily limit.\n\nYour call — no judgment.",
    );
    ScreenTimeService.startMonitoring(selection, timeLimit);
    setIsMonitoring(true);
    Alert.alert(
      "Trail is watching 👁️",
      "After " +
        timeLimit +
        " minutes of daily use, you'll get a gentle nudge.",
    );
  }, [selection, timeLimit]);

  const handleStopMonitoring = useCallback(() => {
    ScreenTimeService.stopMonitoring();
    ScreenTimeService.resetBlocks();
    setIsBlocking(false);
    setIsMonitoring(false);
  }, []);

  const handleConnectCanvas = useCallback(async () => {
    if (!canvasToken.trim()) return;
    setValidating(true);
    try {
      const result = await connectCanvas(canvasToken.trim());
      Alert.alert(
        "Canvas Connected! 🎒",
        `Signed in as ${result.canvas_name}\n${result.courses_count} courses found.\n\nYou earned: Sleeping Bag!`,
      );
      setShowTokenInput(null);
      setCanvasToken("");
      setSyncing(true);
      try {
        const s = await syncCanvas();
        Alert.alert("Synced!", `Pulled ${s.synced} assignments.`);
      } catch {}
      setSyncing(false);
    } catch (e: any) {
      Alert.alert(
        "Invalid Token",
        e.message || "Check that you copied the full token.",
      );
    } finally {
      setValidating(false);
    }
  }, [canvasToken, connectCanvas]);

  const handleDisconnect = useCallback(
    (name: string) => {
      Alert.alert(
        `Disconnect ${name}?`,
        "You'll lose the gear item and integration data.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disconnect",
            style: "destructive",
            onPress: () => {
              if (name === "Canvas") removeCanvas();
              if (name === "Apple Health") setFitnessConnected(false);
            },
          },
        ],
      );
    },
    [removeCanvas],
  );

  const handleConnect = useCallback((key: string) => {
    if (key === "canvas") setShowTokenInput("canvas");
    else if (key === "fitness") {
      // Handled by handleFitnessConnect
    } else
      Alert.alert(
        "Coming Soon",
        `${key.charAt(0).toUpperCase() + key.slice(1)} integration is coming soon!`,
      );
  }, []);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.header}>
          <Text style={s.title}>GEAR</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Log Out?", "", [
                { text: "Cancel", style: "cancel" },
                { text: "Log Out", style: "destructive", onPress: logout },
              ]);
            }}
          >
            <Text style={s.loadoutBtn}>LOADOUT</Text>
          </TouchableOpacity>
        </View>

        {/* ═══ GEAR GRID ═══ */}
        <View style={s.gearGrid}>
          {GEAR_ITEMS.map((gear) => {
            const isUnlocked =
              connectedMap[gear.integration as keyof typeof connectedMap];
            return (
              <TouchableOpacity
                key={gear.key}
                style={[s.gearCard, isUnlocked && s.gearCardUnlocked]}
                onPress={() => {
                  if (gear.key === "screentime" && !isUnlocked) handleAuth();
                  else if (gear.key === "fitness" && !isUnlocked)
                    handleFitnessConnect();
                  else if (!isUnlocked) handleConnect(gear.integration);
                }}
                activeOpacity={isUnlocked ? 1 : 0.7}
              >
                <Text style={[s.gearEmoji, !isUnlocked && s.gearEmojiLocked]}>
                  {gear.emoji}
                </Text>
                <Text style={[s.gearName, !isUnlocked && s.gearNameLocked]}>
                  {gear.name}
                </Text>
                <Text style={[s.gearDesc, isUnlocked && s.gearDescConnected]}>
                  {isUnlocked ? "Connected" : gear.unlockText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ═══ SCREEN TIME ═══ */}
        <Text style={s.sectionLabel}>SCREEN TIME</Text>
        <View style={s.stCard}>
          <View style={s.stHeader}>
            <Text style={{ fontSize: 24 }}>🛡️</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.stTitle}>Nudge Shield</Text>
              <Text style={s.stStatus}>
                {authStatus === "approved"
                  ? isMonitoring
                    ? `Monitoring · ${timeLimit}min limit`
                    : isBlocking
                      ? "Active · nudging now"
                      : "Ready · pick apps below"
                  : authStatus === "denied"
                    ? "Denied — open Settings"
                    : "Not set up yet"}
              </Text>
            </View>
            <View
              style={[
                s.dot,
                authStatus === "approved" ? s.dotGreen : s.dotAmber,
              ]}
            />
          </View>

          {authStatus !== "approved" ? (
            <View style={{ marginTop: 14 }}>
              <Text style={s.stHint}>
                Trail uses Screen Time to show gentle reminders when you open
                distracting apps. No hard locks — just a moment to pause.
              </Text>
              <TouchableOpacity style={s.primaryBtn} onPress={handleAuth}>
                <Text style={s.primaryBtnText}>
                  {authStatus === "denied"
                    ? "Open Settings to Enable"
                    : "Enable Screen Time"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ marginTop: 14 }}>
              <Text style={s.stSubLabel}>Apps to nudge about</Text>
              <View style={s.pickerContainer}>
                {DeviceActivity && (
                  <DeviceActivity.DeviceActivitySelectionView
                    style={s.picker}
                    familyActivitySelection={selection}
                    onSelectionChange={(event: any) =>
                      setSelection(event.nativeEvent.familyActivitySelection)
                    }
                  />
                )}
              </View>
              {selection && (
                <Text style={s.selectedText}>✅ Apps selected</Text>
              )}
              <TouchableOpacity
                style={[s.primaryBtn, isBlocking && s.activeBtn]}
                onPress={isBlocking ? handleUnblock : handleBlock}
              >
                <Text style={s.primaryBtnText}>
                  {isBlocking ? "Remove Nudge Screen" : "Activate Nudge Now"}
                </Text>
              </TouchableOpacity>
              <Text style={s.stSubLabel}>Daily time limit</Text>
              <Text style={s.stSubHint}>
                After this much daily use, Trail nudges you
              </Text>
              <View style={s.timeLimitRow}>
                {[15, 30, 60, 120].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[s.timePill, timeLimit === m && s.timePillActive]}
                    onPress={() => setTimeLimit(m)}
                  >
                    <Text
                      style={[
                        s.timePillText,
                        timeLimit === m && s.timePillTextActive,
                      ]}
                    >
                      {m < 60 ? `${m}m` : `${m / 60}h`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[s.primaryBtn, isMonitoring && s.activeBtn]}
                onPress={
                  isMonitoring ? handleStopMonitoring : handleStartMonitoring
                }
              >
                <Text style={s.primaryBtnText}>
                  {isMonitoring
                    ? "Stop Monitoring"
                    : `Start ${timeLimit}min Daily Limit`}
                </Text>
              </TouchableOpacity>
              {isMonitoring && (
                <View style={s.statusCard}>
                  <Text style={{ fontSize: 20 }}>👁️</Text>
                  <Text style={s.statusText}>
                    Trail is active. After {timeLimit} min, you'll see a
                    reminder.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* ═══ FITNESS ═══ */}
        {fitnessConnected && (
          <>
            <Text style={s.sectionLabel}>FITNESS</Text>
            <View style={s.stCard}>
              <View style={s.stHeader}>
                <Text style={{ fontSize: 24 }}>💪</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.stTitle}>Apple Health</Text>
                  <Text style={s.stStatus}>Syncing steps & activity rings</Text>
                </View>
                <View style={[s.dot, s.dotGreen]} />
              </View>
              <View style={{ marginTop: 14 }}>
                <Text style={s.stHint}>
                  Your steps, active calories, exercise minutes, and stand hours
                  sync automatically to your goals on the Tasks tab.
                </Text>
                <TouchableOpacity
                  style={[s.primaryBtn, s.activeBtn]}
                  onPress={() => handleDisconnect("Apple Health")}
                >
                  <Text style={s.primaryBtnText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* ═══ INTEGRATIONS ═══ */}
        <Text style={s.sectionLabel}>INTEGRATIONS</Text>
        {INTEGRATIONS.map((intg) => {
          const connected = connectedMap[intg.key as keyof typeof connectedMap];
          return (
            <View key={intg.key}>
              <View
                style={[
                  s.intgRow,
                  showTokenInput === intg.key && {
                    marginBottom: 0,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  },
                ]}
              >
                <View
                  style={[s.intgIcon, { backgroundColor: intg.color + "18" }]}
                >
                  <Text style={[s.intgIconText, { color: intg.color }]}>
                    {intg.icon}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.intgName}>{intg.name}</Text>
                  <Text style={s.intgCat}>{intg.category}</Text>
                </View>
                {connected ? (
                  <TouchableOpacity onPress={() => handleDisconnect(intg.name)}>
                    <Text style={s.connText}>✓ Connected</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={s.connBtn}
                    onPress={() => handleConnect(intg.key)}
                  >
                    <Text style={s.connBtnText}>Connect</Text>
                  </TouchableOpacity>
                )}
              </View>
              {showTokenInput === intg.key && intg.key === "canvas" && (
                <View style={s.tokenFlow}>
                  <Text style={s.tokenHint}>
                    1. Open canvas.ou.edu → Settings{"\n"}2. Scroll to "Approved
                    Integrations"{"\n"}3. Click "+ New Access Token"{"\n"}4.
                    Name it "Trail", generate, paste below
                  </Text>
                  <TouchableOpacity
                    style={s.openCanvasBtn}
                    onPress={() =>
                      Linking.openURL("https://canvas.ou.edu/profile/settings")
                    }
                  >
                    <Text style={s.openCanvasBtnText}>
                      Open Canvas Settings →
                    </Text>
                  </TouchableOpacity>
                  <TextInput
                    style={s.tokenInput}
                    placeholder="Paste token here"
                    placeholderTextColor={C.textLight}
                    value={canvasToken}
                    onChangeText={setCanvasToken}
                    autoCapitalize="none"
                    autoCorrect={false}
                    multiline
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                      marginTop: 12,
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        s.primaryBtn,
                        { flex: 1, marginBottom: 0 },
                        (validating || !canvasToken.trim()) && { opacity: 0.4 },
                      ]}
                      onPress={handleConnectCanvas}
                      disabled={validating || !canvasToken.trim()}
                    >
                      {validating ? (
                        <ActivityIndicator color={C.textOnKelp} size="small" />
                      ) : (
                        <Text style={s.primaryBtnText}>Connect</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setShowTokenInput(null);
                        setCanvasToken("");
                      }}
                    >
                      <Text style={{ color: C.textLight }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {intg.key === "canvas" && connected && (
                <View style={s.syncRow}>
                  <Text style={s.syncInfo}>
                    {services?.canvas?.user_name} ·{" "}
                    {services?.canvas?.courses_count} courses
                  </Text>
                  <TouchableOpacity
                    style={s.syncBtn}
                    onPress={async () => {
                      setSyncing(true);
                      try {
                        const res = await syncCanvas();
                        Alert.alert(
                          "Synced!",
                          `Pulled ${res.synced} assignments.`,
                        );
                      } catch (e: any) {
                        Alert.alert("Error", e.message);
                      }
                      setSyncing(false);
                    }}
                    disabled={syncing}
                  >
                    {syncing ? (
                      <ActivityIndicator color={C.kelp} size="small" />
                    ) : (
                      <Text style={s.syncBtnText}>🔄 Sync</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        <View style={s.footer}>
          <Text style={s.footerText}>
            🥾 {connectedCount}/{GEAR_ITEMS.length} gear collected
          </Text>
          <Text style={s.footerHint}>
            Connect more apps to unlock trail gear
          </Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.beige },
  scroll: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: C.textMid,
    letterSpacing: 4,
  },
  loadoutBtn: {
    fontSize: 13,
    color: C.kelp,
    letterSpacing: 2,
    fontWeight: "600",
  },

  gearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  gearCard: {
    width: "47%",
    backgroundColor: C.cardBg,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.cream,
    opacity: 0.45,
  },
  gearCardUnlocked: {
    opacity: 1,
    borderColor: C.kelp + "40",
    backgroundColor: C.parchment,
  },
  gearEmoji: { fontSize: 32, marginBottom: 8 },
  gearEmojiLocked: { opacity: 0.4 },
  gearName: {
    color: C.textDark,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  gearNameLocked: { color: C.textLight },
  gearDesc: { color: C.textLight, fontSize: 12, textAlign: "center" },
  gearDescConnected: { color: C.kelp },

  sectionLabel: {
    fontSize: 13,
    color: C.textLight,
    letterSpacing: 3,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
  },

  stCard: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.cream,
  },
  stHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  stTitle: { color: C.textDark, fontSize: 16, fontWeight: "600" },
  stStatus: { color: C.textMid, fontSize: 13, marginTop: 2 },
  stHint: { color: C.textMid, fontSize: 14, lineHeight: 20, marginBottom: 14 },
  stSubLabel: {
    color: C.textMid,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 8,
  },
  stSubHint: { color: C.textLight, fontSize: 12, marginBottom: 10 },

  dot: { width: 10, height: 10, borderRadius: 5 },
  dotGreen: { backgroundColor: C.success },
  dotAmber: { backgroundColor: C.warning },

  pickerContainer: {
    backgroundColor: C.inputBg,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  picker: { width: "100%" as any, height: 350 },
  selectedText: {
    color: C.success,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  primaryBtn: {
    backgroundColor: C.kelp,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryBtnText: { color: C.textOnKelp, fontSize: 15, fontWeight: "700" },
  activeBtn: { backgroundColor: C.danger },
  timeLimitRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  timePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: C.parchment,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.cream,
  },
  timePillActive: { backgroundColor: C.kelp, borderColor: C.kelp },
  timePillText: { color: C.textMid, fontSize: 14, fontWeight: "600" },
  timePillTextActive: { color: C.textOnKelp },
  statusCard: {
    backgroundColor: C.parchment,
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: C.cream,
  },
  statusText: { color: C.textMid, fontSize: 13, flex: 1, lineHeight: 18 },

  intgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.cream,
  },
  intgIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  intgIconText: { fontSize: 16, fontWeight: "bold" },
  intgName: { color: C.textDark, fontSize: 16, fontWeight: "600" },
  intgCat: { color: C.textLight, fontSize: 13, marginTop: 1 },
  connText: { color: C.success, fontSize: 14, fontWeight: "500" },
  connBtn: {
    backgroundColor: C.kelp,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  connBtnText: { color: C.textOnKelp, fontSize: 13, fontWeight: "700" },

  tokenFlow: {
    backgroundColor: C.cardBg,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: C.cream,
  },
  tokenHint: { color: C.textMid, fontSize: 13, lineHeight: 22 },
  openCanvasBtn: {
    backgroundColor: C.parchment,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 12,
    borderWidth: 1,
    borderColor: C.cream,
  },
  openCanvasBtnText: { color: C.kelp, fontSize: 14, fontWeight: "600" },
  tokenInput: {
    backgroundColor: C.inputBg,
    borderRadius: 10,
    padding: 14,
    color: C.textDark,
    fontSize: 13,
    borderWidth: 1,
    borderColor: C.border,
    minHeight: 50,
  },

  syncRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.cardBg,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 14,
    marginTop: -8,
    marginBottom: 8,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: C.cream,
  },
  syncInfo: { color: C.textLight, fontSize: 12, flex: 1 },
  syncBtn: {
    backgroundColor: C.parchment,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.cream,
  },
  syncBtnText: { color: C.kelp, fontSize: 13, fontWeight: "600" },

  footer: { alignItems: "center", marginTop: 32 },
  footerText: { color: C.kelp, fontSize: 16, fontWeight: "600" },
  footerHint: { color: C.textLight, fontSize: 13, marginTop: 4 },
});
