import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { notifications } from '@mantine/notifications'
import { HouseholdsPage } from '../HouseholdsPage'
import { todayIsoDate } from '../dates'
import type { Household } from '../api'
import { renderPage } from '../../../test/render'
import { callsWith, jsonResponse, mockFetch } from '../../../test/fetch'

const profiles = [
  { '@id': '/api/profiles/1', id: 1, name: 'Alice', color: null, createdAt: '2026-09-01T00:00:00+00:00' },
  { '@id': '/api/profiles/2', id: 2, name: 'Bob', color: null, createdAt: '2026-09-01T00:00:00+00:00' },
]

const household: Household = {
  '@id': '/api/households/1',
  id: 1,
  name: 'Couple',
  members: [
    {
      '@id': '/api/household_members/1',
      id: 1,
      household: '/api/households/1',
      profile: '/api/profiles/1',
      isOwner: true,
      joinedAt: '2026-01-01T00:00:00+00:00',
    },
    {
      '@id': '/api/household_members/2',
      id: 2,
      household: '/api/households/1',
      externalLabel: 'Partner',
      isOwner: false,
      joinedAt: '2026-02-01T00:00:00+00:00',
    },
    {
      '@id': '/api/household_members/3',
      id: 3,
      household: '/api/households/1',
      externalLabel: 'Former roommate',
      isOwner: false,
      joinedAt: '2026-01-01T00:00:00+00:00',
      leftAt: '2026-06-01T00:00:00+00:00',
    },
  ],
}

/** Answers GET /profiles and GET /households, `write` answers the other calls. */
function mockHouseholdsApi(households: Household[], write: (method: string, path: string) => Response = () => jsonResponse({})) {
  return mockFetch(({ method, path }) => {
    if (method !== 'GET') return write(method, path)
    if (path === '/profiles') return jsonResponse({ member: profiles, totalItems: profiles.length })
    return jsonResponse({ member: households, totalItems: households.length })
  })
}

function renderHouseholdsPage(activeProfileId = 1) {
  localStorage.setItem('activeProfileId', String(activeProfileId))
  return renderPage(<HouseholdsPage />, { path: '/households', url: '/households' })
}

function bodyOf(init: RequestInit | undefined) {
  return JSON.parse(String(init?.body))
}

async function fillPrompt(value: string, submit: string) {
  const user = userEvent.setup()
  const dialog = await screen.findByRole('dialog')
  await user.type(within(dialog).getByRole('textbox'), value)
  await user.click(within(dialog).getByRole('button', { name: submit }))
}

describe('HouseholdsPage', () => {
  it('lists active and past members', async () => {
    mockHouseholdsApi([household])
    renderHouseholdsPage()

    expect(await screen.findByText('Couple')).toBeInTheDocument()
    expect(await screen.findByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Owner')).toBeInTheDocument()
    expect(screen.getByText('Partner')).toBeInTheDocument()
    expect(screen.getByText('Active members (2)')).toBeInTheDocument()
    expect(screen.getByText('Past members')).toBeInTheDocument()
    expect(screen.getByText('From Jan 1, 2026 to Jun 1, 2026')).toBeInTheDocument()
  })

  it('creates a household', async () => {
    const user = userEvent.setup()
    const fetchMock = mockHouseholdsApi([], () => jsonResponse(household, 201))
    renderHouseholdsPage()

    expect(await screen.findByText(/No household yet/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'New household' }))
    await fillPrompt('  Couple ', 'Create')

    await expect.poll(() => callsWith(fetchMock, 'POST')).toHaveLength(1)
    const [path, init] = callsWith(fetchMock, 'POST')[0]
    expect(path).toBe('/households')
    expect(bodyOf(init)).toEqual({ name: 'Couple' })
    await expect.poll(() => screen.queryByRole('dialog')).toBeNull()
  })

  it('requires a name', async () => {
    const user = userEvent.setup()
    const fetchMock = mockHouseholdsApi([])
    renderHouseholdsPage()

    await user.click(await screen.findByRole('button', { name: 'New household' }))
    await fillPrompt('   ', 'Create')

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(callsWith(fetchMock, 'POST')).toHaveLength(0)
  })

  it('adds an external member', async () => {
    const user = userEvent.setup()
    const fetchMock = mockHouseholdsApi([household], () => jsonResponse({}, 201))
    renderHouseholdsPage()

    await user.click(await screen.findByRole('button', { name: 'Add a member' }))
    await fillPrompt('Roommate', 'Add')

    await expect.poll(() => callsWith(fetchMock, 'POST')).toHaveLength(1)
    const [path, init] = callsWith(fetchMock, 'POST')[0]
    expect(path).toBe('/households/1/members')
    expect(bodyOf(init)).toEqual({ externalLabel: 'Roommate' })
  })

  it('detaches a member as of today', async () => {
    const user = userEvent.setup()
    const fetchMock = mockHouseholdsApi([household])
    renderHouseholdsPage()

    await user.click(await screen.findByRole('button', { name: 'Detach' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Detach' }))

    await expect.poll(() => callsWith(fetchMock, 'PATCH')).toHaveLength(1)
    const [path, init] = callsWith(fetchMock, 'PATCH')[0]
    expect(path).toBe('/household_members/2')
    expect(bodyOf(init)).toEqual({ leftAt: todayIsoDate() })
  })

  it('explains why a household with rows cannot be deleted', async () => {
    const user = userEvent.setup()
    const showNotification = vi.spyOn(notifications, 'show')
    mockHouseholdsApi([household], () => jsonResponse({ violations: [] }, 422))
    renderHouseholdsPage()

    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Delete' }))

    await expect.poll(() => showNotification.mock.calls).toHaveLength(1)
    expect(showNotification.mock.calls[0][0].message).toMatch(/still has incomes, expenses or fixed expenses attached/)
  })

  it('hides management actions from a member who is not the owner', async () => {
    const shared: Household = {
      ...household,
      members: [
        ...household.members,
        {
          '@id': '/api/household_members/4',
          id: 4,
          household: '/api/households/1',
          profile: '/api/profiles/2',
          isOwner: false,
          joinedAt: '2026-03-01T00:00:00+00:00',
        },
      ],
    }
    mockHouseholdsApi([shared])
    renderHouseholdsPage(2)

    expect(await screen.findByText('Bob')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rename' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Add a member' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Detach' })).toBeNull()
  })
})
