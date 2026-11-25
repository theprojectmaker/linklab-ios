import { Text, View } from 'react-native';
import { colors } from '../lib/theme';

export function StatPill({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.cardBorder }}>
      <Text style={{ color: color ?? colors.text, fontSize: 18, fontWeight: '700' }}>{value}</Text>
      <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}
