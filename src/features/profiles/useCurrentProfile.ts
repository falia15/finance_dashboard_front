import { useActiveProfile } from './ActiveProfileContext'
import { useProfile } from './queries'

/** The active profile's data: `undefined` while loading, `null` if it no longer exists. */
export function useCurrentProfile() {
  const { activeProfileId } = useActiveProfile()
  return useProfile(activeProfileId).data
}
