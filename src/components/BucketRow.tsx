import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CategoryBucket, TestResult } from '../lib/types';
import { colors } from '../lib/theme';
import { PORT_CATEGORY_LABELS } from '../lib/ports';
import { DEST_CATEGORY_LABELS } from '../lib/destLabels';
import { ResultBadge } from './ResultBadge';

export function BucketRow({ bucket, sampleResults }: { bucket: CategoryBucket; sampleResults: TestResult[] }) {
  const [open, setOpen] = useState(false);
  const matching = sampleResults.filter(
    (r) => r.destCategory === bucket.destCategory && r.portCategory === bucket.portCategory && (r.status === 'open' || r.status === 'simulated-open' || r.status === 'refused')
  );

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 8 }}>
      <Pressable onPress={() => setOpen((o) => !o)} style={{ padding: 12 }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
          {DEST_CATEGORY_LABELS[bucket.destCategory] ?? bucket.destCategory} · {PORT_CATEGORY_LABELS[bucket.portCategory]}
        </Text>
        <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 4 }}>
          {bucket.total.toLocaleString()} tested — {bucket.open.toLocaleString()} reachable, {bucket.refused.toLocaleString()} suspect,{' '}
          {bucket.filtered.toLocaleString()} blocked, {bucket.error.toLocaleString()} errored
        </Text>
      </Pressable>
      {open && (
        <View style={{ paddingHorizontal: 12, paddingBottom: 12, gap: 4 }}>
          {matching.length === 0 ? (
            <Text style={{ color: colors.textDim, fontSize: 11 }}>No reachable/suspect ports sampled in this bucket.</Text>
          ) : (
            matching.slice(0, 50).map((r, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 4,
                  borderBottomWidth: i < Math.min(matching.length, 50) - 1 ? 1 : 0,
                  borderBottomColor: colors.cardBorder,
                }}
              >
                <Text numberOfLines={1} style={{ color: colors.text, fontSize: 12, flex: 1, marginRight: 8 }}>
                  {r.host}:{r.port}
                </Text>
                <ResultBadge result={r} />
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}
