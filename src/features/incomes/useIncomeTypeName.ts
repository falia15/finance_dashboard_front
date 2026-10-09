import { useIncomeTypes } from './queries'

/** Name of an income type from its IRI (types are data: shown untranslated). */
export function useIncomeTypeName() {
  const { data: incomeTypes = [] } = useIncomeTypes()
  return (iri: string) =>
    incomeTypes.find((type) => type['@id'] === iri)?.name ?? ''
}
