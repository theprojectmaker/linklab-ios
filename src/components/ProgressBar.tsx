import { View } from 'react-native';
import { colors } from '../lib/theme';

export function ProgressBar({ fraction }: { fraction: number }) {
  const pct = Math.max(0, Math.min(1, fraction)) * 100;
  return (
    <View style={{ height: 10, borderRadius: 6, backgroundColor: colors.cardBorder, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${pct}%`, backgroundColor: colors.accent }} />
    </View>
  );
}
