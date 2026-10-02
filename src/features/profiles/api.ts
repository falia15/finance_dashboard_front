export const PROFILES_ROUTE = '/profiles'

export interface Profile {
  '@id': string
  id: number
  name: string
  color: string | null
  createdAt: string
}

export interface ProfileCollection {
  member: Profile[]
  totalItems: number
}

export interface ProfileInput {
  name: string
  color: string | null
}
