import type { VercelRequest, VercelResponse } from '@vercel/node'
import { localInsights } from '../src/lib/planner.js'
import { DEFAULT_PROFILE, type InsightResult, type Profile } from '../src/lib/types.js'
import { messageFrom, sendJson } from './_shared.js'

async function aiInsights(note: string, profile: Profile): Promise<InsightResult | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null

  const system = `You are a summit note-taking agent for Agentic AI Summit 2026 (UC Berkeley).
The user is a ${profile.role}. Interests: ${profile.interests.join(', ')}.
Goals: ${profile.goals}
Return STRICT JSON with keys:
summary (string), keyClaims (string[]), toolsMentioned (string[]), applyToWork (string[] — concrete for analytics/BI/DE),
followUps (string[]), peopleToResearch (string[]).
Be concise and practical. No markdown.`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: note },
      ],
    }),
  })

  if (!res.ok) return null
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const raw = data.choices?.[0]?.message?.content
  if (!raw) return null
  const parsed = JSON.parse(raw) as Omit<InsightResult, 'source'>
  return { ...parsed, source: 'ai' }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }

  try {
    const body = request.body as { note?: string; profile?: Partial<Profile> }
    const note = body.note?.trim()
    if (!note || note.length < 8) {
      return sendJson(response, 400, { error: 'Paste at least a short note from the session.' })
    }

    const profile: Profile = {
      ...DEFAULT_PROFILE,
      ...body.profile,
      interests: body.profile?.interests?.length
        ? body.profile.interests
        : DEFAULT_PROFILE.interests,
    }

    const ai = await aiInsights(note, profile)
    if (ai) return sendJson(response, 200, { insight: ai })

    return sendJson(response, 200, { insight: localInsights(note, profile) })
  } catch (error) {
    return sendJson(response, 500, { error: messageFrom(error) })
  }
}
