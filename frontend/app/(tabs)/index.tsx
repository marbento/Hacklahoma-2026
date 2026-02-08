// frontend/app/(tabs)/index.tsx
// HOME — Dashboard only. No auth gates. No Screen Time setup.
import { useCallback, useEffect, useMemo, useState } from "react";
import {
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
import { C } from "../../theme";

let DeviceActivity: any;
try {
  DeviceActivity = require("react-native-device-activity");
} catch {}

interface FocusSession {
  label: string;
  detail: string;
  points: number;
  isProductive: boolean;
}

function getTimeSummary(): {
  productiveMin: number;
  unproductiveMin: number;
  sessions: FocusSession[];
} {
  try {
    if (DeviceActivity?.getEvents) {
      const events = DeviceActivity.getEvents();
      let productive = 0,
        unproductive = 0;
      const sessions: FocusSession[] = [];
      if (Array.isArray(events)) {
        for (const e of events) {
          if (e.type === "shieldActionSelected") {
            const mins = e.durationMinutes || 5;
            if (e.action === "defer" || e.action === "unblock") {
              unproductive += mins;
              sessions.push({
                label: e.appName || "App Usage",
                detail: `${mins}m after nudge`,
                points: -1,
                isProductive: false,
              });
            } else {
              productive += mins;
              sessions.push({
                label: "Refocused",
                detail: `Closed ${e.appName || "app"} after nudge`,
                points: 2,
                isProductive: true,
              });
            }
          } else if (e.type === "intervalDidEnd") {
            const mins = e.durationMinutes || 0;
            productive += mins;
            sessions.push({
              label: "Deep Focus",
              detail: `${fmt(mins)} focused`,
              points: Math.ceil(mins / 15),
              isProductive: true,
            });
          }
        }
      }
      return {
        productiveMin: productive,
        unproductiveMin: unproductive,
        sessions: sessions.slice(-10).reverse(),
      };
    }
  } catch {}
  return { productiveMin: 0, unproductiveMin: 0, sessions: [] };
}

function fmt(mins: number): string {
  if (mins <= 0) return "0m";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60),
    m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function scoreGoal(g: {
  is_active: boolean;
  current_streak: number;
  today_progress: number;
  target_value: number;
}): number {
  if (!g.is_active) return -100;
  let s = 0;
  if (g.current_streak > 0 && g.today_progress < g.target_value)
    s += 30 + g.current_streak;
  s += (1 - (g.target_value > 0 ? g.today_progress / g.target_value : 1)) * 50;
  return s;
}

function getDaysLeft(a: {
  days_until_due?: number;
  due_at?: string;
}): number | null {
  if (a.days_until_due != null) return a.days_until_due;
  if (a.due_at)
    return Math.ceil((new Date(a.due_at).getTime() - Date.now()) / 86400000);
  return null;
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { goals, refresh: refreshGoals } = useGoals();
  const { nudge, refresh: refreshNudge } = useNudge();
  const { dashboard, refresh: refreshDashboard } = useDashboard();
  const { text: encouragement, fetch: fetchEncouragement } = useEncouragement();
  const { assignments, refresh: refreshAssignments } = useAssignments();

  const prioritizedGoals = useMemo(
    () =>
      [...goals]
        .filter((g) => g.is_active)
        .sort((a, b) => scoreGoal(b) - scoreGoal(a)),
    [goals],
  );
  const urgentAssignment = useMemo(() => {
    if (!assignments || !assignments.length) return null;
    return (
      assignments
        .map((a) => ({ ...a, _daysLeft: getDaysLeft(a) }))
        .filter(
          (a) =>
            a.status !== "submitted" &&
            a.status !== "graded" &&
            a.status !== "missed",
        )
        .sort((a, b) => (a._daysLeft ?? 999) - (b._daysLeft ?? 999))[0] || null
    );
  }, [assignments]);

  const topGoal =
    prioritizedGoals.length > 0
      ? prioritizedGoals[0].title
      : nudge?.current_goal || null;
  const assignmentDue = urgentAssignment?.due_at
    ? new Date(urgentAssignment.due_at).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : nudge?.assignment_due || null;

  const [localGoal, setLocalGoal] = useState<string | null>(null);
  const [goalInput, setGoalInput] = useState("");
  const currentGoal = localGoal || topGoal;

  const timeSummary = useMemo(() => getTimeSummary(), [refreshing]);
  const netResult = timeSummary.productiveMin - timeSummary.unproductiveMin;

  const totalSteps = dashboard ? dashboard.goals_total : goals.length;
  const completedSteps = dashboard
    ? dashboard.goals_completed
    : goals.filter((g) => g.today_progress >= g.target_value).length;
  const progressPct =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  useEffect(() => {
    fetchEncouragement();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshGoals(),
        refreshNudge(),
        refreshDashboard(),
        refreshAssignments(),
        fetchEncouragement(),
      ]);
    } catch {}
    setRefreshing(false);
  }, [
    refreshGoals,
    refreshNudge,
    refreshDashboard,
    refreshAssignments,
    fetchEncouragement,
  ]);

  const handleSaveGoal = useCallback(() => {
    if (!goalInput.trim()) return;
    setLocalGoal(goalInput.trim());
    setGoalInput("");
  }, [goalInput]);

  // ── ALWAYS render the dashboard. No auth gates. ──────────
  return (
    <SafeAreaView style={st.container}>
      <ScrollView
        contentContainerStyle={st.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.kelp}
          />
        }
      >
        <Text style={st.title}>Trail 🥾</Text>
        <Text style={st.tagline}>What are you working towards?</Text>

        {encouragement && (
          <View style={st.encourageCard}>
            <Text style={st.encourageText}>💬 {encouragement}</Text>
          </View>
        )}

        {/* ═══ CURRENT FOCUS ═══ */}
        <View style={st.card}>
          <Text style={st.cardLabel}>YOUR CURRENT FOCUS</Text>
          {currentGoal ? (
            <View>
              <Text style={st.goalText}>"{currentGoal}"</Text>
              {urgentAssignment && (
                <View style={st.urgentCard}>
                  <Text style={{ fontSize: 16 }}>
                    {(urgentAssignment._daysLeft ?? 99) <= 1
                      ? "🔴"
                      : (urgentAssignment._daysLeft ?? 99) <= 3
                        ? "🟡"
                        : "🟢"}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={st.urgentTitle}>{urgentAssignment.title}</Text>
                    <Text style={st.urgentMeta}>
                      {urgentAssignment.course_name} •{" "}
                      {assignmentDue || "No due date"}
                      {urgentAssignment._daysLeft != null &&
                      urgentAssignment._daysLeft <= 3
                        ? ` • ${urgentAssignment._daysLeft === 0 ? "DUE TODAY" : urgentAssignment._daysLeft === 1 ? "DUE TOMORROW" : `${urgentAssignment._daysLeft} days left`}`
                        : ""}
                    </Text>
                  </View>
                </View>
              )}
              <TouchableOpacity onPress={() => setLocalGoal(null)}>
                <Text style={st.clearGoal}>Change focus</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={st.cardHint}>
                Set a focus so Trail can remind you when you're about to scroll
              </Text>
              <TextInput
                style={st.goalInput}
                placeholder="e.g., Finish homework by Friday"
                placeholderTextColor={C.textLight}
                value={goalInput}
                onChangeText={setGoalInput}
                onSubmitEditing={handleSaveGoal}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[st.smallBtn, !goalInput.trim() && st.disabledBtn]}
                onPress={handleSaveGoal}
                disabled={!goalInput.trim()}
              >
                <Text style={st.smallBtnText}>Set Focus</Text>
              </TouchableOpacity>
              {prioritizedGoals.length > 0 && (
                <View style={{ marginTop: 14 }}>
                  <Text
                    style={{
                      color: C.textLight,
                      fontSize: 12,
                      marginBottom: 8,
                    }}
                  >
                    Pick from your goals:
                  </Text>
                  {prioritizedGoals.slice(0, 4).map((g) => {
                    const progress =
                      g.target_value > 0
                        ? Math.min(g.today_progress / g.target_value, 1)
                        : 0;
                    const isAtRisk =
                      g.current_streak > 0 && g.today_progress < g.target_value;
                    return (
                      <TouchableOpacity
                        key={g.id}
                        onPress={() => setLocalGoal(g.title)}
                        style={st.goalPick}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Text style={{ fontSize: 14 }}>
                            {isAtRisk ? "🔥" : progress >= 1 ? "✅" : "🎯"}
                          </Text>
                          <View style={{ flex: 1 }}>
                            <Text style={st.goalPickText}>{g.title}</Text>
                            <View style={st.miniBar}>
                              <View
                                style={[
                                  st.miniFill,
                                  { width: `${progress * 100}%` as any },
                                ]}
                              />
                            </View>
                          </View>
                          {g.current_streak > 0 && (
                            <Text
                              style={{
                                color: C.warning,
                                fontSize: 12,
                                fontWeight: "600",
                              }}
                            >
                              {g.current_streak}🔥
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </View>

        {/* ═══ PROGRESS ═══ */}
        <View style={st.card}>
          <Text style={st.cardLabel}>PROGRESS</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={st.dataText}>
              {completedSteps}/{totalSteps} steps
            </Text>
            <Text style={st.dataMuted}>{progressPct}% completed</Text>
          </View>
          <View style={st.progressBar}>
            <View
              style={[st.progressFill, { width: `${progressPct}%` as any }]}
            />
          </View>
        </View>

        {/* ═══ TIME SAVED ═══ */}
        <View style={st.card}>
          <Text style={st.cardLabel}>TIME SAVED</Text>
          <Text
            style={[
              st.timeBig,
              { color: netResult >= 0 ? C.success : C.danger },
            ]}
          >
            {netResult >= 0 ? "+" : "-"}
            {fmt(Math.abs(netResult))}
          </Text>
          <View style={st.timeRow}>
            <Text style={st.timeLabel}>Productive time</Text>
            <Text style={[st.timeVal, { color: C.success }]}>
              +{fmt(timeSummary.productiveMin)}
            </Text>
          </View>
          <View style={st.timeRow}>
            <Text style={st.timeLabel}>Unproductive time</Text>
            <Text style={[st.timeVal, { color: C.danger }]}>
              -{fmt(timeSummary.unproductiveMin)}
            </Text>
          </View>
          <View
            style={[
              st.timeRow,
              {
                borderTopWidth: 1,
                borderTopColor: C.border,
                paddingTop: 8,
                marginTop: 4,
              },
            ]}
          >
            <Text style={st.timeLabel}>Net result</Text>
            <Text
              style={[
                st.timeVal,
                { color: netResult >= 0 ? C.success : C.danger },
              ]}
            >
              {netResult >= 0 ? "+" : "-"}
              {fmt(Math.abs(netResult))}
            </Text>
          </View>
        </View>

        {/* ═══ RECENT ACTIVITIES ═══ */}
        <Text style={st.sectionLabel}>RECENT ACTIVITIES</Text>
        {timeSummary.sessions.length > 0 ? (
          timeSummary.sessions.slice(0, 6).map((session, i) => (
            <View key={i} style={st.activityCard}>
              <View style={{ flex: 1 }}>
                <Text style={st.activityName}>{session.label}</Text>
                <Text style={st.activityDetail}>{session.detail}</Text>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Text
                  style={[
                    st.activityPts,
                    { color: session.isProductive ? C.success : C.danger },
                  ]}
                >
                  {session.isProductive ? "+" : ""}
                  {session.points}
                </Text>
                <Text style={{ fontSize: 14 }}>🥾</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={st.activityCard}>
            <Text style={st.activityDetail}>
              No activity yet. Set up nudges in the Gear tab to start tracking.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.beige },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: "bold", color: C.kelp, marginTop: 20 },
  tagline: { fontSize: 16, color: C.textMid, marginBottom: 12 },
  encourageCard: {
    backgroundColor: C.parchment,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: C.cream,
  },
  encourageText: {
    color: C.textMid,
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
  card: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: C.cream,
  },
  cardLabel: {
    fontSize: 11,
    color: C.textLight,
    letterSpacing: 2,
    marginBottom: 10,
    fontWeight: "600",
  },
  cardHint: { fontSize: 14, color: C.textMid, marginBottom: 12 },
  goalText: {
    fontSize: 18,
    color: C.kelp,
    fontWeight: "600",
    fontStyle: "italic",
  },
  clearGoal: { fontSize: 13, color: C.textLight, marginTop: 8 },
  goalInput: {
    backgroundColor: C.inputBg,
    borderRadius: 10,
    padding: 14,
    color: C.textDark,
    fontSize: 15,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
  },
  smallBtn: {
    backgroundColor: C.kelp,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  smallBtnText: { color: C.textOnKelp, fontWeight: "600", fontSize: 14 },
  disabledBtn: { opacity: 0.4 },
  goalPick: {
    backgroundColor: C.parchment,
    borderRadius: 10,
    padding: 12,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: C.cream,
  },
  goalPickText: { color: C.textDark, fontSize: 14 },
  miniBar: {
    height: 3,
    backgroundColor: C.cream,
    borderRadius: 2,
    marginTop: 6,
  },
  miniFill: { height: 3, backgroundColor: C.kelp, borderRadius: 2 },
  urgentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.parchment,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: C.cream,
  },
  urgentTitle: { color: C.textDark, fontSize: 14, fontWeight: "600" },
  urgentMeta: { color: C.textLight, fontSize: 12, marginTop: 2 },
  dataText: { color: C.textDark, fontSize: 14 },
  dataMuted: { color: C.textLight, fontSize: 14 },
  progressBar: {
    height: 6,
    backgroundColor: C.cream,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: 6, backgroundColor: C.kelp, borderRadius: 3 },
  timeBig: { fontSize: 28, fontWeight: "bold", marginBottom: 12 },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  timeLabel: { color: C.textLight, fontSize: 14 },
  timeVal: { fontSize: 14, fontWeight: "600" },
  sectionLabel: {
    fontSize: 13,
    color: C.textLight,
    letterSpacing: 2,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 10,
  },
  activityCard: {
    backgroundColor: C.cardBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.cream,
  },
  activityName: { color: C.textDark, fontSize: 15, fontWeight: "600" },
  activityDetail: { color: C.textMid, fontSize: 13, marginTop: 2 },
  activityPts: { fontSize: 16, fontWeight: "700" },
});
