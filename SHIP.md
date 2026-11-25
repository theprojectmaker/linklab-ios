# LinkLab — ship status

Standalone iOS app: a throttled, honest Wi-Fi reachability "lab test" tool. Diagnoses
what classes of outbound traffic the current network allows, instead of finding or
providing a working proxy.

- **Repo:** https://github.com/theprojectmaker/linklab-ios (public, branch `main`)
- **EAS project:** `@solomonsasson/linklab` (projectId `fe150cdb-a764-4256-956e-3f5a2e468904`)
- **Bundle id:** `com.solyapps.linklab`
- **App name:** LinkLab
- **App Store Connect app:** created 2026-11-24, `ascAppId` **6839021654** (already filled into `eas.json`)

## What's done — fully shipped to TestFlight pipeline

- Full Expo SDK 58 / TypeScript / Expo Router app:
  - `src/lib/destinations.ts` (100 curated anchors) + `src/lib/broadDomains.ts` (4,954 broad
    destinations) + `src/lib/ports.ts` + `src/lib/targets.ts` — the two-tier test-target
    generator (see below)
  - `scripts/gen-broad-domains.js` — regenerates `broadDomains.ts` from a fresh Majestic
    Million CSV if the broad list ever needs refreshing
  - `src/lib/reachability.ts` — real raw-TCP connect test via `react-native-tcp-socket` on-device, simulated stand-in on web
  - `src/lib/runner.ts` — concurrency-limited, throttled, pause/resume/stop scan engine, capped result sampling (doesn't try to hold millions of result rows in memory/storage)
  - `src/lib/scanStore.tsx`, `src/lib/storage.ts`, `src/lib/networkInfo.ts`
  - 4 tabs: **Run** (throttle presets, start/pause/stop, live progress), **Results** (grouped by category, drill-down), **History**, **About** (plain-language scope + methodology, two-tier explanation)
- `.github/workflows/ios-testflight.yml` — macOS runner, `eas build --local` + `eas submit`, `workflow_dispatch` with a `submit` input
- `eas.json` — `submit.production.ios.ascAppId` = `6839021654` (real value, not a placeholder)
- `scripts/set-expo-token.ps1` — EXPO_TOKEN secret is set on the repo
- Typecheck (`npx tsc --noEmit`) passes clean
- **iOS credentials created** (2026-11-24) via interactive `eas credentials`: distribution cert + provisioning profile for `com.solyapps.linklab`, Apple Team "Moshe Sasson (Individual)"
- **First build + submit done manually, end to end**: GitHub Actions macOS build (local build, run 45537963296, green in 17m33s) → downloaded the `.ipa` → `eas submit` interactively → App Store Connect app created, binary uploaded, processing on Apple's side
- **Final target-set version dispatched as a fresh build** — see below

## How the target set grew (full history, so the final design makes sense)

Started from your call when asked: **combinatorial**, not a scraped proxy list. Scaled up
three more times at your request:

1. **159,600** — 19 anchors (DNS/NTP/CDN/speedtest) × ports 1–8,400.
2. **500,000** — 50 anchors (added Apple/iCloud infra + public-web giants) × ports 1–10,000.
3. **3,276,750** — anchors frozen at 50, ports pushed to the full TCP range (1–65,535),
   per "no more anchor companies... like everything."
4. **"At least 5,000 destinations" (final, two-tier design):** doing this as a flat
   combinatorial would have meant 5,000+ destinations × 65,535 ports = **~327 million**
   connection attempts — not a "lab test" any throttle preset could ever finish, and a
   volume that reads as abusive scanning on any real network regardless of throttling. You
   picked the fix I proposed: split into two tiers.
   - **Anchor tier — 100 destinations**, still frozen at the same curated, high-redundancy
     list (DNS resolvers ×22, NTP servers ×15, CDN/cloud providers ×26, speedtest ×2,
     Apple/iCloud infra ×10, public-web giants ×25 — expanded once more within this tier,
     still zero real proxy servers, zero random sites), × the **full 65,535-port range**.
   - **Broad tier — 4,954 destinations**, pulled from the **Majestic Million**
     (majestic.com/reports/majestic-million) — a standard, openly published top-domains
     ranking used throughout the security/networking industry, downloaded fresh via `curl`
     this session. This is explicitly **not** a proxy list and provides no working proxy —
     same trust model as any ordinary site-categorization/firewall test. Checked on a fixed
     list of **~20 ports that actually matter** (web, mail, DNS, SSH, RDP, common proxy/VPN
     ports) instead of the full range, which is what keeps the total sane.
   - **Final: 5,054 total destinations, 6,652,580 total test cases.**

"Proxy" coverage, at every scale and both tiers, is still only the PORT axis
(SOCKS/VPN/HTTP-proxy ports) tested against real, legitimate, massive-scale destinations —
never a list of real proxy servers to route through, and never a scanner of arbitrary random
sites outside the Majestic Million's standard public ranking. That line held through every
single scale-up.

## Real privacy/safety tradeoffs (also written into the app's About tab)

- 6.65M connection attempts, even throttled, is a genuinely enormous operation — a full run
  at any throttle preset will take a long time. Pause/Stop are always available and a
  stopped run still saves everything tested so far to History, so a partial run is still a
  useful result.
- Three throttle presets (Gentle/Normal/Fast) trade concurrency + per-dispatch delay against
  how long it takes; "Gentle" is the safer default for a first run on any network you care
  about staying on good terms with.
- Results are NOT stored as millions of raw rows — only aggregate counts per category
  bucket, plus a capped sample, so storage and memory stay bounded regardless of run size.
  Verified in the web preview: the app loads instantly and scans smoothly against the full
  5,054-destination / 6,652,580-target catalog, no freeze building either the 65,535-entry
  anchor port catalog or the 4,954-entry broad destination list.
- A phone doing this repeatedly will very plausibly get flagged by a carrier/Wi-Fi provider
  for anomalous connection-attempt volume — more true than ever at this scale. Throttle +
  Stop exist specifically because of it.
- SSID is unavailable on iOS without Apple's gated entitlement; the app shows "unavailable"
  rather than guessing. Device IP and Wi-Fi-vs-not are still shown.

## What I verified vs. couldn't

- **Verified in the Expo web preview**: full UI flow end-to-end at every scale, up to and
  including the final two-tier 6,652,580-target catalog — Run tab loads instantly, throttle
  presets, start → live progress → pause/stop, Results tab grouped-by-category with
  drill-down (including the new "Broad web destinations" bucket), History, About.
  Screenshotted.
- **Could NOT verify real reachability behavior** — web has no raw-socket API, so
  `reachability.ts` simulates there (visible orange "SIMULATED MODE" banner, every run
  tagged `simulated: true`). Real reachability (via `react-native-tcp-socket`) is only
  provable on an actual TestFlight build on a device.

## Status: nothing left blocking

Apple credentials, EXPO_TOKEN, and the ASC app all exist. The GitHub Actions pipeline is
fully wired. Any future change (including this final target-set version) ships with:
```powershell
gh workflow run ios-testflight.yml -R theprojectmaker/linklab-ios -f submit=true
```
No further Apple login/credentials steps needed.
