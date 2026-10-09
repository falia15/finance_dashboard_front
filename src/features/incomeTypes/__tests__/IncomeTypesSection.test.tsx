import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { notifications } from '@mantine/notifications'
import { Settings } from '#/pages/Settings'
import type { IncomeType } from '#/features/incomeTypes/api'
import { renderPage } from '#/test/render'
import { callsWith, jsonResponse, mockFetch } from '#/test/fetch'

const incomeTypes: IncomeType[] = [
  {
    '@id': '/api/income_types/1',
    id: 1,
    name: 'Salaire',
    color: '#3B82F6',
    sortOrder: 0,
  },
  { '@id': '/api/income_types/2', id: 2, name: 'CAF', sortOrder: 1 },
  {
    '@id': '/api/income_types/3',
    id: 3,
    name: 'Ticket restaurant',
    sortOrder: 2,
  },
]

/** Answers GET /income_types, `write` answers the other calls. */
function mockIncomeTypesApi(
  write: (method: string, path: string) => Response = () =>
    jsonResponse({}, 201),
) {
  return mockFetch(({ method, path }) => {
    if (method !== 'GET') return write(method, path)
    if (path === '/income_types')
      return jsonResponse({ member: incomeTypes, totalItems: 3 })
    return jsonResponse({ member: [], totalItems: 0 })
  })
}

function renderSettings() {
  localStorage.setItem('activeProfileId', '1')
  return renderPage(<Settings />, { path: '/settings', url: '/settings' })
}

function bodyOf(init: RequestInit | undefined) {
  return JSON.parse(String(init?.body))
}

describe('IncomeTypesSection', () => {
  it('lists the income types in order', async () => {
    mockIncomeTypesApi()
    renderSettings()

    const rows = await screen.findAllByRole('row')
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('Salaire'),
      expect.stringContaining('CAF'),
      expect.stringContaining('Ticket restaurant'),
    ])
    expect(
      screen.getByRole('button', { name: 'Move Salaire up' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Move Ticket restaurant down' }),
    ).toBeDisabled()
  })

  it('creates a type', async () => {
    const user = userEvent.setup()
    const fetchMock = mockIncomeTypesApi(() =>
      jsonResponse({ ...incomeTypes[0], id: 9, name: 'Prime' }, 201),
    )
    renderSettings()

    await user.click(await screen.findByRole('button', { name: 'New type' }))
    const dialog = await screen.findByRole('dialog')
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Name' }),
      ' Prime ',
    )
    await user.click(within(dialog).getByRole('button', { name: 'Create' }))

    await expect.poll(() => callsWith(fetchMock, 'POST')).toHaveLength(1)
    const [path, init] = callsWith(fetchMock, 'POST')[0]
    expect(path).toBe('/income_types')
    expect(bodyOf(init)).toEqual({ name: 'Prime', color: null })
    await expect.poll(() => screen.queryByRole('dialog')).toBeNull()
  })

  it('renames a type', async () => {
    const user = userEvent.setup()
    const fetchMock = mockIncomeTypesApi(() => jsonResponse(incomeTypes[1]))
    renderSettings()

    await user.click(await screen.findByRole('button', { name: 'Edit CAF' }))
    const name = within(await screen.findByRole('dialog')).getByRole(
      'textbox',
      { name: 'Name' },
    )
    expect(name).toHaveValue('CAF')
    await user.clear(name)
    await user.type(name, 'Allocations familiales')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await expect.poll(() => callsWith(fetchMock, 'PATCH')).toHaveLength(1)
    const [path, init] = callsWith(fetchMock, 'PATCH')[0]
    expect(path).toBe('/income_types/2')
    expect(bodyOf(init)).toEqual({
      name: 'Allocations familiales',
      color: null,
    })
  })

  it('moves a type down with the whole new order', async () => {
    const user = userEvent.setup()
    const fetchMock = mockIncomeTypesApi(
      () => new Response(null, { status: 204 }),
    )
    renderSettings()

    await user.click(
      await screen.findByRole('button', { name: 'Move Salaire down' }),
    )

    await expect.poll(() => callsWith(fetchMock, 'PATCH')).toHaveLength(1)
    const [path, init] = callsWith(fetchMock, 'PATCH')[0]
    expect(path).toBe('/income_types/reorder')
    expect(bodyOf(init)).toEqual({
      order: [
        '/api/income_types/2',
        '/api/income_types/1',
        '/api/income_types/3',
      ],
    })
  })

  it('explains why a used type cannot be deleted', async () => {
    const user = userEvent.setup()
    const show = vi.spyOn(notifications, 'show')
    mockIncomeTypesApi(() => jsonResponse({ violations: [] }, 422))
    renderSettings()

    await user.click(await screen.findByRole('button', { name: 'Delete CAF' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Delete the type "CAF"?')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await expect
      .poll(() => show.mock.calls[0]?.[0].message)
      .toBe(
        'Incomes still use this type: change their type before deleting it.',
      )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
