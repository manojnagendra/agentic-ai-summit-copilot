import type { VercelRequest, VercelResponse } from '@vercel/node'
import { SESSIONS } from '../src/data/agenda.js'
import { buildWeekendPlan } from '../src/lib/planner.js'
import { DEFAULT_PROFILE, type Profile } from '../src/lib/types.js'
import { messageFrom, sendJson } from './_shared.js'

function localAnswer(message: string, profile: Profile): string {
  const plans = buildWeekendPlan(profile)
  const lower = message.toLowerCase()

  if (lower.includes('sunday') || lower.includes('day 2')) {
    const items = plans[1].items
      .map((i) => SESSIONS.find((s) => s.id === i.sessionId))
      .filter(Boolean)
      .slice(0, 5)
    return [
      'Sunday focus for your profile:',
      ...items.map((s) => `• ${s!.start} ${s!.title} (${s!.stage})`),
      'Protect Databricks fireside; Omnigent Meta Harness is Atlas 2:15. Hop to Compass evals if Plenary repeats themes.',
    ].join('\n')
  }

  if (lower.includes('saturday') || lower.includes('today') || lower.includes('day 1')) {
    const items = plans[0].items
      .map((i) => SESSIONS.find((s) => s.id === i.sessionId))
      .filter(Boolean)
      .slice(0, 5)
    return [
      'Saturday focus for your profile:',
      ...items.map((s) => `• ${s!.start} ${s!.title} (${s!.stage})`),
      'Watch for Dan Roth (data) and the capital markets panel. Omnigent Meta Harness is Atlas Sunday at 2:15 — not on Nexus.',
    ].join('\n')
  }

  if (
    lower.includes('where') ||
    lower.includes('map') ||
    lower.includes('check-in') ||
    lower.includes('direction') ||
    lower.includes('mlk')
  ) {
    return [
      'Venue quick guide + Google Maps (no API — open links from the Venue tab):',
      '• Plenary → Zellerbach Auditorium',
      '• Nexus → Zellerbach Playhouse (same complex)',
      '• Atlas / Compass / GA check-in → MLK Student Union',
      '• Sponsors / catering → Lower Sproul Plaza',
      '• Livestream lounge → Alumni House',
      'Tip: use Venue → Quick campus hops, or Directions on any session card.',
    ].join('\n')
  }

  return [
    `You're set up as: ${profile.role}.`,
    `Interests: ${profile.interests.join(', ')}.`,
    'Ask me about Saturday, Sunday, where to go, or paste a conflict (e.g. “Plenary vs Omnigent”).',
    'Tip: use What now on the Today tab for live routing.',
  ].join('\n')
}

async function aiAnswer(message: string, profile: Profile): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null

  const agendaDigest = SESSIONS.map(
    (s) => `${s.day}|${s.start}-${s.end}|${s.stage}|${s.title}|${s.tags.join(',')}`,
  ).join('\n')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: `You are Agentic AI Summit CoPilot for Agentic AI Summit 2026 (Aug 1–2, UC Berkeley).
User: ${profile.role}. Interests: ${profile.interests.join(', ')}. Goals: ${profile.goals}.
Be concise, mobile-friendly, actionable. Prefer 5–8 short lines.
Agenda digest:\n${agendaDigest}`,
        },
        { role: 'user', content: message },
      ],
    }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return data.choices?.[0]?.message?.content ?? null
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }

  try {
    const body = request.body as { message?: string; profile?: Partial<Profile> }
    const message = body.message?.trim()
    if (!message) return sendJson(response, 400, { error: 'Message required.' })

    const profile: Profile = {
      ...DEFAULT_PROFILE,
      ...body.profile,
      interests: body.profile?.interests?.length
        ? body.profile.interests
        : DEFAULT_PROFILE.interests,
    }

    const ai = await aiAnswer(message, profile)
    return sendJson(response, 200, {
      reply: ai ?? localAnswer(message, profile),
      source: ai ? 'ai' : 'local',
    })
  } catch (error) {
    return sendJson(response, 500, { error: messageFrom(error) })
  }
}
