import { ReachabilityStatus } from './types';
import { colors } from './theme';

export type StatusBucket = 'reachable' | 'suspect' | 'blocked' | 'error';

/**
 * Collapses the raw TCP-level status into the 3 buckets shown in the UI
 * (Reachable / Suspect / Blocked), matching the categories used across the
 * stat tiles, filter chips and endpoint list:
 *  - open: a full TCP handshake completed -> genuinely reachable.
 *  - refused: something answered and declined. This is ambiguous by design —
 *    it could be the real destination legitimately not listening there, or a
 *    network middlebox actively resetting blocked traffic instead of silently
 *    dropping it. Shown as "suspect" rather than asserting either reading.
 *  - filtered: no response at all before the timeout -> this network (or
 *    something between here and the destination) is silently blocking it.
 */
export function statusBucket(status: ReachabilityStatus): StatusBucket {
  switch (status) {
    case 'open':
    case 'simulated-open':
      return 'reachable';
    case 'refused':
      return 'suspect';
    case 'filtered':
    case 'simulated-filtered':
      return 'blocked';
    case 'error':
    default:
      return 'error';
  }
}

export const STATUS_BUCKET_COLOR: Record<StatusBucket, string> = {
  reachable: colors.success,
  suspect: colors.warn,
  blocked: colors.danger,
  error: colors.textDim,
};

export const STATUS_BUCKET_LABEL: Record<StatusBucket, string> = {
  reachable: 'Reachable',
  suspect: 'Suspect',
  blocked: 'Blocked',
  error: 'Error',
};
