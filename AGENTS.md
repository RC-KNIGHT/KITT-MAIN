# KITT Landing Page — Antigravity Agent Instructions

These instructions apply to the entire repository. They are intentionally strict around the visual identity, landing-page narrative, performance, routing, and API boundaries.

## 1. Mission

This repo is the public-facing **KITT AI-Native Electronics Ecosystem landing page plus its connected interactive studios**.

Your default goal is to improve the product without changing its core identity:

- Premium engineering laboratory aesthetic.
- Cinematic dark environment.
- AI-native electronics positioning.
- Strong hardware / circuit / scientific visual language.
- Smooth, deliberate motion.
- Direct access to the connected KITT tools.

Do not turn this into a generic AI SaaS landing page.

---

## 2. Read these rules first

Before changing visual or ecosystem behavior, read:

```text
.agents/rules/ecosystem_rules.md
.agents/rules/palette.md
```

Those files are always-on project rules. This file adds landing-page-specific guidance; it does not replace them.

---

## 3. Source of truth

### App composition

`src/App.tsx` is the source of truth for:

- Hash routing.
- Lazy loading of the connected studios.
- Landing-page section order.
- Global atmospheric layers.

### Content

`src/data/ecosystem.ts` is the main source of truth for ecosystem products, journey steps, community projects, testimonials, and pricing data.

Do not duplicate these datasets into multiple components unless there is a strong architectural reason.

### Design system

`src/index.css` is the canonical source for global colors, typography helpers, glass surfaces, animation utilities, and common perspective/depth utilities.

Prefer reusing existing utilities over adding one-off inline styling.

---

## 4. Product routes

Preserve these routes unless the task explicitly requires changing them:

```text
#/                  Landing
#/kitt-ai           KITT AI Studio
#/workspace         KITT Engineering Workspace
#/digilogic         DigiLogic Studio
#/number-trainer    Number Trainer
```

Routing currently uses `window.location.hash`. Do not add React Router merely to simplify a small route change.

When navigating from a studio back to the landing page, preserve the existing `#/` convention.

Every route change should continue to reset scroll position as implemented in `App.tsx`.

---

## 5. Hard visual constraints

The KITT theme is non-negotiable unless the user explicitly requests a redesign.

### Canonical colors

```text
Obsidian:       #080f14
Obsidian alt:   #0a1114
Antique Gold:   #A58D66
Deep Teal:      #407E8C
Light Teal:     #76B4C2
Warm Sand:      #E5E1DD
Platinum:       #F5F2ED
White glint:    #FFFFFF
Engineering:   #03141D
```

### Visual character

The page should feel:

- Dark.
- Deep.
- Precise.
- Scientific.
- Industrial.
- Luxurious.
- Futuristic, but grounded in real engineering.

Avoid making it:

- Purple/blue AI SaaS.
- Cyberpunk neon.
- Cartoonish.
- Flat and ordinary.
- White-dashboard-like.
- Overly playful.

### Surfaces

Reuse the existing vocabulary:

- `surreal-card`
- `surreal-card-gold`
- `transparent-glass-card`
- `bg-surreal-grid`
- `bg-teal-haze`
- `bg-gold-haze`

Do not create a new card system with unrelated radii, borders, shadows, and colors when an existing utility can be extended.

---

## 6. Typography rules

Existing typography hierarchy:

- UI/body: **Plus Jakarta Sans**.
- Engineering/code: **Fira Code**.
- Editorial/luxury display: **Italiana / Cinzel / Cormorant Garamond** fallbacks.

Use type to establish hierarchy, not to make every heading decorative.

Use monospace for values that feel like instrumentation, specifications, code, IDs, telemetry, or technical labels.

Do not introduce a random font family for one section.

---

## 7. Landing-page narrative

Preserve the current story unless the task explicitly changes it:

```text
Hero
  ↓
Ecosystem Launchpad
  ↓
AI Conversation / Architecture Explanation
  ↓
Student → Professional Journey
  ↓
Pricing
  ↓
Community / Reviews
  ↓
What Do You Want To Build?
  ↓
Team
  ↓
Footer
```

Each section should answer one question for the visitor. Avoid repeating the same pitch in five different sections.

The main narrative is engineering transformation, not AI hype.

---

## 8. Global visual systems

### `SignatureHeroK`

Treat `SignatureHeroK.tsx` as a core identity element.

Current constraints:

- Approximately 680 particles desktop.
- Approximately 420 particles mobile.
- DPR capped around 1.5.
- Scroll-driven morphing.
- Mouse/touch response.
- Central vertical stem stays straight.
- The field must not dominate foreground readability.

Do not increase particle counts casually.

Do not rotate the entire page's visual system just to add drama.

### `PremiumLogicGatesMatrix`

This canvas is a background electronics motif with logic gates, traces, signal packets, vias, and package/IC geometry.

Use the existing palette and low-contrast glow behavior. It should look like engineering instrumentation in the environment, not a foreground game.

### `Deep3DSpaceBackdrop`

Preserve the deep-space / engineering-grid depth layer.

### `SurrealAuraCursor`

Keep pointer-driven effects supplemental. Disable or reduce them naturally when pointer input is not available.

---

## 9. Motion rules

Motion should feel engineered and expensive, not frantic.

Prefer the existing easing vocabulary, especially:

```text
cubic-bezier(0.16, 1, 0.3, 1)
```

Existing animation utilities include:

```text
animate-text-shimmer
animate-text-glow
animate-title-breathe
animate-gold-radiance
animate-ambition
animate-float
animate-halo
animate-pulse-sync
animate-pulse-teal
animate-border-sheen
smooth-spring
hover-lift
```

For new motion:

- Keep entrances subtle.
- Prefer opacity/transform over layout animation.
- Avoid constant high-frequency DOM updates.
- Keep decorative motion slower than interaction motion.
- Respect `prefers-reduced-motion` for new animations.

Do not add motion merely because a section feels empty.

---

## 10. Performance rules

This site already runs multiple canvases and motion systems. Every new effect competes with them.

### Required behavior

- Clean up all listeners on unmount.
- Cancel `requestAnimationFrame` loops.
- Clear timers/intervals.
- Clamp expensive pixel ratios.
- Avoid allocations inside render loops.
- Avoid layout thrashing.
- Keep expensive product studios lazy-loaded.
- Use containment/content-visibility for long offscreen sections where appropriate.

### Avoid

- New global animation loops for tiny UI details.
- Per-frame React state updates.
- Repeated `getBoundingClientRect()` calls inside animation loops unless throttled/necessary.
- Giant SVGs when a lightweight Canvas2D effect is enough.
- Additional Three.js scenes for purely decorative effects.
- Unbounded particle systems.
- Removing manual Vite chunks without a reason.

If performance regresses, isolate the new work before disabling existing signature systems.

---

## 11. Responsive behavior

Design for:

- Mobile portrait.
- Tablet.
- Laptop.
- Large desktop.

Do not assume hover exists.

Interactive elements must remain usable with touch.

Canvas systems must scale down rather than simply overflow.

Keep headline width, CTA spacing, video framing, navigation density, and card grids intentional at narrow widths.

---

## 12. Accessibility

Every new interaction should support:

- Keyboard access.
- Focus visibility.
- Semantic controls.
- Meaningful accessible names.
- Screen-reader-safe decorative backgrounds.
- Adequate text contrast.
- Motion reduction.
- Touch interaction.

Do not use a clickable `div` where a button or link is appropriate.

For dialogs/modals, follow the existing `.agents/rules/palette.md` instruction to portal them to `document.body` and provide accessible close affordances.

---

## 13. Landing-page component boundaries

Primary landing components live under `src/components/`:

```text
Navbar.tsx
HeroVideo.tsx
DirectEcosystemAccess.tsx
AiChatDemo.tsx
StudentJourney.tsx
PricingSection.tsx
CommunityAndReviewsSpiral.tsx
HeroPromptBuilder.tsx
TeamSection.tsx
Footer.tsx
```

Atmospheric systems include:

```text
Deep3DSpaceBackdrop.tsx
PremiumLogicGatesMatrix.tsx
SignatureHeroK.tsx
SurrealAuraCursor.tsx
AnimatedCircuitOverlay.tsx
InfiniteSpiral.tsx
Tilt3DCard.tsx
```

When the task is specific to one section, modify that section instead of rewriting `App.tsx` wholesale.

---

## 14. Content architecture

Use `src/data/ecosystem.ts` for reusable product and marketing data.

When editing content:

- Keep naming consistent across navbar, cards, routes, and footer.
- Prefer concrete engineering capabilities over vague AI claims.
- Keep terminology technically coherent.
- Avoid conflicting product names.
- Do not invent customer logos, institutional endorsements, performance benchmarks, ratings, usage numbers, or testimonials.

The repository contains strong marketing-style figures and examples. Treat them as editable project content; do not silently upgrade them into verified factual claims.

---

## 15. Navigation behavior

Navbar anchors currently target section IDs such as:

```text
#ecosystem-launchpad
#ai-agent
#journey
#community
#pricing
#team
```

Keep IDs stable unless a coordinated navigation change is made.

The navbar also exposes the connected ecosystem tools. Maintain direct, obvious access to the actual product surfaces.

---

## 16. API boundaries

Frontend AI calls use relative URLs:

```text
POST /api/kitt-org-chat
POST /api/kitt-core-chat
POST /api/ai/compile-firmware
POST /api/ai/validate-panel
GET  /api/health
```

Do not hard-code localhost or a specific production domain into frontend API clients.

Business logic belongs in the shared service layer where possible.

Cloudflare Pages Functions should remain thin adapters. They should parse/validate the edge request and delegate to runtime-agnostic services.

---

## 17. AI provider rules

The provider abstraction is in:

```text
src/services/llmProvider.ts
src/services/nimClient.ts
src/services/nimConfig.ts
src/services/geminiClient.ts
src/services/runtimeEnv.ts
```

Supported runtime selection:

```text
KITT_LLM_PROVIDER=nvidia
KITT_LLM_PROVIDER=nim
KITT_LLM_PROVIDER=gemini
```

Without an explicit override, the application prefers NVIDIA when configured, then Gemini.

Do not duplicate provider-selection logic inside React components.

Do not expose provider credentials to the browser.

---

## 18. Security rules

Preserve the existing defense layers in `server.ts` and `src/services/edgeApi.ts`.

These include behavior such as:

- Request method filtering.
- Path traversal detection.
- Scanner/honeypot checks.
- Request size limits.
- Rate limiting.
- Origin validation.
- Payload inspection/sanitization.
- Sensitive output redaction.
- Security headers.

Do not weaken these controls to make development easier.

Never commit:

- API keys.
- Session credentials.
- Cloudflare secrets.
- Private URLs containing secrets.
- Test dumps containing credentials.

---

## 19. Media rules

Prefer existing assets in `public/` and `src/assets/` when they fit the design.

Key existing assets include:

```text
public/kitt-hero.mp4
public/premium-hero.mp4
public/kitt-logo.png
public/kitt-logo-dark.png
public/kitt-logo-badge.png
public/og-image.png
```

When adding media:

- Optimize dimensions and bitrate for the intended viewport.
- Provide appropriate poster/fallback behavior.
- Avoid loading large media before it is needed.
- Keep art direction aligned with the obsidian/gold/teal/sand system.

---

## 20. Icons

Use the existing `lucide-react` icon set for UI icons unless a project-specific SVG/asset is clearly required.

Keep stroke weight and scale consistent.

Do not add multiple competing icon libraries for a small feature.

---

## 21. Modals and overlays

Follow the existing modal conventions.

Per the project rules, modals should be portaled to `document.body` and provide accessible close controls.

Ensure overlays do not accidentally sit behind the global canvas layers.

Always check stacking contexts when adding:

- Dialogs.
- Dropdowns.
- Tooltips.
- Menus.
- Full-screen studio transitions.

---

## 22. Engineering workspace isolation

The repo contains deeper product code under:

```text
src/components/kitt-ai/
src/components/workspace/
src/components/digilogic/
src/components/number-trainer/
```

These are not merely visual mockups. They contain simulation, circuit, routing, editor, authentication, and other engineering logic.

When working on the landing page:

- Do not refactor these folders without a reason.
- Do not change simulation semantics to solve a landing-page UI problem.
- Do not rename routes casually.
- Do not break shared service contracts.
- Prefer integration through existing public interfaces.

---

## 23. State and persistence

Existing shared state/persistence utilities live under:

```text
src/utils/
src/services/
src/components/*/context/
```

Before introducing new global state, check whether an existing store/context already owns the required state.

Do not create duplicate sources of truth for user/session/ecosystem state.

---

## 24. Code style

Prefer:

- Small focused React components.
- Explicit TypeScript types.
- Early returns for guard clauses.
- Existing project naming conventions.
- Existing utility classes and tokens.
- Comments only where they explain non-obvious engineering choices.

Avoid:

- Giant components for unrelated sections.
- `any` when a useful type already exists.
- Copy/paste implementation of existing services.
- Dead code left behind after a refactor.
- Placeholder text that can accidentally ship.

---

## 25. Validation commands

Use these commands as appropriate:

```bash
npm run lint
npm run build
npm run preview
```

`npm run dev` starts the local Express/Vite development runtime.

For route-specific changes, also manually inspect the affected hash route after the build-sensitive checks.

---

## 26. Change discipline

When the requested task is narrow:

1. Identify the smallest affected file set.
2. Inspect existing implementation first.
3. Make a minimal coherent patch.
4. Preserve current APIs and route contracts.
5. Validate the changed behavior.
6. Avoid unrelated formatting churn.

Do not rewrite the entire landing page because one card, animation, or section needs improvement.

---

## 27. When creating a new landing component

Before creating one, ask whether the behavior already belongs in an existing component.

A new component should have a clear responsibility, for example:

```text
Hero visual
Ecosystem card
Engineering metric
Journey step
Pricing tier
Community item
CTA / prompt interaction
Footer utility
```

Keep data separate from presentation when the data is reused.

---

## 28. Acceptance checklist

Before considering a landing-page change complete, verify:

### Visual
- [ ] Uses the current KITT color system.
- [ ] Matches the cinematic engineering aesthetic.
- [ ] Does not introduce unrelated visual language.
- [ ] Foreground remains readable over the canvases.

### Interaction
- [ ] Works with mouse.
- [ ] Works with touch where relevant.
- [ ] Works with keyboard.
- [ ] Links/routes still work.
- [ ] Hash navigation still behaves correctly.

### Responsive
- [ ] Mobile layout is intentional.
- [ ] Tablet layout is stable.
- [ ] Desktop spacing is balanced.
- [ ] Canvas effects scale appropriately.

### Performance
- [ ] No leaked listeners/timers/RAF loops.
- [ ] No unnecessary per-frame allocations.
- [ ] No obvious layout thrashing.
- [ ] Existing lazy loading remains intact.

### Engineering
- [ ] TypeScript remains valid.
- [ ] API contracts are preserved.
- [ ] Security behavior is not weakened.
- [ ] No secrets were added.
- [ ] Relevant checks/builds were run.

---

## 29. Final principle

**Add capability without losing identity.**

KITT should look and behave like a serious engineering instrument with an AI-native interface—not like a reskinned generic SaaS template.
