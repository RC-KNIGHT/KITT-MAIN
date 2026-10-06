# KITT — AI-Native Electronics Ecosystem Landing Page

> **Where Ideas Become Inventions.**
>
> The KITT landing page is the cinematic public-facing shell for the KITT ecosystem: a high-end engineering website that introduces the platform, demonstrates its AI capabilities, explains the student-to-hardware workflow, surfaces community work, and launches users directly into the ecosystem's interactive tools.

## 🚀 Live Demo

**[Visit KITT AI →](https://kitt-main.pages.dev/)**

Experience the KITT AI interface and explore the vision behind AI-powered digital circuit engineering.

## What this project is

This repository is the **KITT ecosystem landing page plus its connected interactive experiences**. The landing page is not a static marketing site only; it is the entry point to several lazy-loaded product surfaces and a small runtime API layer.

The primary experience combines:

- A cinematic hero with video and prompt-driven AI interaction.
- A unified ecosystem launchpad for KITT AI, KITT Engineering Workspace, DigiLogic Simulator, and Number Trainer.
- Interactive AI conversation on the landing page.
- A student-to-professional engineering journey explaining the complete workflow from idea to manufactured hardware.
- Pricing and token/billing presentation.
- A community project/review exhibition.
- A final invention prompt builder.
- Team and ecosystem footer information.
- Hash-based navigation into the connected studios without adding a router dependency.

## Product direction

KITT is presented as an AI-native electronics and engineering ecosystem rather than a generic AI chatbot or generic SaaS dashboard.

The landing page should make this progression obvious:

**Idea → Requirements → Components → Schematic → 3D Prototype → Firmware → Simulation → Experiment → PCB → Physical Hardware**

The visual language should communicate engineering precision, premium hardware, scientific experimentation, and futuristic depth without becoming a neon cyberpunk interface.

---

## Core ecosystem surfaces

The landing page exposes four major product portals through `src/data/ecosystem.ts`:

| Surface | Purpose | Route |
|---|---|---|
| **KITT AI** | Autonomous AI electronics engineering agent | `#/kitt-ai` |
| **KITT Engineering Workspace** | 2D schematic + 3D breadboard + simulation environment | `#/workspace` |
| **DigiLogic Simulator** | Logic gates, digital logic construction, truth tables, and waveform-oriented learning | `#/digilogic` |
| **Number Trainer** | Binary, decimal, hexadecimal, octal, bitwise logic, and computational foundations | `#/number-trainer` |

The landing route is the default:

```text
#/          → Landing page
#/kitt-ai   → KITT AI Studio
#/workspace → KITT Engineering Workspace
#/digilogic → DigiLogic Studio
#/number-trainer → Number Trainer
```

Routing is implemented in `src/App.tsx` through `window.location.hash` and `hashchange` listeners.

---

## Landing-page section order

The current landing page is composed in `src/App.tsx` in this order:

1. Global cinematic/ambient background layers.
2. `SurrealAuraCursor`
3. `Deep3DSpaceBackdrop`
4. `PremiumLogicGatesMatrix`
5. `SignatureHeroK`
6. `Navbar`
7. `HeroVideo`
8. `DirectEcosystemAccess`
9. `AiChatDemo`
10. `StudentJourney`
11. `PricingSection`
12. `CommunityAndReviewsSpiral`
13. `HeroPromptBuilder`
14. `TeamSection`
15. `Footer`

The order is part of the current storytelling flow. Reordering sections should be intentional because it changes the narrative from inspiration → capability → proof → conversion.

---

## Technology stack

### Frontend

- React 19
- TypeScript
- Vite 6
- Tailwind CSS v4
- `@tailwindcss/vite`
- Motion (`motion/react`)
- Three.js
- Lucide React icons
- Canvas-based custom animation systems

### Backend / runtime

- Node + Express for the local/full server path (`server.ts`)
- Cloudflare Pages Functions for deployed `/api/*` handlers
- Runtime-agnostic service modules under `src/services/`
- Google Gemini support through `@google/genai`
- NVIDIA NIM support through the OpenAI-compatible NVIDIA endpoint

### Data / platform services present in the repository

- Firebase client libraries
- Firestore / database security rules
- Local browser storage helpers
- Cloudflare Pages configuration

Not every dependency is used by the landing page shell itself; several belong to the connected KITT studios.

---

## Visual identity / design system

The current theme is deliberately **dark, cinematic, industrial, scientific, and premium**.

### Primary palette

| Token | Hex | Use |
|---|---|---|
| Obsidian Dark Void | `#080f14` | Main page background, canvas void, deep surfaces |
| Secondary Obsidian | `#0a1114` | Dark variations / elevated backgrounds |
| Antique Gold | `#A58D66` | Primary accent, active states, circuit traces, premium emphasis |
| Deep Oceanic Teal | `#407E8C` | Secondary accent, atmosphere, active signal states |
| Lighter Teal | `#76B4C2` | Glow, highlights, secondary information |
| Warm Sand | `#E5E1DD` | Main typography, neutral nodes, readable UI text |
| Platinum / Pearlescent | `#F5F2ED` / `#FFFFFF` | Specular highlights and rare high-contrast glints |
| Dark Navy Engineering Surface | `#03141D` | Workspace-oriented deep surface |

The canonical CSS variables are defined in `src/index.css`.

### Typography

The existing hierarchy mixes engineering UI typography with luxury editorial display typography:

- **Body/UI:** Plus Jakarta Sans
- **Monospace / engineering:** Fira Code (with system monospace fallbacks)
- **Luxury display options:** Italiana, Cinzel, Cormorant Garamond, Georgia fallbacks

The result should feel closer to a premium engineering laboratory than a conventional startup website.

### Surface language

Use the existing visual vocabulary rather than introducing a new component style:

- Transparent glass cards.
- Dark translucent surfaces.
- Subtle gold borders.
- Teal atmospheric haze.
- Radial gradients.
- Fine engineering grids / dot fields.
- Circuit traces and signal packets.
- Soft depth and restrained shadows.
- Long, smooth easing curves.
- Controlled 3D perspective.

Important existing utility classes include:

```text
transparent-glass-card
surreal-card
surreal-card-gold
bg-surreal-grid
bg-teal-haze
bg-gold-haze
text-gradient-gold
text-gradient-teal
text-gradient-surreal
animate-text-shimmer
animate-text-glow
animate-title-breathe
animate-gold-radiance
animate-ambition
animate-float
animate-halo
smooth-spring
hover-lift
perspective-1000
perspective-1400
preserve-3d
```

Prefer extending the existing system over inventing a second design system.

---

## Signature visual systems

### `SignatureHeroK.tsx`

This is the global scroll-driven particle system. It is part of the identity of the site, not decorative filler.

Current engineering constraints visible in the implementation:

- Desktop target: about 680 particles.
- Mobile target: about 420 particles.
- Device pixel ratio is clamped to 1.5.
- Mouse and touch movement influence the field.
- Scroll progress morphs the field toward a stylized **K** structure.
- The vertical center stem is intentionally straight.
- The background must not visually overwhelm foreground content.

### `PremiumLogicGatesMatrix.tsx`

This is the ambient electronics canvas containing gates, traces, active signal packets, vias, and an ASIC-like package motif.

Keep it behind content and readable at low visual contrast. It should feel like living engineering instrumentation, not an interactive game unless deliberately redesigned.

### `Deep3DSpaceBackdrop.tsx`

Provides deep-space depth, grids, stars, and orbital/engineering atmosphere.

### `SurrealAuraCursor.tsx`

Adds the premium cursor/aura layer. It should degrade gracefully on devices where pointer tracking is unavailable or expensive.

---

## Repository structure

```text
.
├── functions/
│   └── api/                  # Cloudflare Pages API routes
├── public/                   # Static media, logos, videos, favicon assets
├── scripts/                  # Build/setup/test helper scripts
├── src/
│   ├── components/
│   │   ├── kitt-ai/          # KITT AI Studio
│   │   ├── digilogic/        # DigiLogic Studio
│   │   ├── number-trainer/   # Number Trainer
│   │   ├── workspace/        # Engineering Workspace
│   │   └── ...               # Landing-page components
│   ├── data/                 # Ecosystem, journey, community, pricing data
│   ├── services/             # API, AI, simulation, security, orchestration
│   ├── types/                # Shared TypeScript types
│   ├── utils/                # Shared browser/runtime utilities
│   ├── App.tsx               # Top-level route + landing-page composition
│   ├── main.tsx              # React entry point
│   └── index.css             # Global design system and animation utilities
├── .agents/
│   └── rules/                # Existing always-on agent rules
├── server.ts                 # Local/full Express runtime
├── vite.config.ts            # Vite + Tailwind + chunking configuration
├── wrangler.toml             # Cloudflare Pages configuration
├── database.rules.json       # Database rules
└── firestore.rules           # Firestore rules
```

---

## AI and API architecture

The frontend uses relative `/api/*` endpoints so local and deployed environments can share the same client code.

### Landing-page AI conversation

```text
POST /api/kitt-org-chat
```

Implemented through `handleKittOrgChat` in `src/services/edgeApi.ts`.

Responsibilities include:

- Same-origin / allowed-origin checks.
- Per-IP rate limiting.
- Payload security inspection.
- Message sanitization.
- Provider selection.
- LLM invocation.
- Sensitive-output redaction.
- Intelligent offline fallback when no provider is available or a provider fails.

### KITT AI Studio conversation

```text
POST /api/kitt-core-chat
```

This endpoint runs the hardware-oriented orchestrator and can return structured information such as:

- Assistant reply.
- Proposed circuit patch.
- Panel report.
- Simulation report.
- Firmware compile result.
- BOM information.
- Model/provider metadata.

### Additional API routes

```text
GET  /api/health
POST /api/ai/compile-firmware
POST /api/ai/validate-panel
```

Cloudflare Pages functions are thin adapters around the runtime-agnostic service layer. Do not move business logic into individual Pages route files unless the behavior is truly edge-only.

---

## LLM provider behavior

`src/services/llmProvider.ts` centralizes provider selection.

Supported providers:

- **NVIDIA NIM** (`nvidia-nim`)
- **Google Gemini** (`gemini`)
- **Offline fallback** when no usable credential exists

Provider precedence:

1. `KITT_LLM_PROVIDER=nvidia` / `nim` forces NVIDIA when a key is available.
2. `KITT_LLM_PROVIDER=gemini` forces Gemini when a key is available.
3. Without an explicit provider, NVIDIA is preferred when configured; otherwise Gemini is used.
4. If neither is available, the landing conversation uses its deterministic fallback path.

The provider layer also supports model fallback behavior.

---

## Environment variables

Use `.env.example` as the canonical local reference.

### Primary secrets

```text
GEMINI_API_KEY=
NVIDIA_API_KEY=
```

### Optional configuration

```text
NVIDIA_MODEL=
KITT_LLM_PROVIDER=nvidia
ALLOWED_ORIGINS=
```

The runtime layer also recognizes compatible alternate credential names such as:

```text
GEMINI_API_KEY_CORE
GEMINI_API_KEY_LANDING
GOOGLE_API_KEY
NVIDIA_NIM_API_KEY
NIM_API_KEY
NVIDIA_API_KEY_CORE
```

### Secret-handling rule

**Never commit real API keys, tokens, cookies, service credentials, or generated secret material.** Keep secrets in local environment configuration or deployment secrets.

---

## Running locally

Install dependencies:

```bash
npm install
```

Start the local Express/Vite development runtime:

```bash
npm run dev
```

The Vite/Express server is configured for port `3000` by default.

Type-check the project:

```bash
npm run lint
```

Build the frontend and bundled Node server:

```bash
npm run build
```

Preview the Vite output:

```bash
npm run preview
```

Clean generated output:

```bash
npm run clean
```

---

## Production / Cloudflare deployment model

`wrangler.toml` configures the project for **Cloudflare Pages** with:

```text
pages_build_output_dir = "dist"
compatibility_flags = ["nodejs_compat"]
```

The expected architecture is:

```text
Browser
  │
  ├── Static Vite assets ───────────────→ Cloudflare Pages / dist
  │
  └── /api/* requests ─────────────────→ Cloudflare Pages Functions
                                              │
                                              └── shared src/services/*
```

The deployed site must retain the same-origin API behavior. Do not change client calls to hard-coded development URLs.

---

## Performance rules

This landing page contains several always-visible animation systems, so performance is a first-class constraint.

### Do

- Keep canvas work GPU-friendly.
- Clamp device pixel ratio where the existing implementation does.
- Reuse arrays/objects inside animation loops where practical.
- Clean up `requestAnimationFrame`, resize, pointer, touch, and scroll listeners.
- Use lazy loading for large studio surfaces.
- Preserve the existing Vite manual vendor chunks.
- Use `content-visibility` / containment utilities for long sections where appropriate.
- Respect `prefers-reduced-motion` for new motion-heavy interactions.

### Avoid

- Large unbounded particle counts.
- Creating new React objects every frame in canvas loops.
- Continuous DOM layout reads/writes inside high-frequency pointer handlers.
- Adding a second Three.js scene for a small visual effect when Canvas2D is sufficient.
- Huge autoplaying media without checking mobile bandwidth/decoding costs.
- Global scroll handlers that force layout on every event.
- Removing lazy loading from the studio routes.

---

## Accessibility expectations

Every new landing-page feature should preserve:

- Keyboard reachability.
- Visible focus states.
- Semantic buttons/links instead of clickable `div`s.
- Labels for interactive controls.
- Meaningful alt text for informative images.
- Decorative canvases marked appropriately so they do not pollute screen-reader output.
- Sufficient contrast against the dark background.
- A usable mobile layout without requiring hover.
- Reduced-motion behavior when animation would otherwise be excessive.

Glass, glow, and motion are visual enhancement layers—not substitutes for readable information.

---

## Content and marketing rules

The page mixes product explanation, product claims, metrics, testimonials, and community examples.

Treat data in `src/data/ecosystem.ts` as the content source for the corresponding sections. Avoid scattering duplicate marketing strings through multiple components.

When adding a new metric, testimonial, partner name, rating, performance figure, or institutional claim, verify that the project actually has evidence for the claim before presenting it as factual. Do not invent social proof to make the page look more impressive.

Avoid generic copy such as “revolutionary AI platform” when a concrete engineering capability can be stated instead.

---

## Media rules

Important public assets include:

```text
public/kitt-hero.mp4
public/premium-hero.mp4
public/kitt-logo.png
public/kitt-logo-dark.png
public/kitt-logo-badge.png
public/og-image.png
```

Prefer the existing KITT media library before introducing visually inconsistent stock assets.

Remote images already present in `src/data/ecosystem.ts` should not be replaced with random sources just for visual variety.

---

## Component ownership

### Landing-page shell

```text
src/App.tsx
src/index.css
src/components/Navbar.tsx
src/components/HeroVideo.tsx
src/components/DirectEcosystemAccess.tsx
src/components/AiChatDemo.tsx
src/components/StudentJourney.tsx
src/components/PricingSection.tsx
src/components/CommunityAndReviewsSpiral.tsx
src/components/HeroPromptBuilder.tsx
src/components/TeamSection.tsx
src/components/Footer.tsx
```

### Atmospheric / visual systems

```text
Deep3DSpaceBackdrop.tsx
PremiumLogicGatesMatrix.tsx
SignatureHeroK.tsx
SurrealAuraCursor.tsx
AnimatedCircuitOverlay.tsx
Tilt3DCard.tsx
InfiniteSpiral.tsx
```

### Connected product surfaces

```text
src/components/kitt-ai/
src/components/workspace/
src/components/digilogic/
src/components/number-trainer/
```

Keep cross-product changes deliberate. A landing-page visual improvement should not silently modify the engineering semantics of the connected studios.

---

## Design-change checklist

Before changing visual design, check:

- Does it belong to the current obsidian/gold/teal/sand system?
- Does it preserve the cinematic engineering-lab identity?
- Does it improve hierarchy rather than add decoration?
- Is the foreground still more readable than the ambient canvas?
- Does it behave correctly on mobile and desktop?
- Does it work without hover-only interaction?
- Does it remain performant while the global canvases are active?
- Does it accidentally introduce a new color language, rounded-SaaS look, or unrelated visual metaphor?

### Strongly avoid

- Purple-blue AI SaaS gradients.
- White-card-on-white-background layouts.
- Heavy glass blur everywhere.
- Excessive glowing neon.
- Cartoonish hardware illustrations.
- Huge borders or pills around every element.
- Excessive parallax that makes the page feel unstable.
- Unrelated icon packs or inconsistent icon stroke weights.

---

## Engineering-change checklist

For a normal code change:

1. Read the relevant component/service and its nearby dependencies.
2. Check `.agents/rules/` before changing core visual or ecosystem behavior.
3. Make the smallest coherent change.
4. Preserve TypeScript types.
5. Keep API contracts stable unless the task explicitly changes them.
6. Remove listeners/timers/animation frames during unmount.
7. Run `npm run lint` for TypeScript-facing changes.
8. Run `npm run build` for build, routing, import, or deployment-facing changes.
9. Inspect the affected route at desktop and mobile sizes.
10. Do not commit secrets or generated artifacts.

---

## Troubleshooting

### Landing AI is not answering

Check:

1. The browser request is reaching `/api/kitt-org-chat`.
2. The deployment environment contains a valid LLM credential.
3. `KITT_LLM_PROVIDER` is not forcing an unavailable provider.
4. `/api/health` reports the expected AI configuration.
5. The request is same-origin or allowed through `ALLOWED_ORIGINS`.

The landing endpoint intentionally has a fallback response path when the model is unavailable.

### KITT AI Studio is blank or slow to open

The studio is lazy-loaded from `src/App.tsx`. Check its import path and the component's runtime errors before changing the route shell.

### API works locally but not after deployment

Verify that:

- Cloudflare Pages Functions are deployed.
- API secrets are configured in the Pages environment.
- `wrangler.toml` still points to `dist`.
- The client is using relative `/api/...` URLs.
- No frontend route is swallowing an API request.

### Animation performance dropped

Profile the newly changed canvas/DOM region first. Do not immediately disable the entire visual system; isolate the expensive effect and reduce per-frame work.

---

## License

Source files include Apache-2.0 license notices where applicable. Preserve existing license headers when modifying those files, and verify the repository's intended distribution terms before publishing additional third-party assets.

---

## Maintainer note

This repository contains both the **public KITT landing experience** and connected interactive engineering tools. Think of the landing page as the visual and narrative front door, while `src/services/`, the studio folders, and the API layer contain the deeper engineering systems behind it.
