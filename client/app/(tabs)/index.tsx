import { Audio } from 'expo-av';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity as RNTouchableOpacity,
  View,
} from 'react-native';
import { TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';

// gesture-handler TouchableOpacity doesn't handle web clicks; use RN on web
const TouchableOpacity =
  Platform.OS === 'web' ? RNTouchableOpacity : GHTouchableOpacity;

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getInsight } from '@/services/insightsEngine';
import {
  isElevenLabsConfigured,
  MALE_VOICE_ID,
  speakWithElevenLabs,
} from '@/services/elevenLabsSpeech';
import { getMockScreenTimeForDay } from '@/services/screenTime';
import { speak as speechSpeak, stop as speechStop } from '@/services/speech';
import { useStore } from '@/store/useStore';
import type { DailyScreenTime } from '@/store/types';

const todayDateStr = () => new Date().toISOString().slice(0, 10);

function categoryLabel(cat: string): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

export default function HomeScreen() {
  const settings = useStore((s) => s.settings);
  const screenTimeHistory = useStore((s) => s.screenTimeHistory);
  const appendScreenTimeDay = useStore((s) => s.appendScreenTimeDay);

  const todayScreenTime = useMemo((): DailyScreenTime => {
    const today = todayDateStr();
    const fromHistory = screenTimeHistory.find((d) => d.date === today);
    return fromHistory ?? getMockScreenTimeForDay(today);
  }, [screenTimeHistory]);

  const insight = useMemo(
    () => getInsight(todayScreenTime),
    [todayScreenTime]
  );

  const [affirmationLoading, setAffirmationLoading] = useState(false);
  const [helloLoading, setHelloLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [suggestionPlaying, setSuggestionPlaying] = useState(false);

  const handleSaveToday = useCallback(() => {
    console.log('[Home] Save today\'s data button pressed');
    appendScreenTimeDay(todayScreenTime);
    console.log('[Home] Today\'s data saved:', {
      date: todayScreenTime.date,
      totalMinutes: todayScreenTime.totalMinutes,
      entriesCount: todayScreenTime.entries.length,
    });
    setSavedMessage('Saved!');
    setTimeout(() => setSavedMessage(null), 2000);
  }, [appendScreenTimeDay, todayScreenTime]);

  const playSuggestion = useCallback(() => {
    if (!settings.voiceEnabled) return;
    speechStop();
    speechSpeak(insight.suggestion);
    setSuggestionPlaying(true);
    setTimeout(() => setSuggestionPlaying(false), 1500);
  }, [insight.suggestion, settings.voiceEnabled]);

  const playAffirmation = useCallback(async () => {
    if (!settings.voiceEnabled) return;
    if (affirmationLoading) return;

    const run = async () => {
      setAffirmationLoading(true);
      try {
        if (Platform.OS === 'ios') {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
            interruptionModeAndroid: 1,
            interruptionModeIOS: 1,
          });
        }
        await speakWithElevenLabs(insight.affirmation);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Playback failed';
        if (isElevenLabsConfigured()) {
          Alert.alert('Affirmation', message);
        } else {
          speechStop();
          speechSpeak(insight.affirmation);
        }
      } finally {
        setAffirmationLoading(false);
      }
    };
    await run();
  }, [insight.affirmation, affirmationLoading, settings.voiceEnabled]);

  const playHelloMale = useCallback(async () => {
    if (helloLoading) return;
    setHelloLoading(true);
    try {
      if (Platform.OS === 'ios') {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1,
          interruptionModeIOS: 1,
        });
      }
      await speakWithElevenLabs('hello', {
        voiceId: MALE_VOICE_ID,
        useServerOnly: true,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Playback failed';
      Alert.alert('Say hello', message);
    } finally {
      setHelloLoading(false);
    }
  }, [helloLoading]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of todayScreenTime.entries) {
      map[e.category] = (map[e.category] ?? 0) + e.minutes;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [todayScreenTime.entries]);

  const hasTodayInHistory = screenTimeHistory.some(
    (d) => d.date === todayDateStr()
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<View style={{ flex: 1 }} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Dashboard</ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Say hello</ThemedText>
        <ThemedText style={styles.body}>
          Play &quot;hello&quot; in a male voice (Eleven Labs).
        </ThemedText>
        <Pressable
          style={[styles.button, helloLoading && styles.buttonDisabled]}
          onPress={playHelloMale}
          disabled={helloLoading}
        >
          {helloLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText style={styles.buttonText}>Say hello</ThemedText>
          )}
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Today&apos;s screen time</ThemedText>
        <ThemedText style={styles.summary}>
          {todayScreenTime.totalMinutes} min total · {todayScreenTime.entries.length} apps
        </ThemedText>
        {byCategory.length > 0 && (
          <ThemedText style={styles.categories}>
            {byCategory
              .map(([cat, min]) => `${categoryLabel(cat)}: ${min} min`)
              .join(' · ')}
          </ThemedText>
        )}
        {!hasTodayInHistory && (
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPressIn={() => console.log('[Home] Save button touch started')}
            onPress={handleSaveToday}
          >
            <ThemedText style={styles.buttonText}>Save today&apos;s data</ThemedText>
          </TouchableOpacity>
        )}
        {savedMessage && (
          <ThemedText style={styles.feedbackText}>{savedMessage}</ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Suggestion</ThemedText>
        <ThemedText style={styles.body}>{insight.suggestion}</ThemedText>
        {settings.voiceEnabled && (
          <>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={playSuggestion}
            >
              <ThemedText style={styles.buttonText}>
                {suggestionPlaying ? 'Playing…' : 'Play'}
              </ThemedText>
            </Pressable>
            {suggestionPlaying && (
              <ThemedText style={styles.feedbackText}>Speaking suggestion…</ThemedText>
            )}
          </>
        )}
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Affirmation</ThemedText>
        <ThemedText style={styles.body}>{insight.affirmation}</ThemedText>
        {settings.voiceEnabled && (
          <Pressable
            style={[styles.button, affirmationLoading && styles.buttonDisabled]}
            onPress={playAffirmation}
            disabled={affirmationLoading}
          >
            {affirmationLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={styles.buttonText}>Play</ThemedText>
            )}
          </Pressable>
        )}
      </ThemedView>

      <ThemedView style={styles.footer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <ThemedText style={styles.footerText}>
            Suggestion and affirmation are based on today&apos;s screen time.
          </ThemedText>
        </ScrollView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 16,
  },
  card: {
    gap: 8,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  summary: {
    fontSize: 14,
    opacity: 0.9,
  },
  categories: {
    fontSize: 13,
    opacity: 0.85,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 4,
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    minWidth: 88,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 14,
    marginTop: 6,
    opacity: 0.9,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  footer: {
    marginTop: 8,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.75,
  },
});
