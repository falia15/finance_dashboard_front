import { createContext, useContext, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { setApiActiveProfileId } from '../../api/client'
import { profilesQueryKey } from './queries'

const STORAGE_KEY = 'activeProfileId'

interface ActiveProfileContextValue {
  activeProfileId: number | null
  setActiveProfileId: (id: number | null) => void
}

const ActiveProfileContext = createContext<ActiveProfileContextValue | null>(null)

function readStoredProfileId(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const id = raw ? Number(raw) : null
    setApiActiveProfileId(id)
    return id
  } catch {
    return null
  }
}

export function ActiveProfileProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [activeProfileId, setActiveProfileIdState] = useState<number | null>(readStoredProfileId)

  function setActiveProfileId(id: number | null) {
    setApiActiveProfileId(id)
    setActiveProfileIdState(id)
    // Le profil n'est pas dans les queryKey (il part en en-tête) : on jette le
    // cache des données de l'ancien profil, sauf la liste des profils.
    if (id !== activeProfileId) {
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== profilesQueryKey[0] })
    }
    try {
      if (id === null) {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(STORAGE_KEY, String(id))
      }
    } catch {
      // localStorage indisponible (navigation privée...) — l'état reste utilisable en mémoire
    }
  }

  return (
    <ActiveProfileContext.Provider value={{ activeProfileId, setActiveProfileId }}>
      {children}
    </ActiveProfileContext.Provider>
  )
}

export function useActiveProfile() {
  const context = useContext(ActiveProfileContext)
  if (!context) {
    throw new Error('useActiveProfile must be used within an ActiveProfileProvider')
  }
  return context
}
