import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TrailColors } from '@/constants/theme';

export default function TasksScreen() {
  return (
    <View style={styles.page}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.label}>TASKS</Text>
          <Text style={styles.title}>Today's Tasks</Text>
          <Text style={styles.subtitle}>Complete tasks to earn steps</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>PERSONAL</Text>
            <Text style={[styles.statValue, { color: TrailColors.emerald.text }]}>2/5</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>ACADEMIC</Text>
            <Text style={[styles.statValue, { color: TrailColors.cyan.border }]}>3/6</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>PROFESSIONAL</Text>
            <Text style={[styles.statValue, { color: TrailColors.purple.border }]}>1/4</Text>
          </View>
        </View>

        {[
          { title: 'Finish math homework', sub: 'Academic • Due tonight', color: TrailColors.emerald.text },
          { title: 'Read 20 pages', sub: 'Personal • Daily goal', color: TrailColors.cyan.border },
          { title: 'Update portfolio site', sub: 'Professional • This week', color: TrailColors.purple.border },
          { title: 'Study for physics exam', sub: 'Academic • Tomorrow', color: TrailColors.cyan.border },
          { title: 'Morning workout', sub: 'Personal • Daily habit', color: TrailColors.emerald.text },
        ].map((task, i) => (
          <TouchableOpacity key={i} style={styles.taskCard} activeOpacity={0.8}>
            <View style={[styles.checkbox, { borderColor: task.color }]} />
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskSub}>{task.sub}</Text>
            </View>
            <Text style={[styles.stepBadge, { color: task.color }]}>+1 👣</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: TrailColors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 },
  header: { marginBottom: 24 },
  label: { fontSize: 11, letterSpacing: 3, color: TrailColors.textMuted },
  title: { fontSize: 22, fontWeight: '600', color: TrailColors.textBody, marginTop: 8 },
  subtitle: { fontSize: 12, color: TrailColors.textCaption, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TrailColors.cardBorder,
    backgroundColor: TrailColors.surface,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1, color: TrailColors.textMuted },
  statValue: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: TrailColors.cardBorder,
    backgroundColor: TrailColors.surface,
    padding: 16,
    marginBottom: 8,
    shadowColor: TrailColors.shadowCard,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: TrailColors.textBody },
  taskSub: { fontSize: 12, color: TrailColors.textCaption, marginTop: 2 },
  stepBadge: { fontSize: 14, fontWeight: '700' },
  bottomSpacer: { height: 24 },
});
