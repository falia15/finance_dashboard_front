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
