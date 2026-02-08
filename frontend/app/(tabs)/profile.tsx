// frontend/app/(tabs)/profile.tsx
import { useState, useCallback } from "react";
import {
  Alert, ActivityIndicator, Linking, SafeAreaView, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useServices } from "../../hooks/useServices";
import { syncCanvas } from "../../api/assignments";

export default function ProfileScreen() {
  const { userName, logout } = useAuth();
  const { services, connectCanvas, removeCanvas } = useServices();

  // Canvas token flow
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [canvasToken, setCanvasToken] = useState("");
  const [validating, setValidating] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleConnectCanvas = useCallback(async () => {
    if (!canvasToken.trim()) return;
    setValidating(true);
    try {
      const result = await connectCanvas(canvasToken.trim());
      Alert.alert(
        "Canvas Connected! 📚",
        `Signed in as ${result.canvas_name}\n${result.courses_count} courses found.`
      );
      setShowTokenInput(false);
      setCanvasToken("");

      // Auto-sync
      setSyncing(true);
      try {
        const s = await syncCanvas();
        Alert.alert("Synced!", `Pulled ${s.synced} assignments.`);
      } catch {}
      setSyncing(false);
    } catch (e: any) {
      Alert.alert("Invalid Token", e.message || "Check that you copied the full token.");
    } finally {
      setValidating(false);
    }
  }, [canvasToken, connectCanvas]);

  const handleSyncCanvas = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await syncCanvas();
      Alert.alert("Synced! 📚", `Pulled ${res.synced} assignments from Canvas.`);
    } catch (e: any) {
      Alert.alert("Sync Failed", e.message);
    } finally {
      setSyncing(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    Alert.alert("Disconnect Canvas?", "You'll lose access to assignment sync.", [
      { text: "Cancel", style: "cancel" },
      { text: "Disconnect", style: "destructive", onPress: () => removeCanvas() },
    ]);
  }, [removeCanvas]);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Profile 🥾</Text>
        <Text style={s.subtitle}>Hey {userName || "there"}!</Text>

        <Text style={s.sectionTitle}>Connected Services</Text>

        {/* ═══ CANVAS ═══ */}
        <View style={[s.card, services?.canvas?.connected && s.cardConnected]}>
          <View style={s.cardHeader}>
            <Text style={s.cardEmoji}>📚</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.cardName}>Canvas (OU)</Text>
              <Text style={s.cardStatus}>
                {services?.canvas?.connected
                  ? `${services.canvas.user_name} · ${services.canvas.courses_count} courses`
                  : "Not connected"}
              </Text>
            </View>
            <View style={[s.dot, services?.canvas?.connected ? s.dotGreen : s.dotRed]} />
          </View>

          {services?.canvas?.connected ? (
            <View style={s.cardActions}>
              <TouchableOpacity style={s.actionBtn} onPress={handleSyncCanvas} disabled={syncing}>
                {syncing
                  ? <ActivityIndicator color="#7C6FF7" size="small" />
                  : <Text style={s.actionBtnText}>🔄 Sync Assignments</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDisconnect}>
                <Text style={s.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          ) : !showTokenInput ? (
            <TouchableOpacity style={s.connectBtn} onPress={() => setShowTokenInput(true)}>
              <Text style={s.connectBtnText}>Connect Canvas</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.tokenFlow}>
              <Text style={s.tokenHint}>
                1. Open canvas.ou.edu → Settings{"\n"}
                2. Scroll to "Approved Integrations"{"\n"}
                3. Click "+ New Access Token"{"\n"}
                4. Name it "Trail", generate, and paste below
              </Text>

              <TouchableOpacity
                style={s.openCanvasBtn}
                onPress={() => Linking.openURL("https://canvas.ou.edu/profile/settings")}
              >
                <Text style={s.openCanvasBtnText}>Open Canvas Settings →</Text>
              </TouchableOpacity>

              <TextInput
                style={s.tokenInput}
                placeholder="Paste token here"
                placeholderTextColor="#555"
                value={canvasToken}
                onChangeText={setCanvasToken}
                autoCapitalize="none"
                autoCorrect={false}
                multiline
              />

              <View style={s.tokenActions}>
                <TouchableOpacity
                  style={[s.validateBtn, (validating || !canvasToken.trim()) && s.disabled]}
                  onPress={handleConnectCanvas}
                  disabled={validating || !canvasToken.trim()}
                >
                  <Text style={s.validateBtnText}>{validating ? "Validating..." : "Connect"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShowTokenInput(false); setCanvasToken(""); }}>
                  <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ═══ GOOGLE CALENDAR ═══ */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardEmoji}>📅</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.cardName}>Google Calendar</Text>
              <Text style={s.cardStatus}>Not connected</Text>
            </View>
            <View style={[s.dot, s.dotRed]} />
          </View>
          <TouchableOpacity style={s.comingSoonBtn} disabled>
            <Text style={s.comingSoonText}>Coming Soon</Text>
          </TouchableOpacity>
        </View>

        {/* ═══ ALWAYS ON ═══ */}
        <View style={[s.card, s.cardConnected]}>
          <View style={s.cardHeader}>
            <Text style={s.cardEmoji}>🤖</Text>
            <View style={{ flex: 1 }}><Text style={s.cardName}>Gemini AI</Text><Text style={s.cardStatus}>Active — study plans & insights</Text></View>
            <View style={[s.dot, s.dotGreen]} />
          </View>
        </View>

        <View style={[s.card, s.cardConnected]}>
          <View style={s.cardHeader}>
            <Text style={s.cardEmoji}>🎙️</Text>
            <View style={{ flex: 1 }}><Text style={s.cardName}>ElevenLabs Voice</Text><Text style={s.cardStatus}>Active — daily briefings</Text></View>
            <View style={[s.dot, s.dotGreen]} />
          </View>
        </View>

        {/* ═══ LOGOUT ═══ */}
        <TouchableOpacity style={s.logoutBtn} onPress={() => {
          Alert.alert("Log Out?", "", [
            { text: "Cancel", style: "cancel" },
            { text: "Log Out", style: "destructive", onPress: logout },
          ]);
        }}>
          <Text style={s.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" }, scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff", marginTop: 10 },
  subtitle: { fontSize: 16, color: "#888", marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#ccc", marginTop: 24, marginBottom: 10 },

  card: { backgroundColor: "#1a1a1a", borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#2a2a2a" },
  cardConnected: { borderColor: "#1b3a1b" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardEmoji: { fontSize: 28 },
  cardName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  cardStatus: { color: "#888", fontSize: 12, marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotGreen: { backgroundColor: "#4CAF50" }, dotRed: { backgroundColor: "#E53935" },

  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#333" },
  actionBtn: { backgroundColor: "#2a2a4a", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  actionBtnText: { color: "#7C6FF7", fontSize: 13, fontWeight: "600" },
  disconnectText: { color: "#E53935", fontSize: 13 },

  connectBtn: { backgroundColor: "#7C6FF7", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 14 },
  connectBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  comingSoonBtn: { backgroundColor: "#222", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 14 },
  comingSoonText: { color: "#666", fontSize: 14 },

  // Token flow
  tokenFlow: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#333" },
  tokenHint: { color: "#aaa", fontSize: 13, lineHeight: 22 },
  openCanvasBtn: { backgroundColor: "#2a2a4a", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginVertical: 12 },
  openCanvasBtnText: { color: "#7C6FF7", fontSize: 14, fontWeight: "600" },
  tokenInput: { backgroundColor: "#111", borderRadius: 10, padding: 14, color: "#fff", fontSize: 13, borderWidth: 1, borderColor: "#333", minHeight: 50, fontFamily: "monospace" },
  tokenActions: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 12 },
  validateBtn: { flex: 1, backgroundColor: "#7C6FF7", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  validateBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  disabled: { opacity: 0.4 },
  cancelText: { color: "#666", fontSize: 14 },

  logoutBtn: { borderWidth: 1, borderColor: "#E53935", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 32 },
  logoutText: { color: "#E53935", fontSize: 16, fontWeight: "600" },
});
