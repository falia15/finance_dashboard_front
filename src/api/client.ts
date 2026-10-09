const API_URL = import.meta.env.VITE_API_URL

// Profil actif envoyé dans l'en-tête X-Profile-Id : le back filtre les données
// sur ce profil (et ses foyers). Tenu à jour par ActiveProfileProvider.
let activeProfileId: number | null = null

export function setApiActiveProfileId(id: number | null) {
  activeProfileId = id
}

/** A validation error of a 422 response. */
export interface Violation {
  propertyPath: string
  message: string
}

export class ApiError extends Error {
  status: number
  /** Validation errors of a 422, empty otherwise */
  violations: Violation[]

  constructor(message: string, status: number, violations: Violation[] = []) {
    super(message)
    this.status = status
    this.violations = violations
  }
}

async function readViolations(response: Response): Promise<Violation[]> {
  try {
    const body = (await response.json()) as { violations?: Violation[] }
    return Array.isArray(body.violations) ? body.violations : []
  } catch {
    return []
  }
}

export const mergePatchHeaders = {
  'Content-Type': 'application/merge-patch+json',
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/ld+json',
      'Content-Type': 'application/ld+json',
      ...(activeProfileId !== null && {
        'X-Profile-Id': String(activeProfileId),
      }),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(
      `${response.status} ${response.statusText}`,
      response.status,
      response.status === 422 ? await readViolations(response) : [],
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
