import { Text, View } from 'react-native';
import { TestResult } from '../lib/types';
import { colors } from '../lib/theme';

function resultVisual(status: TestResult['status']): { text: string; bg: string; fg: string } {
  switch (status) {
    case 'open':
    case 'simulated-open':
      return { text: 'WORKS', bg: '#113B2E', fg: colors.success };
    case 'refused':
      return { text: 'NO · refused', bg: '#3A2A14', fg: colors.warn };
    case 'filtered':
    case 'simulated-filtered':
      return { text: 'NO · blocked', bg: '#3A1414', fg: colors.danger };
    case 'error':
    default:
      return { text: 'NO · error', bg: '#262F3D', fg: colors.textDim };
  }
}

/** A compact, high-contrast works/doesn't-work pill for a single result row. */
export function ResultBadge({ result }: { result: TestResult }) {
  const v = resultVisual(result.status);
  return (
    <View
      style={{
        backgroundColor: v.bg,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Text style={{ color: v.fg, fontSize: 11, fontWeight: '800', letterSpacing: 0.3 }}>{v.text}</Text>
      {result.latencyMs != null && <Text style={{ color: v.fg, fontSize: 11, opacity: 0.8 }}>· {result.latencyMs}ms</Text>}
    </View>
  );
}
