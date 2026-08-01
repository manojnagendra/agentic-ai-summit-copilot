import { SESSIONS, sessionById } from '../data/agenda.js'
import { STAGES } from '../data/venues.js'
import { hopNote, overlaps } from './time.js'
import type { DayId, DayPlan, PlanItem, Profile, Session } from './types.js'

function scoreSession(session: Session, profile: Profile): { score: number; reason: string } {
  let score = 0
  const hits: string[] = []

  for (const tag of session.tags) {
    if (profile.interests.includes(tag)) {
      score += 3
      hits.push(tag)
    }
  }
  for (const tag of session.mustSeeFor ?? []) {
    if (profile.interests.includes(tag)) {
      score += 4
      hits.push(`must:${tag}`)
    }
  }

  if (session.stage === 'plenary') score += 1.5
  if (session.kind === 'fireside' || session.kind === 'keynote') score += 1
  if (session.kind === 'workshop' && profile.energy === 'max') score += 1.5
  if (session.kind === 'break' || session.kind === 'reception') {
    score = profile.energy === 'light' ? 4 : 2
    hits.push('recovery')
  }

  const goal = profile.goals.toLowerCase()
  if (goal) {
    for (const token of [
      'databricks',
      'snowflake',
      'eval',
      'finance',
      'enterprise',
      'data',
      'governance',
      'bi',
      'pipeline',
    ]) {
      if (goal.includes(token) && (session.summary + session.title).toLowerCase().includes(token)) {
        score += 2
        hits.push(token)
      }
    }
  }

  const reason =
    hits.length > 0
      ? `Matches your focus: ${[...new Set(hits)].slice(0, 4).join(', ')}`
      : 'Useful breadth / headline context'

  return { score, reason }
}

function capacity(energy: Profile['energy']): number {
  if (energy === 'max') return 10
  if (energy === 'light') return 5
  return 7
}

export function buildDayPlan(day: DayId, profile: Profile): DayPlan {
  const daySessions = SESSIONS.filter((s) => s.day === day)
  const ranked = daySessions
    .map((s) => {
      const { score, reason } = scoreSession(s, profile)
      return { session: s, score, reason }
    })
    .sort((a, b) => b.score - a.score || a.session.start.localeCompare(b.session.start))

  const picked: typeof ranked = []
  const limit = capacity(profile.energy)

  for (const candidate of ranked) {
    if (picked.length >= limit) break
    const clash = picked.some((p) =>
      overlaps(p.session.start, p.session.end, candidate.session.start, candidate.session.end),
    )
    if (clash) continue
    // Always keep lunch/reception lightly if not conflicting hard
    picked.push(candidate)
  }

  picked.sort((a, b) => a.session.start.localeCompare(b.session.start))

  const items: PlanItem[] = picked.map((p, i) => {
    const prev = picked[i - 1]
    return {
      sessionId: p.session.id,
      score: Math.round(p.score * 10) / 10,
      reason: p.reason,
      hopNote: prev ? hopNote(prev.session.stage, p.session.stage) : undefined,
    }
  })

  const pickedIds = new Set(items.map((i) => i.sessionId))
  const skippedHighlights = ranked
    .filter((r) => !pickedIds.has(r.session.id) && r.score >= 6)
    .slice(0, 6)
    .map((r) => ({
      sessionId: r.session.id,
      reason: `Conflict or capacity — still high signal (${r.reason})`,
    }))

  return { day, items, skippedHighlights }
}

export function buildWeekendPlan(profile: Profile): DayPlan[] {
  return [buildDayPlan('saturday', profile), buildDayPlan('sunday', profile)]
}

export function whatNow(
  day: DayId,
  minutes: number,
  profile: Profile,
): { current?: Session; next?: Session; tip: string } {
  const plan = buildDayPlan(day, profile)
  const planned = plan.items
    .map((i) => sessionById(i.sessionId))
    .filter((s): s is Session => Boolean(s))

  const current = planned.find((s) => {
    const start = s.start.split(':').map(Number)
    const end = s.end.split(':').map(Number)
    const sm = start[0] * 60 + start[1]
    const em = end[0] * 60 + end[1]
    return minutes >= sm && minutes < em
  })

  const next = planned.find((s) => {
    const start = s.start.split(':').map(Number)
    return start[0] * 60 + start[1] > minutes
  })

  if (current) {
    const stage = STAGES[current.stage]
    return {
      current,
      next,
      tip: `You're in ${current.title} @ ${stage.label}. ${
        next ? `Next: ${next.title} — leave with hop time.` : 'Then capture notes before the break.'
      }`,
    }
  }

  if (next) {
    const stage = STAGES[next.stage]
    return {
      next,
      tip: `Head to ${stage.label} (${stage.short}) for ${next.title} starting soon.`,
    }
  }

  return {
    tip: 'No more planned blocks — hit sponsors on Lower Sproul, Alumni House lounge, or dump notes.',
  }
}

export function localInsights(note: string, profile: Profile): {
  summary: string
  keyClaims: string[]
  toolsMentioned: string[]
  applyToWork: string[]
  followUps: string[]
  peopleToResearch: string[]
  source: 'local'
} {
  const text = note.trim()
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const toolPatterns =
    /\b(Databricks|Snowflake|dbt|Spark|Airflow|Kafka|Neo4j|vLLM|LangGraph|Temporal|Retool|Scale AI|OpenAI|Anthropic|Redis|Postman|Hex|Omnigent|Replit|Kubernetes|AWS|Azure|GCP)\b/gi
  const tools = [...new Set([...(text.match(toolPatterns) ?? [])])]

  const people = [
    ...new Set(
      (text.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})\b/g) ?? []).filter(
        (n) => !['Lower Sproul', 'Agentic AI', 'United States'].includes(n),
      ),
    ),
  ].slice(0, 6)

  const applyToWork = [
    `Map one claim from these notes to your ${profile.role} workflow this week.`,
    profile.interests.includes('evals')
      ? 'Define a tiny eval: input → agent step → pass/fail for a BI/DE task you already do.'
      : 'Write a 5-bullet share-out for your team: what changed, what to try, what to ignore.',
    profile.interests.includes('data-platforms')
      ? 'Ask: does this need a new table/metric, a new agent tool, or just better orchestration?'
      : 'Identify one production constraint (latency, cost, governance) this idea must respect.',
  ]

  return {
    summary: sentences[0] || 'Notes captured — add more detail after the next session.',
    keyClaims: sentences.slice(0, 4),
    toolsMentioned: tools,
    applyToWork,
    followUps: [
      'What evidence did the speaker give (demo, benchmark, customer)?',
      'What would break if we tried this on messy internal data?',
      'Who at the summit can answer the open question in 10 minutes?',
    ],
    peopleToResearch: people,
    source: 'local',
  }
}
