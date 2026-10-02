import { apiFetch, mergePatchHeaders, useApiGet } from '../../api/client'
import { PROFILES_ROUTE, type Profile, type ProfileCollection, type ProfileInput } from './api'

export function useProfiles(refreshKey?: unknown) {
  return useApiGet<ProfileCollection>(PROFILES_ROUTE, refreshKey)
}

export function createProfile(input: ProfileInput) {
  return apiFetch<Profile>(PROFILES_ROUTE, { method: 'POST', body: JSON.stringify(input) })
}

export function updateProfile(id: number, input: Partial<ProfileInput>) {
  return apiFetch<Profile>(`${PROFILES_ROUTE}/${id}`, {
    method: 'PATCH',
    headers: mergePatchHeaders,
    body: JSON.stringify(input),
  })
}

export function deleteProfile(id: number) {
  return apiFetch<void>(`${PROFILES_ROUTE}/${id}`, { method: 'DELETE' })
}
