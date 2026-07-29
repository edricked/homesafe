# HomeSafe

HomeSafe is a standalone, offline-first progressive web app for household
emergency planning. It runs locally without ChatGPT authentication, a user
account, or a backend.

## Run locally

Requirements: Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by the development server.

## Production build

```bash
npm run build
npm run start
```

## Current prototype

- Fire, water-leak, power-outage, and evacuation guidance
- One-action-at-a-time emergency flow
- Prepared SMS check-ins
- Optional one-time location capture
- Local emergency-contact storage
- Installable PWA manifest and offline service worker

HomeSafe supports household preparedness and does not replace emergency
services or instructions from local authorities.
