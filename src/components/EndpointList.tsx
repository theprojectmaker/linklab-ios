import { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { TestResult } from '../lib/types';
import { colors } from '../lib/theme';
import { StatusBucket, STATUS_BUCKET_COLOR, statusBucket } from '../lib/statusVisual';

export type EndpointFilter = 'all' | StatusBucket;

interface Props {
  results: TestResult[]; // oldest first, live reference — do not mutate
  filter: EndpointFilter;
  search: string;
  /** Changes whenever `results` has grown enough to be worth re-rendering. */
  tick: number;
}

const ROW_HEIGHT = 52;

function Row({ r }: { r: TestResult }) {
  const bucket = statusBucket(r.status);
  const color = STATUS_BUCKET_COLOR[bucket];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 2,
        height: ROW_HEIGHT,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
        gap: 10,
      }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
          {r.host}
        </Text>
        <Text numberOfLines={1} style={{ color: colors.textDim, fontSize: 11, marginTop: 1 }}>
          {r.portCategory} · port {r.port}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color, fontSize: 13, fontWeight: '700' }}>
          {bucket === 'reachable' ? '✓' : bucket === 'suspect' ? '!' : '✕'}
          {r.latencyMs != null ? ` ${r.latencyMs}ms` : ''}
        </Text>
      </View>
    </View>
  );
}

/** Searchable/filterable live list of every endpoint tested so far this run. */
export function EndpointList({ results, filter, search, tick }: Props) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out: TestResult[] = [];
    // Walk newest-first (array is oldest-first) so the visible list reads
    // like a live feed without needing an O(n) reverse/unshift on insert.
    for (let i = results.length - 1; i >= 0; i--) {
      const r = results[i];
      if (filter !== 'all' && statusBucket(r.status) !== filter) continue;
      if (q && !r.host.toLowerCase().includes(q)) continue;
      out.push(r);
      if (out.length >= 500) break; // plenty for a scroll window; avoids building huge arrays while typing
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search, tick]);

  if (results.length === 0) {
    return (
      <View style={{ paddingVertical: 24, alignItems: 'center' }}>
        <Text style={{ color: colors.textDim, fontSize: 12 }}>Waiting for first results…</Text>
      </View>
    );
  }

  if (filtered.length === 0) {
    return (
      <View style={{ paddingVertical: 24, alignItems: 'center' }}>
        <Text style={{ color: colors.textDim, fontSize: 12 }}>No endpoints match.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(r, i) => `${r.host}:${r.port}:${i}`}
      renderItem={({ item }) => <Row r={item} />}
      getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
      initialNumToRender={20}
      maxToRenderPerBatch={20}
      windowSize={7}
      style={{ maxHeight: 420 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
