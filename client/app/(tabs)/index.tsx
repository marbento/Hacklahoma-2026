import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/trail/avatar';
import { TrailColors } from '@/constants/theme';
import { useTrail } from '@/contexts/trail-context';

const investedMinutes = 220;
const totalSteps = 7;
const currentTile = 7;
const itemsCollected = 2;
const fogRevealDistance = 5;

const TILE_POSITIONS = [
  { x: 40, y: 420 },
  { x: 120, y: 400 },
  { x: 200, y: 380 },
  { x: 160, y: 360 },
  { x: 80, y: 340 },
  { x: 140, y: 320 },
  { x: 200, y: 300 },
  { x: 120, y: 280 },
  { x: 60, y: 260 },
  { x: 140, y: 240 },
  { x: 200, y: 220 },
  { x: 140, y: 200 },
  { x: 70, y: 180 },
  { x: 140, y: 160 },
  { x: 210, y: 140 },
  { x: 140, y: 120 },
  { x: 80, y: 100 },
  { x: 160, y: 80 },
  { x: 120, y: 60 },
  { x: 140, y: 40 },
];

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = String(minutes % 60).padStart(2, '0');
  return `${hours}h ${mins}m`;
}

export default function HomeScreen() {
  const { savedAvatar } = useTrail();

  return (
    <View style={styles.page}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status bar row */}
        <View style={styles.statusRow}>
          <Text style={styles.time}>10:42</Text>
          <View style={styles.statusIcons}>
            <View style={[styles.dot, { backgroundColor: TrailColors.emerald.dot }]} />
            <View style={[styles.dot, { backgroundColor: TrailColors.emerald.dot, opacity: 0.7 }]} />
            <View style={styles.battery} />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.label}>YOUR JOURNEY</Text>
            <Text style={styles.title}>The Trail</Text>
          </View>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>👣</Text>
              <Text style={styles.badgeText}>{totalSteps}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>📦</Text>
              <Text style={styles.badgeText}>{itemsCollected}</Text>
            </View>
          </View>
        </View>

        {/* Trail View */}
        <View style={styles.trailCard}>
          <View style={styles.trailInner}>
            {Array.from({ length: 20 }, (_, i) => {
              const tileIndex = 19 - i;
              const isCurrentTile = tileIndex === currentTile;
              const isPastTile = tileIndex < currentTile;
              const isFoggy = tileIndex > currentTile + fogRevealDistance;
              const pos = TILE_POSITIONS[tileIndex];

              return (
                <View
                  key={tileIndex}
                  style={[
                    styles.tileWrap,
                    {
                      left: pos.x,
                      top: pos.y,
                      opacity: isFoggy ? 0.15 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.tile,
                      isPastTile && styles.tilePast,
                      isCurrentTile && styles.tileCurrent,
                      !isPastTile && !isCurrentTile && styles.tileFuture,
                    ]}
                  />
                  {isCurrentTile && (
                    <View style={styles.avatarOnTile}>
                      <Avatar
                        body={savedAvatar.body}
                        hair={savedAvatar.hair}
                        clothing={savedAvatar.clothing}
                        size={48}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Time Invested This Week */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>TIME INVESTED THIS WEEK</Text>
          <Text style={styles.cardTitle}>{formatMinutes(investedMinutes)}</Text>
          <Text style={styles.cardCaption}>+22% from last week</Text>
        </View>

        {/* Recent Activities */}
        <Text style={styles.sectionLabel}>RECENT ACTIVITIES</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityRow}>
            <View>
              <Text style={styles.activityTitle}>Deep Focus</Text>
              <Text style={styles.activitySub}>2h in Canvas</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: TrailColors.emerald.bg }]}>
              <Text style={[styles.pillText, { color: TrailColors.emerald.text }]}>+2 👣</Text>
            </View>
          </View>
        </View>
        <View style={styles.activityCard}>
          <View style={styles.activityRow}>
            <View>
              <Text style={styles.activityTitle}>Project Work</Text>
              <Text style={styles.activitySub}>1h 30m in Notion</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: TrailColors.emerald.bg }]}>
              <Text style={[styles.pillText, { color: TrailColors.emerald.text }]}>+1 👣</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: TrailColors.background,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  time: {
    fontSize: 12,
    color: TrailColors.textSecondary,
    fontWeight: '500',
    letterSpacing: 2,
  },
  statusIcons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  battery: {
    width: 24,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    padding: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    letterSpacing: 3,
    color: TrailColors.textMuted,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: TrailColors.textBody,
    marginTop: 8,
  },
  badges: { flexDirection: 'row', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: TrailColors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  badgeEmoji: { fontSize: 18 },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: TrailColors.textBody,
  },
  trailCard: {
    height: 450,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: TrailColors.cardBorder,
    overflow: 'hidden',
    backgroundColor: '#e8f4ff',
    marginBottom: 24,
    shadowColor: TrailColors.shadowCard,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 8,
  },
  trailInner: {
    flex: 1,
    position: 'relative',
  },
  tileWrap: {
    position: 'absolute',
    width: 32,
    height: 32,
  },
  tile: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
  },
  tilePast: {
    borderColor: '#34d399',
    backgroundColor: '#d1fae5',
  },
  tileCurrent: {
    borderColor: '#22d3ee',
    backgroundColor: '#cffafe',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  tileFuture: {
    borderColor: '#d1d5db',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  avatarOnTile: {
    position: 'absolute',
    left: '50%',
    marginLeft: -24,
    top: -48,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: TrailColors.cardBorder,
    backgroundColor: TrailColors.surface,
    padding: 16,
    marginBottom: 24,
    shadowColor: TrailColors.shadowCard,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 26,
    elevation: 6,
  },
  cardLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: TrailColors.textMuted,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: TrailColors.textBody,
    marginTop: 8,
  },
  cardCaption: {
    fontSize: 12,
    color: TrailColors.textCaption,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: TrailColors.textMuted,
    marginBottom: 12,
  },
  activityCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: TrailColors.cardBorder,
    backgroundColor: TrailColors.surface,
    padding: 12,
    marginBottom: 8,
    shadowColor: TrailColors.shadowCard,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 4,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TrailColors.textBody,
  },
  activitySub: {
    fontSize: 12,
    color: TrailColors.textCaption,
    marginTop: 2,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSpacer: { height: 24 },
});
