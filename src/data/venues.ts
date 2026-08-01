export type VenueId =
  | 'zellerbach-auditorium'
  | 'zellerbach-playhouse'
  | 'mlk-pauley-west'
  | 'mlk-pauley-east'
  | 'alumni-house'
  | 'lower-sproul'
  | 'check-in-general'
  | 'check-in-vip'

export type StageId = 'plenary' | 'nexus' | 'atlas' | 'compass' | 'campus'

export const STAGES: Record<
  StageId,
  { label: string; short: string; color: string; venueId: VenueId }
> = {
  plenary: {
    label: 'Plenary Stage',
    short: 'Plenary',
    color: '#5b2d8e',
    venueId: 'zellerbach-auditorium',
  },
  nexus: {
    label: 'Nexus Stage',
    short: 'Nexus',
    color: '#c9a227',
    venueId: 'zellerbach-playhouse',
  },
  atlas: {
    label: 'Atlas Stage',
    short: 'Atlas',
    color: '#2f6fed',
    venueId: 'mlk-pauley-west',
  },
  compass: {
    label: 'Compass Stage',
    short: 'Compass',
    color: '#0d8a6a',
    venueId: 'mlk-pauley-east',
  },
  campus: {
    label: 'Campus',
    short: 'Campus',
    color: '#6b5b4d',
    venueId: 'lower-sproul',
  },
}

export const VENUES: Record<
  VenueId,
  {
    name: string
    blurb: string
    walkFromSproul: string
    tips: string[]
    /** Place query for Google Maps URL links (no API key). */
    mapsQuery: string
  }
> = {
  'zellerbach-auditorium': {
    name: 'Zellerbach Auditorium',
    blurb: 'Plenary Stage — main keynotes and headline panels.',
    walkFromSproul: 'On Lower Sproul / Zellerbach Hall complex',
    tips: ['Arrive early for popular plenary blocks', 'Lobby has sponsor exhibits'],
    mapsQuery: 'Zellerbach Hall, UC Berkeley, Berkeley, CA',
  },
  'zellerbach-playhouse': {
    name: 'Zellerbach Playhouse',
    blurb: 'Nexus Stage — technical deep dives and workshops.',
    walkFromSproul: 'Same Zellerbach complex as Plenary (~2 min)',
    tips: ['Poster session nearby', 'Easy hop from Plenary between blocks'],
    mapsQuery: 'Zellerbach Playhouse, UC Berkeley, Berkeley, CA',
  },
  'mlk-pauley-west': {
    name: 'MLK Jr. Building — Pauley West (2/F)',
    blurb: 'Atlas Stage — frameworks, enterprise, systems tracks.',
    walkFromSproul: '~3–5 min across Lower Sproul Plaza',
    tips: ['Check-in at MLK entrance', 'Catering nearby on plaza'],
    mapsQuery: 'Martin Luther King Jr. Student Union, UC Berkeley, Berkeley, CA',
  },
  'mlk-pauley-east': {
    name: 'MLK Jr. Building — Pauley East (2/F)',
    blurb: 'Compass Stage — safety, evals, applied industry tracks.',
    walkFromSproul: '~3–5 min; same building as Atlas',
    tips: ['Atlas ↔ Compass is a quick indoor hop', 'Good overflow if Plenary is full'],
    mapsQuery: 'Martin Luther King Jr. Student Union, UC Berkeley, Berkeley, CA',
  },
  'alumni-house': {
    name: 'Alumni House',
    blurb: 'Livestream (Plenary) viewing and networking lounge.',
    walkFromSproul: 'North of plaza / Spieker area (~5–7 min)',
    tips: ['Quieter for calls and note capture', 'Livestream of Plenary'],
    mapsQuery: 'Alumni House, UC Berkeley, Berkeley, CA',
  },
  'lower-sproul': {
    name: 'Lower Sproul Plaza',
    blurb: 'Outdoor hub — sponsor exhibits, catering, and stage hops.',
    walkFromSproul: 'You are here',
    tips: ['Green dots = sponsor exhibits', 'Use plaza time between sessions'],
    mapsQuery: 'Lower Sproul Plaza, UC Berkeley, Berkeley, CA',
  },
  'check-in-general': {
    name: 'General Check-in',
    blurb: 'GA, Atlas/Compass speakers, Silver/Bronze/VC sponsors.',
    walkFromSproul: 'MLK Jr. Building entrance (purple check)',
    tips: ['Have QR / badge email ready', 'Then grab a coffee before first session'],
    mapsQuery: 'Martin Luther King Jr. Student Union, UC Berkeley, Berkeley, CA',
  },
  'check-in-vip': {
    name: 'Priority Check-in',
    blurb: 'Plenary/Nexus speakers & Platinum/Gold sponsors.',
    walkFromSproul: 'Marked with yellow check on venue map',
    tips: ['Separate line — follow staff signs'],
    mapsQuery: 'Zellerbach Hall, UC Berkeley, Berkeley, CA',
  },
}

export const MAP_LEGEND = [
  { id: 'check-ga', label: 'Check-in — GA / Atlas-Compass speakers / Silver-Bronze-VC', tone: 'purple' },
  { id: 'check-vip', label: 'Check-in — Plenary-Nexus speakers / Platinum-Gold', tone: 'gold' },
  { id: 'sponsors', label: 'Sponsor exhibits (Lower Sproul + lobbies)', tone: 'green' },
  { id: 'posters', label: 'Poster sessions (near Nexus / receptions)', tone: 'gold' },
  { id: 'catering', label: 'Catering', tone: 'rose' },
  { id: 'alumni', label: 'Alumni House livestream & lounge', tone: 'brown' },
] as const
