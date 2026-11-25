import { PortCategory, PortDef } from './types';

/**
 * Curated well-known port -> {name, category} overrides. Anything not listed
 * here falls back to a generic "well-known" / "registered" label, still
 * tested, still bucketed, just without a friendly name. This is how the app
 * gets breadth of PORT coverage (the actual IANA well-known + first chunk of
 * registered range) without pretending every port number has a notable
 * service behind it.
 */
const NAMED_PORTS: Record<number, { name: string; category: PortCategory }> = {
  20: { name: 'FTP data', category: 'file-transfer' },
  21: { name: 'FTP control', category: 'file-transfer' },
  22: { name: 'SSH', category: 'remote-access' },
  23: { name: 'Telnet', category: 'remote-access' },
  25: { name: 'SMTP', category: 'mail' },
  53: { name: 'DNS', category: 'dns-ntp' },
  67: { name: 'DHCP server', category: 'other-registered' },
  68: { name: 'DHCP client', category: 'other-registered' },
  69: { name: 'TFTP', category: 'file-transfer' },
  80: { name: 'HTTP', category: 'web' },
  110: { name: 'POP3', category: 'mail' },
  115: { name: 'SFTP', category: 'file-transfer' },
  119: { name: 'NNTP', category: 'other-registered' },
  123: { name: 'NTP', category: 'dns-ntp' },
  135: { name: 'MS RPC', category: 'other-registered' },
  137: { name: 'NetBIOS name', category: 'file-transfer' },
  138: { name: 'NetBIOS datagram', category: 'file-transfer' },
  139: { name: 'NetBIOS session', category: 'file-transfer' },
  143: { name: 'IMAP', category: 'mail' },
  161: { name: 'SNMP', category: 'other-registered' },
  162: { name: 'SNMP trap', category: 'other-registered' },
  179: { name: 'BGP', category: 'other-registered' },
  194: { name: 'IRC', category: 'messaging-iot' },
  389: { name: 'LDAP', category: 'other-registered' },
  443: { name: 'HTTPS', category: 'web' },
  445: { name: 'SMB', category: 'file-transfer' },
  465: { name: 'SMTPS', category: 'mail' },
  500: { name: 'IPsec IKE', category: 'proxy-vpn' },
  514: { name: 'Syslog', category: 'other-registered' },
  515: { name: 'LPD printing', category: 'other-registered' },
  554: { name: 'RTSP', category: 'streaming-rtc' },
  587: { name: 'SMTP (submission)', category: 'mail' },
  631: { name: 'IPP printing', category: 'other-registered' },
  636: { name: 'LDAPS', category: 'other-registered' },
  853: { name: 'DNS over TLS', category: 'dns-ntp' },
  873: { name: 'rsync', category: 'file-transfer' },
  902: { name: 'VMware auth', category: 'other-registered' },
  989: { name: 'FTPS data', category: 'file-transfer' },
  990: { name: 'FTPS control', category: 'file-transfer' },
  993: { name: 'IMAPS', category: 'mail' },
  995: { name: 'POP3S', category: 'mail' },
  1080: { name: 'SOCKS proxy', category: 'proxy-vpn' },
  1194: { name: 'OpenVPN', category: 'proxy-vpn' },
  1433: { name: 'MS SQL Server', category: 'database' },
  1521: { name: 'Oracle DB', category: 'database' },
  1701: { name: 'L2TP', category: 'proxy-vpn' },
  1723: { name: 'PPTP', category: 'proxy-vpn' },
  1883: { name: 'MQTT', category: 'messaging-iot' },
  1900: { name: 'UPnP/SSDP', category: 'messaging-iot' },
  2049: { name: 'NFS', category: 'file-transfer' },
  2082: { name: 'cPanel', category: 'other-registered' },
  2083: { name: 'cPanel SSL', category: 'other-registered' },
  2525: { name: 'SMTP (alt)', category: 'mail' },
  3000: { name: 'Dev server (common)', category: 'web' },
  3074: { name: 'Xbox Live', category: 'gaming' },
  3128: { name: 'HTTP proxy (Squid)', category: 'proxy-vpn' },
  3306: { name: 'MySQL', category: 'database' },
  3389: { name: 'RDP', category: 'remote-access' },
  3478: { name: 'STUN/TURN', category: 'streaming-rtc' },
  3479: { name: 'STUN/TURN (alt)', category: 'streaming-rtc' },
  4500: { name: 'IPsec NAT-T', category: 'proxy-vpn' },
  5000: { name: 'Dev server (common)', category: 'web' },
  5060: { name: 'SIP', category: 'streaming-rtc' },
  5061: { name: 'SIP TLS', category: 'streaming-rtc' },
  5222: { name: 'XMPP', category: 'messaging-iot' },
  5269: { name: 'XMPP server-to-server', category: 'messaging-iot' },
  5353: { name: 'mDNS', category: 'dns-ntp' },
  5432: { name: 'PostgreSQL', category: 'database' },
  5900: { name: 'VNC', category: 'remote-access' },
  5901: { name: 'VNC display 1', category: 'remote-access' },
  5938: { name: 'TeamViewer', category: 'remote-access' },
  6379: { name: 'Redis', category: 'database' },
  6667: { name: 'IRC (alt)', category: 'messaging-iot' },
  7777: { name: 'Generic game server', category: 'gaming' },
  8008: { name: 'HTTP (alt)', category: 'web' },
  8080: { name: 'HTTP proxy / alt web', category: 'web' },
  8081: { name: 'HTTP (alt)', category: 'web' },
  8118: { name: 'Privoxy', category: 'proxy-vpn' },
  8123: { name: 'Polipo/HA proxy', category: 'proxy-vpn' },
  8443: { name: 'HTTPS (alt)', category: 'web' },
  8883: { name: 'MQTT over TLS', category: 'messaging-iot' },
  8888: { name: 'HTTP proxy (alt)', category: 'proxy-vpn' },
  9000: { name: 'Dev server (common)', category: 'web' },
  9042: { name: 'Cassandra', category: 'database' },
  9050: { name: 'Tor SOCKS', category: 'proxy-vpn' },
  9150: { name: 'Tor Browser SOCKS', category: 'proxy-vpn' },
  9418: { name: 'Git protocol', category: 'other-registered' },
  19132: { name: 'Minecraft Bedrock', category: 'gaming' },
  19302: { name: 'Google STUN', category: 'streaming-rtc' },
  25565: { name: 'Minecraft Java', category: 'gaming' },
  27015: { name: 'Source engine game', category: 'gaming' },
  27017: { name: 'MongoDB', category: 'database' },
  28015: { name: 'RethinkDB', category: 'database' },
  51820: { name: 'WireGuard', category: 'proxy-vpn' },
};

function fallbackCategory(port: number): PortCategory {
  if (port <= 1023) return 'other-registered';
  return 'other-registered';
}

/**
 * Builds the full port catalog from 1..maxPort. Known ports get a friendly
 * name + accurate category; everything else is still a real, testable port
 * number, labeled generically and bucketed as "other-registered" (or
 * "well-known (unnamed)" for <1024) so results stay honest about what was
 * actually tested.
 */
export function buildPortCatalog(maxPort: number): PortDef[] {
  const out: PortDef[] = new Array(maxPort);
  for (let port = 1; port <= maxPort; port++) {
    const known = NAMED_PORTS[port];
    if (known) {
      out[port - 1] = { port, name: known.name, category: known.category };
    } else {
      out[port - 1] = {
        port,
        name: port <= 1023 ? `Well-known (unnamed) ${port}` : `Registered ${port}`,
        category: fallbackCategory(port),
      };
    }
  }
  return out;
}

/** Builds PortDefs for an arbitrary explicit list of port numbers (not a contiguous range). */
export function buildPortList(ports: number[]): PortDef[] {
  return ports.map((port) => {
    const known = NAMED_PORTS[port];
    if (known) return { port, name: known.name, category: known.category };
    return {
      port,
      name: port <= 1023 ? `Well-known (unnamed) ${port}` : `Registered ${port}`,
      category: fallbackCategory(port),
    };
  });
}

// The small, meaningful port set used against the broad (thousands-strong)
// destination tier — full 1-65535 sweeps only happen against the curated
// anchor list; broad destinations get checked on the ports that actually
// matter for "what classes of traffic does this network allow".
export const BROAD_TIER_PORTS = [
  80, 443, 53, 22, 21, 23, 25, 587, 465, 110, 995, 143, 993, 3389, 1080, 3128, 8080, 1194,
  51820, 500,
];

export const PORT_CATEGORY_LABELS: Record<PortCategory, string> = {
  web: 'Web (HTTP/HTTPS)',
  mail: 'Mail',
  'file-transfer': 'File transfer',
  'remote-access': 'Remote access',
  'proxy-vpn': 'Proxy / VPN / Tunnel',
  'dns-ntp': 'DNS / NTP',
  database: 'Database',
  'messaging-iot': 'Messaging / IoT',
  'streaming-rtc': 'Streaming / RTC',
  gaming: 'Gaming',
  'other-registered': 'Other registered ports',
};
