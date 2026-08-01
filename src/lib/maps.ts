import { STAGES, VENUES, type StageId, type VenueId } from '../data/venues'

/** Open Google Maps via public URL schemes — no Maps API key required. */
export function mapsPlaceUrl(query: string): string {
  const params = new URLSearchParams({ api: '1', query })
  return `https://www.google.com/maps/search/?${params.toString()}`
}

export function mapsDirectionsUrl(
  destination: string,
  options?: { origin?: string; mode?: 'walking' | 'driving' | 'transit' },
): string {
  const params = new URLSearchParams({
    api: '1',
    destination,
    travelmode: options?.mode ?? 'walking',
  })
  if (options?.origin) params.set('origin', options.origin)
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export function venueQuery(venueId: VenueId): string {
  return VENUES[venueId].mapsQuery
}

export function stageDirectionsUrl(stage: StageId): string {
  return mapsDirectionsUrl(venueQuery(STAGES[stage].venueId), { mode: 'walking' })
}

export function hopDirectionsUrl(fromStage: StageId, toStage: StageId): string {
  const from = venueQuery(STAGES[fromStage].venueId)
  const to = venueQuery(STAGES[toStage].venueId)
  if (from === to) return mapsPlaceUrl(to)
  return mapsDirectionsUrl(to, { origin: from, mode: 'walking' })
}

export const CAMPUS_HOPS: {
  id: string
  label: string
  from: VenueId
  to: VenueId
  blurb: string
}[] = [
  {
    id: 'sproul-zell',
    label: 'Sproul → Zellerbach',
    from: 'lower-sproul',
    to: 'zellerbach-auditorium',
    blurb: 'Plenary / Nexus (~2 min walk)',
  },
  {
    id: 'sproul-mlk',
    label: 'Sproul → MLK Student Union',
    from: 'lower-sproul',
    to: 'mlk-pauley-west',
    blurb: 'Atlas / Compass / GA check-in (~3–5 min)',
  },
  {
    id: 'zell-mlk',
    label: 'Zellerbach → MLK',
    from: 'zellerbach-auditorium',
    to: 'mlk-pauley-west',
    blurb: 'Cross Lower Sproul between stages (~5 min)',
  },
  {
    id: 'sproul-alumni',
    label: 'Sproul → Alumni House',
    from: 'lower-sproul',
    to: 'alumni-house',
    blurb: 'Livestream lounge (~5–7 min)',
  },
  {
    id: 'arrive-checkin',
    label: 'My location → GA check-in',
    from: 'check-in-general',
    to: 'check-in-general',
    blurb: 'Opens walking directions from where you are',
  },
]
