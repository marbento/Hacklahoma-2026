// frontend/app/(tabs)/goals.tsx
import { useState, useCallback } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useGoals } from "../../hooks/useGoals";

const CATEGORIES = [
  { key: "academic", emoji: "📚", label: "Academic" },
  { key: "fitness", emoji: "🏃", label: "Fitness" },
  { key: "wellness", emoji: "🧘", label: "Wellness" },
  { key: "creative", emoji: "🎨", label: "Creative" },
  { key: "other", emoji: "✨", label: "Other" },
];

export default function GoalsScreen() {
  const { goals, loading, create, log, remove } = useGoals();
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("other");
  const [newTarget, setNewTarget] = useState("1");
  const [newUnit, setNewUnit] = useState("times");

  const handleCreate = useCallback(async () => {
    if (!newTitle.trim()) { Alert.alert("Name your goal"); return; }
    try {
      await create({ title: newTitle.trim(), category: newCategory, target_value: parseFloat(newTarget) || 1, target_unit: newUnit, frequency: "daily" });
      setNewTitle(""); setNewTarget("1"); setNewUnit("times"); setShowCreate(false);
    } catch (e: any) { Alert.alert("Error", e.message); }
  }, [newTitle, newCategory, newTarget, newUnit, create]);

  const handleLog = useCallback(async (goalId: string, title: string) => {
    try {
      const res = await log(goalId);
      if (res.met) Alert.alert("Goal Met! 🎉", `You completed "${title}" for today!`);
    } catch (e: any) { Alert.alert("Error", e.message); }
  }, [log]);

  const handleDelete = useCallback((goalId: string, title: string) => {
    Alert.alert("Delete?", `Remove "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove(goalId) },
    ]);
  }, [remove]);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <View><Text style={s.title}>Goals 🎯</Text><Text style={s.subtitle}>{goals.length} active</Text></View>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowCreate(!showCreate)}>
            <Text style={s.addBtnText}>{showCreate ? "✕" : "+"}</Text>
          </TouchableOpacity>
        </View>

        {showCreate && (
          <View style={s.card}>
            <Text style={s.cardLabel}>NEW GOAL</Text>
            <TextInput style={s.input} placeholder='e.g., Read 5 pages per day' placeholderTextColor="#555" value={newTitle} onChangeText={setNewTitle} />
            <Text style={s.fieldLabel}>Category</Text>
            <View style={s.catRow}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c.key} style={[s.catPill, newCategory === c.key && s.catActive]} onPress={() => setNewCategory(c.key)}>
                  <Text style={s.catEmoji}>{c.emoji}</Text>
                  <Text style={[s.catText, newCategory === c.key && { color: "#fff" }]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.row}>
              <View style={{ flex: 1 }}><Text style={s.fieldLabel}>Target</Text><TextInput style={s.input} placeholder="5" placeholderTextColor="#555" value={newTarget} onChangeText={setNewTarget} keyboardType="numeric" /></View>
              <View style={{ flex: 1, marginLeft: 10 }}><Text style={s.fieldLabel}>Unit</Text><TextInput style={s.input} placeholder="pages" placeholderTextColor="#555" value={newUnit} onChangeText={setNewUnit} /></View>
            </View>
            <TouchableOpacity style={s.createBtn} onPress={handleCreate}><Text style={s.createBtnText}>Create Goal</Text></TouchableOpacity>
          </View>
        )}

        {loading ? <Text style={s.empty}>Loading...</Text> : goals.length === 0 ? (
          <View style={s.emptyCard}><Text style={{ fontSize: 48 }}>🎯</Text><Text style={s.emptyTitle}>No goals yet</Text><Text style={s.emptyHint}>Tap + to set your first goal</Text></View>
        ) : goals.map(g => {
          const pct = Math.min(100, (g.today_progress / g.target_value) * 100);
          const met = g.today_progress >= g.target_value;
          return (
            <View key={g.id} style={s.goalCard}>
              <View style={s.goalHeader}>
                <Text style={s.goalTitle}>{met ? "✅ " : ""}{g.title}</Text>
                <TouchableOpacity onPress={() => handleDelete(g.id, g.title)}><Text style={{ color: "#666" }}>✕</Text></TouchableOpacity>
              </View>
              <View style={s.bar}><View style={[s.barFill, { width: `${pct}%` }, met && { backgroundColor: "#4CAF50" }]} /></View>
              <Text style={s.prog}>{g.today_progress}/{g.target_value} {g.target_unit}{g.current_streak > 0 ? `  🔥 ${g.current_streak} day streak` : ""}</Text>
              {!met && <TouchableOpacity style={s.logBtn} onPress={() => handleLog(g.id, g.title)}><Text style={s.logBtnText}>Log +1 {g.target_unit}</Text></TouchableOpacity>}
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" }, scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff" }, subtitle: { fontSize: 14, color: "#888" },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#7C6FF7", alignItems: "center", justifyContent: "center" },
  addBtnText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  card: { backgroundColor: "#1a1a1a", borderRadius: 16, padding: 20, marginTop: 16 },
  cardLabel: { fontSize: 11, color: "#666", letterSpacing: 2, marginBottom: 12, fontWeight: "600" },
  input: { backgroundColor: "#111", borderRadius: 10, padding: 14, color: "#fff", fontSize: 15, borderWidth: 1, borderColor: "#333" },
  fieldLabel: { fontSize: 12, color: "#888", marginTop: 12, marginBottom: 6 },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: "#222", borderWidth: 1, borderColor: "#333" },
  catActive: { backgroundColor: "#7C6FF7", borderColor: "#7C6FF7" },
  catEmoji: { fontSize: 14, marginRight: 4 }, catText: { color: "#888", fontSize: 12 },
  row: { flexDirection: "row", marginTop: 4 },
  createBtn: { backgroundColor: "#7C6FF7", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 16 },
  createBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  goalCard: { backgroundColor: "#1a1a1a", borderRadius: 14, padding: 16, marginTop: 12 },
  goalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  goalTitle: { color: "#fff", fontSize: 16, fontWeight: "600", flex: 1 },
  bar: { height: 6, backgroundColor: "#333", borderRadius: 3, marginTop: 10, overflow: "hidden" },
  barFill: { height: 6, backgroundColor: "#7C6FF7", borderRadius: 3 },
  prog: { color: "#888", fontSize: 12, marginTop: 6 },
  logBtn: { backgroundColor: "#2a2a4a", paddingVertical: 10, borderRadius: 8, alignItems: "center", marginTop: 10 },
  logBtnText: { color: "#7C6FF7", fontSize: 14, fontWeight: "600" },
  empty: { color: "#666", textAlign: "center", marginTop: 40 },
  emptyCard: { alignItems: "center", marginTop: 60 }, emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", marginTop: 12 },
  emptyHint: { color: "#888", fontSize: 14, marginTop: 6 },
});
