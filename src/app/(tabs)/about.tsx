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

        <Section title="HOW THE TEST SET IS BUILT (TWO TIERS)">
          {describeTargetSet()}.{'\n\n'}
          <Text style={{ fontWeight: '700' }}>Anchor tier (100 destinations):</Text> a fixed list of large,
          publicly documented services that exist specifically to be probed or operate at massive, redundant
          scale — public DNS resolvers, public NTP servers, major CDN/cloud providers, Apple/iCloud
          infrastructure, speedtest-style endpoints, and public-web giants (Wikipedia, GitHub, etc). These get
          checked against every port with an actual, named, real-world service behind it (web, mail, DNS, SSH,
          RDP, databases, gaming, proxy/VPN, etc) — not a blind 1–65,535 sweep, since almost none of those port
          numbers have any service at all and testing them produces no real signal.{'\n\n'}
          <Text style={{ fontWeight: '700' }}>Broad tier (~4,950 destinations):</Text> ordinary popular websites
          pulled from the Majestic Million — a standard, openly published top-domains ranking used throughout
          the security/networking industry. This is <Text style={{ fontWeight: '700' }}>not</Text> a proxy list
          and provides no working proxy; it's the same trust model as any ordinary site-categorization or
          firewall test. Testing every one of these on the full 65,535-port range would be ~327 million
          connection attempts — not a "lab test" any throttle could finish, and volume that would read as
          abusive scanning on any real network. So the broad tier only checks ~20 ports that actually matter
          (web, mail, DNS, SSH, RDP, common proxy/VPN ports), keeping the total in the tens of millions instead.
          {'\n\n'}
          "Proxy" coverage, at both tiers, is still only the PORT axis — SOCKS/VPN/HTTP-proxy ports tested
          against real destinations, never a list of real proxy servers to route through.
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

        <Section title="WHAT 'REACHABLE' / 'SUSPECT' / 'BLOCKED' MEAN">
          <Text style={{ color: colors.success, fontWeight: '700' }}>Reachable (green):</Text> a TCP connection
          completed — that port is fully reachable through this network.{'\n\n'}
          <Text style={{ color: colors.warn, fontWeight: '700' }}>Suspect (amber):</Text> something answered and
          declined the connection. That's ambiguous on purpose — it can be the real destination legitimately not
          listening there, or it can be a network middlebox actively resetting traffic it wants to block instead
          of silently dropping it. Shown as "suspect", not asserted as a real block.{'\n\n'}
          <Text style={{ color: colors.danger, fontWeight: '700' }}>Blocked (red):</Text> no response at all before
          the timeout — usually means this network (or something between you and the destination) is silently
          dropping that port or protocol.
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
