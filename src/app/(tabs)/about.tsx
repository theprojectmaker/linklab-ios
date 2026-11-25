import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../lib/theme';
import { describeTargetSet } from '../../lib/targets';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: colors.textDim, fontSize: 13, lineHeight: 19 }}>{children}</Text>
    </View>
  );
}

export default function AboutScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>About LinkLab</Text>

        <Section title="WHAT THIS IS">
          A diagnostic tool for the Wi-Fi network you are currently connected to. It does not find or provide a
          working proxy, and it is not a filter-bypass tool. It only tells you what classes of outbound traffic
          your current network allows or blocks.
        </Section>

        <Section title="HOW THE TEST SET IS BUILT">
          {describeTargetSet()}. The destinations are a fixed list of 50 large, publicly documented services
          that exist specifically to be probed or operate at massive, redundant scale — public DNS resolvers,
          public NTP servers, major CDN/cloud providers, Apple/iCloud infrastructure, speedtest-style endpoints,
          and a short list of huge public-web services (Wikipedia, GitHub, etc). This is not a list of open or
          anonymizing proxy servers, and it is not a general "every website" scanner; no such list is shipped or
          scraped. "Proxy" coverage comes from the PORT axis — SOCKS/VPN/HTTP-proxy ports tested against these
          same legitimate anchors, not a list of real proxy servers to route through. Breadth comes from testing
          a wide range of well-known and registered TCP ports against each of those anchors — the same approach
          ordinary "port checker" and firewall-diagnostic tools use, just run at a larger, throttled scale.
        </Section>

        <Section title="WHY NOT A REAL PROXY LIST">
          Lists of real-world open/public proxies are usually abuse-prone, stale, or outright malicious, and
          shipping one would turn this into a filter-bypass tool rather than a network diagnostic. This app is
          scoped to tell you what your own network does, not to get you around it.
        </Section>

        <Section title="THROTTLING & SAFETY">
          Connection attempts are concurrency-limited and spaced out (see the throttle presets on the Run tab) so
          the app does not hammer the network or drain the battery. You can pause or stop a run at any time, and
          partial runs are still saved to History.
        </Section>

        <Section title="WHAT 'OPEN' / 'REFUSED' / 'FILTERED' MEAN">
          Open: a TCP connection completed — that port is fully reachable through this network. Refused: the
          packet reached the destination and it actively rejected the connection — the network did not block it,
          the destination just isn't listening there. Filtered: no response at all before the timeout — usually
          means this network (or something between you and the destination) is blocking that port or protocol.
        </Section>

        <Section title="LIMITS">
          SSID is unavailable on iOS without a special Apple-approval-gated entitlement, so it may show as
          unavailable. A single large run (150k+ targets) can take a long time even throttled — use Stop any
          time, results up to that point are kept.
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
