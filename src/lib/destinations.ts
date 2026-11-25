import { Destination } from './types';

/**
 * Anchor destinations for the reachability test set.
 *
 * Deliberately NOT a list of open/public proxy servers. Every entry here is a
 * large, high-redundancy, publicly documented service that exists precisely
 * to be probed by diagnostic clients (public resolvers, NTP servers) or that
 * operates at a scale where a handful of throttled TCP connection attempts
 * is indistinguishable from ordinary background traffic (major CDN/cloud
 * anchors, speedtest hosts). See README.md "Why this target list" for the
 * full rationale.
 */
export const DESTINATIONS: Destination[] = [
  // Public DNS resolvers — designed to be queried by anyone, anywhere.
  { id: 'dns-google', label: 'Google Public DNS', host: '8.8.8.8', category: 'dns' },
  { id: 'dns-google-2', label: 'Google Public DNS (alt)', host: '8.8.4.4', category: 'dns' },
  { id: 'dns-cloudflare', label: 'Cloudflare DNS', host: '1.1.1.1', category: 'dns' },
  { id: 'dns-cloudflare-2', label: 'Cloudflare DNS (alt)', host: '1.0.0.1', category: 'dns' },
  { id: 'dns-quad9', label: 'Quad9', host: '9.9.9.9', category: 'dns' },
  { id: 'dns-opendns', label: 'OpenDNS', host: '208.67.222.222', category: 'dns' },

  // Public NTP servers — part of the public NTP pool, exist to answer time queries.
  { id: 'ntp-cloudflare', label: 'Cloudflare NTP', host: 'time.cloudflare.com', category: 'ntp' },
  { id: 'ntp-google', label: 'Google NTP', host: 'time.google.com', category: 'ntp' },
  { id: 'ntp-apple', label: 'Apple NTP', host: 'time.apple.com', category: 'ntp' },
  { id: 'ntp-pool', label: 'NTP Pool (generic)', host: 'pool.ntp.org', category: 'ntp' },
  { id: 'ntp-nist', label: 'NIST Time', host: 'time.nist.gov', category: 'ntp' },

  // Major CDN / cloud anchors — massive, globally distributed infrastructure.
  { id: 'cdn-cloudflare', label: 'Cloudflare', host: 'cloudflare.com', category: 'cdn-cloud' },
  { id: 'cdn-google', label: 'Google', host: 'google.com', category: 'cdn-cloud' },
  { id: 'cdn-microsoft', label: 'Microsoft', host: 'microsoft.com', category: 'cdn-cloud' },
  { id: 'cdn-apple', label: 'Apple', host: 'apple.com', category: 'cdn-cloud' },
  { id: 'cdn-amazon', label: 'Amazon/AWS', host: 'amazon.com', category: 'cdn-cloud' },
  { id: 'cdn-akamai', label: 'Akamai', host: 'akamai.com', category: 'cdn-cloud' },

  // Speedtest-style endpoints — designed for throughput/latency probing.
  { id: 'speed-cloudflare', label: 'Cloudflare Speed Test', host: 'speed.cloudflare.com', category: 'speedtest' },
  { id: 'speed-fast', label: 'Fast.com (Netflix)', host: 'fast.com', category: 'speedtest' },
];
