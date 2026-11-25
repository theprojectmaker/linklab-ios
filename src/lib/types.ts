export type DestinationCategory =
  | 'dns'
  | 'ntp'
  | 'cdn-cloud'
  | 'speedtest'
  | 'apple-icloud'
  | 'public-web';

export interface Destination {
  id: string;
  label: string;
  host: string;
  category: DestinationCategory;
}

export type PortCategory =
  | 'web'
  | 'mail'
  | 'file-transfer'
  | 'remote-access'
  | 'proxy-vpn'
  | 'dns-ntp'
  | 'database'
  | 'messaging-iot'
  | 'streaming-rtc'
  | 'gaming'
  | 'other-registered';

export interface PortDef {
  port: number;
  name: string;
  category: PortCategory;
}

export interface TargetRef {
  destId: string;
  port: number;
}

export type ReachabilityStatus = 'open' | 'refused' | 'filtered' | 'error' | 'simulated-open' | 'simulated-filtered';

export interface TestResult {
  destId: string;
  host: string;
  port: number;
  destCategory: DestinationCategory;
  portCategory: PortCategory;
  status: ReachabilityStatus;
  latencyMs?: number;
}

export interface CategoryBucket {
  key: string; // `${destCategory}:${portCategory}` or just portCategory, etc.
  destCategory: DestinationCategory;
  portCategory: PortCategory;
  total: number;
  open: number;
  refused: number;
  filtered: number;
  error: number;
}

export interface NetworkSnapshot {
  ssid: string | null;
  ipAddress: string | null;
  isWifi: boolean | null;
  isConnected: boolean | null;
  capturedAt: number;
}

export interface RunSummary {
  id: string;
  startedAt: number;
  finishedAt: number | null;
  stopped: boolean;
  network: NetworkSnapshot;
  totalTargets: number;
  tested: number;
  openCount: number;
  refusedCount: number;
  filteredCount: number;
  errorCount: number;
  simulated: boolean;
}

export interface RunDetail extends RunSummary {
  buckets: CategoryBucket[];
  // capped detail list: every 'open'/'refused' result plus a sample of filtered, up to a cap
  sampleResults: TestResult[];
}

export interface ScanProgress {
  tested: number;
  total: number;
  openCount: number;
  refusedCount: number;
  filteredCount: number;
  errorCount: number;
  currentLabel: string;
}
