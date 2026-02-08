// frontend/app/onboarding/connect-services.tsx
import { useState, useCallback } from "react";
import {
  Alert, Linking, SafeAreaView, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useServices } from "../../hooks/useServices";
import { syncCanvas } from "../../api/assignments";

export default function ConnectServicesScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const { services, connectCanvas } = useServices();

  const [showCanvasSteps, setShowCanvasSteps] = useState(false);
  const [canvasToken, setCanvasToken] = useState("");
  const [validating, setValidating] = useState(false);
  const [canvasResult, setCanvasResult] = useState<{ name: string; courses: string[] } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncCount, setSyncCount] = useState<number | null>(null);

  const handleValidateCanvas = useCallback(async () => {
    if (!canvasToken.trim()) {
      Alert.alert("Paste Your Token", "Copy the token from Canvas and paste it here.");
      return;
    }
    setValidating(true);
    try {
      const result = await connectCanvas(canvasToken.trim());
      setCanvasResult({ name: result.canvas_name, courses: result.courses });
      setSyncing(true);
      try {
        const sync = await syncCanvas();
        setSyncCount(sync.synced);
      } catch {}
      setSyncing(false);
    } catch (e: any) {
      Alert.alert("Invalid Token", e.message || "Make sure you copied the full token from Canvas.");
    } finally {
      setValidating(false);
    }
  }, [canvasToken, connectCanvas]);

  const handleDone = useCallback(() => {
    completeOnboarding();
    router.replace("/(tabs)");
  }, []);

  const canvasConnected = services?.canvas?.connected || canvasResult !== null;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.step}>Step 2 of 3</Text>
        <Text style={s.title}>Connect Your Services</Text>
        <Text style={s.subtitle}>Link your accounts so Trail can pull assignments, give you smart study plans, and nudge you at the right time.</Text>

        {/* CANVAS */}
        <View style={[s.serviceCard, canvasConnected && s.serviceConnected]}>
          <View style={s.serviceHeader}>
            <Text style={s.serviceEmoji}>📚</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.serviceName}>Canvas (OU)</Text>
              <Text style={s.serviceDesc}>
                {canvasConnected
                  ? `Connected as ${canvasResult?.name || services?.canvas?.user_name}`
                  : "Sync assignments, grades, and due dates"}
              </Text>
            </View>
            {canvasConnected && <View style={s.checkBadge}><Text style={s.checkText}>✓</Text></View>}
          </View>

          {canvasConnected ? (
            <View style={s.connectedInfo}>
              {canvasResult?.courses && canvasResult.courses.length > 0 && (
                <View>
                  <Text style={s.coursesLabel}>YOUR COURSES</Text>
                  {canvasResult.courses.slice(0, 6).map((c, i) => (
                    <Text key={i} style={s.courseName}>📗 {c}</Text>
                  ))}
                  {canvasResult.courses.length > 6 && (
                    <Text style={s.moreText}>+{canvasResult.courses.length - 6} more</Text>
                  )}
                </View>
              )}
              {syncing ? (
                <View style={s.syncRow}><ActivityIndicator color="#7C6FF7" /><Text style={s.syncText}>Syncing assignments...</Text></View>
              ) : syncCount !== null ? (
                <Text style={s.syncDone}>✅ Synced {syncCount} assignments</Text>
              ) : null}
            </View>
          ) : !showCanvasSteps ? (
            <TouchableOpacity style={s.connectBtn} onPress={() => setShowCanvasSteps(true)}>
              <Text style={s.connectBtnText}>Connect Canvas</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.stepsBox}>
              <Text style={s.stepsTitle}>How to get your Canvas token:</Text>

              <View style={s.stepRow}><View style={s.stepDot}><Text style={s.stepDotText}>1</Text></View><Text style={s.stepText}>Open Canvas and go to Settings</Text></View>

              <TouchableOpacity style={s.openCanvasBtn} onPress={() => Linking.openURL("https://canvas.ou.edu/profile/settings")}>
                <Text style={s.openCanvasBtnText}>Open canvas.ou.edu Settings →</Text>
              </TouchableOpacity>

              <View style={s.stepRow}><View style={s.stepDot}><Text style={s.stepDotText}>2</Text></View><Text style={s.stepText}>Scroll to "Approved Integrations"</Text></View>
              <View style={s.stepRow}><View style={s.stepDot}><Text style={s.stepDotText}>3</Text></View><Text style={s.stepText}>Click "+ New Access Token"</Text></View>
              <View style={s.stepRow}><View style={s.stepDot}><Text style={s.stepDotText}>4</Text></View><Text style={s.stepText}>Name it "Trail", leave expiry blank, click "Generate Token"</Text></View>
              <View style={s.stepRow}><View style={s.stepDot}><Text style={s.stepDotText}>5</Text></View><Text style={s.stepText}>Copy the token and paste it below</Text></View>

              <TextInput
                style={s.tokenInput} placeholder="Paste your Canvas token here"
                placeholderTextColor="#555" value={canvasToken} onChangeText={setCanvasToken}
                autoCapitalize="none" autoCorrect={false} multiline
              />

              <TouchableOpacity
                style={[s.validateBtn, (validating || !canvasToken.trim()) && s.disabled]}
                onPress={handleValidateCanvas} disabled={validating || !canvasToken.trim()}
              >
                {validating ? (
                  <View style={s.row}><ActivityIndicator color="#fff" size="small" /><Text style={s.validateText}>  Connecting...</Text></View>
                ) : (
                  <Text style={s.validateText}>Connect Canvas</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowCanvasSteps(false)}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* GOOGLE CALENDAR */}
        <View style={s.serviceCard}>
          <View style={s.serviceHeader}>
            <Text style={s.serviceEmoji}>📅</Text>
            <View style={{ flex: 1 }}><Text style={s.serviceName}>Google Calendar</Text><Text style={s.serviceDesc}>See your schedule and auto-create study blocks</Text></View>
          </View>
          <TouchableOpacity style={s.comingSoonBtn} disabled><Text style={s.comingSoonText}>Coming Soon</Text></TouchableOpacity>
        </View>

        {/* GEMINI */}
        <View style={[s.serviceCard, s.serviceConnected]}>
          <View style={s.serviceHeader}>
            <Text style={s.serviceEmoji}>🤖</Text>
            <View style={{ flex: 1 }}><Text style={s.serviceName}>Gemini AI</Text><Text style={s.serviceDesc}>AI study plans, encouragement, and smart nudges</Text></View>
            <View style={s.checkBadge}><Text style={s.checkText}>✓</Text></View>
          </View>
        </View>

        {/* ELEVENLABS */}
        <View style={[s.serviceCard, s.serviceConnected]}>
          <View style={s.serviceHeader}>
            <Text style={s.serviceEmoji}>🎙️</Text>
            <View style={{ flex: 1 }}><Text style={s.serviceName}>ElevenLabs Voice</Text><Text style={s.serviceDesc}>Jarvis-like daily briefings and spoken insights</Text></View>
            <View style={s.checkBadge}><Text style={s.checkText}>✓</Text></View>
          </View>
        </View>

        {/* DONE */}
        <TouchableOpacity style={s.doneBtn} onPress={handleDone}>
          <Text style={s.doneBtnText}>{canvasConnected ? "All Set — Let's Go! 🥾" : "Skip for Now"}</Text>
        </TouchableOpacity>

        {!canvasConnected && <Text style={s.skipHint}>You can connect Canvas later in Profile.</Text>}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" }, scroll: { padding: 24, paddingBottom: 40 },
  step: { color: "#7C6FF7", fontSize: 13, fontWeight: "600", letterSpacing: 1, marginTop: 10 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginTop: 8 },
  subtitle: { fontSize: 15, color: "#888", marginTop: 6, marginBottom: 24, lineHeight: 22 },

  serviceCard: { backgroundColor: "#1a1a1a", borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: "#2a2a2a" },
  serviceConnected: { borderColor: "#1b3a1b" },
  serviceHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  serviceEmoji: { fontSize: 32 }, serviceName: { color: "#fff", fontSize: 16, fontWeight: "700" },
  serviceDesc: { color: "#888", fontSize: 13, marginTop: 2 },

  checkBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#1b3a1b", alignItems: "center", justifyContent: "center" },
  checkText: { color: "#4CAF50", fontSize: 16, fontWeight: "bold" },

  connectBtn: { backgroundColor: "#7C6FF7", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 14 },
  connectBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  comingSoonBtn: { backgroundColor: "#222", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 14 },
  comingSoonText: { color: "#666", fontSize: 14 },

  stepsBox: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#333" },
  stepsTitle: { color: "#ccc", fontSize: 15, fontWeight: "600", marginBottom: 14 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  stepDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#7C6FF7", alignItems: "center", justifyContent: "center", marginTop: 1 },
  stepDotText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  stepText: { color: "#ccc", fontSize: 14, flex: 1, lineHeight: 20 },

  openCanvasBtn: { backgroundColor: "#2a2a4a", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginBottom: 16 },
  openCanvasBtnText: { color: "#7C6FF7", fontSize: 14, fontWeight: "600" },

  tokenInput: { backgroundColor: "#111", borderRadius: 12, padding: 16, color: "#fff", fontSize: 14, borderWidth: 1, borderColor: "#333", minHeight: 60, marginTop: 8, marginBottom: 12, fontFamily: "monospace" },
  validateBtn: { backgroundColor: "#7C6FF7", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  validateText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center" },
  disabled: { opacity: 0.4 },
  cancelText: { color: "#666", fontSize: 14, textAlign: "center", marginTop: 12 },

  connectedInfo: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#333" },
  coursesLabel: { fontSize: 11, color: "#666", letterSpacing: 2, fontWeight: "600", marginBottom: 8 },
  courseName: { color: "#ccc", fontSize: 14, marginVertical: 3 },
  moreText: { color: "#888", fontSize: 13, marginTop: 4 },
  syncRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  syncText: { color: "#888", fontSize: 13 },
  syncDone: { color: "#4CAF50", fontSize: 14, fontWeight: "600", marginTop: 10 },

  doneBtn: { backgroundColor: "#7C6FF7", paddingVertical: 18, borderRadius: 14, alignItems: "center", marginTop: 24 },
  doneBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  skipHint: { color: "#666", fontSize: 13, textAlign: "center", marginTop: 10 },
});
