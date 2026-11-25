import { Destination } from './types';

/**
 * Anchor destinations for the reachability test set.
 *
 * Deliberately NOT a list of open/public proxy servers, and NOT arbitrary
 * random third-party sites. Every entry here is a large, high-redundancy,
 * publicly documented service that exists precisely to be probed (public
 * resolvers, NTP servers) or that operates at a scale where a handful of
 * throttled TCP connection attempts is indistinguishable from ordinary
 * background traffic (major CDN/cloud anchors, Apple/iCloud infrastructure,
 * speedtest hosts, a short list of huge public-web services). "Proxy"
 * coverage comes from the PORT axis (SOCKS/VPN/HTTP-proxy ports tested
 * against these anchors), not from a list of real proxy servers to route
 * through. See the About tab in the app for the full rationale.
 */
export const DESTINATIONS: Destination[] = [
  // Public DNS resolvers — designed to be queried by anyone, anywhere.
  { id: 'dns-google', label: 'Google Public DNS', host: '8.8.8.8', category: 'dns' },
  { id: 'dns-google-2', label: 'Google Public DNS (alt)', host: '8.8.4.4', category: 'dns' },
  { id: 'dns-cloudflare', label: 'Cloudflare DNS', host: '1.1.1.1', category: 'dns' },
  { id: 'dns-cloudflare-2', label: 'Cloudflare DNS (alt)', host: '1.0.0.1', category: 'dns' },
  { id: 'dns-quad9', label: 'Quad9', host: '9.9.9.9', category: 'dns' },
  { id: 'dns-opendns', label: 'OpenDNS', host: '208.67.222.222', category: 'dns' },
  { id: 'dns-quad101', label: 'Quad101 (Taiwan)', host: '101.101.101.101', category: 'dns' },
  { id: 'dns-cleanbrowsing', label: 'CleanBrowsing', host: '185.228.168.9', category: 'dns' },
  { id: 'dns-adguard', label: 'AdGuard DNS', host: '94.140.14.14', category: 'dns' },
  { id: 'dns-comodo', label: 'Comodo Secure DNS', host: '8.26.56.26', category: 'dns' },
  { id: 'dns-yandex', label: 'Yandex DNS', host: '77.88.8.8', category: 'dns' },
  { id: 'dns-level3', label: 'Level3 / CenturyLink', host: '4.2.2.2', category: 'dns' },

  // Public NTP servers — part of the public NTP pool, exist to answer time queries.
  { id: 'ntp-cloudflare', label: 'Cloudflare NTP', host: 'time.cloudflare.com', category: 'ntp' },
  { id: 'ntp-google', label: 'Google NTP', host: 'time.google.com', category: 'ntp' },
  { id: 'ntp-apple', label: 'Apple NTP', host: 'time.apple.com', category: 'ntp' },
  { id: 'ntp-pool', label: 'NTP Pool (generic)', host: 'pool.ntp.org', category: 'ntp' },
  { id: 'ntp-nist', label: 'NIST Time', host: 'time.nist.gov', category: 'ntp' },
  { id: 'ntp-windows', label: 'Microsoft NTP', host: 'time.windows.com', category: 'ntp' },
  { id: 'ntp-asia', label: 'NTP Pool (Asia zone)', host: 'asia.pool.ntp.org', category: 'ntp' },
  { id: 'ntp-europe', label: 'NTP Pool (Europe zone)', host: 'europe.pool.ntp.org', category: 'ntp' },
  { id: 'ntp-namerica', label: 'NTP Pool (N. America zone)', host: 'north-america.pool.ntp.org', category: 'ntp' },

  // Major CDN / cloud anchors — massive, globally distributed infrastructure.
  { id: 'cdn-cloudflare', label: 'Cloudflare', host: 'cloudflare.com', category: 'cdn-cloud' },
  { id: 'cdn-google', label: 'Google', host: 'google.com', category: 'cdn-cloud' },
  { id: 'cdn-microsoft', label: 'Microsoft', host: 'microsoft.com', category: 'cdn-cloud' },
  { id: 'cdn-apple', label: 'Apple', host: 'apple.com', category: 'cdn-cloud' },
  { id: 'cdn-amazon', label: 'Amazon/AWS', host: 'amazon.com', category: 'cdn-cloud' },
  { id: 'cdn-akamai', label: 'Akamai', host: 'akamai.com', category: 'cdn-cloud' },
  { id: 'cdn-fastly', label: 'Fastly', host: 'fastly.com', category: 'cdn-cloud' },
  { id: 'cdn-digitalocean', label: 'DigitalOcean', host: 'digitalocean.com', category: 'cdn-cloud' },
  { id: 'cdn-oracle', label: 'Oracle Cloud', host: 'oracle.com', category: 'cdn-cloud' },
  { id: 'cdn-ibm', label: 'IBM Cloud', host: 'ibm.com', category: 'cdn-cloud' },
  { id: 'cdn-netlify', label: 'Netlify', host: 'netlify.com', category: 'cdn-cloud' },
  { id: 'cdn-vercel', label: 'Vercel', host: 'vercel.com', category: 'cdn-cloud' },

  // Speedtest-style endpoints — designed for throughput/latency probing.
  { id: 'speed-cloudflare', label: 'Cloudflare Speed Test', host: 'speed.cloudflare.com', category: 'speedtest' },
  { id: 'speed-fast', label: 'Fast.com (Netflix)', host: 'fast.com', category: 'speedtest' },

  // Apple / iCloud infrastructure — massive-scale, built to be hit by every iOS device.
  { id: 'icloud-main', label: 'iCloud', host: 'icloud.com', category: 'apple-icloud' },
  { id: 'icloud-appleid', label: 'Apple ID', host: 'appleid.apple.com', category: 'apple-icloud' },
  { id: 'icloud-itunes', label: 'iTunes/App Store', host: 'itunes.apple.com', category: 'apple-icloud' },
  { id: 'icloud-push', label: 'Apple Push (APNs)', host: 'push.apple.com', category: 'apple-icloud' },
  { id: 'icloud-captive', label: 'Apple Captive check', host: 'captive.apple.com', category: 'apple-icloud' },
  { id: 'icloud-gsa', label: 'Apple GSA', host: 'gsa.apple.com', category: 'apple-icloud' },

  // A short, fixed list of huge, globally-redundant public web services —
  // NOT a general "any website" list, just a few more massive anchors.
  { id: 'web-wikipedia', label: 'Wikipedia', host: 'wikipedia.org', category: 'public-web' },
  { id: 'web-github', label: 'GitHub', host: 'github.com', category: 'public-web' },
  { id: 'web-gitlab', label: 'GitLab', host: 'gitlab.com', category: 'public-web' },
  { id: 'web-reddit', label: 'Reddit', host: 'reddit.com', category: 'public-web' },
  { id: 'web-stackoverflow', label: 'Stack Overflow', host: 'stackoverflow.com', category: 'public-web' },
  { id: 'web-x', label: 'X (Twitter)', host: 'x.com', category: 'public-web' },
  { id: 'web-netflix', label: 'Netflix', host: 'netflix.com', category: 'public-web' },
  { id: 'web-linkedin', label: 'LinkedIn', host: 'linkedin.com', category: 'public-web' },
  { id: 'web-youtube', label: 'YouTube', host: 'youtube.com', category: 'public-web' },
];
