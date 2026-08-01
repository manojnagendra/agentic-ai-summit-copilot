# Agentic AI Summit CoPilot

Personal co-pilot for **Agentic AI Summit 2026** (Aug 1–2, UC Berkeley).

- Ranked Saturday + Sunday agenda from your interests
- Venue / check-in guide (Zellerbach, MLK, Sproul, Alumni House)
- Note → insight extractor for analytics / BI / DE takeaways
- Ask Copilot chat (local planner; OpenAI when `OPENAI_API_KEY` is set)

## Develop

```bash
npm install
npm run dev
```

## Deploy (Vercel)

```bash
npx vercel --prod
```

Optional: set `OPENAI_API_KEY` in the Vercel project environment.
