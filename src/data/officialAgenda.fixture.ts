/**
 * Anchors scraped from the official Program Schedule tabs at
 * https://rdi.berkeley.edu/events/agentic-ai-summit-2026
 *
 * Tab order on the site:
 * 0 Plenary Sat · 1 Plenary Sun · 2 Atlas Sat · 3 Atlas Sun ·
 * 4 Nexus Sat · 5 Compass Sat · 6 Compass Sun
 *
 * Update this fixture when re-validating against the live page.
 */
export type OfficialAnchor = {
  day: 'saturday' | 'sunday'
  stage: 'plenary' | 'atlas' | 'nexus' | 'compass'
  start: string
  titleIncludes: string
  speakerIncludes?: string
}

export const OFFICIAL_ANCHORS: OfficialAnchor[] = [
  // Plenary Saturday
  { day: 'saturday', stage: 'plenary', start: '09:15', titleIncludes: 'Opening Remarks', speakerIncludes: 'Rich Lyons' },
  { day: 'saturday', stage: 'plenary', start: '09:30', titleIncludes: 'Infrastructure', speakerIncludes: 'Peter DeSantis' },
  { day: 'saturday', stage: 'plenary', start: '17:00', titleIncludes: 'Andrew Ng', speakerIncludes: 'Alfred Lin' },

  // Atlas Saturday
  { day: 'saturday', stage: 'atlas', start: '10:00', titleIncludes: 'Foundational', speakerIncludes: 'Jianfeng Gao' },
  { day: 'saturday', stage: 'atlas', start: '15:30', titleIncludes: 'Replit', speakerIncludes: 'Brandon Middleton' },

  // Atlas Sunday — Omnigent lives here on the official tab
  { day: 'sunday', stage: 'atlas', start: '10:00', titleIncludes: 'Enterprise', speakerIncludes: 'Sunita Verma' },
  { day: 'sunday', stage: 'atlas', start: '13:00', titleIncludes: 'Evaluation', speakerIncludes: 'Anastasios' },
  { day: 'sunday', stage: 'atlas', start: '13:45', titleIncludes: 'Math', speakerIncludes: 'Sergei Gukov' },
  {
    day: 'sunday',
    stage: 'atlas',
    start: '14:15',
    titleIncludes: 'Omnigent',
    speakerIncludes: 'Aravind Segu',
  },

  // Nexus Saturday — Science / Coding / Secure (no Omnigent)
  { day: 'saturday', stage: 'nexus', start: '10:00', titleIncludes: 'Science', speakerIncludes: 'Markus' },
  { day: 'saturday', stage: 'nexus', start: '13:30', titleIncludes: 'Coding', speakerIncludes: 'Silas Alberti' },
  { day: 'saturday', stage: 'nexus', start: '15:30', titleIncludes: 'Secure', speakerIncludes: undefined },
  { day: 'saturday', stage: 'nexus', start: '16:45', titleIncludes: 'Agent Evaluation' },

  // Compass Saturday — AI Systems / Temporal / Open stack
  { day: 'saturday', stage: 'compass', start: '10:00', titleIncludes: 'AI Systems', speakerIncludes: 'Ion Stoica' },
  { day: 'saturday', stage: 'compass', start: '13:30', titleIncludes: 'Temporal' },
  { day: 'saturday', stage: 'compass', start: '15:20', titleIncludes: 'Open Agentic' },

  // Plenary Sunday
  { day: 'sunday', stage: 'plenary', start: '11:05', titleIncludes: 'Ghodsi', speakerIncludes: 'Konwinski' },
  { day: 'sunday', stage: 'plenary', start: '13:00', titleIncludes: 'Frontier', speakerIncludes: 'Ekin Dogus Cubuk' },

  // Compass Sunday
  { day: 'sunday', stage: 'compass', start: '10:00', titleIncludes: 'Safety', speakerIncludes: 'Chris Bregler' },
  { day: 'sunday', stage: 'compass', start: '14:30', titleIncludes: 'Evaluation', speakerIncludes: 'Yuan' },
]

/** Sessions that must NOT appear on a given stage/day. */
export const OFFICIAL_ABSENCES = [
  {
    day: 'saturday' as const,
    stage: 'nexus' as const,
    titleIncludes: 'Omnigent',
    reason: 'Omnigent is Atlas Sunday on the official agenda, not Nexus Saturday',
  },
  {
    day: 'saturday' as const,
    stage: 'compass' as const,
    titleIncludes: 'Omnigent',
    reason: 'Omnigent is Atlas Sunday on the official agenda, not Compass Saturday',
  },
]
