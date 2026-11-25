import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CategoryBucket, TestResult } from '../lib/types';
import { colors } from '../lib/theme';
import { PORT_CATEGORY_LABELS } from '../lib/ports';

const DEST_LABELS: Record<string, string> = {
  dns: 'DNS resolvers',
  ntp: 'NTP servers',
  'cdn-cloud': 'CDN / cloud anchors',
  speedtest: 'Speedtest hosts',
};

export function BucketRow({ bucket, sampleResults }: { bucket: CategoryBucket; sampleResults: TestResult[] }) {
  const [open, setOpen] = useState(false);
  const matching = sampleResults.filter(
    (r) => r.destCategory === bucket.destCategory && r.portCategory === bucket.portCategory && (r.status === 'open' || r.status === 'simulated-open' || r.status === 'refused')
  );

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 8 }}>
      <Pressable onPress={() => setOpen((o) => !o)} style={{ padding: 12 }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
          {DEST_LABELS[bucket.destCategory] ?? bucket.destCategory} · {PORT_CATEGORY_LABELS[bucket.portCategory]}
        </Text>
        <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 4 }}>
          {bucket.total.toLocaleString()} tested — {bucket.open.toLocaleString()} open, {bucket.refused.toLocaleString()} refused,{' '}
          {bucket.filtered.toLocaleString()} filtered, {bucket.error.toLocaleString()} errored
        </Text>
      </Pressable>
      {open && (
        <View style={{ paddingHorizontal: 12, paddingBottom: 12, gap: 4 }}>
          {matching.length === 0 ? (
            <Text style={{ color: colors.textDim, fontSize: 11 }}>No open/refused ports sampled in this bucket.</Text>
          ) : (
            matching.slice(0, 50).map((r, i) => (
              <Text key={i} style={{ color: colors.textDim, fontSize: 11 }}>
                {r.host}:{r.port} — {r.status}
                {r.latencyMs ? ` (${r.latencyMs}ms)` : ''}
              </Text>
            ))
          )}
        </View>
      )}
    </View>
  );
}
