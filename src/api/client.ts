import { useCallback, useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

// Profil actif envoyé dans l'en-tête X-Profile-Id : le back filtre les données
// sur ce profil (et ses foyers). Tenu à jour par ActiveProfileProvider.
let activeProfileId: number | null = null

export function setApiActiveProfileId(id: number | null) {
  activeProfileId = id
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export const mergePatchHeaders = { 'Content-Type': 'application/merge-patch+json' }

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/ld+json',
      'Content-Type': 'application/ld+json',
      ...(activeProfileId !== null && { 'X-Profile-Id': String(activeProfileId) }),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(`${response.status} ${response.statusText}`, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

/**
 * GET `path` à l'affichage du composant, et de nouveau quand `refreshKey` change.
 * Après une écriture, le composant appelle `reload()` pour relire les données.
 */
export function useApiGet<T>(path: string, refreshKey?: unknown) {
  const [data, setData] = useState<T>()
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const reload = useCallback(async () => {
    try {
      setData(await apiFetch<T>(path))
      setIsError(false)
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [path])

  useEffect(() => {
    reload()
  }, [reload, refreshKey])

  return { data, isLoading, isError, reload }
}
