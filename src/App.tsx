import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { SESSIONS, sessionById, sessionsForDay } from './data/agenda'
import { MAP_LEGEND, STAGES, VENUES, type VenueId } from './data/venues'
import {
  CAMPUS_HOPS,
  hopDirectionsUrl,
  mapsDirectionsUrl,
  mapsPlaceUrl,
  stageDirectionsUrl,
  venueQuery,
} from './lib/maps'
import { buildDayPlan, whatNow } from './lib/planner'
import {
  isProfileComplete,
  loadNotes,
  loadProfile,
  loadSavedIds,
  saveNotes,
  saveProfile,
  saveSavedIds,
  type NoteEntry,
} from './lib/storage'
import { dayLabel, formatRange, nowMinutesPT, todayDayId } from './lib/time'
import {
  INTEREST_OPTIONS,
  PROFILE_PLACEHOLDERS,
  type ChatMessage,
  type DayId,
  type InsightResult,
  type InterestTag,
  type Profile,
  type Session,
} from './lib/types'

type Tab = 'today' | 'agenda' | 'venue' | 'notes' | 'ask'

const NAV_ITEMS = [
  ['today', '◈', 'Today'],
  ['agenda', '☰', 'Agenda'],
  ['venue', '⌖', 'Venue'],
  ['notes', '✎', 'Notes'],
  ['ask', '✦', 'Ask'],
] as const

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 512 512" aria-hidden>
      <rect width="512" height="512" rx="112" fill="#0f2a1f" />
      <circle cx="256" cy="256" r="150" stroke="#d4a84b" strokeWidth="28" fill="none" />
      <path d="M256 140 L310 300 H202 Z" fill="#e8f2ea" />
      <circle cx="256" cy="256" r="22" fill="#d4a84b" />
    </svg>
  )
}

function StageChip({ stage }: { stage: Session['stage'] }) {
  return <span className={`chip stage-${stage}`}>{STAGES[stage].short}</span>
}

function MapsLink({
  href,
  children,
  className = 'btn map-btn',
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

function SessionBlock({
  session,
  reason,
  hop,
  prevStage,
  saved,
  onToggleSave,
}: {
  session: Session
  reason?: string
  hop?: string
  prevStage?: Session['stage']
  saved?: boolean
  onToggleSave?: () => void
}) {
  const venue = VENUES[STAGES[session.stage].venueId]
  const directions =
    prevStage && prevStage !== session.stage
      ? hopDirectionsUrl(prevStage, session.stage)
      : stageDirectionsUrl(session.stage)

  return (
    <article className="session-card">
      <header>
        <div className="row">
          <StageChip stage={session.stage} />
          <span className="chip">{formatRange(session.start, session.end)}</span>
          <span className="chip">{session.kind}</span>
        </div>
        {onToggleSave ? (
          <button className="star" type="button" aria-label="Save session" onClick={onToggleSave}>
            {saved ? '★' : '☆'}
          </button>
        ) : null}
      </header>
      <h4>{session.title}</h4>
      <p className="location-line">
        <span aria-hidden>⌖</span> {venue.name}
      </p>
      <p className="muted">{session.summary}</p>
      {session.talks?.length ? (
        <ul className="insight-list">
          {session.talks.slice(0, 4).map((t) => (
            <li key={`${t.speaker}-${t.title}`}>
              <strong>{t.speaker}</strong>
              {t.role ? ` · ${t.role}` : ''} — {t.title}
            </li>
          ))}
        </ul>
      ) : null}
      {reason ? <p className="reason">{reason}</p> : null}
      {hop ? <div className="hop">{hop}</div> : null}
      <div className="row session-actions">
        <MapsLink href={directions} className="btn map-btn secondary">
          {prevStage && prevStage !== session.stage ? 'Google Maps hop' : 'Directions in Maps'}
        </MapsLink>
        <MapsLink
          href={mapsPlaceUrl(venueQuery(STAGES[session.stage].venueId))}
          className="btn map-btn ghost"
        >
          Open in Maps
        </MapsLink>
      </div>
    </article>
  )
}

function VenueActions({ venueId }: { venueId: VenueId }) {
  const query = venueQuery(venueId)
  return (
    <div className="row session-actions">
      <MapsLink href={mapsDirectionsUrl(query, { mode: 'walking' })} className="btn map-btn">
        Walking directions
      </MapsLink>
      <MapsLink href={mapsPlaceUrl(query)} className="btn map-btn secondary">
        Open in Google Maps
      </MapsLink>
    </div>
  )
}

function ProfileModal({
  profile,
  required,
  onSave,
  onClose,
}: {
  profile: Profile
  required?: boolean
  onSave: (p: Profile) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(profile)
  const [formError, setFormError] = useState<string | null>(null)

  function toggleInterest(tag: InterestTag) {
    setFormError(null)
    setDraft((d) => {
      const has = d.interests.includes(tag)
      return {
        ...d,
        interests: has ? d.interests.filter((t) => t !== tag) : [...d.interests, tag],
      }
    })
  }

  function submit() {
    if (draft.interests.length === 0) {
      setFormError('Pick at least one interest so we can rank your agenda.')
      return
    }
    onSave({ ...draft, onboarded: true })
    onClose()
  }

  return (
    <div
      className={`modal-backdrop ${required ? 'onboarding-backdrop' : ''}`}
      role="dialog"
      aria-modal
      aria-labelledby="profile-title"
    >
      <div className={`modal ${required ? 'onboarding-modal' : ''}`}>
        {required ? (
          <div className="onboarding-brand">
            <BrandMark />
            <div>
              <p className="eyebrow">Agentic AI Summit 2026</p>
              <h3 id="profile-title">Set up your CoPilot</h3>
            </div>
          </div>
        ) : (
          <h3 id="profile-title" style={{ fontFamily: 'var(--font-display)', marginTop: 0 }}>
            Edit your profile
          </h3>
        )}
        <p className="muted">
          {required
            ? 'Tell us what you care about — we’ll build a personalized Saturday & Sunday agenda.'
            : 'Used to rank both days and personalize insights.'}
        </p>
        <div className="field">
          <label htmlFor="name">Name (optional)</label>
          <input
            id="name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="First name"
            autoFocus={required}
          />
        </div>
        <div className="field">
          <label htmlFor="role">Role</label>
          <input
            id="role"
            value={draft.role}
            onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            placeholder={PROFILE_PLACEHOLDERS.role}
          />
        </div>
        <div className="field">
          <label htmlFor="goals">Summit goals</label>
          <textarea
            id="goals"
            value={draft.goals}
            onChange={(e) => setDraft({ ...draft, goals: e.target.value })}
            placeholder={PROFILE_PLACEHOLDERS.goals}
          />
        </div>
        <div className="field">
          <label htmlFor="energy">Pace</label>
          <select
            id="energy"
            value={draft.energy}
            onChange={(e) =>
              setDraft({ ...draft, energy: e.target.value as Profile['energy'] })
            }
          >
            <option value="max">Max coverage</option>
            <option value="balanced">Balanced (recommended)</option>
            <option value="light">Light / high-signal only</option>
          </select>
        </div>
        <div className="field">
          <label>Interests (pick at least one)</label>
          <div className="interest-grid">
            {INTEREST_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`chip toggle ${draft.interests.includes(opt.id) ? 'on' : ''}`}
                onClick={() => toggleInterest(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {formError ? <p className="form-error">{formError}</p> : null}
        <div className="row">
          <button type="button" className="btn" onClick={submit}>
            {required ? 'Show my agenda' : 'Save profile'}
          </button>
          {!required ? (
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [day, setDay] = useState<DayId>(() => todayDayId())
  const [profile, setProfile] = useState<Profile>(() => loadProfile())
  const needsOnboarding = !isProfileComplete(profile)
  const [showProfile, setShowProfile] = useState(false)
  const [savedIds, setSavedIds] = useState<string[]>(() => loadSavedIds())
  const [notes, setNotes] = useState<NoteEntry[]>(() => loadNotes())
  const [noteText, setNoteText] = useState('')
  const [noteSession, setNoteSession] = useState('General / hallway')
  const [insight, setInsight] = useState<InsightResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Ask Agentic AI Summit CoPilot about Saturday/Sunday picks, stage hops, or conflicts. Offline planner works without an API key.',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [nowTip, setNowTip] = useState('')
  const [nowMapsUrl, setNowMapsUrl] = useState<string | null>(null)
  const [stageFilter, setStageFilter] = useState<'all' | Session['stage']>('all')
  const [minutes, setMinutes] = useState(() => nowMinutesPT())

  useEffect(() => {
    const id = window.setInterval(() => setMinutes(nowMinutesPT()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const plan = useMemo(() => buildDayPlan(day, profile), [day, profile])

  const plannedSessions = useMemo(
    () =>
      plan.items
        .map((item) => ({
          item,
          session: sessionById(item.sessionId),
        }))
        .filter((x): x is { item: (typeof plan.items)[0]; session: Session } => Boolean(x.session)),
    [plan],
  )

  const agenda = useMemo(() => {
    const list = sessionsForDay(day)
    return stageFilter === 'all' ? list : list.filter((s) => s.stage === stageFilter)
  }, [day, stageFilter])

  function persistProfile(next: Profile) {
    const saved = { ...next, onboarded: true }
    setProfile(saved)
    saveProfile(saved)
    setTab('today')
  }

  function toggleSave(id: string) {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      saveSavedIds(next)
      return next
    })
  }

  function runWhatNow() {
    const result = whatNow(day, minutes, profile)
    setNowTip(result.tip)
    const target = result.next ?? result.current
    setNowMapsUrl(target ? stageDirectionsUrl(target.stage) : mapsDirectionsUrl(venueQuery('lower-sproul')))
  }

  async function runInsights(e?: FormEvent) {
    e?.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText, profile }),
      })
      const data = (await res.json()) as { insight?: InsightResult; error?: string }
      if (!res.ok || !data.insight) throw new Error(data.error || 'Could not build insights.')
      setInsight(data.insight)
      const entry: NoteEntry = {
        id: crypto.randomUUID(),
        sessionTitle: noteSession,
        note: noteText,
        createdAt: new Date().toISOString(),
        insight: data.insight,
      }
      const next = [entry, ...notes].slice(0, 40)
      setNotes(next)
      saveNotes(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Insights failed.')
    } finally {
      setBusy(false)
    }
  }

  async function sendChat(e?: FormEvent) {
    e?.preventDefault()
    const message = chatInput.trim()
    if (!message) return
    setChatInput('')
    setChat((c) => [...c, { role: 'user', content: message }])
    setBusy(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, profile }),
      })
      const data = (await res.json()) as { reply?: string; error?: string }
      if (!res.ok || !data.reply) throw new Error(data.error || 'Chat failed.')
      setChat((c) => [...c, { role: 'assistant', content: data.reply! }])
    } catch (err) {
      setChat((c) => [
        ...c,
        {
          role: 'assistant',
          content: err instanceof Error ? err.message : 'Chat failed.',
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  if (needsOnboarding) {
    return (
      <div className="app-shell onboarding-shell">
        <div className="app-bg" aria-hidden />
        <ProfileModal
          profile={profile}
          required
          onSave={persistProfile}
          onClose={() => {
            /* required — stay until complete */
          }}
        />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="app-bg" aria-hidden />

      <aside className="side-nav" aria-label="Primary">
        <div className="side-nav-brand">
          <BrandMark />
          <div>
            <strong>Agentic AI Summit CoPilot</strong>
            <span>Aug 1–2 · UC Berkeley</span>
          </div>
        </div>
        <nav className="side-nav-links">
          {NAV_ITEMS.map(([id, icon, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'active' : ''}
              onClick={() => setTab(id)}
            >
              <span className="icon">{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <p className="side-nav-foot muted">Mobile + desktop · Maps via Google links</p>
      </aside>

      <main className="app-main">
        <div className="brand-lockup brand-lockup-mobile">
          <BrandMark />
          <div>
            <h1>Agentic AI Summit CoPilot</h1>
            <p>Aug 1–2 · UC Berkeley</p>
          </div>
        </div>

        {tab === 'today' ? (
          <>
            <section className="hero-strip">
              <h2>Your personalized agenda</h2>
              <p>
                Ranked for {profile.role || 'your goals'}. {dayLabel(day)} · {profile.energy}{' '}
                pace.
              </p>
            </section>

            <div className="tabs-day">
              <button
                type="button"
                className={day === 'saturday' ? 'active' : ''}
                onClick={() => setDay('saturday')}
              >
                Saturday
              </button>
              <button
                type="button"
                className={day === 'sunday' ? 'active' : ''}
                onClick={() => setDay('sunday')}
              >
                Sunday
              </button>
            </div>

            <div className="content-grid">
              <div className="panel">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0 }}>What now</h3>
                  <button type="button" className="btn gold" onClick={runWhatNow}>
                    Route me
                  </button>
                </div>
                <p className="muted">
                  {nowTip || 'Tap Route me for a live next-step based on Pacific time + your plan.'}
                </p>
                {nowMapsUrl ? (
                  <div className="row session-actions">
                    <MapsLink href={nowMapsUrl} className="btn map-btn">
                      Open directions in Google Maps
                    </MapsLink>
                  </div>
                ) : null}
              </div>

              <div className="panel">
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                  <h3 style={{ margin: 0 }}>Profile</h3>
                  <button type="button" className="btn secondary" onClick={() => setShowProfile(true)}>
                    Edit profile
                  </button>
                </div>
                <p className="muted" style={{ marginBottom: 0 }}>
                  {profile.role || 'Summit attendee'}
                  {profile.interests.length
                    ? ` · ${profile.interests.slice(0, 4).join(', ')}`
                    : ''}
                </p>
              </div>
            </div>

            <div className="panel">
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ margin: 0 }}>Personal agenda</h3>
              </div>
              <div className="session-grid">
                {plannedSessions.map(({ item, session }, index) => (
                  <SessionBlock
                    key={session.id}
                    session={session}
                    reason={item.reason}
                    hop={item.hopNote}
                    prevStage={plannedSessions[index - 1]?.session.stage}
                    saved={savedIds.includes(session.id)}
                    onToggleSave={() => toggleSave(session.id)}
                  />
                ))}
              </div>
            </div>

            {plan.skippedHighlights.length ? (
              <div className="panel">
                <h3>High-signal conflicts</h3>
                <p className="muted">Worth knowing even if you can’t be in two places.</p>
                <div className="session-grid">
                  {plan.skippedHighlights.map((s) => {
                    const session = sessionById(s.sessionId)
                    if (!session) return null
                    return (
                      <SessionBlock
                        key={session.id}
                        session={session}
                        reason={s.reason}
                        saved={savedIds.includes(session.id)}
                        onToggleSave={() => toggleSave(session.id)}
                      />
                    )
                  })}
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        {tab === 'agenda' ? (
          <>
            <div className="tabs-day">
              <button
                type="button"
                className={day === 'saturday' ? 'active' : ''}
                onClick={() => setDay('saturday')}
              >
                Saturday
              </button>
              <button
                type="button"
                className={day === 'sunday' ? 'active' : ''}
                onClick={() => setDay('sunday')}
              >
                Sunday
              </button>
            </div>
            <div className="filters">
              {(['all', 'plenary', 'nexus', 'atlas', 'compass', 'campus'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={stageFilter === s ? 'active' : ''}
                  onClick={() => setStageFilter(s)}
                >
                  {s === 'all' ? 'All stages' : STAGES[s].short}
                </button>
              ))}
            </div>
            <div className="panel">
              <h3>
                Full {dayLabel(day)} · {agenda.length} blocks
              </h3>
              <div className="session-grid">
                {agenda.map((session, index) => (
                  <SessionBlock
                    key={session.id}
                    session={session}
                    prevStage={agenda[index - 1]?.stage}
                    saved={savedIds.includes(session.id)}
                    onToggleSave={() => toggleSave(session.id)}
                  />
                ))}
              </div>
            </div>
          </>
        ) : null}

        {tab === 'venue' ? (
          <>
            <section className="hero-strip">
              <h2>Venue map guide</h2>
              <p>Directions open Google Maps in a new tab — no API key needed.</p>
            </section>

            <div className="panel">
              <h3>Quick campus hops</h3>
              <p className="muted">Walking routes between summit landmarks.</p>
              <div className="hop-grid">
                {CAMPUS_HOPS.map((hop) => {
                  const fromQ = venueQuery(hop.from)
                  const toQ = venueQuery(hop.to)
                  const href =
                    hop.from === hop.to
                      ? mapsDirectionsUrl(toQ, { mode: 'walking' })
                      : mapsDirectionsUrl(toQ, { origin: fromQ, mode: 'walking' })
                  return (
                    <div className="hop-card" key={hop.id}>
                      <h4>{hop.label}</h4>
                      <p className="muted">{hop.blurb}</p>
                      <MapsLink href={href} className="btn map-btn">
                        Open in Google Maps
                      </MapsLink>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="content-grid">
              <div className="panel">
                <h3>Legend</h3>
                {MAP_LEGEND.map((item) => (
                  <p key={item.id} className="muted" style={{ margin: '6px 0' }}>
                    <span className={`legend-dot ${item.tone}`} /> {item.label}
                  </p>
                ))}
              </div>
              <div className="panel">
                <h3>Check-in</h3>
                <div className="venue-block">
                  <h4>{VENUES['check-in-general'].name}</h4>
                  <p className="muted">{VENUES['check-in-general'].blurb}</p>
                  <VenueActions venueId="check-in-general" />
                </div>
                <div className="venue-block">
                  <h4>{VENUES['check-in-vip'].name}</h4>
                  <p className="muted">{VENUES['check-in-vip'].blurb}</p>
                  <VenueActions venueId="check-in-vip" />
                </div>
              </div>
            </div>

            <div className="panel">
              <h3>Stages & buildings</h3>
              <div className="venue-grid">
                {(Object.keys(STAGES) as Array<keyof typeof STAGES>).map((stageId) => {
                  const stage = STAGES[stageId]
                  const venue = VENUES[stage.venueId]
                  return (
                    <div className="venue-block venue-card" key={stageId}>
                      <h4>
                        <span className={`chip stage-${stageId}`}>{stage.short}</span> {venue.name}
                      </h4>
                      <p className="muted" style={{ margin: 0 }}>
                        {venue.blurb}
                      </p>
                      <p className="muted">{venue.walkFromSproul}</p>
                      <VenueActions venueId={stage.venueId} />
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        ) : null}

        {tab === 'notes' ? (
          <div className="content-grid notes-layout">
            <div className="panel">
              <h3>Note → Insight</h3>
              <p className="muted">
                Paste talk notes. Works offline; uses OpenAI when <code>OPENAI_API_KEY</code> is set
                on Vercel.
              </p>
              <form onSubmit={runInsights}>
                <div className="field">
                  <label htmlFor="session">Session label</label>
                  <input
                    id="session"
                    list="session-options"
                    value={noteSession}
                    onChange={(e) => setNoteSession(e.target.value)}
                  />
                  <datalist id="session-options">
                    {SESSIONS.map((s) => (
                      <option key={s.id} value={s.title} />
                    ))}
                  </datalist>
                </div>
                <div className="field">
                  <label htmlFor="note">Notes</label>
                  <textarea
                    id="note"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Key claims, tools, quotes, questions…"
                  />
                </div>
                {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
                <button className="btn" type="submit" disabled={busy}>
                  {busy ? 'Working…' : 'Extract insights'}
                </button>
              </form>
            </div>

            <div className="notes-side">
              {insight ? (
                <div className="panel">
                  <h3>Latest insight · {insight.source}</h3>
                  <p>{insight.summary}</p>
                  <h4>Key claims</h4>
                  <ul className="insight-list">
                    {insight.keyClaims.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                  {insight.toolsMentioned.length ? (
                    <>
                      <h4>Tools</h4>
                      <div className="row">
                        {insight.toolsMentioned.map((t) => (
                          <span className="chip" key={t}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : null}
                  <h4>Apply to work</h4>
                  <ul className="insight-list">
                    {insight.applyToWork.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                  <h4>Follow-ups</h4>
                  <ul className="insight-list">
                    {insight.followUps.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="panel">
                <h3>Saved notes ({notes.length})</h3>
                {notes.length === 0 ? (
                  <p className="empty">Your insight log will show up here.</p>
                ) : (
                  notes.map((n) => (
                    <article className="session-card" key={n.id}>
                      <div className="row">
                        <span className="chip">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <h4>{n.sessionTitle}</h4>
                      <p className="muted">
                        {n.note.slice(0, 180)}
                        {n.note.length > 180 ? '…' : ''}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'ask' ? (
          <div className="panel ask-panel">
            <h3>Ask CoPilot</h3>
            <div className="chat-log">
              {chat.map((m, i) => (
                <div key={`${m.role}-${i}`} className={`bubble ${m.role}`}>
                  {m.content}
                </div>
              ))}
            </div>
            <form className="ask-form" onSubmit={sendChat}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="e.g. Sunday Databricks vs Compass evals?"
              />
              <button className="btn" type="submit" disabled={busy}>
                Send
              </button>
            </form>
            <div className="row" style={{ marginTop: 10 }}>
              {['Saturday plan', 'Sunday plan', 'Where is check-in?', 'Directions to MLK'].map(
                (q) => (
                  <button
                    key={q}
                    type="button"
                    className="chip toggle"
                    onClick={() => {
                      setChatInput(q)
                    }}
                  >
                    {q}
                  </button>
                ),
              )}
            </div>
          </div>
        ) : null}
      </main>

      <nav className="bottom-nav" aria-label="Primary mobile">
        {NAV_ITEMS.map(([id, icon, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'active' : ''}
            onClick={() => setTab(id)}
          >
            <span className="icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      {showProfile ? (
        <ProfileModal
          profile={profile}
          onSave={persistProfile}
          onClose={() => setShowProfile(false)}
        />
      ) : null}
    </div>
  )
}
