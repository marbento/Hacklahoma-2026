// frontend/app/(tabs)/tasks.tsx
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Linking,
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
import { useDashboard, useEncouragement } from "../../hooks/useDashboard";
import { useGoals } from "../../hooks/useGoals";

// ── Time tracking helpers ───────────────────────────────────
// react-native-device-activity stores events in UserDefaults via the
// DeviceActivityMonitor extension. We read them to compute focus stats.
let DeviceActivity: any;
try {
  DeviceActivity = require("react-native-device-activity");
} catch {}

function getTimeSummary(): { productiveMin: number; unproductiveMin: number } {
  // Try to read events from the package's event log
  try {
    if (DeviceActivity?.getEvents) {
      const events = DeviceActivity.getEvents();
      let unproductive = 0;
      let productive = 0;
      // Events are logged with types: intervalDidStart, intervalDidEnd,
      // eventDidReachThreshold, shieldActionSelected
      // "shieldActionSelected" with action "defer" = user chose to proceed (unproductive)
      // "shieldActionSelected" with action "close" = user chose to refocus (productive)
      if (Array.isArray(events)) {
        for (const e of events) {
          if (e.type === "shieldActionSelected") {
            const mins = e.durationMinutes || 5; // estimate per session
            if (e.action === "defer" || e.action === "unblock") {
              unproductive += mins;
            } else {
              productive += mins;
            }
          } else if (e.type === "intervalDidEnd") {
            productive += e.durationMinutes || 0;
          }
        }
      }
      return { productiveMin: productive, unproductiveMin: unproductive };
    }
  } catch {}
  // Fallback: no data yet
  return { productiveMin: 0, unproductiveMin: 0 };
}

function formatTime(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── Categories for goals ────────────────────────────────────
const CATEGORIES = [
  { key: "academic", emoji: "📚", label: "Academic" },
  { key: "fitness", emoji: "🏃", label: "Fitness" },
  { key: "wellness", emoji: "🧘", label: "Wellness" },
  { key: "creative", emoji: "🎨", label: "Creative" },
  { key: "other", emoji: "✨", label: "Other" },
];

export default function TasksScreen() {
  const {
    dashboard,
    loading: dashLoading,
    refresh: refreshDash,
  } = useDashboard();
  const {
    assignments,
    syncing,
    generatingPlanFor,
    sync,
    makePlan,
    refresh: refreshAssignments,
  } = useAssignments();
  const {
    goals,
    loading: goalsLoading,
    create,
    log,
    remove,
    refresh: refreshGoals,
  } = useGoals();
  const {
    text: encouragement,
    loading: encLoading,
    fetch: fetchEncouragement,
  } = useEncouragement();

  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "overview" | "goals" | "assignments"
  >("overview");

  // Goal creation
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("other");
  const [newTarget, setNewTarget] = useState("1");
  const [newUnit, setNewUnit] = useState("times");

  // Time tracking
  const timeSummary = useMemo(() => getTimeSummary(), [refreshing]);
  const netResult = timeSummary.productiveMin - timeSummary.unproductiveMin;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshDash(),
        refreshGoals(),
        refreshAssignments(),
        fetchEncouragement(),
      ]);
    } catch {}
    setRefreshing(false);
  }, [refreshDash, refreshGoals, refreshAssignments, fetchEncouragement]);

  const handleSync = useCallback(async () => {
    try {
      const count = await sync();
      Alert.alert("Synced!", `${count} assignments from Canvas.`);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }, [sync]);

  const handlePlan = useCallback(
    async (id: string) => {
      try {
        const plan = await makePlan(id);
        Alert.alert(
          "Study Plan Ready! 📚",
          `~${plan.estimated_total_minutes} min · ${plan.subtasks.length} steps\n\n${plan.encouragement}`,
        );
      } catch (e: any) {
        Alert.alert("Error", e.message);
      }
    },
    [makePlan],
  );

  const handleCreate = useCallback(async () => {
    if (!newTitle.trim()) {
      Alert.alert("Name your goal");
      return;
    }
    try {
      await create({
        title: newTitle.trim(),
        category: newCategory,
        target_value: parseFloat(newTarget) || 1,
        target_unit: newUnit,
        frequency: "daily",
      });
      setNewTitle("");
      setNewTarget("1");
      setNewUnit("times");
      setShowCreate(false);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }, [newTitle, newCategory, newTarget, newUnit, create]);

  const handleLog = useCallback(
    async (goalId: string, title: string) => {
      try {
        const res = await log(goalId);
        if (res.met)
          Alert.alert("Goal Met! 🎉", `You completed "${title}" for today!`);
      } catch (e: any) {
        Alert.alert("Error", e.message);
      }
    },
    [log],
  );

  const handleDelete = useCallback(
    (goalId: string, title: string) => {
      Alert.alert("Delete?", `Remove "${title}"?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => remove(goalId) },
      ]);
    },
    [remove],
  );

  // Section tabs
  const sections = [
    { key: "overview" as const, label: "Overview" },
    { key: "goals" as const, label: `Goals (${goals.length})` },
    { key: "assignments" as const, label: `Tasks (${assignments.length})` },
  ];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7C6FF7"
          />
        }
      >
        <Text style={s.title}>Tasks 📋</Text>
        {dashboard && (
          <Text style={s.subtitle}>Hey {dashboard.user_name}!</Text>
        )}

        {/* Section tabs */}
        <View style={s.tabRow}>
          {sections.map((sec) => (
            <TouchableOpacity
              key={sec.key}
              style={[s.tab, activeSection === sec.key && s.tabActive]}
              onPress={() => setActiveSection(sec.key)}
            >
              <Text
                style={[
                  s.tabText,
                  activeSection === sec.key && s.tabTextActive,
                ]}
              >
                {sec.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* OVERVIEW SECTION                                       */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeSection === "overview" && (
          <>
            {/* Quick stats */}
            {dashboard && (
              <View style={s.statsRow}>
                <View style={s.stat}>
                  <Text style={s.statNum}>
                    {dashboard.goals_completed}/{dashboard.goals_total}
                  </Text>
                  <Text style={s.statLabel}>Goals Today</Text>
                </View>
                <View style={s.stat}>
                  <Text style={s.statNum}>{dashboard.assignments_count}</Text>
                  <Text style={s.statLabel}>Due This Week</Text>
                </View>
              </View>
            )}

            {/* Progress card */}
            <View style={s.progressCard}>
              <Text style={s.progressLabel}>PROGRESS</Text>
              <View style={s.progressRow}>
                <Text style={s.progressText}>
                  {dashboard
                    ? `${dashboard.goals_completed}/${dashboard.goals_total} goals`
                    : "0/0 goals"}
                </Text>
                <Text style={s.progressPct}>
                  {dashboard && dashboard.goals_total > 0
                    ? `${Math.round((dashboard.goals_completed / dashboard.goals_total) * 100)}% completed`
                    : "0% completed"}
                </Text>
              </View>
              <View style={s.progressBar}>
                <View
                  style={[
                    s.progressFill,
                    {
                      width:
                        `${dashboard && dashboard.goals_total > 0 ? Math.round((dashboard.goals_completed / dashboard.goals_total) * 100) : 0}%` as any,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Time saved card */}
            <View style={s.timeCard}>
              <Text style={s.progressLabel}>TIME SAVED</Text>
              <Text style={s.timeBig}>
                {netResult >= 0 ? "+" : ""}
                {formatTime(Math.abs(netResult))}
              </Text>
              <View style={s.timeRow}>
                <Text style={s.timeLabel}>Productive time</Text>
                <Text style={[s.timeValue, { color: "#4CAF50" }]}>
                  +{formatTime(timeSummary.productiveMin)}
                </Text>
              </View>
              <View style={s.timeRow}>
                <Text style={s.timeLabel}>Unproductive time</Text>
                <Text style={[s.timeValue, { color: "#E53935" }]}>
                  -{formatTime(timeSummary.unproductiveMin)}
                </Text>
              </View>
              <View
                style={[
                  s.timeRow,
                  {
                    borderTopWidth: 1,
                    borderTopColor: "#333",
                    paddingTop: 8,
                    marginTop: 4,
                  },
                ]}
              >
                <Text style={s.timeLabel}>Net result</Text>
                <Text
                  style={[
                    s.timeValue,
                    { color: netResult >= 0 ? "#4CAF50" : "#E53935" },
                  ]}
                >
                  {netResult >= 0 ? "+" : "-"}
                  {formatTime(Math.abs(netResult))}
                </Text>
              </View>
            </View>

            {/* Today's goals quick view */}
            {dashboard && dashboard.goals.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Today's Goals</Text>
                {dashboard.goals.map((g) => (
                  <View key={g.id} style={s.goalRow}>
                    <Text style={{ fontSize: 16 }}>{g.met ? "✅" : "⬜"}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.goalName, g.met && s.goalDone]}>
                        {g.title}
                      </Text>
                      <Text style={s.goalProg}>
                        {g.progress}/{g.target} {g.unit}
                        {g.streak > 0 ? ` 🔥${g.streak}` : ""}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Encouragement */}
            {encouragement ? (
              <View style={s.encourageCard}>
                <Text style={s.encourageText}>"{encouragement}"</Text>
                <Text style={s.encourageFrom}>— Trail AI 🥾</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={s.encourageBtn}
                onPress={fetchEncouragement}
                disabled={encLoading}
              >
                <Text style={s.encourageBtnText}>
                  {encLoading ? "Thinking..." : "✨ Get Encouragement"}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* GOALS SECTION                                          */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeSection === "goals" && (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <Text style={s.sectionTitle}>Your Goals</Text>
              <TouchableOpacity
                style={s.addBtn}
                onPress={() => setShowCreate(!showCreate)}
              >
                <Text style={s.addBtnText}>{showCreate ? "✕" : "+"}</Text>
              </TouchableOpacity>
            </View>

            {showCreate && (
              <View style={s.createCard}>
                <Text style={s.createLabel}>NEW GOAL</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g., Read 5 pages per day"
                  placeholderTextColor="#555"
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
                <Text style={s.fieldLabel}>Category</Text>
                <View style={s.catRow}>
                  {CATEGORIES.map((c) => (
                    <TouchableOpacity
                      key={c.key}
                      style={[s.catPill, newCategory === c.key && s.catActive]}
                      onPress={() => setNewCategory(c.key)}
                    >
                      <Text style={s.catEmoji}>{c.emoji}</Text>
                      <Text
                        style={[
                          s.catText,
                          newCategory === c.key && { color: "#fff" },
                        ]}
                      >
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ flexDirection: "row", marginTop: 4 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.fieldLabel}>Target</Text>
                    <TextInput
                      style={s.input}
                      placeholder="5"
                      placeholderTextColor="#555"
                      value={newTarget}
                      onChangeText={setNewTarget}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={s.fieldLabel}>Unit</Text>
                    <TextInput
                      style={s.input}
                      placeholder="pages"
                      placeholderTextColor="#555"
                      value={newUnit}
                      onChangeText={setNewUnit}
                    />
                  </View>
                </View>
                <TouchableOpacity style={s.createBtn} onPress={handleCreate}>
                  <Text style={s.createBtnText}>Create Goal</Text>
                </TouchableOpacity>
              </View>
            )}

            {goalsLoading ? (
              <Text style={s.empty}>Loading...</Text>
            ) : goals.length === 0 ? (
              <View style={s.emptyCard}>
                <Text style={{ fontSize: 48 }}>🎯</Text>
                <Text style={s.emptyTitle}>No goals yet</Text>
                <Text style={s.emptyHint}>Tap + to set your first goal</Text>
              </View>
            ) : (
              goals.map((g) => {
                const pct = Math.min(
                  100,
                  (g.today_progress / g.target_value) * 100,
                );
                const met = g.today_progress >= g.target_value;
                return (
                  <View key={g.id} style={s.goalCard}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={s.goalCardTitle}>
                        {met ? "✅ " : ""}
                        {g.title}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDelete(g.id, g.title)}
                      >
                        <Text style={{ color: "#666" }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={s.bar}>
                      <View
                        style={[
                          s.barFill,
                          { width: `${pct}%` as any },
                          met && { backgroundColor: "#4CAF50" },
                        ]}
                      />
                    </View>
                    <Text style={s.barProg}>
                      {g.today_progress}/{g.target_value} {g.target_unit}
                      {g.current_streak > 0
                        ? `  🔥 ${g.current_streak} day streak`
                        : ""}
                    </Text>
                    {!met && (
                      <TouchableOpacity
                        style={s.logBtn}
                        onPress={() => handleLog(g.id, g.title)}
                      >
                        <Text style={s.logBtnText}>Log +1 {g.target_unit}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ASSIGNMENTS SECTION                                    */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeSection === "assignments" && (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <Text style={s.sectionTitle}>Assignments</Text>
              <TouchableOpacity
                style={s.syncBtn}
                onPress={handleSync}
                disabled={syncing}
              >
                <Text style={s.syncBtnText}>
                  {syncing ? "Syncing..." : "🔄 Sync"}
                </Text>
              </TouchableOpacity>
            </View>

            {assignments.length === 0 ? (
              <Text style={s.noData}>
                No assignments yet. Connect Canvas in Gear to sync.
              </Text>
            ) : (
              assignments.slice(0, 15).map((a) => {
                const daysLeft =
                  a.days_until_due ??
                  (a.due_at
                    ? Math.ceil(
                        (new Date(a.due_at).getTime() - Date.now()) / 86400000,
                      )
                    : null);
                return (
                  <View key={a.id} style={s.assignCard}>
                    <View style={s.assignHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.assignTitle}>{a.title}</Text>
                        <Text style={s.assignCourse}>{a.course_name}</Text>
                      </View>
                      {daysLeft != null && (
                        <View
                          style={[s.dueBadge, daysLeft <= 2 && s.dueUrgent]}
                        >
                          <Text style={s.dueText}>
                            {daysLeft === 0
                              ? "TODAY"
                              : daysLeft === 1
                                ? "TOMORROW"
                                : `${daysLeft}d`}
                          </Text>
                        </View>
                      )}
                    </View>

                    {a.study_plan ? (
                      <View style={s.planBox}>
                        <Text style={s.planHeader}>
                          📋 Study Plan · ~
                          {a.study_plan.estimated_total_minutes} min
                        </Text>
                        {a.study_plan.subtasks.map((st: any, i: number) => (
                          <View key={i} style={s.subtask}>
                            <Text style={s.subtaskNum}>{i + 1}.</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={s.subtaskTitle}>{st.title}</Text>
                              <Text style={s.subtaskDesc}>
                                {st.description}
                              </Text>
                              {st.resources?.map((r: string, ri: number) => (
                                <TouchableOpacity
                                  key={ri}
                                  onPress={() => Linking.openURL(r)}
                                >
                                  <Text style={s.link} numberOfLines={1}>
                                    🔗 {r}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        ))}
                        <Text style={s.planEncourage}>
                          💬 {a.study_plan.encouragement}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          s.planBtn,
                          generatingPlanFor === a.id && { opacity: 0.5 },
                        ]}
                        onPress={() => handlePlan(a.id)}
                        disabled={generatingPlanFor === a.id}
                      >
                        <Text style={s.planBtnText}>
                          {generatingPlanFor === a.id
                            ? "Generating..."
                            : "🤖 Generate Study Plan"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff", marginTop: 10 },
  subtitle: { fontSize: 15, color: "#888", marginBottom: 4 },

  // Section tabs
  tabRow: { flexDirection: "row", gap: 8, marginTop: 16, marginBottom: 8 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  tabActive: { backgroundColor: "#7C6FF7", borderColor: "#7C6FF7" },
  tabText: { color: "#888", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#fff" },

  // Stats
  statsRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  stat: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  statNum: { color: "#7C6FF7", fontSize: 28, fontWeight: "bold" },
  statLabel: { color: "#888", fontSize: 12, marginTop: 4 },

  // Progress card
  progressCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
  },
  progressLabel: {
    fontSize: 11,
    color: "#666",
    letterSpacing: 2,
    fontWeight: "600",
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: { color: "#ccc", fontSize: 14 },
  progressPct: { color: "#888", fontSize: 14 },
  progressBar: {
    height: 6,
    backgroundColor: "#333",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: 6, backgroundColor: "#7C6FF7", borderRadius: 3 },

  // Time card
  timeCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
  },
  timeBig: {
    color: "#4CAF50",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  timeLabel: { color: "#888", fontSize: 14 },
  timeValue: { fontSize: 14, fontWeight: "600" },

  // Sections
  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ccc",
    marginBottom: 10,
  },

  // Goals in overview
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 10,
  },
  goalName: { color: "#fff", fontSize: 15 },
  goalDone: { color: "#4CAF50", textDecorationLine: "line-through" },
  goalProg: { color: "#888", fontSize: 12, marginTop: 2 },

  // Goal cards (goals section)
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7C6FF7",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  createCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
  },
  createLabel: {
    fontSize: 11,
    color: "#666",
    letterSpacing: 2,
    marginBottom: 12,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 14,
    color: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  fieldLabel: { fontSize: 12, color: "#888", marginTop: 12, marginBottom: 6 },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "#333",
  },
  catActive: { backgroundColor: "#7C6FF7", borderColor: "#7C6FF7" },
  catEmoji: { fontSize: 14, marginRight: 4 },
  catText: { color: "#888", fontSize: 12 },
  createBtn: {
    backgroundColor: "#7C6FF7",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  createBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  goalCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
  },
  goalCardTitle: { color: "#fff", fontSize: 16, fontWeight: "600", flex: 1 },
  bar: {
    height: 6,
    backgroundColor: "#333",
    borderRadius: 3,
    marginTop: 10,
    overflow: "hidden",
  },
  barFill: { height: 6, backgroundColor: "#7C6FF7", borderRadius: 3 },
  barProg: { color: "#888", fontSize: 12, marginTop: 6 },
  logBtn: {
    backgroundColor: "#2a2a4a",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  logBtnText: { color: "#7C6FF7", fontSize: 14, fontWeight: "600" },

  // Assignments
  syncBtn: {
    backgroundColor: "#2a2a4a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncBtnText: { color: "#7C6FF7", fontSize: 12, fontWeight: "600" },
  noData: { color: "#666", fontSize: 14, marginTop: 8 },
  assignCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  assignHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  assignTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  assignCourse: { color: "#888", fontSize: 13, marginTop: 2 },
  dueBadge: {
    backgroundColor: "#2a2a4a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dueUrgent: { backgroundColor: "#E5393530" },
  dueText: { color: "#7C6FF7", fontSize: 11, fontWeight: "700" },
  planBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  planHeader: { color: "#888", fontSize: 13, marginBottom: 8 },
  subtask: { flexDirection: "row", gap: 8, marginVertical: 4 },
  subtaskNum: { color: "#7C6FF7", fontSize: 13, fontWeight: "700", width: 20 },
  subtaskTitle: { color: "#ccc", fontSize: 14, fontWeight: "600" },
  subtaskDesc: { color: "#888", fontSize: 12, marginTop: 2 },
  link: { color: "#7C6FF7", fontSize: 12, marginTop: 4 },
  planEncourage: {
    color: "#888",
    fontSize: 13,
    marginTop: 10,
    fontStyle: "italic",
  },
  planBtn: {
    backgroundColor: "#2a2a4a",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  planBtnText: { color: "#7C6FF7", fontSize: 14, fontWeight: "600" },

  // Encouragement
  encourageCard: {
    backgroundColor: "#1a1a2a",
    borderRadius: 14,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#2a2a4a",
  },
  encourageText: {
    color: "#ccc",
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
  },
  encourageFrom: { color: "#7C6FF7", fontSize: 13, marginTop: 10 },
  encourageBtn: {
    backgroundColor: "#1a1a2a",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#2a2a4a",
  },
  encourageBtnText: { color: "#7C6FF7", fontSize: 15, fontWeight: "600" },

  // Empty states
  empty: { color: "#666", textAlign: "center", marginTop: 40 },
  emptyCard: { alignItems: "center", marginTop: 60 },
  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
  },
  emptyHint: { color: "#888", fontSize: 14, marginTop: 6 },
});
