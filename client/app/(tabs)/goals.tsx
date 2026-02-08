import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TrailColors } from '@/constants/theme';

export default function GoalsScreen() {
  return (
    <View style={styles.page}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.label}>INTEGRATIONS</Text>
          <Text style={styles.title}>Connected Apps</Text>
          <Text style={styles.subtitle}>Earn camping items by connecting apps</Text>
        </View>

        {/* Canvas - connected */}
        <View style={styles.card}>
          <View style={styles.appRow}>
            <View style={[styles.appIcon, { backgroundColor: TrailColors.emerald.border }]}>
              <Text style={styles.appEmoji}>📚</Text>
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>Canvas LMS</Text>
              <Text style={styles.appDesc}>Tracks study time</Text>
            </View>
            <Text style={[styles.check, { color: TrailColors.emerald.text }]}>✓</Text>
          </View>
          <View style={[styles.itemBox, { borderColor: TrailColors.emerald.border, backgroundColor: TrailColors.emerald.bg }]}>
            <Text style={styles.itemEmoji}>⛺</Text>
            <View>
              <Text style={styles.itemName}>Study Tent</Text>
              <Text style={styles.itemDesc}>+2 fog reveal distance</Text>
            </View>
          </View>
        </View>

        {/* Notion - connected */}
        <View style={styles.card}>
          <View style={styles.appRow}>
            <View style={[styles.appIcon, { backgroundColor: TrailColors.purple.border }]}>
              <Text style={styles.appEmoji}>💼</Text>
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>Notion</Text>
              <Text style={styles.appDesc}>Tracks work time</Text>
            </View>
            <Text style={[styles.check, { color: TrailColors.purple.border }]}>✓</Text>
          </View>
          <View style={[styles.itemBox, { borderColor: TrailColors.purple.border, backgroundColor: TrailColors.purple.bg }]}>
            <Text style={styles.itemEmoji}>🔦</Text>
            <View>
              <Text style={styles.itemName}>Flashlight</Text>
              <Text style={styles.itemDesc}>See path connections</Text>
            </View>
          </View>
        </View>

        {/* Google Calendar - locked */}
        <View style={[styles.card, styles.cardLocked]}>
          <View style={styles.appRow}>
            <View style={[styles.appIcon, { backgroundColor: '#e5e7eb' }]}>
              <Text style={styles.appEmoji}>🎯</Text>
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>Google Calendar</Text>
              <Text style={styles.appDesc}>Add to unlock</Text>
            </View>
            <TouchableOpacity style={styles.connectBtn}>
              <Text style={styles.connectBtnText}>Connect</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.itemBox, { borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }]}>
            <Text style={[styles.itemEmoji, { opacity: 0.4 }]}>🧭</Text>
            <View>
              <Text style={styles.itemName}>Compass</Text>
              <Text style={styles.itemDesc}>Points to next goal</Text>
            </View>
          </View>
        </View>

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
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: TrailColors.cardBorder,
    backgroundColor: TrailColors.surface,
    padding: 16,
    marginBottom: 16,
    shadowColor: TrailColors.shadowCard,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 26,
    elevation: 6,
  },
  cardLocked: { opacity: 0.85 },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  appIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  appEmoji: { fontSize: 24 },
  appInfo: { flex: 1 },
  appName: { fontSize: 16, fontWeight: '600', color: TrailColors.textBody },
  appDesc: { fontSize: 12, color: TrailColors.textCaption },
  check: { fontSize: 18, fontWeight: '700' },
  itemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemEmoji: { fontSize: 20 },
  itemName: { fontSize: 14, fontWeight: '600', color: TrailColors.textBody },
  itemDesc: { fontSize: 12, color: TrailColors.textCaption },
  connectBtn: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  connectBtnText: { fontSize: 12, fontWeight: '700', color: '#4b5563' },
  bottomSpacer: { height: 24 },
});
