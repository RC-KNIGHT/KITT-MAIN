# KITT — AI-Native Electronics Ecosystem

**Where Ideas Become Inventions.**

KITT is an electronics engineering platform designed to bring circuit design, digital logic, simulation, learning, and AI-assisted development together in one place.

The project aims to simplify the process of developing electronic systems by connecting different stages of engineering, from understanding an idea and selecting components to designing circuits, testing them, and eventually building hardware.

## Live Demo

https://kitt-main.pages.dev/

## Project Overview

KITT currently consists of four main modules:

| Module | Description | Route |
|---|---|---|
| KITT AI | AI-assisted electronics engineering interface | `#/kitt-ai` |
| Engineering Workspace | 2D circuit design, 3D breadboarding and simulation | `#/workspace` |
| DigiLogic Simulator | Digital logic gates, circuits and truth tables | `#/digilogic` |
| Number Trainer | Binary, decimal, hexadecimal, octal and bitwise operations | `#/number-trainer` |

The modules are accessible through a common landing page and are intended to work as parts of the same ecosystem.

## Main Features

- Interactive landing page with access to all four modules.
- AI conversation interface for electronics-related queries.
- Circuit schematic design and component interaction.
- 3D breadboard environment.
- Digital logic circuit construction and simulation.
- Truth-table generation and number-system learning.
- Shared API services for AI functionality.
- Responsive interface with custom animations and visual elements.

Some features are implemented, while others are still being developed and tested.

## Technology Stack

**Frontend**
- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- Motion
- Three.js

**Backend and Services**
- Node.js
- Express
- Cloudflare Pages Functions
- Google Gemini API
- NVIDIA NIM
- Firebase and Firestore

## AI Integration

KITT supports Google Gemini and NVIDIA NIM through a shared provider service.

The main API endpoints are:

```text
POST /api/kitt-org-chat
POST /api/kitt-core-chat
```

The first handles conversations on the landing page, while the second supports the KITT AI Studio.

Additional API endpoints include:

```text
GET  /api/health
POST /api/ai/compile-firmware
POST /api/ai/validate-panel
```

The application also includes fallback handling for situations where an external AI provider is unavailable.

## Design

The interface uses a dark colour scheme with antique gold, deep teal, and warm neutral accents.

Custom visual components include:

- `SignatureHeroK.tsx` — scroll-based particle animation forming the KITT logo.
- `PremiumLogicGatesMatrix.tsx` — animated logic gates and circuit elements.
- `Deep3DSpaceBackdrop.tsx` — background depth and spatial effects.
- `SurrealAuraCursor.tsx` — interactive cursor effect.

The design is intended to remain consistent across the landing page and connected modules.

## Project Structure

```text
.
├── functions/
│   └── api/
├── public/
├── scripts/
├── src/
│   ├── components/
│   │   ├── kitt-ai/
│   │   ├── workspace/
│   │   ├── digilogic/
│   │   └── number-trainer/
│   ├── data/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server.ts
├── vite.config.ts
└── wrangler.toml
```

## Running Locally

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The development server uses port `3000` by default.

Other available commands:

```bash
npm run lint
npm run build
npm run preview
npm run clean
```

API credentials can be configured using the variables documented in `.env.example`.

Do not commit API keys or other private credentials to the repository.

## Deployment

The project is deployed using Cloudflare Pages.

The frontend is built into the `dist` directory, while API requests are handled through Cloudflare Pages Functions.

Deployment settings are maintained in `wrangler.toml`.

## Current Development

KITT is still under development. The main focus is improving existing functionality, testing the connected modules, and making the overall system more reliable.

Planned improvements include:

- Improving digital logic and circuit simulation.
- Expanding AI-assisted circuit development.
- Improving communication between the modules.
- Developing the 3D prototyping and hardware workflow.
- Improving authentication and collaboration.
- Testing performance across different devices.

The long-term goal is to make KITT a single environment for learning electronics, designing circuits, experimenting with them, and developing physical electronic systems.
