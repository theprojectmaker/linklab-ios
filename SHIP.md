# LinkLab — ship status

Standalone iOS app: a throttled, honest Wi-Fi reachability "lab test" tool. Diagnoses
what classes of outbound traffic the current network allows, instead of finding or
providing a working proxy.

- **Repo:** https://github.com/theprojectmaker/linklab-ios (public, branch `main`)
- **EAS project:** `@solomonsasson/linklab` (projectId `fe150cdb-a764-4256-956e-3f5a2e468904`)
- **Bundle id:** `com.solyapps.linklab` (checked for collisions against everything else under `tests/` — none)
- **App name:** LinkLab

## What's done

- Full Expo SDK 58 / TypeScript / Expo Router app, scaffolded and built out:
  - `src/lib/destinations.ts` + `src/lib/ports.ts` + `src/lib/targets.ts` — the test-target generator (see below)
  - `src/lib/reachability.ts` — real raw-TCP connect test via `react-native-tcp-socket` on-device, simulated stand-in on web
  - `src/lib/runner.ts` — concurrency-limited, throttled, pause/resume/stop scan engine with progress callbacks and capped result sampling (so it doesn't try to hold 160k result rows in memory/storage)
  - `src/lib/scanStore.tsx` — app-wide scan state (React context)
  - `src/lib/storage.ts` — AsyncStorage-backed run history
  - `src/lib/networkInfo.ts` — current network snapshot (Wi-Fi/IP; SSID caveat below)
  - 4 tabs: **Run** (throttle presets, start/pause/stop, live progress), **Results** (grouped by category, tap to drill into individual host:port results with latency), **History** (past runs, tap into any for its full breakdown), **About** (plain-language explanation of scope + methodology)
- `.github/workflows/ios-testflight.yml` — same pattern as the account's other apps (macOS runner, `eas build --local` + `eas submit`, `workflow_dispatch` with a `submit` input)
- `eas.json` — production/development build profiles; `submit.production.ios.ascAppId` is a placeholder (`TODO_FILL_AFTER_FIRST_INTERACTIVE_SUBMIT`) until the first submit creates the App Store Connect app
- `scripts/set-expo-token.ps1` — paste-token helper scoped to `theprojectmaker/linklab-ios`, matching the other apps
- Typecheck (`npx tsc --noEmit`) passes clean

## How the ~150k-175k target set is actually built (read this first)

Per your call when I asked: **combinatorial**, not a scraped proxy list.

- **19 anchor destinations** — a small, fixed, publicly-documented set: public DNS resolvers
  (Google, Cloudflare, Quad9, OpenDNS), public NTP servers (Cloudflare, Google, Apple, the
  NTP pool, NIST), major CDN/cloud anchors (Cloudflare, Google, Microsoft, Apple, Amazon,
  Akamai), and speedtest-style hosts (Cloudflare Speed Test, fast.com). Every one of these
  exists specifically to be probed, or is large/redundant enough that a handful of
  throttled TCP connects is indistinguishable from background traffic.
- **× ports 1–8400** — covers every IANA well-known port (0–1023) plus the first ~7400
  registered ports, each tagged with a name where known (SSH, HTTPS, OpenVPN, WireGuard,
  SOCKS, RDP, MQTT, Minecraft, etc.) and a category, falling back to a generic
  "registered N" label + "other-registered" category for the long tail of unnamed ports.
- **19 × 8400 = 159,600 test cases** — lands in your 150k-175k target without shipping or
  scraping a single real open/public proxy. I did **not** pad this further just to hit a
  rounder number; 159,600 is the actual, defensible count.
- Breadth comes entirely from the port axis (same principle as any ordinary port-checker /
  firewall-diagnostic tool, just run at larger scale with throttling), not from enumerating
  arbitrary third-party hosts. The About tab in the app explains this to you (or anyone else
  who opens it) in plain language, same reasoning as above.

## Real privacy/safety tradeoffs (also written into the app and About tab)

- 150k+ connection attempts, even throttled, is a long-running operation — minutes to
  possibly over an hour depending on the throttle preset. Three presets (Gentle/Normal/Fast)
  trade concurrency + per-dispatch delay against how long it takes.
- Pause/Stop are always available; a stopped run still saves everything tested so far to History.
- Results are NOT stored as 160k raw rows — only aggregate counts per category bucket, plus
  a capped sample (every "open"/"refused" result, a sparse sample of "filtered"/"error") so
  storage and memory stay bounded regardless of run size.
- A phone doing this repeatedly could plausibly get flagged by a carrier/Wi-Fi provider for
  anomalous connection-attempt volume — this is a real tradeoff of the feature as requested,
  not something I can design away; it's why throttling + visible progress + an easy Stop
  exist rather than defaulting to "Fast."
- SSID is unavailable on iOS without Apple's gated `com.apple.developer.networking.wifi-info`
  / NEHotspotHelper entitlement, which isn't something a standalone indie app gets by default.
  The app shows "unavailable" rather than guessing; device IP and Wi-Fi-vs-not are still shown.

## What I verified vs. couldn't

- **Verified in the Expo web preview** (`npm run web` / the `linklab-web` launch config in
  the shared `tests/.claude/launch.json`): the full UI flow end-to-end — Run tab throttle
  presets, start → live progress → pause/stop, Results tab grouped-by-category breakdown
  with drill-down into individual host:port + latency rows, History tab listing + run-detail
  drill-down, About tab content. All confirmed working via screenshots in this session.
- **Could NOT verify real reachability behavior** — the web preview has no raw-socket API,
  so `reachability.ts` falls back to a clearly-labeled "SIMULATED" random generator there.
  The app shows a visible orange "SIMULATED MODE" banner whenever it's running on web, and
  every saved run is tagged `simulated: true` so History never confuses simulated and real
  results. Real reachability (via `react-native-tcp-socket`) can only be verified by actually
  building and running the app on a device, which needs the step below.

## What's blocking (needs you)

Brand-new bundle id → brand-new EAS/Apple credentials, which `eas credentials` genuinely
can't do non-interactively (confirmed: `--non-interactive` isn't even a valid flag for that
command, it always needs your Apple account login in the terminal). Same one-time dance as
every other app on this account:

1. **Paste your Expo access token** so GitHub Actions can run EAS:
   ```powershell
   cd linklab-native; powershell -File scripts/set-expo-token.ps1
   ```
2. **One interactive credentials/build step** (creates the Apple certs/provisioning profile
   for `com.solyapps.linklab`) — from `linklab-native/`:
   ```powershell
   npx eas-cli@latest credentials --platform ios
   ```
   or just run a build once interactively, which will offer to create credentials:
   ```powershell
   npx eas-cli@latest build -p ios --profile production
   ```
3. Once that first build/submit creates the App Store Connect app, grab its `ascAppId` and
   fill it into `eas.json` (`submit.production.ios.ascAppId`), commit, push.
4. After that, it's on GitHub like the rest:
   ```powershell
   gh workflow run ios-testflight.yml -R theprojectmaker/linklab-ios -f submit=true
   ```

I can do all of this once credentials exist — just the Apple login + first cert creation is
yours to do (same pattern as FidgetTrack, NSHA, Signal Scout, etc.).
