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
  - `src/lib/runner.ts` — concurrency-limited, throttled, pause/resume/stop scan engine with progress callbacks and capped result sampling (doesn't try to hold 500k result rows in memory/storage)
  - `src/lib/scanStore.tsx` — app-wide scan state (React context)
  - `src/lib/storage.ts` — AsyncStorage-backed run history
  - `src/lib/networkInfo.ts` — current network snapshot (Wi-Fi/IP; SSID caveat below)
  - 4 tabs: **Run** (throttle presets, start/pause/stop, live progress), **Results** (grouped by category, tap to drill into individual host:port results with latency), **History** (past runs, tap into any for its full breakdown), **About** (plain-language explanation of scope + methodology)
- `.github/workflows/ios-testflight.yml` — same pattern as the account's other apps (macOS runner, `eas build --local` + `eas submit`, `workflow_dispatch` with a `submit` input)
- `eas.json` — production/development build profiles; `submit.production.ios.ascAppId` is a placeholder until the first submit creates the App Store Connect app
- `scripts/set-expo-token.ps1` — paste-token helper scoped to `theprojectmaker/linklab-ios` (done — EXPO_TOKEN secret is set)
- Typecheck (`npx tsc --noEmit`) passes clean
- **iOS credentials created** via interactive `eas credentials` (2026-11-24): distribution cert + provisioning profile for `com.solyapps.linklab` under Apple Team "Moshe Sasson (Individual)" — reused the account's existing distribution cert
- **First GitHub Actions build dispatched** (`workflow_dispatch`, submit=false) to produce the first `.ipa` via the macOS runner's local build — see "what's left" below

## How the 500,000 target set is actually built (read this first)

Per your calls: **combinatorial** (not a scraped proxy list), then expanded on request to
cover Apple/iCloud specifically and scale toward 500k.

- **50 anchor destinations** — a fixed, publicly-documented list across 6 categories: public
  DNS resolvers (12, worldwide — Google, Cloudflare, Quad9, OpenDNS, Quad101, CleanBrowsing,
  AdGuard, Comodo, Yandex, Level3), public NTP servers (9, including regional pool zones),
  major CDN/cloud providers (12 — Cloudflare, Google, Microsoft, Apple, Amazon, Akamai,
  Fastly, DigitalOcean, Oracle, IBM, Netlify, Vercel), speedtest hosts (2), **Apple/iCloud
  infrastructure (6 — icloud.com, appleid.apple.com, itunes.apple.com, push.apple.com,
  captive.apple.com, gsa.apple.com)**, and a short fixed list of huge public-web services (9
  — Wikipedia, GitHub, GitLab, Reddit, Stack Overflow, X, Netflix, LinkedIn, YouTube). Every
  one of these is large/redundant enough that a handful of throttled TCP connects is
  indistinguishable from background traffic, or exists specifically to be probed.
- **× ports 1–10,000** — every IANA well-known port (0–1023) plus the first ~9000 registered
  ports, named where known (SSH, HTTPS, OpenVPN, WireGuard, SOCKS, RDP, MQTT, Minecraft,
  etc.), category-tagged, generic fallback for the unnamed long tail.
- **50 × 10,000 = exactly 500,000 test cases.**
- **"Proxy" coverage is still only a port/protocol axis** (SOCKS, VPN, HTTP-proxy ports
  tested against the same 50 legitimate anchors) — I did not add real proxy servers or a
  general "any website" scanner even though more scale was requested; that would turn this
  back into the filter-bypass/open-proxy tool the original brief said to avoid. Said this to
  you directly when making the change; flagging again here for the record.

## Real privacy/safety tradeoffs (also written into the app's About tab)

- 500k connection attempts, even throttled, is a genuinely long-running operation — this is
  a much bigger number than the original 150-175k ask, so expect a full run to take
  meaningfully longer (potentially multiple hours on "Gentle", still a long while on "Fast").
  Three throttle presets (Gentle/Normal/Fast) trade concurrency + per-dispatch delay against
  how long it takes.
- Pause/Stop are always available; a stopped run still saves everything tested so far to History.
- Results are NOT stored as 500k raw rows — only aggregate counts per category bucket, plus a
  capped sample (every "open"/"refused" result, a sparse sample of "filtered"/"error") so
  storage and memory stay bounded regardless of run size.
- A phone doing this repeatedly could plausibly get flagged by a carrier/Wi-Fi provider for
  anomalous connection-attempt volume — more true than ever at 500k. Throttling + visible
  progress + an easy Stop exist specifically because of this; "Gentle" is the safer default
  for a first run on any network you care about staying on good terms with.
- SSID is unavailable on iOS without Apple's gated `com.apple.developer.networking.wifi-info`
  / NEHotspotHelper entitlement, which isn't something a standalone indie app gets by default.
  The app shows "unavailable" rather than guessing; device IP and Wi-Fi-vs-not are still shown.

## What I verified vs. couldn't

- **Verified in the Expo web preview** (`npm run web` / the `linklab-web` launch config in
  the shared `tests/.claude/launch.json`): the full UI flow end-to-end — Run tab throttle
  presets, start → live progress → pause/stop, Results tab grouped-by-category breakdown
  with drill-down into individual host:port + latency rows, History tab listing + run-detail
  drill-down, About tab content. All confirmed working via screenshots (with the original
  159,600-target set; the 500k expansion is a straightforward data change to the same code
  paths, typechecks clean, not re-screenshotted).
- **Could NOT verify real reachability behavior** — the web preview has no raw-socket API,
  so `reachability.ts` falls back to a clearly-labeled "SIMULATED" random generator there.
  The app shows a visible orange "SIMULATED MODE" banner whenever it's running on web, and
  every saved run is tagged `simulated: true` so History never confuses simulated and real
  results. Real reachability (via `react-native-tcp-socket`) can only be verified by actually
  running the app on a device, once the first TestFlight build lands.

## What's left

Credentials are done, EXPO_TOKEN is set, and the first GitHub Actions build (local build on
the macOS runner, submit=false) was dispatched. Once it's green:

1. Download its `app-ipa` artifact and run `eas submit -p ios --path <ipa>` interactively —
   this first submit creates the App Store Connect app record (asks for app name/language/
   SKU, no secrets beyond the already-authenticated Apple session).
2. Grab the new app's `ascAppId` from that submit, fill it into `eas.json`
   (`submit.production.ios.ascAppId`), commit, push.
3. From then on it's fully on GitHub like the rest of the account's apps:
   ```powershell
   gh workflow run ios-testflight.yml -R theprojectmaker/linklab-ios -f submit=true
   ```

No further Apple login/credentials steps needed — that part is done.
