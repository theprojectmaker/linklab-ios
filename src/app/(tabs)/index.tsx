import { useEffect, useState } from 'react';
import { ScrollView, Text, View, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScan } from '../../lib/scanStore';
import { describeTargetSet, getTotalTargetCount } from '../../lib/targets';
import { captureNetworkSnapshot } from '../../lib/networkInfo';
import { NetworkSnapshot } from '../../lib/types';
import { colors } from '../../lib/theme';
import { ProgressBar } from '../../components/ProgressBar';
import { StatPill } from '../../components/StatPill';
import { EndpointList, EndpointFilter } from '../../components/EndpointList';

const FILTER_CHIPS: { label: string; value: EndpointFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Reachable', value: 'reachable' },
  { label: 'Suspect', value: 'suspect' },
  { label: 'Blocked', value: 'blocked' },
];

const CONCURRENCY_PRESETS = [
  { label: 'Gentle', concurrency: 16, delayMs: 2 },
  { label: 'Normal', concurrency: 48, delayMs: 0 },
  { label: 'Fast', concurrency: 100, delayMs: 0 },
];

export default function RunScreen() {
  const scan = useScan();
  const [network, setNetwork] = useState<NetworkSnapshot | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<EndpointFilter>('all');
  const total = getTotalTargetCount();

  useEffect(() => {
    captureNetworkSnapshot().then(setNetwork).catch(() => {});
  }, []);

  const pct = scan.progress ? scan.progress.tested / scan.progress.total : 0;
  // Re-render the endpoint list roughly every 25 new results instead of on
  // every single one — keeps filtering/scrolling smooth at high throughput.
  const listTick = scan.progress ? Math.floor(scan.progress.tested / 25) : 0;
  const showList = scan.status !== 'idle';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>LinkLab</Text>
        <Text style={{ color: colors.textDim, fontSize: 13, lineHeight: 18 }}>
          Network reachability lab test. Diagnoses the Wi-Fi you're currently on by attempting a large,
          throttled set of outbound connections and reporting what classes of traffic get through.
        </Text>

        {scan.isSimulated && (
          <View style={{ backgroundColor: '#3A2A14', borderColor: colors.warn, borderWidth: 1, borderRadius: 10, padding: 10 }}>
            <Text style={{ color: colors.warn, fontWeight: '700', fontSize: 12 }}>SIMULATED MODE</Text>
            <Text style={{ color: colors.warn, fontSize: 12, marginTop: 2 }}>
              Web preview has no raw-socket API. Results here are randomly generated to exercise the UI only —
              they say nothing about any real network. Run the built iOS app for real results.
            </Text>
          </View>
        )}

        <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.cardBorder, gap: 6 }}>
          <Text style={{ color: colors.textDim, fontSize: 12 }}>CURRENT NETWORK</Text>
          <Text style={{ color: colors.text, fontSize: 14 }}>
            {network?.isWifi ? 'Wi-Fi' : network?.isConnected ? 'Connected (non Wi-Fi)' : 'Not connected'}
          </Text>
          <Text style={{ color: colors.textDim, fontSize: 12 }}>SSID: {network?.ssid ?? 'unavailable on iOS without special entitlement'}</Text>
          <Text style={{ color: colors.textDim, fontSize: 12 }}>Device IP: {network?.ipAddress ?? '—'}</Text>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.cardBorder, gap: 6 }}>
          <Text style={{ color: colors.textDim, fontSize: 12 }}>TEST SET</Text>
          <Text style={{ color: colors.text, fontSize: 13 }}>{describeTargetSet()}</Text>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.cardBorder, gap: 10 }}>
          <Text style={{ color: colors.textDim, fontSize: 12 }}>THROTTLE</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {CONCURRENCY_PRESETS.map((p) => {
              const active = scan.options.concurrency === p.concurrency && scan.options.delayMs === p.delayMs;
              return (
                <Pressable
                  key={p.label}
                  disabled={scan.status === 'running' || scan.status === 'paused'}
                  onPress={() => scan.setOptions({ concurrency: p.concurrency, delayMs: p.delayMs })}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    backgroundColor: active ? colors.accent : 'transparent',
                    borderWidth: 1,
                    borderColor: active ? colors.accent : colors.cardBorder,
                  }}
                >
                  <Text style={{ color: active ? '#06201C' : colors.text, fontWeight: '700', fontSize: 13 }}>{p.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={{ color: colors.textDim, fontSize: 11 }}>
            {scan.options.concurrency} concurrent attempts, {scan.options.delayMs}ms delay between dispatches.
            Lower = gentler on battery and the network, slower to finish.
          </Text>
        </View>

        {scan.fatalError && (
          <View style={{ backgroundColor: '#3A1414', borderColor: colors.danger, borderWidth: 1, borderRadius: 10, padding: 10 }}>
            <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 12 }}>SCAN FAILED TO START</Text>
            <Text style={{ color: colors.danger, fontSize: 12, marginTop: 2 }}>{scan.fatalError}</Text>
          </View>
        )}

        {scan.status === 'idle' && (
          <Pressable
            onPress={scan.start}
            style={{ backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ color: '#06201C', fontWeight: '800', fontSize: 16 }}>Start test ({total.toLocaleString()} targets)</Text>
          </Pressable>
        )}

        {scan.progress && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <StatPill label="Reachable" value={scan.progress.openCount} color={colors.success} />
            <StatPill label="Suspect" value={scan.progress.refusedCount} color={colors.warn} />
            <StatPill label="Blocked" value={scan.progress.filteredCount} color={colors.danger} />
            <StatPill label="Tested" value={scan.progress.tested.toLocaleString()} />
          </View>
        )}

        {(scan.status === 'running' || scan.status === 'paused') && (
          <View style={{ gap: 6 }}>
            <ProgressBar fraction={pct} />
            <Text style={{ color: colors.textDim, fontSize: 12 }}>
              {scan.progress ? `${scan.progress.tested.toLocaleString()} / ${scan.progress.total.toLocaleString()}` : 'Starting…'}
              {scan.progress ? `  (${Math.round(pct * 100)}%)` : ''}
            </Text>
          </View>
        )}

        {scan.status === 'done' && scan.lastRun && (
          <Text style={{ color: colors.success, fontWeight: '700', fontSize: 13 }}>
            {scan.lastRun.stopped ? 'Stopped early.' : 'Run complete.'} See the Results tab for the full breakdown.
          </Text>
        )}

        {(scan.status === 'running' || scan.status === 'paused') && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {scan.status === 'running' ? (
              <Pressable onPress={scan.pause} style={{ flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>Pause</Text>
              </Pressable>
            ) : (
              <Pressable onPress={scan.resume} style={{ flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>Resume</Text>
              </Pressable>
            )}
            <Pressable onPress={scan.stop} style={{ flex: 1, backgroundColor: '#3A1414', borderWidth: 1, borderColor: colors.danger, borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ color: colors.danger, fontWeight: '700' }}>Stop</Text>
            </Pressable>
          </View>
        )}

        {scan.status === 'done' && (
          <Pressable
            onPress={scan.start}
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ color: colors.text, fontWeight: '700' }}>Run again</Text>
          </Pressable>
        )}

        {showList && (
          <>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search endpoints — e.g. apple, azure, github"
              placeholderTextColor={colors.textDim}
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.text,
                fontSize: 13,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {FILTER_CHIPS.map((c) => {
                const active = filter === c.value;
                return (
                  <Pressable
                    key={c.value}
                    onPress={() => setFilter(c.value)}
                    style={{
                      paddingVertical: 7,
                      paddingHorizontal: 14,
                      borderRadius: 999,
                      backgroundColor: active ? colors.accent : 'transparent',
                      borderWidth: 1,
                      borderColor: active ? colors.accent : colors.cardBorder,
                    }}
                  >
                    <Text style={{ color: active ? '#06201C' : colors.text, fontWeight: '700', fontSize: 12 }}>{c.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.cardBorder, paddingHorizontal: 10 }}>
              <EndpointList results={scan.getAllResults()} filter={filter} search={search} tick={listTick} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
