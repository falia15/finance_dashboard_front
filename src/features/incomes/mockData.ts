// TEMPORAIRE — données en dur pour maquetter la page : les revenus du profil
// et ceux du foyer, sur une année. À remplacer par les types de `api.ts` et
// les hooks de `queries.ts` (étapes 6 et 8).

export interface MockIncomeType {
  '@id': string
  name: string
}

export interface MockHouseholdMember {
  '@id': string
  /** Profile name or `externalLabel`. */
  name: string
}

/** An individual income row of the active profile. */
export interface MockIncome {
  id: number
  month: number
  type: string
  amount: string
}

/** A household income row, as listed for the household. */
export interface MockHouseholdIncome {
  id: number
  month: number
  type: string
  amount: string
  appliedDivisor: number
  /** Member receiving the whole income, null = split equally. */
  member: string | null
}

export const mockIncomeTypes: MockIncomeType[] = [
  { '@id': '/api/income_types/1', name: 'Salaire' },
  { '@id': '/api/income_types/2', name: 'Revenu locatif' },
  { '@id': '/api/income_types/3', name: 'CAF' },
  { '@id': '/api/income_types/4', name: 'Ticket restaurant' },
  { '@id': '/api/income_types/5', name: 'Aide familiale' },
]

const SALARY = '/api/income_types/1'
const RENT = '/api/income_types/2'
const CAF = '/api/income_types/3'
const MEAL_VOUCHERS = '/api/income_types/4'
const FAMILY_SUPPORT = '/api/income_types/5'

export const mockHousehold = {
  '@id': '/api/households/1',
  name: 'Couple de Mathilde',
  members: [
    { '@id': '/api/household_members/1', name: 'Mathilde' },
    { '@id': '/api/household_members/2', name: 'Conjoint' },
  ] satisfies MockHouseholdMember[],
}

const ME = '/api/household_members/1'
const PARTNER = '/api/household_members/2'

function rent(id: number, month: number): MockHouseholdIncome {
  return { id, month, type: RENT, amount: '600.00', appliedDivisor: 2, member: null }
}

export const mockHouseholdIncomes: MockHouseholdIncome[] = [
  rent(101, 1),
  rent(102, 2),
  rent(103, 3),
  { id: 120, month: 3, type: FAMILY_SUPPORT, amount: '45.01', appliedDivisor: 2, member: ME },
  rent(104, 4),
  { id: 121, month: 4, type: CAF, amount: '120.00', appliedDivisor: 2, member: PARTNER },
  rent(105, 5),
  rent(106, 6),
  rent(107, 7),
  rent(108, 8),
  rent(109, 9),
]

/** The active profile's share: all of it if assigned to them, none if assigned to someone else. */
export function shareOf(income: MockHouseholdIncome): string {
  if (income.member === null) {
    return (Number(income.amount) / income.appliedDivisor).toFixed(2)
  }

  return income.member === ME ? income.amount : '0.00'
}

function salary(id: number, month: number, amount: string): MockIncome {
  return { id, month, type: SALARY, amount }
}

function mealVouchers(id: number, month: number): MockIncome {
  return { id, month, type: MEAL_VOUCHERS, amount: '120.00' }
}

export const mockIncomes: MockIncome[] = [
  salary(1, 1, '2073.00'),
  mealVouchers(2, 1),
  salary(3, 2, '1798.85'),
  mealVouchers(4, 2),
  salary(5, 3, '2073.00'),
  mealVouchers(6, 3),
  salary(7, 4, '2073.00'),
  mealVouchers(8, 4),
  salary(9, 5, '2150.40'),
  salary(11, 6, '2073.00'),
  salary(13, 7, '2890.12'),
  salary(15, 8, '2073.00'),
  salary(16, 9, '2073.00'),
]

export function sum(values: string[]): string {
  return values.reduce((total, value) => total + Number(value), 0).toFixed(2)
}

export function incomeTypeName(iri: string): string {
  return mockIncomeTypes.find((type) => type['@id'] === iri)?.name ?? iri
}

export function memberName(iri: string): string {
  return mockHousehold.members.find((member) => member['@id'] === iri)?.name ?? iri
}
