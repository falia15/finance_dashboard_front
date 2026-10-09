import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IncomesPage } from '#/features/incomes/IncomesPage'
import type { Household } from '#/features/households/api'
import type { Income, ProfileIncomeYear } from '#/features/incomes/api'
import { renderPage } from '#/test/render'
import { callsWith, jsonResponse, mockFetch } from '#/test/fetch'

const SALARY = '/api/income_types/1'
const MEAL_VOUCHERS = '/api/income_types/4'
const RENT = '/api/income_types/2'

const profiles = [
  {
    '@id': '/api/profiles/1',
    id: 1,
    name: 'Alice',
    color: null,
    createdAt: '2026-09-01T00:00:00+00:00',
  },
]

const incomeTypes = [
  { '@id': SALARY, id: 1, name: 'Salaire', sortOrder: 1 },
  { '@id': RENT, id: 2, name: 'Revenu locatif', sortOrder: 2 },
  { '@id': MEAL_VOUCHERS, id: 4, name: 'Ticket restaurant', sortOrder: 4 },
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

const householdIncomes: Income[] = [
  {
    '@id': '/api/incomes/42',
    id: 42,
    household: '/api/households/1',
    member: null,
    year: 2026,
    month: 3,
    type: RENT,
    amount: '45.01',
    appliedDivisor: 2,
  },
  {
    '@id': '/api/incomes/43',
    id: 43,
    household: '/api/households/1',
    member: '/api/household_members/2',
    year: 2026,
    month: 4,
    type: RENT,
    amount: '150.00',
    appliedDivisor: 2,
  },
]

function profileYear(year: number): ProfileIncomeYear {
  const months: ProfileIncomeYear['months'] = Array.from(
    { length: 12 },
    (_, index) => ({
      month: index + 1,
      incomes: [],
      householdShares: [],
      total: '0.00',
    }),
  )
  if (year === 2026) {
    months[0] = {
      month: 1,
      incomes: [
        { id: 12, type: SALARY, amount: '2073.00' },
        { id: 13, type: MEAL_VOUCHERS, amount: '160.00' },
      ],
      householdShares: [],
      total: '2233.00',
    }
    months[2] = {
      month: 3,
      incomes: [],
      householdShares: [
        {
          incomeId: 42,
          household: '/api/households/1',
          type: RENT,
          amount: '45.01',
          appliedDivisor: 2,
          member: null,
          share: '22.51',
        },
      ],
      total: '22.51',
    }
    months[3] = {
      month: 4,
      incomes: [],
      householdShares: [
        {
          incomeId: 43,
          household: '/api/households/1',
          type: RENT,
          amount: '150.00',
          appliedDivisor: 2,
          member: '/api/household_members/2',
          share: '0.00',
        },
      ],
      total: '0.00',
    }
  }
  const individual = year === 2026 ? '2233.00' : '0.00'
  const householdShare = year === 2026 ? '22.51' : '0.00'
  return {
    profileId: 1,
    year,
    months,
    totals: {
      individual,
      householdShare,
      total: year === 2026 ? '2255.51' : '0.00',
    },
  }
}

/**
 * Answers the GETs of the page, `write` answers the other calls.
 */
function mockIncomesApi(
  write: (method: string, path: string) => Response = () =>
    jsonResponse({}, 201),
) {
  return mockFetch(({ method, path }) => {
    if (method !== 'GET') return write(method, path)
    if (path === '/profiles')
      return jsonResponse({ member: profiles, totalItems: 1 })
    if (path === '/income_types')
      return jsonResponse({ member: incomeTypes, totalItems: 3 })
    if (path === '/households')
      return jsonResponse({ member: [household], totalItems: 1 })
    if (path.startsWith('/households/1/incomes'))
      return jsonResponse({
        member: path.endsWith('2026') ? householdIncomes : [],
        totalItems: 2,
      })
    const year = /^\/profiles\/1\/incomes\?year=(\d+)$/.exec(path)
    if (year) return jsonResponse(profileYear(Number(year[1])))
    return jsonResponse({}, 404)
  })
}

function renderIncomesPage(url = '/incomes?year=2026') {
  localStorage.setItem('activeProfileId', '1')
  return renderPage(<IncomesPage />, { path: '/incomes', url })
}

function bodyOf(init: RequestInit | undefined) {
  return JSON.parse(String(init?.body))
}

/** The add form under the table of the given section ("My income", household name). */
async function addFormOf(sectionTitle: string) {
  const title = await screen.findByRole('heading', { name: sectionTitle })
  const section = title.closest('.mantine-Stack-root') as HTMLElement
  const forms = section.querySelectorAll('form')
  return forms[forms.length - 1] as HTMLElement
}

async function pick(form: HTMLElement, label: string, option: string) {
  const user = userEvent.setup()
  await user.click(within(form).getByRole('combobox', { name: label }))
  await user.click(await screen.findByRole('option', { name: option }))
}

async function fillAndAdd(
  form: HTMLElement,
  { month, type, amount }: { month: string; type: string; amount: string },
) {
  const user = userEvent.setup()
  await pick(form, 'Month', month)
  await pick(form, 'Type', type)
  await user.type(within(form).getByRole('textbox', { name: 'Amount' }), amount)
  await user.click(within(form).getByRole('button', { name: 'Add' }))
}

describe('IncomesPage', () => {
  it("shows the profile's incomes and the annual total from the API", async () => {
    mockIncomesApi()
    renderIncomesPage()

    expect(await screen.findByText('€2,073.00')).toBeInTheDocument()
    expect(screen.getByText('€160.00')).toBeInTheDocument()
    expect(
      await screen.findByRole('cell', { name: 'Ticket restaurant' }),
    ).toBeInTheDocument()
    // Profile table footer and annual total come from `totals`
    expect(screen.getByText('€2,233.00')).toBeInTheDocument()
    expect(screen.getByText(/€2,255\.51/)).toBeInTheDocument()
  })

  it('shows the household rows with the share computed by the API', async () => {
    mockIncomesApi()
    renderIncomesPage()

    const card = (await screen.findByRole('heading', { name: 'Couple' }))
      .parentElement as HTMLElement
    expect(await within(card).findByText('€45.01')).toBeInTheDocument()
    expect(within(card).getAllByText('€22.51')).toHaveLength(2) // row + footer
    expect(within(card).getByText('Equal shares (÷2)')).toBeInTheDocument()
    expect(
      within(card).getByRole('cell', { name: 'Partner' }),
    ).toBeInTheDocument()
  })

  it('adds an income then reloads the year', async () => {
    const fetchMock = mockIncomesApi()
    renderIncomesPage()

    const form = await addFormOf('My income')
    await fillAndAdd(form, {
      month: 'February',
      type: 'Salaire',
      amount: '1798,85',
    })

    await expect.poll(() => callsWith(fetchMock, 'POST')).toHaveLength(1)
    const [path, init] = callsWith(fetchMock, 'POST')[0]
    expect(path).toBe('/incomes')
    expect(bodyOf(init)).toEqual({
      profile: '/api/profiles/1',
      year: 2026,
      month: 2,
      type: SALARY,
      amount: '1798.85',
    })
    await expect
      .poll(
        () =>
          callsWith(fetchMock, 'GET').filter(
            ([path]) => path === '/profiles/1/incomes?year=2026',
          ).length,
      )
      .toBe(2)
  })

  it('adds a household income assigned to one member', async () => {
    const fetchMock = mockIncomesApi()
    renderIncomesPage()

    const form = await addFormOf('Couple')
    await pick(form, 'Split between', 'Partner')
    await fillAndAdd(form, {
      month: 'May',
      type: 'Revenu locatif',
      amount: '600',
    })

    await expect.poll(() => callsWith(fetchMock, 'POST')).toHaveLength(1)
    expect(bodyOf(callsWith(fetchMock, 'POST')[0][1])).toEqual({
      household: '/api/households/1',
      year: 2026,
      month: 5,
      type: RENT,
      amount: '600.00',
      member: '/api/household_members/2',
    })
  })

  it('shows a duplicate income on the type field', async () => {
    mockIncomesApi(() =>
      jsonResponse(
        {
          violations: [
            { propertyPath: 'type', message: 'Already an income of this type' },
          ],
        },
        422,
      ),
    )
    renderIncomesPage()

    const form = await addFormOf('My income')
    await fillAndAdd(form, {
      month: 'January',
      type: 'Salaire',
      amount: '100',
    })

    expect(
      await within(form).findByText(
        'An income of this type already exists for this month',
      ),
    ).toBeInTheDocument()
  })

  it('deletes an income after confirmation', async () => {
    const user = userEvent.setup()
    const fetchMock = mockIncomesApi(() => new Response(null, { status: 204 }))
    renderIncomesPage()

    await user.click(
      await screen.findByRole('button', { name: 'Delete Salaire — January' }),
    )
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await expect.poll(() => callsWith(fetchMock, 'DELETE')).toHaveLength(1)
    expect(callsWith(fetchMock, 'DELETE')[0][0]).toBe('/incomes/12')
  })

  it('edits an income in a modal', async () => {
    const user = userEvent.setup()
    const fetchMock = mockIncomesApi(() => jsonResponse({}))
    renderIncomesPage()

    await user.click(
      await screen.findByRole('button', { name: 'Edit Salaire — January' }),
    )
    const dialog = await screen.findByRole('dialog')
    const amount = within(dialog).getByRole('textbox', { name: 'Amount' })
    await user.clear(amount)
    await user.type(amount, '2100')
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))

    await expect.poll(() => callsWith(fetchMock, 'PATCH')).toHaveLength(1)
    const [path, init] = callsWith(fetchMock, 'PATCH')[0]
    expect(path).toBe('/incomes/12')
    expect(bodyOf(init)).toEqual({ month: 1, type: SALARY, amount: '2100.00' })
    await expect.poll(() => screen.queryByRole('dialog')).toBeNull()
  })

  it('loads the previous year', async () => {
    const user = userEvent.setup()
    const fetchMock = mockIncomesApi()
    renderIncomesPage()

    await screen.findByText('€2,073.00')
    await user.click(screen.getByRole('button', { name: 'Previous year' }))

    expect(await screen.findByText('2025')).toBeInTheDocument()
    expect(
      await screen.findByText('No income entered for this year.'),
    ).toBeInTheDocument()
    expect(callsWith(fetchMock, 'GET').map(([path]) => path)).toContain(
      '/profiles/1/incomes?year=2025',
    )
  })

  it('defaults to the current year', async () => {
    const fetchMock = mockIncomesApi()
    renderIncomesPage('/incomes')

    const year = new Date().getFullYear()
    expect(await screen.findByText(String(year))).toBeInTheDocument()
    await expect
      .poll(() => callsWith(fetchMock, 'GET').map(([path]) => path))
      .toContain(`/profiles/1/incomes?year=${year}`)
  })

  it('shows an alert when the API fails', async () => {
    mockFetch(({ path }) =>
      path === '/profiles'
        ? jsonResponse({ member: profiles, totalItems: 1 })
        : jsonResponse({}, 500),
    )
    renderIncomesPage()

    expect(await screen.findByText('Unable to load income')).toBeInTheDocument()
  })
})
