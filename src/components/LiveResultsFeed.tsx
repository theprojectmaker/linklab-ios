import { ScrollView, Text, View } from 'react-native';
import { TestResult } from '../lib/types';
import { colors } from '../lib/theme';

function worksLabel(status: TestResult['status']): { text: string; color: string } {
  switch (status) {
    case 'open':
    case 'simulated-open':
      return { text: 'Works', color: colors.success };
    case 'refused':
      return { text: "Doesn't work (refused)", color: colors.warn };
    case 'filtered':
    case 'simulated-filtered':
      return { text: "Doesn't work (blocked)", color: colors.danger };
    case 'error':
    default:
      return { text: "Doesn't work (error)", color: colors.textDim };
  }
}

/** Live "works / doesn't work" feed — most recent results first, updated as the scan runs. */
export function LiveResultsFeed({ results }: { results: TestResult[] }) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.cardBorder, padding: 10, maxHeight: 220 }}>
      <Text style={{ color: colors.textDim, fontSize: 12, marginBottom: 6 }}>LIVE — most recent results</Text>
      {results.length === 0 ? (
        <Text style={{ color: colors.textDim, fontSize: 12 }}>Waiting for first results…</Text>
      ) : (
        <ScrollView>
          {results.map((r, i) => {
            const w = worksLabel(r.status);
            return (
              <View key={`${r.host}:${r.port}:${i}`} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
                <Text numberOfLines={1} style={{ color: colors.text, fontSize: 12, flex: 1, marginRight: 8 }}>
                  {r.host}:{r.port}
                </Text>
                <Text style={{ color: w.color, fontSize: 12, fontWeight: '700' }}>
                  {w.text}
                  {r.latencyMs ? ` · ${r.latencyMs}ms` : ''}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
