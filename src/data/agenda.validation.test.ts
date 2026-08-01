import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { SESSIONS } from './agenda.js'
import {
  FORBIDDEN_SPEAKERS,
  OFFICIAL_ABSENCES,
  OFFICIAL_ANCHORS,
  OFFICIAL_WORKSHOPS,
} from './officialAgenda.fixture.js'

function normalize(s: string): string {
  return s.toLowerCase()
}

function sessionHaystack(session: (typeof SESSIONS)[number]): string {
  return normalize(
    [
      session.title,
      session.summary,
      ...(session.talks ?? []).flatMap((t) => [t.speaker, t.title, t.role ?? '']),
    ].join(' '),
  )
}

function sessionMatchesAnchor(
  session: (typeof SESSIONS)[number],
  anchor: (typeof OFFICIAL_ANCHORS)[number],
): boolean {
  if (session.day !== anchor.day || session.stage !== anchor.stage || session.start !== anchor.start) {
    return false
  }
  const haystack = sessionHaystack(session)
  if (!haystack.includes(normalize(anchor.titleIncludes))) return false
  if (anchor.speakerIncludes && !haystack.includes(normalize(anchor.speakerIncludes))) return false
  return true
}

describe('agenda vs official RDI Program Schedule tabs', () => {
  it('places every official anchor on the matching day/stage/start', () => {
    const missing: string[] = []
    for (const anchor of OFFICIAL_ANCHORS) {
      const hit = SESSIONS.find((s) => sessionMatchesAnchor(s, anchor))
      if (!hit) {
        missing.push(
          `${anchor.day} ${anchor.stage} ${anchor.start} ~"${anchor.titleIncludes}"` +
            (anchor.speakerIncludes ? ` / ${anchor.speakerIncludes}` : ''),
        )
      }
    }
    assert.deepEqual(missing, [], `Missing official anchors:\n${missing.join('\n')}`)
  })

  it('covers every named official workshop with lead speaker', () => {
    const missing: string[] = []
    for (const ws of OFFICIAL_WORKSHOPS) {
      const hit = SESSIONS.find((s) => sessionMatchesAnchor(s, ws))
      if (!hit) {
        missing.push(`${ws.day} ${ws.stage} ${ws.start} ${ws.titleIncludes} / ${ws.speakerIncludes ?? ''}`)
      }
    }
    assert.deepEqual(missing, [], `Missing workshops:\n${missing.join('\n')}`)
  })

  it('does not put Omnigent on Nexus or Compass Saturday', () => {
    for (const rule of OFFICIAL_ABSENCES) {
      const bad = SESSIONS.filter((s) => {
        if (s.day !== rule.day || s.stage !== rule.stage) return false
        return sessionHaystack(s).includes(normalize(rule.titleIncludes))
      })
      assert.equal(bad.length, 0, `${rule.reason}; found: ${bad.map((s) => s.id).join(', ')}`)
    }
  })

  it('keeps Omnigent on Atlas Sunday at 14:15 with Aravind Segu', () => {
    const omni = SESSIONS.find((s) => normalize(s.title).includes('omnigent'))
    assert.ok(omni, 'Omnigent session missing from agenda')
    assert.equal(omni!.day, 'sunday')
    assert.equal(omni!.stage, 'atlas')
    assert.equal(omni!.start, '14:15')
    assert.equal(omni!.kind, 'workshop')
    const speakers = (omni!.talks ?? []).map((t) => t.speaker).join(' ')
    assert.match(speakers, /Aravind Segu/i)
  })

  it('excludes speakers removed from the official schedule', () => {
    const blob = SESSIONS.map(sessionHaystack).join(' ')
    for (const name of FORBIDDEN_SPEAKERS) {
      assert.equal(blob.includes(normalize(name)), false, `Unexpected speaker still in agenda: ${name}`)
    }
  })

  it('has unique session ids', () => {
    const ids = SESSIONS.map((s) => s.id)
    assert.equal(ids.length, new Set(ids).size)
  })

  it('uses 24h HH:MM start/end strings', () => {
    for (const s of SESSIONS) {
      assert.match(s.start, /^\d{2}:\d{2}$/, s.id)
      assert.match(s.end, /^\d{2}:\d{2}$/, s.id)
      assert.ok(s.start < s.end || s.end === '00:00', `${s.id} start>=end`)
    }
  })
})
