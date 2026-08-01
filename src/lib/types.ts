import type { StageId } from '../data/venues.js'

export type DayId = 'saturday' | 'sunday'

export type InterestTag =
  | 'enterprise'
  | 'data-platforms'
  | 'evals'
  | 'infrastructure'
  | 'finance'
  | 'safety'
  | 'coding-agents'
  | 'foundations'
  | 'robotics'
  | 'science'
  | 'developer-platforms'
  | 'networking'
  | 'career'

export type Talk = {
  time?: string
  speaker: string
  role?: string
  title: string
}

export type Session = {
  id: string
  day: DayId
  stage: StageId
  start: string
  end: string
  title: string
  kind: 'keynote' | 'talks' | 'panel' | 'fireside' | 'workshop' | 'break' | 'reception' | 'break'
  tags: InterestTag[]
  summary: string
  talks?: Talk[]
  mustSeeFor?: InterestTag[]
}

export type Profile = {
  name: string
  role: string
  interests: InterestTag[]
  goals: string
  energy: 'max' | 'balanced' | 'light'
  onboarded?: boolean
}

export type PlanItem = {
  sessionId: string
  score: number
  reason: string
  hopNote?: string
}

export type DayPlan = {
  day: DayId
  items: PlanItem[]
  skippedHighlights: { sessionId: string; reason: string }[]
}

export type InsightResult = {
  summary: string
  keyClaims: string[]
  toolsMentioned: string[]
  applyToWork: string[]
  followUps: string[]
  peopleToResearch: string[]
  source: 'ai' | 'local'
}

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export const INTEREST_OPTIONS: { id: InterestTag; label: string }[] = [
  { id: 'enterprise', label: 'Enterprise AI' },
  { id: 'data-platforms', label: 'Data / BI platforms' },
  { id: 'evals', label: 'Evals & reliability' },
  { id: 'infrastructure', label: 'Infra & platforms' },
  { id: 'finance', label: 'Finance / markets' },
  { id: 'safety', label: 'Safety & security' },
  { id: 'coding-agents', label: 'Coding agents' },
  { id: 'foundations', label: 'Foundational models' },
  { id: 'developer-platforms', label: 'Dev platforms' },
  { id: 'robotics', label: 'Robotics / world models' },
  { id: 'science', label: 'AI for science' },
  { id: 'networking', label: 'Networking / startups' },
  { id: 'career', label: 'Career / strategy' },
]

export const DEFAULT_PROFILE: Profile = {
  name: '',
  role: '',
  interests: [],
  goals: '',
  energy: 'balanced',
  onboarded: false,
}

export const PROFILE_PLACEHOLDERS = {
  role: 'e.g. Data engineer, PM, founder, researcher…',
  goals: 'e.g. Enterprise agents, evals, networking, tools to ship at work…',
} as const
