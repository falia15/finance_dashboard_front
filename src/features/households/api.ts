export const HOUSEHOLDS_ROUTE = '/households'
export const HOUSEHOLD_MEMBERS_ROUTE = '/household_members'

export interface HouseholdMember {
  '@id': string
  id: number
  household: string
  /** IRI of the member's profile, absent for an external member */
  profile?: string | null
  externalLabel?: string | null
  isOwner: boolean
  joinedAt: string
  leftAt?: string | null
}

export interface Household {
  '@id': string
  id: number
  name: string
  members: HouseholdMember[]
}

export interface HouseholdCollection {
  member: Household[]
  totalItems: number
}
