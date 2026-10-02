import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { ActiveProfileProvider } from '../features/profiles/ActiveProfileContext'

interface RenderPageOptions {
  /** Route pattern the page is mounted on, e.g. '/profiles/:id/edit' */
  path: string
  /** Initial URL, e.g. '/profiles/1/edit' */
  url: string
}

/**
 * Renders a page with the app providers. Every other route renders
 * "Navigated to <path>" so tests can assert on redirections.
 */
export function renderPage(page: ReactElement, { path, url }: RenderPageOptions) {
  return render(
    <MantineProvider>
      <ActiveProfileProvider>
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route path={path} element={page} />
            <Route path="*" element={<NavigatedTo />} />
          </Routes>
        </MemoryRouter>
      </ActiveProfileProvider>
    </MantineProvider>,
  )
}

function NavigatedTo() {
  const { pathname } = useLocation()
  return <p>Navigated to {pathname}</p>
}
