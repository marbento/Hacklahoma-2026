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
import { C } from "../../theme";

// ── Time tracking helpers ───────────────────────────────────
// react-native-device-activity stores events in UserDefaults via the
// DeviceActivityMonitor extension. We read them to compute focus stats.
let DeviceActivity: any;
try {
  DeviceActivity = require("react-native-device-activity");
} catch {}

function getTimeSummary(): { productiveMin: number; unproductiveMin: number } {
  try {
    if (DeviceActivity?.getEvents) {
      const events = DeviceActivity.getEvents();
      let unproductive = 0;
      let productive = 0;
      if (Array.isArray(events)) {
        for (const e of events) {
          if (e.type === "shieldActionSelected") {
            const mins = e.durationMinutes || 5;
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
  return { productiveMin: 0, unproductiveMin: 0 };
}

function formatTime(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── Categories for goals (must match backend GoalCategory enum) ────────
const CATEGORIES = [
  { key: "other", emoji: "🌟", label: "Personal" },
  { key: "academic", emoji: "📚", label: "Academic" },
  { key: "career", emoji: "💼", label: "Career" },
  { key: "fitness", emoji: "🏃", label: "Fitness" },
  { key: "wellness", emoji: "🧘", label: "Wellness" },
  { key: "creative", emoji: "🎨", label: "Creative" },
  { key: "sleep", emoji: "😴", label: "Sleep" },
  { key: "nutrition", emoji: "🥗", label: "Nutrition" },
];

// Completed task interface
interface CompletedTask {
  id: string;
  title: string;
  category: string;
  points: number;
  completedAt: Date;
}

// Sample completed tasks data
const SAMPLE_COMPLETED_TASKS: CompletedTask[] = [
  {
    id: "1",
    title: "Submit studio reflection",
    category: "academic",
    points: 3,
    completedAt: new Date(),
  },
  {
    id: "2",
    title: "Design review scheduled",
    category: "professional",
    points: 2,
    completedAt: new Date(),
  },
  {
    id: "3",
    title: "Outline v2 delivered",
    category: "professional",
    points: 4,
    completedAt: new Date(),
  },
  {
    id: "4",
    title: "Prototype handoff sent",
    category: "professional",
    points: 3,
    completedAt: new Date(),
  },
  {
    id: "5",
    title: "Research notes tagged",
    category: "academic",
    points: 2,
    completedAt: new Date(),
  },
  {
    id: "6",
    title: "Morning meditation",
    category: "personal",
    points: 1,
    completedAt: new Date(),
  },
  {
    id: "7",
    title: "Gym workout",
    category: "fitness",
    points: 2,
    completedAt: new Date(),
  },
  {
    id: "8",
    title: "Journal entry",
    category: "personal",
    points: 1,
    completedAt: new Date(),
  },
];

// Group tasks by category
const groupTasksByCategory = (tasks: CompletedTask[]) => {
  const groups: Record<string, CompletedTask[]> = {
    other: [],
    academic: [],
    career: [],
    fitness: [],
    wellness: [],
    creative: [],
  };

  tasks.forEach((task) => {
    if (groups[task.category]) {
      groups[task.category].push(task);
    } else {
      groups.other.push(task); // Default to other (personal)
    }
  });

  return groups;
};

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
    "overview" | "goals" | "assignments" | "completed"
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

  // Completed tasks
  const completedTasks = SAMPLE_COMPLETED_TASKS;
  const groupedTasks = groupTasksByCategory(completedTasks);
  const totalSteps = completedTasks.reduce((sum, task) => sum + task.points, 0);

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
        console.log("[Study Plan] Generating for assignment:", id);
        const plan = await makePlan(id);
        console.log("[Study Plan] Success:", plan);
        Alert.alert(
          "Study Plan Ready! 📚",
          `~${plan.estimated_total_minutes} min · ${plan.subtasks.length} steps\n\n${plan.encouragement}`,
        );
      } catch (e: any) {
        console.error("[Study Plan] Error:", e);
        Alert.alert(
          "Study Plan Error",
          e.message || "Failed to generate study plan. Check console for details.",
        );
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
    { key: "completed" as const, label: `Completed (${totalSteps})` },
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
            tintColor={C.kelp}
          />
        }
      >
        <Text style={s.title}>Tasks 📋</Text>
        {dashboard && (
          <Text style={s.subtitle}>Hey {dashboard.user_name}!</Text>
        )}

        {/* Section tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.tabScroll}
          contentContainerStyle={s.tabScrollContent}
        >
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
        </ScrollView>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* COMPLETED TASKS SECTION                               */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeSection === "completed" && (
          <>
            {/* Header */}
            <View style={s.completedHeader}>
              <Text style={s.completedTitle}>COMPLETED TASKS</Text>
              <Text style={s.completedSubtitle}>
                Crossed-off work that banked steps
              </Text>
              <View style={s.todayBadge}>
                <Text style={s.todayText}>TODAY</Text>
                <Text style={s.stepsCount}>{totalSteps} STEPS BANKED</Text>
              </View>
            </View>

            {/* Task feed by category */}
            {["other", "academic", "career", "fitness", "wellness", "creative"].map((category) => {
              const tasks = groupedTasks[category];
              if (!tasks || tasks.length === 0) return null;

              const categoryLabel =
                category.charAt(0).toUpperCase() + category.slice(1);
              const categoryEmoji =
                CATEGORIES.find((c) => c.key === category)?.emoji || "🌟";

              return (
                <View key={category} style={s.categorySection}>
                  <View style={s.categoryHeader}>
                    <Text style={s.categoryTitle}>
                      {categoryEmoji} {categoryLabel}
                    </Text>
                    <View style={s.categoryStats}>
                      <Text style={s.categoryCount}>{tasks.length} tasks</Text>
                      <Text style={s.categoryPoints}>
                        +{tasks.reduce((sum, t) => sum + t.points, 0)} 🏆
                      </Text>
                    </View>
                  </View>

                  {tasks.map((task) => (
                    <View key={task.id} style={s.completedTask}>
                      <View style={s.taskCheckbox}>
                        <Text style={s.checkmark}>✓</Text>
                      </View>
                      <View style={s.taskContent}>
                        <Text style={s.taskTitle}>{task.title}</Text>
                        <Text style={s.taskTime}>
                          {task.completedAt.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                      <View style={s.taskPoints}>
                        <Text style={s.pointsText}>+{task.points} 🏆</Text>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}

            {/* Empty state */}
            {completedTasks.length === 0 && (
              <View style={s.emptyCard}>
                <Text style={{ fontSize: 48 }}>📝</Text>
                <Text style={s.emptyTitle}>No completed tasks yet</Text>
                <Text style={s.emptyHint}>Complete tasks to see them here</Text>
              </View>
            )}
          </>
        )}

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
                <View style={s.stat}>
                  <Text style={s.statNum}>{totalSteps}</Text>
                  <Text style={s.statLabel}>Steps Banked</Text>
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
                <Text style={[s.timeValue, { color: C.success }]}>
                  +{formatTime(timeSummary.productiveMin)}
                </Text>
              </View>
              <View style={s.timeRow}>
                <Text style={s.timeLabel}>Unproductive time</Text>
                <Text style={[s.timeValue, { color: C.danger }]}>
                  -{formatTime(timeSummary.unproductiveMin)}
                </Text>
              </View>
              <View
                style={[
                  s.timeRow,
                  {
                    borderTopWidth: 1,
                    borderTopColor: C.border,
                    paddingTop: 8,
                    marginTop: 4,
                  },
                ]}
              >
                <Text style={s.timeLabel}>Net result</Text>
                <Text
                  style={[
                    s.timeValue,
                    { color: netResult >= 0 ? C.success : C.danger },
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
                  placeholderTextColor={C.textLight}
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
                          newCategory === c.key && { color: C.textOnKelp },
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
                      placeholderTextColor={C.textLight}
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
                      placeholderTextColor={C.textLight}
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
                        <Text style={{ color: C.textLight }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={s.bar}>
                      <View
                        style={[
                          s.barFill,
                          { width: `${pct}%` as any },
                          met && { backgroundColor: C.success },
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
              assignments
                .filter((a) => {
                  // Only show assignments due within next 2 weeks (14 days)
                  const daysLeft =
                    a.days_until_due ??
                    (a.due_at
                      ? Math.ceil(
                          (new Date(a.due_at).getTime() - Date.now()) / 86400000,
                        )
                      : null);
                  return daysLeft != null && daysLeft <= 14;
                })
                .slice(0, 15)
                .map((a) => {
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
  container: { flex: 1, backgroundColor: C.beige },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: "bold", color: C.kelp, marginTop: 10 },
  subtitle: { fontSize: 15, color: C.textMid, marginBottom: 4 },

  // Section tabs
  tabScroll: { marginTop: 16, marginBottom: 8 },
  tabScrollContent: { paddingRight: 20 },
  tabRow: { flexDirection: "row", gap: 8, marginTop: 16, marginBottom: 8 },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.cardBg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.cream,
    marginRight: 8,
  },
  tabActive: { backgroundColor: C.kelp, borderColor: C.kelp },
  tabText: { color: C.textMid, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: C.textOnKelp },

  // Stats
  statsRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  stat: {
    flex: 1,
    backgroundColor: C.cardBg,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.cream,
  },
  statNum: { color: C.kelp, fontSize: 28, fontWeight: "bold" },
  statLabel: { color: C.textLight, fontSize: 12, marginTop: 4 },

  // Progress card
  progressCard: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: C.cream,
  },
  progressLabel: {
    fontSize: 11,
    color: C.textLight,
    letterSpacing: 2,
    fontWeight: "600",
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: { color: C.textDark, fontSize: 14 },
  progressPct: { color: C.textLight, fontSize: 14 },
  progressBar: {
    height: 6,
    backgroundColor: C.parchment,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: 6, backgroundColor: C.kelp, borderRadius: 3 },

  // Time card
  timeCard: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: C.cream,
  },
  timeBig: {
    color: C.success,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  timeLabel: { color: C.textLight, fontSize: 14 },
  timeValue: { fontSize: 14, fontWeight: "600" },

  // Sections
  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.textDark,
    marginBottom: 10,
  },

  // Goals in overview
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 10,
  },
  goalName: { color: C.textDark, fontSize: 15 },
  goalDone: { color: C.success, textDecorationLine: "line-through" },
  goalProg: { color: C.textLight, fontSize: 12, marginTop: 2 },

  // Completed Tasks Section
  completedHeader: {
    marginTop: 12,
    marginBottom: 20,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: C.kelp,
    marginBottom: 4,
  },
  completedSubtitle: {
    fontSize: 14,
    color: C.textLight,
    marginBottom: 12,
  },
  todayBadge: {
    backgroundColor: C.cardBg,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: C.cream,
  },
  todayText: {
    fontSize: 11,
    color: C.textLight,
    letterSpacing: 2,
    fontWeight: "600",
    marginBottom: 4,
  },
  stepsCount: {
    fontSize: 24,
    fontWeight: "bold",
    color: C.kelp,
  },

  // Category sections
  categorySection: {
    marginTop: 20,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: C.textDark,
  },
  categoryStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryCount: {
    fontSize: 12,
    color: C.textLight,
  },
  categoryPoints: {
    fontSize: 12,
    color: C.kelp,
    fontWeight: "600",
  },

  // Completed task item
  completedTask: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.cardBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.cream,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.success + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkmark: {
    color: C.success,
    fontSize: 14,
    fontWeight: "bold",
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    color: C.textDark,
    fontWeight: "500",
  },
  taskTime: {
    fontSize: 12,
    color: C.textLight,
    marginTop: 2,
  },
  taskPoints: {
    backgroundColor: C.kelp + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 12,
    color: C.kelp,
    fontWeight: "700",
  },

  // Goal cards (goals section)
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.kelp,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: C.textOnKelp, fontSize: 24, fontWeight: "bold" },
  createCard: {
    backgroundColor: C.cardBg,
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: C.cream,
  },
  createLabel: {
    fontSize: 11,
    color: C.textLight,
    letterSpacing: 2,
    marginBottom: 12,
    fontWeight: "600",
  },
  input: {
    backgroundColor: C.inputBg,
    borderRadius: 10,
    padding: 14,
    color: C.textDark,
    fontSize: 15,
    borderWidth: 1,
    borderColor: C.border,
  },
  fieldLabel: {
    fontSize: 12,
    color: C.textLight,
    marginTop: 12,
    marginBottom: 6,
  },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.parchment,
    borderWidth: 1,
    borderColor: C.cream,
  },
  catActive: { backgroundColor: C.kelp, borderColor: C.kelp },
  catEmoji: { fontSize: 14, marginRight: 4 },
  catText: { color: C.textMid, fontSize: 12 },
  createBtn: {
    backgroundColor: C.kelp,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  createBtnText: { color: C.textOnKelp, fontSize: 15, fontWeight: "700" },
  goalCard: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: C.cream,
  },
  goalCardTitle: {
    color: C.textDark,
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  bar: {
    height: 6,
    backgroundColor: C.parchment,
    borderRadius: 3,
    marginTop: 10,
    overflow: "hidden",
  },
  barFill: { height: 6, backgroundColor: C.kelp, borderRadius: 3 },
  barProg: { color: C.textLight, fontSize: 12, marginTop: 6 },
  logBtn: {
    backgroundColor: C.kelp + "20",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  logBtnText: { color: C.kelp, fontSize: 14, fontWeight: "600" },

  // Assignments
  syncBtn: {
    backgroundColor: C.kelp + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncBtnText: { color: C.kelp, fontSize: 12, fontWeight: "600" },
  noData: { color: C.textLight, fontSize: 14, marginTop: 8 },
  assignCard: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.cream,
  },
  assignHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  assignTitle: { color: C.textDark, fontSize: 16, fontWeight: "600" },
  assignCourse: { color: C.textLight, fontSize: 13, marginTop: 2 },
  dueBadge: {
    backgroundColor: C.kelp + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dueUrgent: { backgroundColor: C.danger + "20" },
  dueText: { color: C.kelp, fontSize: 11, fontWeight: "700" },
  planBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  planHeader: { color: C.textLight, fontSize: 13, marginBottom: 8 },
  subtask: { flexDirection: "row", gap: 8, marginVertical: 4 },
  subtaskNum: { color: C.kelp, fontSize: 13, fontWeight: "700", width: 20 },
  subtaskTitle: { color: C.textDark, fontSize: 14, fontWeight: "600" },
  subtaskDesc: { color: C.textLight, fontSize: 12, marginTop: 2 },
  link: { color: C.kelp, fontSize: 12, marginTop: 4 },
  planEncourage: {
    color: C.textLight,
    fontSize: 13,
    marginTop: 10,
    fontStyle: "italic",
  },
  planBtn: {
    backgroundColor: C.kelp + "20",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  planBtnText: { color: C.kelp, fontSize: 14, fontWeight: "600" },

  // Encouragement
  encourageCard: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: C.kelp + "40",
  },
  encourageText: {
    color: C.textDark,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
  },
  encourageFrom: { color: C.kelp, fontSize: 13, marginTop: 10 },
  encourageBtn: {
    backgroundColor: C.cardBg,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: C.kelp + "40",
  },
  encourageBtnText: { color: C.kelp, fontSize: 15, fontWeight: "600" },

  // Empty states
  empty: { color: C.textLight, textAlign: "center", marginTop: 40 },
  emptyCard: {
    alignItems: "center",
    marginTop: 60,
    padding: 20,
  },
  emptyTitle: {
    color: C.textDark,
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
  },
  emptyHint: { color: C.textLight, fontSize: 14, marginTop: 6 },
});
