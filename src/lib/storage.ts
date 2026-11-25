import AsyncStorage from '@react-native-async-storage/async-storage';
import { RunDetail, RunSummary } from './types';

const INDEX_KEY = 'linklab:runs:index';
const runKey = (id: string) => `linklab:run:${id}`;

export async function saveRun(detail: RunDetail): Promise<void> {
  await AsyncStorage.setItem(runKey(detail.id), JSON.stringify(detail));
  const index = await loadRunIndex();
  const summary: RunSummary = {
    id: detail.id,
    startedAt: detail.startedAt,
    finishedAt: detail.finishedAt,
    stopped: detail.stopped,
    network: detail.network,
    totalTargets: detail.totalTargets,
    tested: detail.tested,
    openCount: detail.openCount,
    refusedCount: detail.refusedCount,
    filteredCount: detail.filteredCount,
    errorCount: detail.errorCount,
    simulated: detail.simulated,
  };
  const next = [summary, ...index.filter((r) => r.id !== detail.id)].slice(0, 100);
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(next));
}

export async function loadRunIndex(): Promise<RunSummary[]> {
  const raw = await AsyncStorage.getItem(INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as RunSummary[];
  } catch {
    return [];
  }
}

export async function loadRun(id: string): Promise<RunDetail | null> {
  const raw = await AsyncStorage.getItem(runKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RunDetail;
  } catch {
    return null;
  }
}

export async function deleteRun(id: string): Promise<void> {
  await AsyncStorage.removeItem(runKey(id));
  const index = await loadRunIndex();
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index.filter((r) => r.id !== id)));
}
