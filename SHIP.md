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
  - `src/lib/destinations.ts` + `src/lib/ports.ts` + `src/lib/targets.ts` — the test-target generator (see below)
  - `src/lib/reachability.ts` — real raw-TCP connect test via `react-native-tcp-socket` on-device, simulated stand-in on web
  - `src/lib/runner.ts` — concurrency-limited, throttled, pause/resume/stop scan engine, capped result sampling (doesn't try to hold 3.28M result rows in memory/storage)
  - `src/lib/scanStore.tsx`, `src/lib/storage.ts`, `src/lib/networkInfo.ts`
  - 4 tabs: **Run** (throttle presets, start/pause/stop, live progress), **Results** (grouped by category, drill-down), **History**, **About** (plain-language scope + methodology)
- `.github/workflows/ios-testflight.yml` — macOS runner, `eas build --local` + `eas submit`, `workflow_dispatch` with a `submit` input
- `eas.json` — `submit.production.ios.ascAppId` = `6839021654` (real value, not a placeholder)
- `scripts/set-expo-token.ps1` — EXPO_TOKEN secret is set on the repo
- Typecheck (`npx tsc --noEmit`) passes clean
- **iOS credentials created** (2026-11-24) via interactive `eas credentials`: distribution cert + provisioning profile for `com.solyapps.linklab`, Apple Team "Moshe Sasson (Individual)"
- **First build + submit done manually, end to end**: GitHub Actions macOS build (local build, run 45537963296, green in 17m33s) → downloaded the `.ipa` → `eas submit` interactively → App Store Connect app created, binary uploaded, processing on Apple's side
- **Final target-set scale dispatched as a fresh build** — see below; GitHub Actions is running `-f submit=true` with the 3.28M-target build

## How the target set grew (full history, so the final number makes sense)

Started from your call when asked: **combinatorial**, not a scraped proxy list. Then scaled
up twice more at your request, each time the same way — more ports, not more "anchors":

1. **159,600** — 19 anchors (DNS/NTP/CDN/speedtest) × ports 1–8,400.
2. **500,000** — expanded to 50 anchors (added Apple/iCloud infra + public-web giants like
   Wikipedia/GitHub) × ports 1–10,000, at your request to cover "icloud apple... everything
   in the world."
3. **3,276,750 (final)** — you said no more anchor companies, scale ports only, "like
   everything" — so the anchor list is frozen at 50, and the port range is now the entire
   TCP space: **50 anchors × ports 1–65,535 = 3,276,750 test cases.**

What stayed constant throughout: the 50 anchors are a fixed, publicly-documented list across
6 categories — DNS resolvers (12), NTP servers (9), CDN/cloud providers (12), speedtest hosts
(2), Apple/iCloud infrastructure (6 — icloud.com, appleid.apple.com, itunes.apple.com,
push.apple.com, captive.apple.com, gsa.apple.com), and huge public-web services (9 —
Wikipedia, GitHub, GitLab, Reddit, Stack Overflow, X, Netflix, LinkedIn, YouTube). **No real
proxy servers were ever added, and no general "any website" scanner** — "proxy" coverage is
still only a port/protocol axis (SOCKS/VPN/HTTP-proxy ports) tested against these same 50
legitimate, massive, high-redundancy anchors. That line held at every scale-up, including
this final one, even though "like everything on the planet" was explicitly asked for.

## Real privacy/safety tradeoffs (also written into the app's About tab)

- 3.28M connection attempts, even throttled, is a genuinely enormous operation — a full run
  at any throttle preset will take a long time (likely many hours, possibly longer than a
  day on "Gentle"). This is a real, large step up from the original ask; Pause/Stop are
  always available and a stopped run still saves everything tested so far to History, so a
  partial run is still a useful result, not a wasted one.
- Three throttle presets (Gentle/Normal/Fast) trade concurrency + per-dispatch delay against
  how long it takes; "Gentle" is the safer default for a first run on any network you care
  about staying on good terms with.
- Results are NOT stored as millions of raw rows — only aggregate counts per category
  bucket, plus a capped sample (every "open"/"refused" result, a sparse sample of
  "filtered"/"error"), so storage and memory stay bounded regardless of run size. Verified in
  the web preview: UI stayed responsive loading and scanning against the full 3,276,750-entry
  catalog, no freeze.
- A phone doing this repeatedly will very plausibly get flagged by a carrier/Wi-Fi provider
  for anomalous connection-attempt volume — more true than ever at this scale. This is the
  real tradeoff of "attempt every port against every anchor"; the throttle + Stop are there
  specifically because of it.
- SSID is unavailable on iOS without Apple's gated entitlement; the app shows "unavailable"
  rather than guessing. Device IP and Wi-Fi-vs-not are still shown.

## What I verified vs. couldn't

- **Verified in the Expo web preview**: full UI flow end-to-end at every scale, including
  the final 3,276,750-target catalog — Run tab loads instantly (no freeze building the
  65,535-port catalog), throttle presets, start → live progress → pause/stop, Results tab
  grouped-by-category with drill-down, History, About. Screenshotted.
- **Could NOT verify real reachability behavior** — web has no raw-socket API, so
  `reachability.ts` simulates there (visible orange "SIMULATED MODE" banner, every run
  tagged `simulated: true`). Real reachability (via `react-native-tcp-socket`) is only
  provable on an actual TestFlight build on a device.

## Status: nothing left blocking

Apple credentials, EXPO_TOKEN, and the ASC app all exist now. The GitHub Actions pipeline is
fully wired and was dispatched with `submit=true` to build + submit the final 3.28M-target
version. From here on, any future change ships with:
```powershell
gh workflow run ios-testflight.yml -R theprojectmaker/linklab-ios -f submit=true
```
No further Apple login/credentials steps needed.
