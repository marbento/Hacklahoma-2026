// frontend/app/(tabs)/index.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAssignments } from "../../hooks/useAssignments";
import {
  useDashboard,
  useEncouragement,
  useNudge,
} from "../../hooks/useDashboard";
import { useGoals } from "../../hooks/useGoals";
import { ScreenTimeService } from "../../services/screenTimeService";

const DeviceActivity = require("react-native-device-activity");

type AuthStatus = "notDetermined" | "denied" | "approved";

const URGENCY_PHRASES = [
  "This one's coming up soon — you've got this.",
  "Due date approaching. A little progress now goes a long way.",
  "Time-sensitive — even 15 minutes would help.",
  "Getting close! Focus here first.",
  "This is the priority right now.",
];

const GENERAL_NUDGES = [
  "You've been spending a lot of time here.\n\nConsider taking a break or doing something productive.",
  "A quick check-in: is this what you wanted to be doing right now?",
  "Every minute counts. What matters most to you today?",
  "Pause and breathe. What's one thing you could do right now that future you would thank you for?",
  "Scrolling is easy. Growth takes intention. You choose.",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function scoreGoal(g: {
  is_active: boolean;
  current_streak: number;
  today_progress: number;
  target_value: number;
}): number {
  if (!g.is_active) return -100;
  let score = 0;
  if (g.current_streak > 0 && g.today_progress < g.target_value)
    score += 30 + g.current_streak;
  const ratio = g.target_value > 0 ? g.today_progress / g.target_value : 1;
  score += (1 - ratio) * 50;
  return score;
}

function scoreAssignment(a: {
  days_until_due?: number;
  due_at?: string;
  status: string;
  time_spent_minutes: number;
}): number {
  if (a.status === "submitted" || a.status === "graded" || a.status === "missed")
    return -100;
  let score = 0;
  const daysLeft = a.days_until_due ?? (a.due_at ? Math.ceil((new Date(a.due_at).getTime() - Date.now()) / 86400000) : null);
  if (daysLeft != null) {
    if (daysLeft <= 1) score += 100;
    else if (daysLeft <= 3) score += 70;
    else if (daysLeft <= 7) score += 40;
    else score += 10;
  }
  if (a.time_spent_minutes < 30) score += 20;
  return score;
}

function getDaysLeft(a: { days_until_due?: number; due_at?: string }): number | null {
  if (a.days_until_due != null) return a.days_until_due;
  if (a.due_at) return Math.ceil((new Date(a.due_at).getTime() - Date.now()) / 86400000);
  return null;
}

function getNudgeMessage(
  goal: string | null,
  assignment: string | null,
  assignmentDue: string | null,
): string {
  const parts: string[] = [];
  if (goal) parts.push('Remember, you wanted to: "' + goal + '"');
  if (assignment) {
    const due = assignmentDue ? ` (due ${assignmentDue})` : "";
    parts.push("Coming up: " + assignment + due + "\n\n" + pickRandom(URGENCY_PHRASES));
  }
  if (parts.length === 0) parts.push(pickRandom(GENERAL_NUDGES));
  parts.push("\nYour call — no judgment.");
  return parts.join("\n\n");
}

export default function HomeScreen() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("notDetermined");
  const [selection, setSelection] = useState<string | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { goals, refresh: refreshGoals } = useGoals();
  const { nudge, refresh: refreshNudge } = useNudge();
  const { dashboard, refresh: refreshDashboard } = useDashboard();
  const { text: encouragement, fetch: fetchEncouragement } = useEncouragement();
  const { assignments, refresh: refreshAssignments } = useAssignments();

  const prioritizedGoals = useMemo(
    () => [...goals].filter((g) => g.is_active).sort((a, b) => scoreGoal(b) - scoreGoal(a)),
    [goals],
  );

  const urgentAssignment = useMemo(() => {
    const scored = [...(assignments || [])]
      .map((a) => ({ ...a, _score: scoreAssignment(a), _daysLeft: getDaysLeft(a) }))
      .filter((a) => a._score > 0)
      .sort((a, b) => b._score - a._score);
    return scored[0] || null;
  }, [assignments]);

  const topGoal = prioritizedGoals.length > 0 ? prioritizedGoals[0].title : nudge?.current_goal || null;
  const upcomingAssignment = urgentAssignment?.title || nudge?.upcoming_assignment || null;
  const assignmentDue = urgentAssignment?.due_at
    ? new Date(urgentAssignment.due_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : nudge?.assignment_due || null;

  const [localGoal, setLocalGoal] = useState<string | null>(null);
  const [goalInput, setGoalInput] = useState("");
  const currentGoal = localGoal || topGoal;

  useEffect(() => {
    const m: Record<number, AuthStatus> = { 0: "notDetermined", 1: "denied", 2: "approved" };
    setAuthStatus(m[ScreenTimeService.getAuthStatus()] ?? "notDetermined");
  }, []);

  useEffect(() => {
    if (authStatus === "approved") {
      ScreenTimeService.updateNudge(
        nudge?.title || "Before you scroll...",
        getNudgeMessage(currentGoal, upcomingAssignment, assignmentDue),
      );
    }
  }, [authStatus, currentGoal, upcomingAssignment, assignmentDue, nudge]);

  useEffect(() => { fetchEncouragement(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await Promise.all([refreshGoals(), refreshNudge(), refreshDashboard(), refreshAssignments(), fetchEncouragement()]); } catch {}
    setRefreshing(false);
  }, [refreshGoals, refreshNudge, refreshDashboard, refreshAssignments, fetchEncouragement]);

  const handleAuth = useCallback(async () => {
    try {
      const s = await ScreenTimeService.requestAuth();
      const m: Record<number, AuthStatus> = { 0: "notDetermined", 1: "denied", 2: "approved" };
      setAuthStatus(m[s] ?? "notDetermined");
    } catch (e) { Alert.alert("Error", `Authorization failed: ${e}`); }
  }, []);

  const handleSaveGoal = useCallback(() => {
    if (!goalInput.trim()) return;
    setLocalGoal(goalInput.trim());
    setGoalInput("");
  }, [goalInput]);

  const handleBlock = useCallback(() => {
    if (!selection) { Alert.alert("Select Apps", "Pick apps to block first."); return; }
    ScreenTimeService.saveSelection(selection);
    ScreenTimeService.updateNudge("Before you scroll...", getNudgeMessage(currentGoal, upcomingAssignment, assignmentDue));
    ScreenTimeService.blockApps();
    setIsBlocking(true);
  }, [selection, currentGoal, upcomingAssignment, assignmentDue]);

  const handleUnblock = useCallback(() => {
    ScreenTimeService.stopMonitoring();
    ScreenTimeService.resetBlocks();
    ScreenTimeService.unblockApps();
    setIsBlocking(false);
    setIsMonitoring(false);
  }, []);

  const handleStartMonitoring = useCallback(() => {
    if (!selection) { Alert.alert("Select Apps", "Pick apps to monitor first."); return; }
    ScreenTimeService.updateNudge("Time check", "You've hit your " + timeLimit + "-minute daily limit.\n\n" + getNudgeMessage(currentGoal, upcomingAssignment, assignmentDue));
    ScreenTimeService.startMonitoring(selection, timeLimit);
    setIsMonitoring(true);
    Alert.alert("Trail is watching", "After " + timeLimit + " minutes of daily use, you'll get a gentle nudge.");
  }, [selection, timeLimit, currentGoal, upcomingAssignment, assignmentDue]);

  const handleStopMonitoring = useCallback(() => {
    ScreenTimeService.stopMonitoring();
    ScreenTimeService.resetBlocks();
    setIsBlocking(false);
    setIsMonitoring(false);
  }, []);

  if (authStatus !== "approved") {
    return (
      <SafeAreaView style={st.container}>
        <View style={st.centered}>
          <Text style={st.logo}>🥾</Text>
          <Text style={st.title}>Trail</Text>
          <Text style={st.tagline}>Gentle nudges to keep you on your path</Text>
          <Text style={st.description}>
            Trail helps you stay focused by giving you a friendly reminder when you open distracting apps. No hard locks — just a moment to pause and decide if this is how you want to spend your time.
          </Text>
          <TouchableOpacity style={st.primaryBtn} onPress={handleAuth}>
            <Text style={st.primaryBtnText}>{authStatus === "denied" ? "Open Settings to Enable" : "Get Started"}</Text>
          </TouchableOpacity>
          {authStatus === "denied" && <Text style={st.hint}>Go to Settings → Screen Time → Trail to re-enable</Text>}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={st.container}>
      <ScrollView contentContainerStyle={st.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C6FF7" />}>
        <Text style={st.title}>Trail 🥾</Text>
        <Text style={st.tagline}>What are you working towards?</Text>

        {encouragement && (
          <View style={st.encouragementCard}>
            <Text style={st.encouragementText}>💬 {encouragement}</Text>
          </View>
        )}

        {dashboard && (
          <View style={st.statsRow}>
            <View style={st.statBox}><Text style={st.statNumber}>{dashboard.goals_completed}/{dashboard.goals_total}</Text><Text style={st.statLabel}>Goals Today</Text></View>
            <View style={st.statBox}><Text style={st.statNumber}>{dashboard.assignments_count}</Text><Text style={st.statLabel}>Upcoming</Text></View>
            <View style={st.statBox}><Text style={st.statNumber}>{prioritizedGoals.length > 0 ? prioritizedGoals[0].current_streak : 0}🔥</Text><Text style={st.statLabel}>Top Streak</Text></View>
          </View>
        )}

        <View style={st.card}>
          <Text style={st.cardLabel}>YOUR CURRENT FOCUS</Text>
          {currentGoal ? (
            <View>
              <Text style={st.goalText}>"{currentGoal}"</Text>
              {urgentAssignment && (
                <View style={st.urgentCard}>
                  <Text style={st.urgentEmoji}>{(urgentAssignment._daysLeft ?? 99) <= 1 ? "🔴" : (urgentAssignment._daysLeft ?? 99) <= 3 ? "🟡" : "🟢"}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={st.urgentTitle}>{urgentAssignment.title}</Text>
                    <Text style={st.urgentMeta}>
                      {urgentAssignment.course_name} • {assignmentDue || "No due date"}
                      {urgentAssignment._daysLeft != null && urgentAssignment._daysLeft <= 3
                        ? ` • ${urgentAssignment._daysLeft === 0 ? "DUE TODAY" : urgentAssignment._daysLeft === 1 ? "DUE TOMORROW" : `${urgentAssignment._daysLeft} days left`}`
                        : ""}
                    </Text>
                  </View>
                </View>
              )}
              <TouchableOpacity onPress={() => setLocalGoal(null)}><Text style={st.clearGoal}>Change focus</Text></TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={st.cardHint}>Set a focus so Trail can remind you when you're about to scroll</Text>
              <TextInput style={st.goalInput} placeholder="e.g., Finish homework by Friday" placeholderTextColor="#555" value={goalInput} onChangeText={setGoalInput} onSubmitEditing={handleSaveGoal} returnKeyType="done" />
              <TouchableOpacity style={[st.smallBtn, !goalInput.trim() && st.disabledBtn]} onPress={handleSaveGoal} disabled={!goalInput.trim()}>
                <Text style={st.smallBtnText}>Set Focus</Text>
              </TouchableOpacity>
              {prioritizedGoals.length > 0 && (
                <View style={{ marginTop: 14 }}>
                  <Text style={{ color: "#666", fontSize: 12, marginBottom: 8 }}>Pick from your goals (sorted by priority):</Text>
                  {prioritizedGoals.slice(0, 4).map((g) => {
                    const progress = g.target_value > 0 ? Math.min(g.today_progress / g.target_value, 1) : 0;
                    const isAtRisk = g.current_streak > 0 && g.today_progress < g.target_value;
                    return (
                      <TouchableOpacity key={g.id} onPress={() => setLocalGoal(g.title)} style={st.goalPick}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <Text style={{ fontSize: 14 }}>{isAtRisk ? "🔥" : progress >= 1 ? "✅" : "🎯"}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={st.goalPickText}>{g.title}</Text>
                            <View style={st.miniProgressBg}><View style={[st.miniProgressFill, { width: `${progress * 100}%` as any }]} /></View>
                          </View>
                          {g.current_streak > 0 && <Text style={st.streakBadge}>{g.current_streak}🔥</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Upcoming assignments as focus options */}
              {assignments && assignments.filter(a => a.status === "upcoming" || a.status === "in_progress").length > 0 && (
                <View style={{ marginTop: 14 }}>
                  <Text style={{ color: "#666", fontSize: 12, marginBottom: 8 }}>Or focus on an assignment:</Text>
                  {assignments.filter(a => a.status === "upcoming" || a.status === "in_progress").sort((a, b) => scoreAssignment(b) - scoreAssignment(a)).slice(0, 4).map((a) => {
                    const daysLeft = getDaysLeft(a);
                    return (
                      <TouchableOpacity key={a.id} onPress={() => setLocalGoal(`${a.title} (${a.course_name})`)} style={st.goalPick}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <Text style={{ fontSize: 14 }}>{daysLeft != null && daysLeft <= 1 ? "🔴" : daysLeft != null && daysLeft <= 3 ? "🟡" : "📚"}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={st.goalPickText}>{a.title}</Text>
                            <Text style={{ color: "#666", fontSize: 11 }}>{a.course_name}{daysLeft != null ? ` • ${daysLeft <= 0 ? "Due today" : daysLeft === 1 ? "Due tomorrow" : `${daysLeft} days`}` : ""}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </View>

        <Text style={st.sectionTitle}>Choose apps to nudge about</Text>
        <View style={st.pickerContainer}>
          <DeviceActivity.DeviceActivitySelectionView style={st.picker} familyActivitySelection={selection} onSelectionChange={(event: any) => setSelection(event.nativeEvent.familyActivitySelection)} />
        </View>
        {selection && <Text style={st.selectedText}>✅ Apps selected</Text>}

        <Text style={st.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={[st.primaryBtn, isBlocking && st.activeBtn]} onPress={isBlocking ? handleUnblock : handleBlock}>
          <Text style={st.primaryBtnText}>{isBlocking ? "Remove Nudge Screen" : "Activate Nudge Now"}</Text>
        </TouchableOpacity>

        <Text style={st.sectionTitle}>Daily Time Limit</Text>
        <Text style={st.sectionHint}>After this much daily use, Trail will start nudging you</Text>
        <View style={st.timeLimitRow}>
          {[15, 30, 60, 120].map((mins) => (
            <TouchableOpacity key={mins} style={[st.timePill, timeLimit === mins && st.timePillActive]} onPress={() => setTimeLimit(mins)}>
              <Text style={[st.timePillText, timeLimit === mins && st.timePillTextActive]}>{mins < 60 ? `${mins}m` : `${mins / 60}h`}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[st.primaryBtn, isMonitoring && st.activeBtn]} onPress={isMonitoring ? handleStopMonitoring : handleStartMonitoring}>
          <Text style={st.primaryBtnText}>{isMonitoring ? "Stop Monitoring" : `Start ${timeLimit}min Daily Limit`}</Text>
        </TouchableOpacity>

        {isMonitoring && (
          <View style={st.statusCard}>
            <Text style={st.statusEmoji}>👁️</Text>
            <Text style={st.statusText}>Trail is active. After {timeLimit} minutes of use, you'll see a gentle reminder.</Text>
          </View>
        )}

        {nudge?.redirect_links && nudge.redirect_links.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={st.sectionTitle}>Quick Links</Text>
            {nudge.redirect_links.map((link: { label: string; url: string }, i: number) => (
              <TouchableOpacity key={i} style={st.linkCard}><Text style={st.linkText}>🔗 {link.label}</Text></TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  scroll: { padding: 20, paddingBottom: 40 },
  logo: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff", marginTop: 20 },
  tagline: { fontSize: 16, color: "#aaa", marginBottom: 12 },
  description: { fontSize: 15, color: "#777", textAlign: "center", lineHeight: 22, marginBottom: 32, paddingHorizontal: 8 },
  hint: { color: "#666", fontSize: 13, marginTop: 12, textAlign: "center" },
  encouragementCard: { backgroundColor: "#1a1a2a", borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: "#2a2a4a" },
  encouragementText: { color: "#bbb", fontSize: 14, fontStyle: "italic", lineHeight: 20 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  statBox: { flex: 1, backgroundColor: "#1a1a1a", borderRadius: 12, padding: 14, alignItems: "center" },
  statNumber: { color: "#7C6FF7", fontSize: 22, fontWeight: "bold" },
  statLabel: { color: "#666", fontSize: 11, marginTop: 4, letterSpacing: 1 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#ccc", marginTop: 28, marginBottom: 4 },
  sectionHint: { fontSize: 13, color: "#666", marginBottom: 12 },
  card: { backgroundColor: "#1a1a1a", borderRadius: 16, padding: 20, marginTop: 16, marginBottom: 8 },
  cardLabel: { fontSize: 11, color: "#666", letterSpacing: 2, marginBottom: 12, fontWeight: "600" },
  cardHint: { fontSize: 14, color: "#888", marginBottom: 12 },
  goalText: { fontSize: 18, color: "#7C6FF7", fontWeight: "600", fontStyle: "italic" },
  clearGoal: { fontSize: 13, color: "#666", marginTop: 8 },
  goalInput: { backgroundColor: "#111", borderRadius: 10, padding: 14, color: "#fff", fontSize: 15, borderWidth: 1, borderColor: "#333", marginBottom: 10 },
  smallBtn: { backgroundColor: "#7C6FF7", paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  smallBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  disabledBtn: { opacity: 0.4 },
  goalPick: { backgroundColor: "#222", borderRadius: 10, padding: 12, marginVertical: 3 },
  goalPickText: { color: "#ccc", fontSize: 14 },
  miniProgressBg: { height: 3, backgroundColor: "#333", borderRadius: 2, marginTop: 6 },
  miniProgressFill: { height: 3, backgroundColor: "#7C6FF7", borderRadius: 2 },
  streakBadge: { color: "#FF9800", fontSize: 12, fontWeight: "600" },
  urgentCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#1a1a2a", borderRadius: 10, padding: 12, marginTop: 12, borderWidth: 1, borderColor: "#2a2a4a" },
  urgentEmoji: { fontSize: 18 },
  urgentTitle: { color: "#ddd", fontSize: 14, fontWeight: "600" },
  urgentMeta: { color: "#888", fontSize: 12, marginTop: 2 },
  pickerContainer: { backgroundColor: "#1a1a1a", borderRadius: 16, overflow: "hidden", marginTop: 8, marginBottom: 12 },
  picker: { width: "100%" as any, height: 400 },
  selectedText: { color: "#4CAF50", fontSize: 14, fontWeight: "600", marginBottom: 8 },
  primaryBtn: { backgroundColor: "#7C6FF7", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginBottom: 12 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  activeBtn: { backgroundColor: "#E53935" },
  timeLimitRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  timePill: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: "#1a1a1a", alignItems: "center", borderWidth: 1, borderColor: "#333" },
  timePillActive: { backgroundColor: "#7C6FF7", borderColor: "#7C6FF7" },
  timePillText: { color: "#888", fontSize: 15, fontWeight: "600" },
  timePillTextActive: { color: "#fff" },
  statusCard: { backgroundColor: "#1a1a2a", borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#2a2a4a" },
  statusEmoji: { fontSize: 24 },
  statusText: { color: "#aaa", fontSize: 14, flex: 1, lineHeight: 20 },
  linkCard: { backgroundColor: "#1a1a2a", borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#2a2a4a" },
  linkText: { color: "#7C6FF7", fontSize: 14 },
});
