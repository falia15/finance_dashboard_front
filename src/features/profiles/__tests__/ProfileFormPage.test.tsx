import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileFormPage } from '../ProfileFormPage'
import { renderPage } from '../../../test/render'
import { callsWith, jsonResponse, mockFetch } from '../../../test/fetch'

const alice = { '@id': '/api/profiles/1', id: 1, name: 'Alice', color: '#8b5cf6', createdAt: '2026-09-01T00:00:00+00:00' }

function mockProfilesApi() {
  return mockFetch(({ method, path }) => {
    if (method === 'GET' && path === '/profiles') return jsonResponse({ member: [alice], totalItems: 1 })
    if (method === 'PATCH') return jsonResponse({ ...alice, name: 'Alicia' })
    if (method === 'POST') return jsonResponse({ ...alice, id: 2 }, 201)
    return jsonResponse({}, 404)
  })
}

function renderEditPage(id: number) {
  return renderPage(<ProfileFormPage />, { path: '/profiles/:id/edit', url: `/profiles/${id}/edit` })
}

describe('ProfileFormPage', () => {
  it('prefills the form with the edited profile and saves it with PATCH', async () => {
    const fetchMock = mockProfilesApi()
    const user = userEvent.setup()
    renderEditPage(1)

    const nameInput = await screen.findByLabelText(/name/i)
    expect(nameInput).toHaveValue('Alice')

    await user.clear(nameInput)
    await user.type(nameInput, 'Alicia')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Navigated to /profiles')).toBeInTheDocument()
    const patches = callsWith(fetchMock, 'PATCH')
    expect(patches).toHaveLength(1)
    expect(patches[0][0]).toBe('/profiles/1')
    expect(JSON.parse(patches[0][1]?.body as string)).toMatchObject({ name: 'Alicia' })
    expect(callsWith(fetchMock, 'POST')).toHaveLength(0)
  })

  it('shows "profile not found" instead of the form for an unknown id', async () => {
    const fetchMock = mockProfilesApi()
    renderEditPage(999)

    expect(await screen.findByText('Profile not found')).toBeInTheDocument()
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument()
    expect(callsWith(fetchMock, 'POST')).toHaveLength(0)
  })

  it('does not render the form while profiles are loading', () => {
    mockFetch(() => new Promise<Response>(() => {}))
    renderEditPage(1)

    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
  })

  it('shows a load error when the API is unreachable', async () => {
    mockFetch(() => jsonResponse({}, 500))
    renderEditPage(1)

    expect(await screen.findByText('Unable to load profiles')).toBeInTheDocument()
  })

  it('creates a profile with POST on the new profile page', async () => {
    const fetchMock = mockProfilesApi()
    const user = userEvent.setup()
    renderPage(<ProfileFormPage />, { path: '/profiles/new', url: '/profiles/new' })

    await user.type(screen.getByLabelText(/name/i), 'Bob')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('Navigated to /profiles')).toBeInTheDocument()
    expect(callsWith(fetchMock, 'POST')).toHaveLength(1)
  })

  it('rejects a blank name without calling the API', async () => {
    const fetchMock = mockProfilesApi()
    const user = userEvent.setup()
    renderPage(<ProfileFormPage />, { path: '/profiles/new', url: '/profiles/new' })

    await user.type(screen.getByLabelText(/name/i), '   ')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(callsWith(fetchMock, 'POST')).toHaveLength(0)
  })
})
