import { useTranslation } from 'react-i18next'
import { useProfiles } from '#/features/profiles/queries'
import type { HouseholdMember } from './api'

/** Display name of a member: its profile's name or its external label. */
export function useMemberName() {
  const { t } = useTranslation()
  const { data: profiles = [] } = useProfiles()

  return (member: HouseholdMember) => {
    if (member.externalLabel) return member.externalLabel
    return (
      profiles.find((profile) => profile['@id'] === member.profile)?.name ??
      t('households.unknownProfile')
    )
  }
}
