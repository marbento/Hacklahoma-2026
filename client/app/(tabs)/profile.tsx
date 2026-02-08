import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Avatar } from '@/components/trail/avatar';
import { TrailColors } from '@/constants/theme';
import { useTrail } from '@/contexts/trail-context';

type Variant = 0 | 1;

function CycleButton({
  onPress,
  direction,
}: {
  onPress: () => void;
  direction: 'left' | 'right';
}) {
  return (
    <TouchableOpacity style={styles.cycleBtn} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.cycleBtnText}>{direction === 'left' ? '‹' : '›'}</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const {
    savedAvatar,
    selectedBody,
    setSelectedBody,
    selectedHair,
    setSelectedHair,
    selectedClothing,
    setSelectedClothing,
    saveAvatar,
  } = useTrail();

  const cycle = (current: Variant) => (current === 0 ? 1 : 0) as Variant;

  return (
    <View style={styles.page}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.label}>PROFILE</Text>
          <Text style={styles.title}>Avatar Maker</Text>
          <Text style={styles.subtitle}>Customize your pixel character</Text>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>YOUR AVATAR</Text>
          <View style={styles.previewInner}>
            <View style={styles.avatarWrap}>
              <Avatar
                body={selectedBody}
                hair={selectedHair}
                clothing={selectedClothing}
                size={280}
              />
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          {/* Body */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>BODY</Text>
            <View style={styles.controlButtons}>
              <CycleButton direction="left" onPress={() => setSelectedBody(cycle(selectedBody))} />
              <Text style={styles.controlValue}>Type {selectedBody + 1}</Text>
              <CycleButton direction="right" onPress={() => setSelectedBody(cycle(selectedBody))} />
            </View>
          </View>

          {/* Hair */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>HAIR</Text>
            <View style={styles.controlButtons}>
              <CycleButton direction="left" onPress={() => setSelectedHair(cycle(selectedHair))} />
              <Text style={styles.controlValue}>Style {selectedHair + 1}</Text>
              <CycleButton direction="right" onPress={() => setSelectedHair(cycle(selectedHair))} />
            </View>
          </View>

          {/* Clothing */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>CLOTHING</Text>
            <View style={styles.controlButtons}>
              <CycleButton direction="left" onPress={() => setSelectedClothing(cycle(selectedClothing))} />
              <Text style={styles.controlValue}>Outfit {selectedClothing + 1}</Text>
              <CycleButton direction="right" onPress={() => setSelectedClothing(cycle(selectedClothing))} />
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={saveAvatar} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Save Avatar</Text>
          </TouchableOpacity>
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
  previewCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: TrailColors.cardBorder,
    backgroundColor: TrailColors.surface,
    padding: 20,
    marginBottom: 16,
    shadowColor: TrailColors.shadowCard,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 26,
    elevation: 6,
  },
  previewLabel: { fontSize: 11, letterSpacing: 2, color: TrailColors.textMuted, textAlign: 'center' },
  previewInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    minHeight: 320,
    width: '100%',
  },
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: { gap: 8 },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: TrailColors.cardBorder,
    backgroundColor: TrailColors.surface,
    padding: 12,
    shadowColor: TrailColors.shadowCard,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 4,
  },
  controlLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 2, color: TrailColors.textMuted },
  controlButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cycleBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: TrailColors.borderButton,
    backgroundColor: TrailColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleBtnText: { fontSize: 14, color: TrailColors.borderButton, fontWeight: '700' },
  controlValue: { minWidth: 60, textAlign: 'center', fontSize: 12, fontWeight: '600', color: TrailColors.textBody },
  saveBtn: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: TrailColors.accent,
    backgroundColor: TrailColors.accentBg,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    color: TrailColors.accent,
  },
  bottomSpacer: { height: 24 },
});
