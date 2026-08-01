/**
 * Anchors from the official Program Schedule tabs at
 * https://rdi.berkeley.edu/events/agentic-ai-summit-2026
 *
 * Tab order on the site:
 * 0 Plenary Sat · 1 Plenary Sun · 2 Atlas Sat · 3 Atlas Sun ·
 * 4 Nexus Sat · 5 Compass Sat · 6 Compass Sun
 */
export type OfficialAnchor = {
  day: 'saturday' | 'sunday'
  stage: 'plenary' | 'atlas' | 'nexus' | 'compass'
  /** Session start in app (block start); workshops may be nested later in the block. */
  start: string
  titleIncludes: string
  speakerIncludes?: string
}

/** Every named workshop on the official agenda. */
export const OFFICIAL_WORKSHOPS: OfficialAnchor[] = [
  {
    day: 'saturday',
    stage: 'atlas',
    start: '10:00',
    titleIncludes: 'Daytona',
    speakerIncludes: 'Lovre Pesut',
  },
  {
    day: 'saturday',
    stage: 'atlas',
    start: '13:30',
    titleIncludes: 'Lambda',
    speakerIncludes: 'Devina Jain',
  },
  {
    day: 'saturday',
    stage: 'atlas',
    start: '15:30',
    titleIncludes: 'Replit',
    speakerIncludes: 'Brandon Middleton',
  },
  {
    day: 'sunday',
    stage: 'atlas',
    start: '10:00',
    titleIncludes: 'Ema',
    speakerIncludes: 'Anushka Pathak',
  },
  {
    day: 'sunday',
    stage: 'atlas',
    start: '14:15',
    titleIncludes: 'Omnigent',
    speakerIncludes: 'Aravind Segu',
  },
  {
    day: 'saturday',
    stage: 'nexus',
    start: '10:00',
    titleIncludes: 'AMD',
    speakerIncludes: 'Mahdi Ghodsi',
  },
  {
    day: 'saturday',
    stage: 'nexus',
    start: '13:30',
    titleIncludes: 'Fetcherr',
    speakerIncludes: 'Uri Yerushalmi',
  },
  {
    day: 'saturday',
    stage: 'nexus',
    start: '16:45',
    titleIncludes: 'Agent Evaluation',
  },
  {
    day: 'saturday',
    stage: 'compass',
    start: '10:00',
    titleIncludes: 'Wallet',
    speakerIncludes: 'Harshal Bhangale',
  },
  {
    day: 'saturday',
    stage: 'compass',
    start: '13:30',
    titleIncludes: 'Temporal',
    speakerIncludes: 'Nikolay Advolodkin',
  },
  {
    day: 'saturday',
    stage: 'compass',
    start: '15:20',
    titleIncludes: 'Open Agentic',
    speakerIncludes: 'Matt White',
  },
  {
    day: 'sunday',
    stage: 'compass',
    start: '10:00',
    titleIncludes: 'SUSE',
    speakerIncludes: 'Jeff Price',
  },
]

export const OFFICIAL_ANCHORS: OfficialAnchor[] = [
  // Plenary Saturday
  { day: 'saturday', stage: 'plenary', start: '09:15', titleIncludes: 'Opening Remarks', speakerIncludes: 'Rich Lyons' },
  { day: 'saturday', stage: 'plenary', start: '09:30', titleIncludes: 'Infrastructure', speakerIncludes: 'Peter DeSantis' },
  { day: 'saturday', stage: 'plenary', start: '10:45', titleIncludes: 'Foom', speakerIncludes: 'Jasjeet Sekhon' },
  { day: 'saturday', stage: 'plenary', start: '11:10', titleIncludes: 'Software Engineering', speakerIncludes: 'Peter Steinberger' },
  { day: 'saturday', stage: 'plenary', start: '13:30', titleIncludes: 'Foundational', speakerIncludes: 'Dawn Song' },
  { day: 'saturday', stage: 'plenary', start: '15:10', titleIncludes: 'Robotics', speakerIncludes: 'Sergey Levine' },
  { day: 'saturday', stage: 'plenary', start: '16:30', titleIncludes: 'Capital Markets', speakerIncludes: 'Jeff Wecker' },
  { day: 'saturday', stage: 'plenary', start: '17:00', titleIncludes: 'Andrew Ng', speakerIncludes: 'Alfred Lin' },

  // Atlas Saturday
  { day: 'saturday', stage: 'atlas', start: '10:00', titleIncludes: 'Foundational', speakerIncludes: 'Jianfeng Gao' },
  { day: 'saturday', stage: 'atlas', start: '13:30', titleIncludes: 'Robotics', speakerIncludes: 'Peter Stone' },
  { day: 'saturday', stage: 'atlas', start: '16:30', titleIncludes: 'Frameworks', speakerIncludes: 'Philip Rathle' },

  // Atlas Sunday
  { day: 'sunday', stage: 'atlas', start: '10:00', titleIncludes: 'Enterprise', speakerIncludes: 'Sunita Verma' },
  { day: 'sunday', stage: 'atlas', start: '13:00', titleIncludes: 'Evaluation', speakerIncludes: 'Anastasios' },
  { day: 'sunday', stage: 'atlas', start: '13:45', titleIncludes: 'Math', speakerIncludes: 'Sergei Gukov' },

  // Nexus Saturday
  { day: 'saturday', stage: 'nexus', start: '10:00', titleIncludes: 'Science', speakerIncludes: 'Markus' },
  { day: 'saturday', stage: 'nexus', start: '13:30', titleIncludes: 'Coding', speakerIncludes: 'Silas Alberti' },
  { day: 'saturday', stage: 'nexus', start: '15:05', titleIncludes: 'Finance', speakerIncludes: 'Krishnaram' },
  { day: 'saturday', stage: 'nexus', start: '15:30', titleIncludes: 'Secure', speakerIncludes: 'Jon-Rav' },

  // Compass Saturday
  { day: 'saturday', stage: 'compass', start: '10:00', titleIncludes: 'AI Systems', speakerIncludes: 'Ion Stoica' },

  // Plenary Sunday
  { day: 'sunday', stage: 'plenary', start: '09:30', titleIncludes: 'Opening', speakerIncludes: 'Jennifer Chayes' },
  { day: 'sunday', stage: 'plenary', start: '09:40', titleIncludes: 'Enterprise', speakerIncludes: 'Rao Surapaneni' },
  { day: 'sunday', stage: 'plenary', start: '11:05', titleIncludes: 'Ghodsi', speakerIncludes: 'Konwinski' },
  { day: 'sunday', stage: 'plenary', start: '13:00', titleIncludes: 'Frontier', speakerIncludes: 'Ekin Dogus Cubuk' },
  { day: 'sunday', stage: 'plenary', start: '14:15', titleIncludes: 'Developer Platforms', speakerIncludes: 'Matt White' },
  { day: 'sunday', stage: 'plenary', start: '14:50', titleIncludes: 'Finance', speakerIncludes: 'Milind Naphade' },
  { day: 'sunday', stage: 'plenary', start: '15:50', titleIncludes: 'Startup' },

  // Compass Sunday
  { day: 'sunday', stage: 'compass', start: '10:00', titleIncludes: 'Safety', speakerIncludes: 'Chris Bregler' },
  { day: 'sunday', stage: 'compass', start: '13:00', titleIncludes: 'AI Systems', speakerIncludes: 'Jun Yang' },
  { day: 'sunday', stage: 'compass', start: '13:45', titleIncludes: 'Enterprise', speakerIncludes: 'Eno Reyes' },
  { day: 'sunday', stage: 'compass', start: '14:30', titleIncludes: 'Evaluation', speakerIncludes: 'Debarshi Raha' },

  ...OFFICIAL_WORKSHOPS,
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
  {
    day: 'sunday' as const,
    stage: 'plenary' as const,
    titleIncludes: 'Andi Peng',
    reason: 'Andi Peng is not on the current official Frontier Research speaker list',
  },
]

/** Speakers that must not appear anywhere in the curated agenda. */
export const FORBIDDEN_SPEAKERS = ['Andi Peng']
