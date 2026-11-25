import { iterateTargets, getTotalTargetCount } from './targets';
import { testReachability, isSimulatedEnvironment } from './reachability';
import { CategoryBucket, RunDetail, ScanProgress, TestResult } from './types';

export interface RunnerOptions {
  concurrency: number; // simultaneous in-flight connection attempts
  delayMs: number; // delay before dispatching each new attempt, throttles overall rate
  categories?: { destCategories?: string[]; portCategories?: string[] }; // optional filter
  onProgress: (p: ScanProgress) => void;
  onDone: (detail: RunDetail) => void;
}

const SAMPLE_CAP = 3000; // cap on detail rows kept per run (every open/refused + a sample of filtered)

export class ScanRunner {
  private paused = false;
  private stopped = false;
  private tested = 0;
  private openCount = 0;
  private refusedCount = 0;
  private filteredCount = 0;
  private errorCount = 0;
  private buckets = new Map<string, CategoryBucket>();
  private sampleResults: TestResult[] = [];
  private filteredSampleEvery = 1;
  private startedAt = Date.now();

  constructor(private opts: RunnerOptions) {}

  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
  }
  stop() {
    this.stopped = true;
  }

  private bucketKey(destCategory: string, portCategory: string) {
    return `${destCategory}::${portCategory}`;
  }

  private recordResult(r: TestResult) {
    this.tested++;
    const key = this.bucketKey(r.destCategory, r.portCategory);
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = {
        key,
        destCategory: r.destCategory,
        portCategory: r.portCategory,
        total: 0,
        open: 0,
        refused: 0,
        filtered: 0,
        error: 0,
      };
      this.buckets.set(key, bucket);
    }
    bucket.total++;

    const keep = () => {
      if (this.sampleResults.length < SAMPLE_CAP) this.sampleResults.push(r);
    };

    switch (r.status) {
      case 'open':
      case 'simulated-open':
        this.openCount++;
        bucket.open++;
        keep();
        break;
      case 'refused':
        this.refusedCount++;
        bucket.refused++;
        keep();
        break;
      case 'filtered':
      case 'simulated-filtered':
        this.filteredCount++;
        bucket.filtered++;
        // sample filtered results sparsely to stay under the cap
        if (this.tested % 97 === 0) keep();
        break;
      case 'error':
        this.errorCount++;
        bucket.error++;
        if (this.tested % 97 === 0) keep();
        break;
    }
  }

  private matchesFilter(destCategory: string, portCategory: string): boolean {
    const f = this.opts.categories;
    if (!f) return true;
    if (f.destCategories?.length && !f.destCategories.includes(destCategory)) return false;
    if (f.portCategories?.length && !f.portCategories.includes(portCategory)) return false;
    return true;
  }

  async run(): Promise<RunDetail> {
    const total = getTotalTargetCount();
    const generator = iterateTargets();
    const inFlight: Promise<void>[] = [];
    const concurrency = Math.max(1, this.opts.concurrency);
    let lastReport = 0;

    const report = (label: string) => {
      const now = Date.now();
      if (now - lastReport < 100) return;
      lastReport = now;
      this.opts.onProgress({
        tested: this.tested,
        total,
        openCount: this.openCount,
        refusedCount: this.refusedCount,
        filteredCount: this.filteredCount,
        errorCount: this.errorCount,
        currentLabel: label,
      });
    };

    const worker = async () => {
      for (const target of generator) {
        if (this.stopped) return;
        while (this.paused && !this.stopped) {
          await new Promise((r) => setTimeout(r, 150));
        }
        if (this.stopped) return;

        if (!this.matchesFilter(target.dest.category, target.port.category)) {
          continue;
        }

        if (this.opts.delayMs > 0) {
          await new Promise((r) => setTimeout(r, this.opts.delayMs));
        }

        const label = `${target.dest.label} : ${target.port.port}`;
        try {
          const res = await testReachability(target.dest.host, target.port.port);
          this.recordResult({
            destId: target.dest.id,
            host: target.dest.host,
            port: target.port.port,
            destCategory: target.dest.category,
            portCategory: target.port.category,
            status: res.status,
            latencyMs: res.latencyMs,
          });
        } catch {
          this.recordResult({
            destId: target.dest.id,
            host: target.dest.host,
            port: target.port.port,
            destCategory: target.dest.category,
            portCategory: target.port.category,
            status: 'error',
          });
        }
        report(label);
      }
    };

    for (let i = 0; i < concurrency; i++) {
      inFlight.push(worker());
    }
    await Promise.all(inFlight);

    const detail: RunDetail = {
      id: `run-${this.startedAt}`,
      startedAt: this.startedAt,
      finishedAt: Date.now(),
      stopped: this.stopped,
      network: { ssid: null, ipAddress: null, isWifi: null, isConnected: null, capturedAt: this.startedAt },
      totalTargets: total,
      tested: this.tested,
      openCount: this.openCount,
      refusedCount: this.refusedCount,
      filteredCount: this.filteredCount,
      errorCount: this.errorCount,
      simulated: isSimulatedEnvironment,
      buckets: Array.from(this.buckets.values()),
      sampleResults: this.sampleResults,
    };
    this.opts.onDone(detail);
    return detail;
  }
}
