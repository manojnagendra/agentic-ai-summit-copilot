# Agentic AI Summit CoPilot

Personal co-pilot for the **[Agentic AI Summit 2026](https://rdi.berkeley.edu/events/agentic-ai-summit-2026)** (Aug 1–2, UC Berkeley).

**Live app:** [https://agentic-ai-summit-copilot.vercel.app](https://agentic-ai-summit-copilot.vercel.app)

Helps attendees pick sessions across four stages, navigate campus venues, and turn talk notes into practical takeaways.

## Features

- **First-visit setup** — role, goals, pace, and interests before the agenda unlocks
- **Personalized agenda** — ranked Saturday & Sunday plan from your profile
- **Format filters** — All / Sessions / Workshops (plus stage filters on Agenda)
- **Venue guide** — Zellerbach, MLK Pauley, Lower Sproul, Alumni House, check-in
- **Google Maps links** — walking directions via public Maps URLs (no Maps API key)
- **Note → Insight** — structure session notes into claims, tools, and follow-ups
- **Ask CoPilot** — quick Q&A about the schedule (local planner; optional OpenAI)

## Stack

- Vite + React + TypeScript
- Vercel serverless API routes (`/api/plan`, `/api/chat`, `/api/insights`, `/api/health`)
- PWA-ready (installable on phone)

## Develop

```bash
npm install
npm run dev
```

App runs at [http://localhost:5174](http://localhost:5174). Local API routes are wired through Vite.

```bash
npm run build
npm run typecheck
```

## Deploy (Vercel)

```bash
npx vercel --prod
```

Optional environment variables:

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Richer Ask + Note insights |
| `OPENAI_MODEL` | Defaults to `gpt-4o-mini` |

Without an API key, planning and insights still work with the built-in local logic.

## Project layout

```
api/           Vercel serverless handlers
src/
  data/        Agenda + venue data
  lib/         Planner, maps URLs, storage, types
  styles/      App CSS
public/        Icons / PWA assets
```

## Notes

Agenda content is curated from the official Berkeley RDI summit schedule and may not include every micro-slot. Prefer the official site / QR “Full Agenda” for last-minute changes.

## License

Personal / summit attendee project — use and share freely with attribution appreciated.
