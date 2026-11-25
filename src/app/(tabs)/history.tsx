import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { loadRunIndex } from '../../lib/storage';
import { RunSummary } from '../../lib/types';
import { colors } from '../../lib/theme';

export default function HistoryScreen() {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadRunIndex().then(setRuns).catch(() => {});
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>History</Text>
      </View>
      <FlatList
        data={runs}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 8 }}
        ListEmptyComponent={<Text style={{ color: colors.textDim, fontSize: 13 }}>No past runs yet.</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/run/${item.id}`)}
            style={{ backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.cardBorder, padding: 12 }}
          >
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
              {new Date(item.startedAt).toLocaleString()}
            </Text>
            <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 4 }}>
              SSID: {item.network.ssid ?? 'unknown'} · {item.tested.toLocaleString()}/{item.totalTargets.toLocaleString()} tested
              {item.simulated ? ' · SIMULATED' : ''}
            </Text>
            <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 2 }}>
              {item.openCount.toLocaleString()} open · {item.refusedCount.toLocaleString()} refused · {item.filteredCount.toLocaleString()} filtered
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
