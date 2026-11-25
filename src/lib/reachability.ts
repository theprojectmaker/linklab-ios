import { Platform } from 'react-native';
import { ReachabilityStatus } from './types';

export interface ReachResult {
  status: ReachabilityStatus;
  latencyMs?: number;
}

const CONNECT_TIMEOUT_MS = 3000;

/**
 * Raw TCP reachability test, used on native (iOS) builds via
 * react-native-tcp-socket. A real connect = port open. A fast refusal
 * (ECONNREFUSED/ECONNRESET) means the packet got to the destination and it
 * actively said no -> the NETWORK did not block it, only the destination
 * declined. A timeout with no response at all is the signal that the
 * current Wi-Fi is most likely filtering that port/protocol.
 */
async function testNative(host: string, port: number): Promise<ReachResult> {
  // Lazy require: this native module isn't available in the Expo web preview bundle.
  // Plain CommonJS export (module.exports = {...}), NOT a default export.
  const TcpSocket = require('react-native-tcp-socket');
  return new Promise((resolve) => {
    const start = Date.now();
    let settled = false;
    const finish = (result: ReachResult) => {
      if (settled) return;
      settled = true;
      try {
        socket.destroy();
      } catch {
        // already closed
      }
      resolve(result);
    };

    const timer = setTimeout(() => finish({ status: 'filtered' }), CONNECT_TIMEOUT_MS);

    const socket = TcpSocket.createConnection({ host, port, tls: false }, () => {
      clearTimeout(timer);
      finish({ status: 'open', latencyMs: Date.now() - start });
    });

    socket.on('error', (err: Error) => {
      clearTimeout(timer);
      const msg = String(err?.message ?? err);
      if (/ECONNREFUSED|ECONNRESET/i.test(msg)) {
        finish({ status: 'refused', latencyMs: Date.now() - start });
      } else {
        finish({ status: 'error' });
      }
    });
  });
}

/**
 * Web preview has no raw-socket API. This simulates plausible outcomes so
 * the run/progress/throttle/results UI can be exercised end to end, clearly
 * labeled as simulated — it proves nothing about any real network.
 */
async function testSimulated(_host: string, port: number): Promise<ReachResult> {
  const delay = 5 + Math.random() * 40;
  await new Promise((r) => setTimeout(r, delay));
  const commonlyOpen = [80, 443, 53, 123].includes(port);
  const openChance = commonlyOpen ? 0.9 : 0.02;
  if (Math.random() < openChance) {
    return { status: 'simulated-open', latencyMs: Math.round(delay) };
  }
  return { status: 'simulated-filtered' };
}

export const isSimulatedEnvironment = Platform.OS === 'web';

export async function testReachability(host: string, port: number): Promise<ReachResult> {
  if (isSimulatedEnvironment) {
    return testSimulated(host, port);
  }
  return testNative(host, port);
}
