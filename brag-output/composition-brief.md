# Hyperframes Composition Brief: C.N Connect (Customer)

## Objective
Create a short launch-style brag video for the C.N Connect **customer** app only.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 20 seconds

## Source Material
- Project root: `/Users/felix/Desktop/work/cnmt/web/apps/customer`
- Primary files read: `messages/en.json` (Home, Track, NewTransfer), `sections/home/hero.tsx`, `hero-illustration.tsx`, `packages/tailwind-config/shared-styles.css`
- Product name: C.N Connect
- Tagline / strongest claim: International money transfer for everyone
- Key UI or visual moment to recreate: corridor chip GBP→GHS; transfer quote (you send / they get); track timeline → Delivered
- Copy that must appear verbatim:
  - C.N Connect
  - International money transfer / for everyone
  - Send money
  - Clear rates, verified payouts (paraphrase OK if space-tight; prefer product wording)
- Fictional stand-ins only: £250, GH₵4,850, TRANS-UK-GH-4821, Ghana · MTN — no real customer data

## Creative Direction
- Tone preset: polished
- Creative direction: quiet premium remittance product film
- Interpretation: restrained pacing, soft crossfades, brand red as accent only
- Angle: Trust without the fog — show clear quote math, then Delivered
- Hook: FOR EVERYONE in brand red
- Outro / punchline: Start a transfer in about a minute + Send money + logo
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Dashboard/admin UI (customer app only)
  - Purple SaaS gradients / Inter defaults

## Visual Identity
- Background: `#ffffff` with soft `#f7f8fa` and brand-soft `#fde8e9` radials
- Text: `#0a1a2f`
- Accent: `#d01018`
- Muted: `#5a6577`
- Gold accent (optional chip warmth): `#e8a317`
- Display font: Barlow Condensed (Google Fonts)
- Body font: Schibsted Grotesk (Google Fonts)
- Visual references: hero illustration phone frame, corridor pill, navy borders, brand CTA button

## Storyboard
Use `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. Hook — 2.5s — C.N CONNECT + FOR EVERYONE
2. Reveal — 3.5s — hero claim + GBP→GHS chip
3. Quote — 5.0s — transfer summary rows one-by-one
4. Track — 5.0s — timeline to Delivered
5. Outro — 4.0s — CTA + logo

## Audio
- Audio role: warm bed / sparse professional accents
- Audio arc: soft in → UI ticks mid → confirmation on Delivered → fade under logo
- Music: `happy-beats-business-moves-vol-11-by-ende-dot-app.mp3`
- Music treatment: soft underlay; fade ~0.8s under final logo
- Music cue guidance: bundled preset for vol-11; optional locks near 1.60s, 5.80s, 8.96s, 12.65s
- Audio-reactive treatment: subtle; brand glow / card presence only
- Audio-coupled moments:
  - Hook title slam
  - Corridor chip settle
  - Quote row sequence
  - Delivered confirmation
  - Final logo
- Exact SFX choice: Hyperframes picks from brag SFX library after animation exists
- Audio files: copy music (+ chosen SFX) into `brag-output/composition/assets/`

## Hyperframes Instructions
Follow hyperframes + hyperframes-cli + hyperframes-registry + media-use. Skip storyline/SPEC/REVIEW.md. Gate: `hyperframes check` with zero errors before render. Keep creation local.
