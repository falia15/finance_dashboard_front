/** Local calendar date as `YYYY-MM-DD` (the API's date format). */
export function todayIsoDate(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/**
 * Formats an API date (`2026-09-25` or `2026-09-25T00:00:00+00:00`) as a
 * calendar date: only the date part is read, so the time zone can't shift it
 * to the previous day.
 */
export function formatIsoDate(value: string, language: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(year, month - 1, day))
}
