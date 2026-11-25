import { ScrollView, Text, View } from 'react-native';
import { TestResult } from '../lib/types';
import { colors } from '../lib/theme';
import { ResultBadge } from './ResultBadge';

/** Live "works / doesn't work" feed — most recent results first, updated as the scan runs. */
export function LiveResultsFeed({ results }: { results: TestResult[] }) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.cardBorder, padding: 10, maxHeight: 240 }}>
      <Text style={{ color: colors.textDim, fontSize: 12, marginBottom: 6 }}>LIVE — most recent results</Text>
      {results.length === 0 ? (
        <Text style={{ color: colors.textDim, fontSize: 12 }}>Waiting for first results…</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {results.map((r, i) => (
            <View
              key={`${r.host}:${r.port}:${i}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 6,
                borderBottomWidth: i < results.length - 1 ? 1 : 0,
                borderBottomColor: colors.cardBorder,
              }}
            >
              <Text numberOfLines={1} style={{ color: colors.text, fontSize: 12, flex: 1, marginRight: 8 }}>
                {r.host}:{r.port}
              </Text>
              <ResultBadge result={r} />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
