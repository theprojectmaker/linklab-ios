import { DESTINATIONS } from './destinations';
import { buildPortCatalog } from './ports';
import { Destination, PortDef } from './types';

// 1..MAX_PORT = the entire TCP port space (well-known 0-1023, registered
// 1024-49151, and dynamic/private 49152-65535). DESTINATIONS stays fixed at
// 50 curated, legitimate, high-redundancy anchors on purpose — scaling up
// happens only on the PORT axis, never by inflating the anchor list with
// more "big enough to be safe" companies. This is every port that exists,
// attempted against every anchor: 50 x 65,535 ~= 3.28M test cases.
export const MAX_PORT = 65535;

export const PORT_CATALOG: PortDef[] = buildPortCatalog(MAX_PORT);

export function getTotalTargetCount(): number {
  return DESTINATIONS.length * PORT_CATALOG.length;
}

export interface Target {
  dest: Destination;
  port: PortDef;
}

/** Lazily iterates every (destination x port) combination without materializing the full array. */
export function* iterateTargets(): Generator<Target> {
  for (const port of PORT_CATALOG) {
    for (const dest of DESTINATIONS) {
      yield { dest, port };
    }
  }
}

export function describeTargetSet(): string {
  return `${DESTINATIONS.length} anchor endpoints x ${PORT_CATALOG.length} ports (1-${MAX_PORT}) = ${getTotalTargetCount().toLocaleString()} test cases`;
}
