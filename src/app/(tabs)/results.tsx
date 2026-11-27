import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScan } from '../../lib/scanStore';
import { colors } from '../../lib/theme';
import { StatPill } from '../../components/StatPill';
import { BucketRow } from '../../components/BucketRow';
import { RemoteControlCheck } from '../../components/RemoteControlCheck';

export default function ResultsScreen() {
  const scan = useScan();
  const run = scan.lastRun;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>Results</Text>

        {!run ? (
          <Text style={{ color: colors.textDim, fontSize: 13 }}>No completed run yet. Start a test from the Run tab.</Text>
        ) : (
          <>
            <Text style={{ color: colors.textDim, fontSize: 12 }}>
              {run.stopped ? 'Stopped early — ' : 'Completed — '}
              {run.tested.toLocaleString()} / {run.totalTargets.toLocaleString()} targets tested
              {run.simulated ? ' (SIMULATED, web preview)' : ''}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <StatPill label="Reachable" value={run.openCount} color={colors.success} />
              <StatPill label="Suspect" value={run.refusedCount} color={colors.warn} />
              <StatPill label="Blocked" value={run.filteredCount} color={colors.danger} />
              <StatPill label="Errors" value={run.errorCount} color={colors.textDim} />
            </View>

            <RemoteControlCheck buckets={run.buckets} />

            <Text style={{ color: colors.textDim, fontSize: 12, marginTop: 6 }}>BY CATEGORY (tap to expand)</Text>
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
