---
trigger: always_on
description: KITT Ecosystem Core Architecture & Platform Guidelines
---

# KITT Ecosystem Architecture Guidelines

When developing in this workspace:
- Maintain the unified platform identity across all 4 platforms:
  1. KITT 1.0 Autonomous Agent
  2. Ravi Synthesis Workspace
  3. DigiLogic Circuit Studio
  4. Hardware Fabrication Labs
- Cross-platform database synchronization is managed via `UserDashboardModal.tsx`.
- The background 3D canvas is governed by `SignatureHeroK.tsx`:
  - Untilted straight vertical center stem for the Logo (NO T-bars on the vertical stem).
  - Two diagonals with 4 perpendicular T-bars at all diagonal ends.
  - Smooth scroll morphing into the 3D letter 'K' at the bottom of the page.
- Keep particle counts balanced (~680 desktop, ~420 mobile) so foreground elements remain crisp and readable.
