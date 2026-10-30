import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FixedExpensesPage } from '#/features/fixedExpenses/FixedExpensesPage'
import type { ProfileFixedExpenseYear } from '#/features/fixedExpenses/api'
import type { Household } from '#/features/households/api'
import { renderPage } from '#/test/render'
import { callsWith, jsonResponse, mockFetch } from '#/test/fetch'

const profiles = [
  {
    '@id': '/api/profiles/1',
    id: 1,
    name: 'Alice',
    color: null,
    createdAt: '2026-09-01T00:00:00+00:00',
  },
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
      joinedAt: '2026-01-01T00:00:00+00:00',
    },
  ],
}

const months = Array.from({ length: 12 }, (_, index) => index + 1)

function profileYear(year: number): ProfileFixedExpenseYear {
  const empty = year !== 2026
  return {
    profileId: 1,
    year,
    lines: empty
      ? []
      : [
          {
            id: 4,
            label: 'Car insurance',
            sortOrder: 0,
            startYear: 2026,
            endYear: null,
            endMonth: null,
            amounts: months.map((month) => ({
              id: 30 + month,
              month,
              amount: '70.00',
            })),
            total: '840.00',
          },
          {
            id: 5,
            label: 'Water',
            sortOrder: 1,
            startYear: 2026,
            endYear: null,
            endMonth: null,
            amounts: [{ id: 80, month: 6, amount: '175.22' }],
            total: '175.22',
          },
          {
            id: 6,
            label: 'Streaming',
            sortOrder: 2,
            startYear: 2026,
            endYear: 2026,
            endMonth: 9,
            amounts: [{ id: 90, month: 1, amount: '13.49' }],
            total: '13.49',
          },
        ],
    households: [
      {
        household: '/api/households/1',
        lines: empty
          ? []
          : [
              {
                id: 9,
                label: 'Rent',
                sortOrder: 0,
                householdMember: null,
                startYear: 2026,
                endYear: null,
                endMonth: null,
                amounts: [
                  {
                    id: 58,
                    month: 1,
                    amount: '560.00',
                    appliedDivisor: 2,
                    share: '280.00',
                  },
                ],
                total: '560.00',
                shareTotal: '280.00',
              },
            ],
        months: months.map((month) => ({
          month,
          total: month === 1 && !empty ? '560.00' : '0.00',
          share: month === 1 && !empty ? '280.00' : '0.00',
        })),
        totals: empty
          ? { total: '0.00', share: '0.00' }
          : { total: '560.00', share: '280.00' },
      },
    ],
    months: months.map((month) => ({
      month,
      individual: '0.00',
      householdShare: '0.00',
      total: '0.00',
    })),
    totals: empty
      ? { individual: '0.00', householdShare: '0.00', total: '0.00' }
      : { individual: '1028.71', householdShare: '280.00', total: '1308.71' },
  }
}

/** Answers the GETs of the page, `write` answers the other calls. */
function mockFixedExpensesApi(
  write: (method: string, path: string) => Response = () =>
    jsonResponse({}, 201),
) {
  return mockFetch(({ method, path }) => {
    if (method !== 'GET') return write(method, path)
    if (path === '/profiles')
      return jsonResponse({ member: profiles, totalItems: 1 })
    if (path === '/households')
      return jsonResponse({ member: [household], totalItems: 1 })
    const year = /^\/profiles\/1\/fixed_expenses\?year=(\d+)$/.exec(path)
    if (year) return jsonResponse(profileYear(Number(year[1])))
    return jsonResponse({}, 404)
  })
}

function renderFixedExpensesPage(url = '/fixed-expenses?year=2026') {
  localStorage.setItem('activeProfileId', '1')
  return renderPage(<FixedExpensesPage />, { path: '/fixed-expenses', url })
}

function bodyOf(init: RequestInit | undefined) {
  return JSON.parse(String(init?.body))
}

/** Clicks a month of the grid, types the amount and validates with Enter. */
async function editCell(name: string, typed: string) {
  const user = userEvent.setup()
  await user.click(await screen.findByRole('button', { name }))
  const input = screen.getByRole('textbox', { name })
  await user.clear(input)
  await user.type(input, `${typed}{Enter}`)
}

async function openAction(line: string, action: string) {
  const user = userEvent.setup()
  await user.click(
    await screen.findByRole('button', { name: `Actions for ${line}` }),
  )
  await user.click(await screen.findByRole('menuitem', { name: action }))
}

/** The add form of the given section ("My fixed expenses", household name). */
async function addFormOf(sectionTitle: string) {
  const title = await screen.findByRole('heading', { name: sectionTitle })
  const section = title.closest('.mantine-Stack-root') as HTMLElement
  const forms = section.querySelectorAll('form')
  return forms[forms.length - 1] as HTMLElement
}

describe('FixedExpensesPage', () => {
  it('shows the grids and totals from the API', async () => {
    mockFixedExpensesApi()
    renderFixedExpensesPage()

    expect(
      await screen.findByRole('button', { name: 'Water — June' }),
    ).toHaveTextContent('€175.22')
    expect(screen.getByText('€840.00')).toBeInTheDocument()
    expect(screen.getByText(/€1,308\.71/)).toBeInTheDocument()

    const card = (await screen.findByRole('heading', { name: 'Couple' }))
      .parentElement as HTMLElement
    // Split under the label, share in its own column
    const rent = within(card).getByText('Rent').parentElement as HTMLElement
    expect(rent).toHaveTextContent('Equal shares')
    expect(within(card).getAllByText('€280.00')).not.toHaveLength(0)
  })

  it('greys out the months after a deactivation', async () => {
    mockFixedExpensesApi()
    renderFixedExpensesPage()

    expect(
      await screen.findByRole('button', { name: 'Streaming — September' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Streaming — October' }),
    ).toBeNull()
    expect(screen.getByText('Until September 2026')).toBeInTheDocument()
  })

  it('fills an empty month', async () => {
    const fetchMock = mockFixedExpensesApi()
    renderFixedExpensesPage()

    await editCell('Water — March', '12,5')

    await expect.poll(() => callsWith(fetchMock, 'POST')).toHaveLength(1)
    const [path, init] = callsWith(fetchMock, 'POST')[0]
    expect(path).toBe('/fixed_expense_amounts')
    expect(bodyOf(init)).toEqual({
      fixedExpense: '/api/fixed_expenses/5',
      year: 2026,
      month: 3,
      amount: '12.50',
    })
  })

  it('corrects a filled month', async () => {
    const fetchMock = mockFixedExpensesApi(() => jsonResponse({}))
    renderFixedExpensesPage()

    await editCell('Water — June', '180')

    await expect.poll(() => callsWith(fetchMock, 'PATCH')).toHaveLength(1)
    const [path, init] = callsWith(fetchMock, 'PATCH')[0]
    expect(path).toBe('/fixed_expense_amounts/80')
    expect(bodyOf(init)).toEqual({ amount: '180.00' })
  })

  it('empties a month when its input is cleared', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFixedExpensesApi(
      () => new Response(null, { status: 204 }),
    )
    renderFixedExpensesPage()

    await user.click(
      await screen.findByRole('button', { name: 'Water — June' }),
    )
    await user.clear(screen.getByRole('textbox', { name: 'Water — June' }))
    await user.keyboard('{Enter}')

    await expect.poll(() => callsWith(fetchMock, 'DELETE')).toHaveLength(1)
    expect(callsWith(fetchMock, 'DELETE')[0][0]).toBe(
      '/fixed_expense_amounts/80',
    )
  })

  it('cancels an edit with Escape', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFixedExpensesApi()
    renderFixedExpensesPage()

    await user.click(
      await screen.findByRole('button', { name: 'Water — June' }),
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Water — June' }),
      '9{Escape}',
    )

    expect(
      await screen.findByRole('button', { name: 'Water — June' }),
    ).toHaveTextContent('€175.22')
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method)).toEqual([])
  })

  it('adds a line with an amount for the whole year', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFixedExpensesApi()
    renderFixedExpensesPage()

    const form = await addFormOf('My fixed expenses')
    await user.type(within(form).getByRole('textbox', { name: 'Label' }), 'Gym')
    await user.type(
      within(form).getByRole('textbox', { name: 'Amount (optional)' }),
      '30',
    )
    await user.click(within(form).getByRole('button', { name: 'Add' }))

    await expect.poll(() => callsWith(fetchMock, 'POST')).toHaveLength(1)
    const [path, init] = callsWith(fetchMock, 'POST')[0]
    expect(path).toBe('/fixed_expenses')
    expect(bodyOf(init)).toEqual({
      profile: '/api/profiles/1',
      startYear: 2026,
      label: 'Gym',
      initialAmount: { year: 2026, month: null, amount: '30.00' },
    })
  })

  it('adds a household line for one month, paid by one member', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFixedExpensesApi()
    renderFixedExpensesPage()

    const form = await addFormOf('Couple')
    await user.type(
      within(form).getByRole('textbox', { name: 'Label' }),
      'Water',
    )
    await user.type(
      within(form).getByRole('textbox', { name: 'Amount (optional)' }),
      '175,22',
    )
    await user.click(within(form).getByText('One month'))
    await user.click(within(form).getByRole('combobox', { name: 'Month' }))
    await user.click(await screen.findByRole('option', { name: 'June' }))
    await user.click(
      within(form).getByRole('combobox', { name: 'Split between' }),
    )
    await user.click(await screen.findByRole('option', { name: 'Partner' }))
    await user.click(within(form).getByRole('button', { name: 'Add' }))

    await expect.poll(() => callsWith(fetchMock, 'POST')).toHaveLength(1)
    expect(bodyOf(callsWith(fetchMock, 'POST')[0][1])).toEqual({
      household: '/api/households/1',
      startYear: 2026,
      label: 'Water',
      householdMember: '/api/household_members/2',
      initialAmount: { year: 2026, month: 6, amount: '175.22' },
    })
  })

  it('adds a line without amount', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFixedExpensesApi()
    renderFixedExpensesPage()

    const form = await addFormOf('My fixed expenses')
    await user.type(within(form).getByRole('textbox', { name: 'Label' }), 'Gym')
    await user.click(within(form).getByRole('button', { name: 'Add' }))

    await expect.poll(() => callsWith(fetchMock, 'POST')).toHaveLength(1)
    expect(bodyOf(callsWith(fetchMock, 'POST')[0][1])).not.toHaveProperty(
      'initialAmount',
    )
  })

  it('applies a month to the whole year', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFixedExpensesApi(() => jsonResponse({}))
    renderFixedExpensesPage()

    await openAction('Water', 'Apply to the year')
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Apply' }))

    await expect.poll(() => callsWith(fetchMock, 'POST')).toHaveLength(1)
    const [path, init] = callsWith(fetchMock, 'POST')[0]
    expect(path).toBe('/fixed_expenses/5/apply_to_year')
    expect(bodyOf(init)).toEqual({ year: 2026, month: 6 })
    await expect.poll(() => screen.queryByRole('dialog')).toBeNull()
  })

  it('deactivates a line after the picked month', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFixedExpensesApi(() => jsonResponse({}))
    renderFixedExpensesPage()

    await openAction('Car insurance', 'Deactivate')
    const dialog = await screen.findByRole('dialog')
    await user.click(
      within(dialog).getByRole('combobox', { name: 'Last month paid (2026)' }),
    )
    await user.click(await screen.findByRole('option', { name: 'March' }))
    await user.click(within(dialog).getByRole('button', { name: 'Deactivate' }))

    await expect.poll(() => callsWith(fetchMock, 'PATCH')).toHaveLength(1)
    const [path, init] = callsWith(fetchMock, 'PATCH')[0]
    expect(path).toBe('/fixed_expenses/4')
    expect(bodyOf(init)).toEqual({ endYear: 2026, endMonth: 3 })
  })

  it('reactivates a deactivated line', async () => {
    const fetchMock = mockFixedExpensesApi(() => jsonResponse({}))
    renderFixedExpensesPage()

    await openAction('Streaming', 'Reactivate')

    await expect.poll(() => callsWith(fetchMock, 'PATCH')).toHaveLength(1)
    const [path, init] = callsWith(fetchMock, 'PATCH')[0]
    expect(path).toBe('/fixed_expenses/6')
    expect(bodyOf(init)).toEqual({ endYear: null, endMonth: null })
  })

  it('deletes a line after confirmation', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFixedExpensesApi(
      () => new Response(null, { status: 204 }),
    )
    renderFixedExpensesPage()

    await openAction('Water', 'Delete')
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await expect.poll(() => callsWith(fetchMock, 'DELETE')).toHaveLength(1)
    expect(callsWith(fetchMock, 'DELETE')[0][0]).toBe('/fixed_expenses/5')
  })

  it('loads the previous year', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFixedExpensesApi()
    renderFixedExpensesPage()

    await screen.findByRole('button', { name: 'Water — June' })
    await user.click(screen.getByRole('button', { name: 'Previous year' }))

    expect(await screen.findByText('2025')).toBeInTheDocument()
    expect(
      await screen.findAllByText('No fixed expense for this year.'),
    ).toHaveLength(2)
    expect(callsWith(fetchMock, 'GET').map(([path]) => path)).toContain(
      '/profiles/1/fixed_expenses?year=2025',
    )
  })
})
