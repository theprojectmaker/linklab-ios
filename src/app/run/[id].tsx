import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { loadRun } from '../../lib/storage';
import { RunDetail } from '../../lib/types';
import { colors } from '../../lib/theme';
import { StatPill } from '../../components/StatPill';
import { BucketRow } from '../../components/BucketRow';

export default function RunDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [run, setRun] = useState<RunDetail | null>(null);

  useEffect(() => {
    if (id) loadRun(id).then(setRun).catch(() => {});
  }, [id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {!run ? (
          <Text style={{ color: colors.textDim }}>Loading…</Text>
        ) : (
          <>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
              {new Date(run.startedAt).toLocaleString()}
            </Text>
            <Text style={{ color: colors.textDim, fontSize: 12 }}>
              Network: {run.network.ssid ?? 'unknown SSID'} · IP {run.network.ipAddress ?? '—'}
              {run.simulated ? ' · SIMULATED' : ''}
            </Text>
            <Text style={{ color: colors.textDim, fontSize: 12 }}>
              {run.stopped ? 'Stopped early — ' : 'Completed — '}
              {run.tested.toLocaleString()} / {run.totalTargets.toLocaleString()} tested
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <StatPill label="Open" value={run.openCount} color={colors.success} />
              <StatPill label="Refused" value={run.refusedCount} color={colors.warn} />
              <StatPill label="Filtered" value={run.filteredCount} color={colors.danger} />
              <StatPill label="Errors" value={run.errorCount} color={colors.textDim} />
            </View>
            <Text style={{ color: colors.textDim, fontSize: 12, marginTop: 6 }}>BY CATEGORY</Text>
            {run.buckets
              .slice()
              .sort((a, b) => b.open - a.open)
              .map((b) => (
                <BucketRow key={b.key} bucket={b} sampleResults={run.sampleResults} />
              ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
