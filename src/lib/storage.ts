import { DEFAULT_PROFILE, type InsightResult, type Profile } from './types.js'

const PROFILE_KEY = 'summit-copilot:profile'
const NOTES_KEY = 'summit-copilot:notes'
const SAVED_KEY = 'summit-copilot:saved'

export type NoteEntry = {
  id: string
  sessionTitle: string
  note: string
  createdAt: string
  insight?: InsightResult
}

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return { ...DEFAULT_PROFILE }
    const parsed = JSON.parse(raw) as Partial<Profile>
    const profile: Profile = { ...DEFAULT_PROFILE, ...parsed }
    // Migrate older saved profiles (no onboarded flag) as complete.
    if (parsed.onboarded == null && localStorage.getItem(PROFILE_KEY)) {
      profile.onboarded = (parsed.interests?.length ?? 0) > 0 || Boolean(parsed.role?.trim())
    }
    return profile
  } catch {
    return { ...DEFAULT_PROFILE }
  }
}

export function saveProfile(profile: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function isProfileComplete(profile: Profile): boolean {
  return Boolean(profile.onboarded && profile.interests.length > 0)
}

export function loadNotes(): NoteEntry[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY)
    if (!raw) return []
    return JSON.parse(raw) as NoteEntry[]
  } catch {
    return []
  }
}

export function saveNotes(notes: NoteEntry[]) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
}

export function loadSavedIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

export function saveSavedIds(ids: string[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(ids))
}
