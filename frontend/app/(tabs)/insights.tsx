// frontend/app/(tabs)/insights.tsx
import { useCallback } from "react";
import { Alert, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDashboard, useEncouragement } from "../../hooks/useDashboard";
import { useAssignments } from "../../hooks/useAssignments";

export default function InsightsScreen() {
  const { dashboard, loading: dashLoading } = useDashboard();
  const { assignments, syncing, generatingPlanFor, sync, makePlan } = useAssignments();
  const { text: encouragement, loading: encLoading, fetch: fetchEncouragement } = useEncouragement();

  const handleSync = useCallback(async () => {
    try {
      const count = await sync();
      Alert.alert("Synced!", `${count} assignments from Canvas.`);
    } catch (e: any) { Alert.alert("Error", e.message); }
  }, [sync]);

  const handlePlan = useCallback(async (id: string) => {
    try {
      const plan = await makePlan(id);
      Alert.alert("Study Plan Ready! 📚", `~${plan.estimated_total_minutes} min · ${plan.subtasks.length} steps\n\n${plan.encouragement}`);
    } catch (e: any) { Alert.alert("Error", e.message); }
  }, [makePlan]);

  if (dashLoading) return <SafeAreaView style={s.container}><Text style={s.loading}>Loading...</Text></SafeAreaView>;
  if (!dashboard) return (
    <SafeAreaView style={s.container}><ScrollView contentContainerStyle={s.scroll}>
      <Text style={s.title}>Insights 📊</Text>
      <View style={s.emptyCard}><Text style={{ fontSize: 48 }}>🔑</Text><Text style={s.emptyTitle}>Log in first</Text><Text style={s.emptyHint}>Go to Profile tab to get started.</Text></View>
    </ScrollView></SafeAreaView>
  );

  return (
    <SafeAreaView style={s.container}><ScrollView contentContainerStyle={s.scroll}>
      <Text style={s.title}>Insights 📊</Text>
      <Text style={s.subtitle}>Hey {dashboard.user_name}!</Text>

      <View style={s.statsRow}>
        <View style={s.stat}><Text style={s.statNum}>{dashboard.goals_completed}/{dashboard.goals_total}</Text><Text style={s.statLabel}>Goals Today</Text></View>
        <View style={s.stat}><Text style={s.statNum}>{dashboard.assignments_count}</Text><Text style={s.statLabel}>Due This Week</Text></View>
      </View>

      {/* Goals overview */}
      {dashboard.goals.length > 0 && (<View style={s.section}><Text style={s.sectionTitle}>Today's Goals</Text>
        {dashboard.goals.map(g => (
          <View key={g.id} style={s.goalRow}>
            <Text style={{ fontSize: 16 }}>{g.met ? "✅" : "⬜"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.goalName, g.met && s.goalDone]}>{g.title}</Text>
              <Text style={s.goalProg}>{g.progress}/{g.target} {g.unit}{g.streak > 0 ? ` 🔥${g.streak}` : ""}</Text>
            </View>
          </View>
        ))}
      </View>)}

      {/* Assignments */}
      <View style={s.section}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={s.sectionTitle}>Assignments</Text>
          <TouchableOpacity style={s.syncBtn} onPress={handleSync} disabled={syncing}>
            <Text style={s.syncBtnText}>{syncing ? "Syncing..." : "🔄 Sync"}</Text>
          </TouchableOpacity>
        </View>

        {assignments.length === 0 ? (
          <Text style={s.noData}>No assignments yet. Connect Canvas in Profile to sync.</Text>
        ) : assignments.slice(0, 10).map(a => (
          <View key={a.id} style={s.assignCard}>
            <View style={s.assignHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.assignTitle}>{a.title}</Text>
                <Text style={s.assignCourse}>{a.course_name}</Text>
              </View>
              {a.days_until_due != null && (
                <View style={[s.dueBadge, (a.days_until_due ?? 99) <= 2 && s.dueUrgent]}>
                  <Text style={s.dueText}>{a.days_until_due === 0 ? "TODAY" : a.days_until_due === 1 ? "TOMORROW" : `${a.days_until_due}d`}</Text>
                </View>
              )}
            </View>

            {a.study_plan ? (
              <View style={s.planBox}>
                <Text style={s.planHeader}>📋 Study Plan · ~{a.study_plan.estimated_total_minutes} min</Text>
                {a.study_plan.subtasks.map((st, i) => (
                  <View key={i} style={s.subtask}>
                    <Text style={s.subtaskNum}>{i + 1}.</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.subtaskTitle}>{st.title}</Text>
                      <Text style={s.subtaskDesc}>{st.description}</Text>
                      {st.resources.map((r, ri) => (
                        <TouchableOpacity key={ri} onPress={() => Linking.openURL(r)}>
                          <Text style={s.link} numberOfLines={1}>🔗 {r}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
                <Text style={s.encourageInline}>💬 {a.study_plan.encouragement}</Text>
              </View>
            ) : (
              <TouchableOpacity style={[s.planBtn, generatingPlanFor === a.id && { opacity: 0.5 }]} onPress={() => handlePlan(a.id)} disabled={generatingPlanFor === a.id}>
                <Text style={s.planBtnText}>{generatingPlanFor === a.id ? "Generating..." : "🤖 Generate Study Plan"}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Encouragement */}
      <View style={s.section}><Text style={s.sectionTitle}>Motivation</Text>
        {encouragement ? (
          <View style={s.encourageCard}><Text style={s.encourageText}>"{encouragement}"</Text><Text style={s.encourageFrom}>— Trail AI 🥾</Text></View>
        ) : (
          <TouchableOpacity style={s.encourageBtn} onPress={fetchEncouragement} disabled={encLoading}>
            <Text style={s.encourageBtnText}>{encLoading ? "Thinking..." : "✨ Get Encouragement"}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView></SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" }, scroll: { padding: 20, paddingBottom: 40 },
  loading: { color: "#888", textAlign: "center", marginTop: 100 },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff", marginTop: 10 }, subtitle: { fontSize: 15, color: "#888", marginBottom: 12 },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  stat: { flex: 1, backgroundColor: "#1a1a1a", borderRadius: 14, padding: 16, alignItems: "center" },
  statNum: { color: "#7C6FF7", fontSize: 28, fontWeight: "bold" }, statLabel: { color: "#888", fontSize: 12, marginTop: 4 },
  section: { marginTop: 24 }, sectionTitle: { fontSize: 18, fontWeight: "700", color: "#ccc", marginBottom: 10 },
  goalRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, gap: 10 },
  goalName: { color: "#fff", fontSize: 15 }, goalDone: { color: "#4CAF50", textDecorationLine: "line-through" },
  goalProg: { color: "#888", fontSize: 12, marginTop: 2 },
  syncBtn: { backgroundColor: "#2a2a4a", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  syncBtnText: { color: "#7C6FF7", fontSize: 12, fontWeight: "600" },
  noData: { color: "#666", fontSize: 14, marginTop: 8 },
  assignCard: { backgroundColor: "#1a1a1a", borderRadius: 14, padding: 16, marginBottom: 10 },
  assignHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  assignTitle: { color: "#fff", fontSize: 16, fontWeight: "600" }, assignCourse: { color: "#888", fontSize: 13, marginTop: 2 },
  dueBadge: { backgroundColor: "#2a2a4a", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  dueUrgent: { backgroundColor: "#E5393530" }, dueText: { color: "#7C6FF7", fontSize: 11, fontWeight: "700" },
  planBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#333" },
  planHeader: { color: "#888", fontSize: 13, marginBottom: 8 },
  subtask: { flexDirection: "row", gap: 8, marginVertical: 4 },
  subtaskNum: { color: "#7C6FF7", fontSize: 13, fontWeight: "700", width: 20 },
  subtaskTitle: { color: "#ccc", fontSize: 14, fontWeight: "600" }, subtaskDesc: { color: "#888", fontSize: 12, marginTop: 2 },
  link: { color: "#7C6FF7", fontSize: 12, marginTop: 4 },
  encourageInline: { color: "#888", fontSize: 13, marginTop: 10, fontStyle: "italic" },
  planBtn: { backgroundColor: "#2a2a4a", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 12 },
  planBtnText: { color: "#7C6FF7", fontSize: 14, fontWeight: "600" },
  encourageCard: { backgroundColor: "#1a1a2a", borderRadius: 14, padding: 20, borderWidth: 1, borderColor: "#2a2a4a" },
  encourageText: { color: "#ccc", fontSize: 15, lineHeight: 22, fontStyle: "italic" },
  encourageFrom: { color: "#7C6FF7", fontSize: 13, marginTop: 10 },
  encourageBtn: { backgroundColor: "#1a1a2a", paddingVertical: 16, borderRadius: 14, alignItems: "center", borderWidth: 1, borderColor: "#2a2a4a" },
  encourageBtnText: { color: "#7C6FF7", fontSize: 15, fontWeight: "600" },
  emptyCard: { alignItems: "center", marginTop: 80 }, emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", marginTop: 12 },
  emptyHint: { color: "#888", fontSize: 14, marginTop: 6 },
});
