import { DestinationCategory } from './types';

export const DEST_CATEGORY_LABELS: Record<DestinationCategory, string> = {
  dns: 'DNS resolver',
  ntp: 'NTP server',
  'cdn-cloud': 'CDN / cloud',
  speedtest: 'Speedtest host',
  'apple-icloud': 'Apple / iCloud',
  'public-web': 'Public web anchor',
  'public-web-broad': 'Top domain',
};
