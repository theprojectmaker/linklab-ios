import NetInfo from '@react-native-community/netinfo';
import * as Network from 'expo-network';
import { NetworkSnapshot } from './types';

/**
 * iOS restricts SSID access without the special NEHotspotHelper /
 * Access-WiFi-Information entitlement (an Apple-approval-gated capability,
 * not something a standalone indie app can self-grant). When unavailable,
 * ssid comes back null and the UI says so rather than guessing.
 */
export async function captureNetworkSnapshot(): Promise<NetworkSnapshot> {
  const [netInfoState, ipAddress] = await Promise.all([
    NetInfo.fetch(),
    Network.getIpAddressAsync().catch(() => null),
  ]);

  const details = netInfoState.details as { ssid?: string | null } | null;

  return {
    ssid: details?.ssid ?? null,
    ipAddress,
    isWifi: netInfoState.type === 'wifi',
    isConnected: netInfoState.isConnected ?? null,
    capturedAt: Date.now(),
  };
}
