import { DESTINATIONS } from './destinations';
import { BROAD_DOMAINS } from './broadDomains';
import { buildNamedPortCatalog, buildPortList, BROAD_TIER_PORTS } from './ports';
import { Destination, PortDef } from './types';

// Two-tier design (changed 2026-11-24 after scaling anchors toward 5,000+,
// then changed again 2026-11-25 to drop the blind full-port sweep):
//
// The curated ANCHOR_DESTINATIONS (currently 100 - DNS/NTP/CDN/cloud/
// speedtest/Apple-iCloud/public-web giants) get checked against every port
// that has an actual, named, real-world service behind it (NAMED_PORTS in
// ports.ts - web, mail, DNS, SSH, RDP, databases, gaming, proxy/VPN, etc).
// A blind 1-65,535 sweep was tried first, but almost every one of those
// 65,535 ports has no service at all, so results like "apple.com : 8" were
// pure noise - not a real link, nothing to learn from it, and it made the
// anchor tier take hours per host for zero useful signal.
//
// Everything added beyond the anchors to reach 5,000+ destinations is a
// BROAD tier - real, distinct hostnames from the public Majestic Million
// top-domains ranking (not a proxy list, not random/arbitrary sites) -
// checked only on a fixed list of ~20 ports that actually matter for "what
// classes of traffic does this network allow".
export const ANCHOR_PORT_CATALOG: PortDef[] = buildNamedPortCatalog();
export const BROAD_PORT_CATALOG: PortDef[] = buildPortList(BROAD_TIER_PORTS);

const BROAD_DESTINATIONS: Destination[] = BROAD_DOMAINS.map((host, i) => ({
  id: `broad-${i}`,
  label: host,
  host,
  category: 'public-web-broad',
}));

export function getTotalDestinationCount(): number {
  return DESTINATIONS.length + BROAD_DESTINATIONS.length;
}

export function getTotalTargetCount(): number {
  return (
    DESTINATIONS.length * ANCHOR_PORT_CATALOG.length +
    BROAD_DESTINATIONS.length * BROAD_PORT_CATALOG.length
  );
}

export interface Target {
  dest: Destination;
  port: PortDef;
}

/** Lazily iterates every (destination x port) combination without materializing the full array. */
export function* iterateTargets(): Generator<Target> {
  for (const port of ANCHOR_PORT_CATALOG) {
    for (const dest of DESTINATIONS) {
      yield { dest, port };
    }
  }
  for (const port of BROAD_PORT_CATALOG) {
    for (const dest of BROAD_DESTINATIONS) {
      yield { dest, port };
    }
  }
}

export function describeTargetSet(): string {
  const total = getTotalTargetCount();
  const destCount = getTotalDestinationCount();
  return (
    `${destCount.toLocaleString()} destinations total: ${DESTINATIONS.length} curated anchors ` +
    `x ${ANCHOR_PORT_CATALOG.length} real named-service ports, plus ${BROAD_DESTINATIONS.length.toLocaleString()} broad ` +
    `destinations x ${BROAD_PORT_CATALOG.length} key ports = ${total.toLocaleString()} test cases`
  );
}
