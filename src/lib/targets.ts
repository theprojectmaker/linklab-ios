import { DESTINATIONS } from './destinations';
import { BROAD_DOMAINS } from './broadDomains';
import { buildPortCatalog, buildPortList, BROAD_TIER_PORTS } from './ports';
import { Destination, PortDef } from './types';

// Two-tier design (changed 2026-11-24 after scaling anchors toward 5,000+):
// a flat destinations x full-port-range combinatorial explodes to hundreds of
// millions of test cases once the destination count gets into the thousands
// (5,000 x 65,535 = 327M - not a "lab test" any throttle preset could ever
// finish, and a volume that would read as abusive scanning on any network).
//
// So: the curated ANCHOR_DESTINATIONS (currently 100 - DNS/NTP/CDN/cloud/
// speedtest/Apple-iCloud/public-web giants) still get the full port sweep,
// 1-65,535. Everything added beyond that to reach 5,000+ destinations is a
// BROAD tier - real, distinct hostnames from the public Majestic Million
// top-domains ranking (not a proxy list, not random/arbitrary sites) -
// checked only on a fixed list of ~20 ports that actually matter for "what
// classes of traffic does this network allow" (web, mail, DNS, SSH, RDP,
// common proxy/VPN ports). This keeps the total in the tens of millions
// instead of hundreds of millions, while still covering 5,000+ distinct
// destinations as requested.
export const MAX_PORT = 65535;

export const ANCHOR_PORT_CATALOG: PortDef[] = buildPortCatalog(MAX_PORT);
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
    `x full port range (1-${MAX_PORT}), plus ${BROAD_DESTINATIONS.length.toLocaleString()} broad ` +
    `destinations x ${BROAD_PORT_CATALOG.length} key ports = ${total.toLocaleString()} test cases`
  );
}
