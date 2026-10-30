import { useSearchParams } from 'react-router-dom'

/** `?year=` of the URL (kept on reload and history), current year by default. */
export function useYearParam() {
  const [searchParams, setSearchParams] = useSearchParams()
  const param = Number(searchParams.get('year'))
  const year =
    Number.isInteger(param) && param >= 2000 && param <= 2100
      ? param
      : new Date().getFullYear()

  function setYear(value: number) {
    setSearchParams((params) => {
      params.set('year', String(value))
      return params
    })
  }

  return [year, setYear] as const
}
