import { Text, View } from 'react-native';
import { CategoryBucket } from '../lib/types';
import { colors } from '../lib/theme';

interface Verdict {
  label: string;
  color: string;
}

function verdictFor(open: number, refused: number, total: number): Verdict {
  if (total === 0) return { label: 'Not tested', color: colors.textDim };
  if (open > 0) return { label: 'Likely works', color: colors.success };
  if (refused > 0) return { label: 'Uncertain', color: colors.warn };
  return { label: 'Blocked', color: colors.danger };
}

function sumBuckets(buckets: CategoryBucket[]) {
  return buckets.reduce(
    (acc, b) => ({ open: acc.open + b.open, refused: acc.refused + b.refused, total: acc.total + b.total }),
    { open: 0, refused: 0, total: 0 }
  );
}

/**
 * Answers "can I remotely control my computer from this network?" using
 * data this app already collects — no relay/proxy identification involved:
 *  - Apple Push / iCloud channels (push.apple.com, icloud.com, CloudKit,
 *    etc.) are the exact anchors an iCloud-based remote-control app depends
 *    on to reach your Mac/PC.
 *  - Generic remote-access ports (SSH, RDP, VNC, TeamViewer) tell you
 *    whether this network allows that whole class of traffic at all.
 * Neither names a specific server to route through — this is "does my own
 * remote-control path have a chance here", not "which host can I tunnel via".
 */
export function RemoteControlCheck({ buckets }: { buckets: CategoryBucket[] }) {
  const icloud = sumBuckets(buckets.filter((b) => b.destCategory === 'apple-icloud'));
  const remoteAccess = sumBuckets(buckets.filter((b) => b.portCategory === 'remote-access'));

  const icloudVerdict = verdictFor(icloud.open, icloud.refused, icloud.total);
  const remoteVerdict = verdictFor(remoteAccess.open, remoteAccess.refused, remoteAccess.total);

  const Row = ({ title, subtitle, v, counts }: { title: string; subtitle: string; v: Verdict; counts: typeof icloud }) => (
    <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.cardBorder, gap: 2 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>{title}</Text>
        <Text style={{ color: v.color, fontWeight: '800', fontSize: 13 }}>{v.label}</Text>
      </View>
      <Text style={{ color: colors.textDim, fontSize: 11 }}>{subtitle}</Text>
      <Text style={{ color: colors.textDim, fontSize: 11 }}>
        {counts.open.toLocaleString()} reachable · {counts.refused.toLocaleString()} suspect ·{' '}
        {(counts.total - counts.open - counts.refused).toLocaleString()} blocked/other of {counts.total.toLocaleString()} tested
      </Text>
    </View>
  );

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.cardBorder, padding: 12, gap: 4 }}>
      <Text style={{ color: colors.textDim, fontSize: 12, marginBottom: 2 }}>CAN I REMOTE INTO MY COMPUTER FROM HERE?</Text>
      <Row
        title="Apple Push / iCloud channels"
        subtitle="What an iCloud-based remote-control app (CloudKit/APNs) relies on"
        v={icloudVerdict}
        counts={icloud}
      />
      <Row
        title="Remote-access ports"
        subtitle="SSH, RDP, VNC, TeamViewer — generic remote-desktop protocols"
        v={remoteVerdict}
        counts={remoteAccess}
      />
      <Text style={{ color: colors.textDim, fontSize: 10, marginTop: 4, fontStyle: 'italic' }}>
        This tells you whether this class of traffic gets through at all — it never points to a specific
        server to connect through.
      </Text>
    </View>
  );
}
