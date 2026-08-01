import type { VercelRequest, VercelResponse } from '@vercel/node'
import { buildWeekendPlan } from '../src/lib/planner.js'
import { DEFAULT_PROFILE, type Profile } from '../src/lib/types.js'
import { messageFrom, sendJson } from './_shared.js'

function normalizeProfile(input: Partial<Profile> | undefined): Profile {
  return {
    name: input?.name?.trim() || DEFAULT_PROFILE.name,
    role: input?.role?.trim() || 'Summit attendee',
    interests: input?.interests?.length
      ? input.interests
      : ['enterprise', 'foundations', 'networking'],
    goals: input?.goals?.trim() || DEFAULT_PROFILE.goals,
    energy: input?.energy || DEFAULT_PROFILE.energy,
    onboarded: true,
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }

  try {
    const body = request.body as { profile?: Partial<Profile> }
    const profile = normalizeProfile(body.profile)
    const plans = buildWeekendPlan(profile)
    return sendJson(response, 200, { profile, plans })
  } catch (error) {
    return sendJson(response, 500, { error: messageFrom(error) })
  }
}
