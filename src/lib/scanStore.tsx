import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { ScanRunner } from './runner';
import { captureNetworkSnapshot } from './networkInfo';
import { saveRun } from './storage';
import { RunDetail, ScanProgress, TestResult } from './types';
import { isSimulatedEnvironment } from './reachability';

export type ScanStatus = 'idle' | 'running' | 'paused' | 'done';

interface ScanOptions {
  concurrency: number;
  delayMs: number;
}

interface ScanState {
  status: ScanStatus;
  progress: ScanProgress | null;
  lastRun: RunDetail | null;
  options: ScanOptions;
  isSimulated: boolean;
  fatalError: string | null;
}

interface ScanContextValue extends ScanState {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setOptions: (o: Partial<ScanOptions>) => void;
  /** Every result produced by the current (or just-finished) run, oldest first. Live reference. */
  getAllResults: () => TestResult[];
}

const ScanContext = createContext<ScanContextValue | null>(null);

const DEFAULT_OPTIONS: ScanOptions = { concurrency: 48, delayMs: 0 };

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [lastRun, setLastRun] = useState<RunDetail | null>(null);
  const [options, setOptionsState] = useState<ScanOptions>(DEFAULT_OPTIONS);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const runnerRef = useRef<ScanRunner | null>(null);
  const finishedResultsRef = useRef<TestResult[]>([]);

  const start = useCallback(() => {
    if (runnerRef.current) return;
    setStatus('running');
    setProgress(null);
    setFatalError(null);

    const runner = new ScanRunner({
      concurrency: options.concurrency,
      delayMs: options.delayMs,
      onProgress: (p) => setProgress(p),
      onDone: (detail) => {
        finishedResultsRef.current = runnerRef.current?.getAllResults() ?? [];
        runnerRef.current = null;
        setStatus('done');
        captureNetworkSnapshot()
          .then((net) => {
            const withNet = { ...detail, network: net };
            setLastRun(withNet);
            return saveRun(withNet);
          })
          .catch(() => {
            setLastRun(detail);
            saveRun(detail).catch(() => {});
          });
      },
    });
    runnerRef.current = runner;
    runner.run().catch((err) => {
      runnerRef.current = null;
      setStatus('idle');
      setFatalError(err instanceof Error ? err.message : String(err));
    });
  }, [options]);

  const pause = useCallback(() => {
    runnerRef.current?.pause();
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    runnerRef.current?.resume();
    setStatus('running');
  }, []);

  const stop = useCallback(() => {
    runnerRef.current?.stop();
  }, []);

  const setOptions = useCallback((o: Partial<ScanOptions>) => {
    setOptionsState((prev) => ({ ...prev, ...o }));
  }, []);

  const getAllResults = useCallback(() => {
    return runnerRef.current?.getAllResults() ?? finishedResultsRef.current;
  }, []);

  const value: ScanContextValue = {
    status,
    progress,
    lastRun,
    options,
    isSimulated: isSimulatedEnvironment,
    fatalError,
    start,
    pause,
    resume,
    stop,
    setOptions,
    getAllResults,
  };

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScan() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScan must be used within ScanProvider');
  return ctx;
}
