import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileSelectPage } from '../ProfileSelectPage'
import { renderPage } from '../../../test/render'
import { callsWith, jsonResponse, mockFetch } from '../../../test/fetch'

const profiles = [
  { '@id': '/api/profiles/1', id: 1, name: 'Alice', color: null, createdAt: '2026-09-01T00:00:00+00:00' },
  { '@id': '/api/profiles/2', id: 2, name: 'Bob', color: null, createdAt: '2026-09-01T00:00:00+00:00' },
]

function mockProfilesApi(list = profiles) {
  return mockFetch(({ method }) => {
    if (method === 'DELETE') return new Response(null, { status: 204 })
    return jsonResponse({ member: list, totalItems: list.length })
  })
}

function renderSelectPage() {
  return renderPage(<ProfileSelectPage />, { path: '/profiles', url: '/profiles' })
}

async function deleteProfile(name: string) {
  const user = userEvent.setup()
  const card = (await screen.findByText(name)).closest<HTMLElement>('.mantine-Card-root')!
  await user.click(within(card).getByRole('button', { name: 'Delete' }))
  await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Delete' }))
}

describe('ProfileSelectPage', () => {
  it('stores the picked profile as active and goes to the dashboard', async () => {
    mockProfilesApi()
    const user = userEvent.setup()
    renderSelectPage()

    await user.click(await screen.findByText('Bob'))

    expect(await screen.findByText('Navigated to /dashboard')).toBeInTheDocument()
    expect(localStorage.getItem('activeProfileId')).toBe('2')
  })

  it('resets the active profile when it gets deleted', async () => {
    localStorage.setItem('activeProfileId', '1')
    const fetchMock = mockProfilesApi()
    renderSelectPage()

    await deleteProfile('Alice')

    await expect.poll(() => callsWith(fetchMock, 'DELETE')).toHaveLength(1)
    await expect.poll(() => localStorage.getItem('activeProfileId')).toBeNull()
  })

  it('keeps the active profile when another profile gets deleted', async () => {
    localStorage.setItem('activeProfileId', '1')
    const fetchMock = mockProfilesApi()
    renderSelectPage()

    await deleteProfile('Bob')

    await expect.poll(() => callsWith(fetchMock, 'DELETE')).toHaveLength(1)
    await expect.poll(() => screen.queryByRole('dialog')).toBeNull()
    expect(localStorage.getItem('activeProfileId')).toBe('1')
  })

  it('disables deletion of the last profile', async () => {
    mockProfilesApi([profiles[0]])
    renderSelectPage()

    await screen.findByText('Alice')

    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
  })
})
