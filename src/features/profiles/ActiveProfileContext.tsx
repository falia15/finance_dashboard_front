import { createContext, useContext, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'activeProfileId'

interface ActiveProfileContextValue {
  activeProfileId: number | null
  setActiveProfileId: (id: number | null) => void
}

const ActiveProfileContext = createContext<ActiveProfileContextValue | null>(null)

function readStoredProfileId(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? Number(raw) : null
  } catch {
    return null
  }
}

export function ActiveProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfileId, setActiveProfileIdState] = useState<number | null>(readStoredProfileId)

  function setActiveProfileId(id: number | null) {
    setActiveProfileIdState(id)
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
