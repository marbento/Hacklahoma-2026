import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { API_BASE_URL } from '@/constants/api';

interface BehaviorLogEntry {
  time: string;
  app: string;
  minutes: number;
}

interface DailyAnalysis {
  date: string | null;
  total_duration_minutes: number;
  total_time_saved_minutes: number;
  total_time_wasted_minutes: number;
  net_time_saved_minutes: number;
  breakdown: {
    productive_apps: {
      count: number;
      total_minutes: number;
      time_saved: number;
    };
    wasteful_apps: {
      count: number;
      total_minutes: number;
      time_wasted: number;
    };
  };
  by_category: Record<string, { minutes: number; saved: number; wasted: number }>;
  sessions: Array<{
    app: string;
    time: string;
    duration_minutes: number;
    time_saved: number;
    time_wasted: number;
    category: string;
    is_productive: boolean;
  }>;
}

export function TimeSavedDisplay() {
  const [analysis, setAnalysis] = useState<DailyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTimeAnalysis();
  }, []);

  const loadTimeAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load input.json data
      const inputData = require('../data/input.json');
      const todayData = inputData.today;

      if (!todayData || !todayData.behaviorLog) {
        throw new Error('No behavior log data found');
      }

      // Prepare request payload
      const payload = {
        date: todayData.date,
        behaviorLog: todayData.behaviorLog.map((entry: any) => ({
          time: entry.time,
          app: entry.app,
          minutes: entry.minutes,
        })),
      };

      // Call the analyze-day endpoint
      const response = await fetch(`${API_BASE_URL}/analyze-day`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time analysis');
      console.error('Error loading time analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Calculating time saved...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.errorTitle}>
          Error
        </ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <ThemedText style={styles.hintText}>
          Make sure the backend server is running on {API_BASE_URL}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Today's Time Analysis
      </ThemedText>

      {analysis.date && (
        <ThemedText style={styles.date}>Date: {analysis.date}</ThemedText>
      )}

      {/* Summary Cards */}
      <ThemedView style={styles.summaryContainer}>
        <ThemedView style={styles.summaryCard}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Time Saved
          </ThemedText>
          <ThemedText style={styles.cardValue}>
            {analysis.total_time_saved_minutes.toFixed(1)} min
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.summaryCard}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Time Wasted
          </ThemedText>
          <ThemedText style={styles.cardValue}>
            {analysis.total_time_wasted_minutes.toFixed(1)} min
          </ThemedText>
        </ThemedView>

        <ThemedView style={[styles.summaryCard, styles.netCard]}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Net Saved
          </ThemedText>
          <ThemedText
            style={[
              styles.cardValue,
              analysis.net_time_saved_minutes >= 0 ? styles.positive : styles.negative,
            ]}>
            {analysis.net_time_saved_minutes >= 0 ? '+' : ''}
            {analysis.net_time_saved_minutes.toFixed(1)} min
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Breakdown */}
      <ThemedView style={styles.breakdownContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Breakdown
        </ThemedText>

        <ThemedView style={styles.breakdownRow}>
          <ThemedText style={styles.breakdownLabel}>Productive Apps:</ThemedText>
          <ThemedText style={styles.breakdownValue}>
            {analysis.breakdown.productive_apps.count} apps,{' '}
            {analysis.breakdown.productive_apps.total_minutes.toFixed(1)} min
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.breakdownRow}>
          <ThemedText style={styles.breakdownLabel}>Wasteful Apps:</ThemedText>
          <ThemedText style={styles.breakdownValue}>
            {analysis.breakdown.wasteful_apps.count} apps,{' '}
            {analysis.breakdown.wasteful_apps.total_minutes.toFixed(1)} min
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Sessions */}
      <ThemedView style={styles.sessionsContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          App Sessions
        </ThemedText>
        {analysis.sessions.map((session, index) => (
          <ThemedView key={index} style={styles.sessionCard}>
            <ThemedView style={styles.sessionHeader}>
              <ThemedText type="defaultSemiBold">{session.app}</ThemedText>
              <ThemedText style={styles.sessionTime}>{session.time}</ThemedText>
            </ThemedView>
            <ThemedText style={styles.sessionDetails}>
              {session.duration_minutes.toFixed(1)} min • {session.category}
            </ThemedText>
            <ThemedView style={styles.sessionMetrics}>
              {session.time_saved > 0 && (
                <ThemedText style={[styles.metric, styles.savedMetric]}>
                  Saved: {session.time_saved.toFixed(1)} min
                </ThemedText>
              )}
              {session.time_wasted > 0 && (
                <ThemedText style={[styles.metric, styles.wastedMetric]}>
                  Wasted: {session.time_wasted.toFixed(1)} min
                </ThemedText>
              )}
            </ThemedView>
          </ThemedView>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  loadingText: {
    marginTop: 8,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#ff4444',
    marginBottom: 8,
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 12,
    opacity: 0.7,
  },
  title: {
    marginBottom: 8,
  },
  date: {
    opacity: 0.7,
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    alignItems: 'center',
  },
  netCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  cardTitle: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#f44336',
  },
  breakdownContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    opacity: 0.7,
  },
  breakdownValue: {
    fontWeight: '600',
  },
  sessionsContainer: {
    marginTop: 8,
  },
  sessionCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  sessionDetails: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  sessionMetrics: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  metric: {
    fontSize: 12,
    fontWeight: '600',
  },
  savedMetric: {
    color: '#4CAF50',
  },
  wastedMetric: {
    color: '#f44336',
  },
});
