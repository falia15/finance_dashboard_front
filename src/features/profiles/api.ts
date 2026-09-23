import { apiFetch } from '../../api/client'

export interface Profile {
  '@id': string
  id: number
  name: string
  color: string | null
  createdAt: string
}

interface ProfileCollection {
  member: Profile[]
  totalItems: number
}

export interface ProfileInput {
  name: string
  color: string | null
}

export function listProfiles() {
  return apiFetch<ProfileCollection>('/profiles')
}

export function createProfile(input: ProfileInput) {
  return apiFetch<Profile>('/profiles', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateProfile(id: number, input: Partial<ProfileInput>) {
  return apiFetch<Profile>(`/profiles/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(input),
  })
}

export function deleteProfile(id: number) {
  return apiFetch<void>(`/profiles/${id}`, { method: 'DELETE' })
}
