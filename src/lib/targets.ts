import { DESTINATIONS } from './destinations';
import { buildPortCatalog } from './ports';
import { Destination, PortDef } from './types';

// 1..MAX_PORT covers every IANA well-known port (0-1023) plus the first
// ~7400 registered ports. Combined with DESTINATIONS.length anchors this
// lands the full target set in the 150k-175k range the test was scoped to,
// via breadth of port coverage rather than a scraped destination list.
export const MAX_PORT = 8400;

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
