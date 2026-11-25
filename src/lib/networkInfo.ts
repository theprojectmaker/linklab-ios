import * as Network from 'expo-network';
import { NetworkSnapshot } from './types';

/**
 * Deliberately does NOT use @react-native-community/netinfo's SSID field.
 * On iOS, reading SSID requires Apple's gated Access-WiFi-Information
 * entitlement, and the native code path that attempts it can hard-crash the
 * app ("attempted to access privacy-sensitive data without a usage
 * description") without the exact Info.plist/entitlement setup that
 * entitlement expects — not worth the crash risk for a value we can't get
 * real data for anyway on a standalone indie app. Connection type/state
 * comes entirely from expo-network (no location/SSID entanglement at all).
 * SSID is always reported unavailable; the UI says so rather than guessing.
 */
export async function captureNetworkSnapshot(): Promise<NetworkSnapshot> {
  const [state, ipAddress] = await Promise.all([
    Network.getNetworkStateAsync().catch(() => null),
    Network.getIpAddressAsync().catch(() => null),
  ]);

  return {
    ssid: null,
    ipAddress,
    isWifi: state?.type === Network.NetworkStateType.WIFI,
    isConnected: state?.isConnected ?? null,
    capturedAt: Date.now(),
  };
}
