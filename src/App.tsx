import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { AppHeader } from './components/AppHeader'
import { AppNavbar } from './components/AppNavbar'
import { useActiveProfile } from './features/profiles/ActiveProfileContext'
import { ProfileSelectPage } from './features/profiles/ProfileSelectPage'
import { ProfileFormPage } from './features/profiles/ProfileFormPage'
import { HouseholdsPage } from './features/households/HouseholdsPage'
import { IncomesPage } from './features/incomes/IncomesPage'
import { FixedExpensesPage } from './features/fixedExpenses/FixedExpensesPage'
import { Dashboard } from './pages/Dashboard'
import { Settings } from './pages/Settings'

function RootRedirect() {
  const { activeProfileId } = useActiveProfile()
  return (
    <Navigate
      to={activeProfileId !== null ? '/dashboard' : '/profiles'}
      replace
    />
  )
}

function RequireActiveProfile({ children }: { children: ReactNode }) {
  const { activeProfileId } = useActiveProfile()
  if (activeProfileId === null) {
    return (
      <Navigate
        to="/profiles"
        replace
      />
    )
  }
  return children
}

function App() {
  const { activeProfileId } = useActiveProfile()
  const [navbarOpened, { toggle: toggleNavbar, close: closeNavbar }] =
    useDisclosure()
  // No navigation before a profile is picked (profile selection screens)
  const hasNavbar = activeProfileId !== null

  return (
    <AppShell
      header={{ height: 50 }}
      navbar={
        hasNavbar
          ? {
              width: 220,
              breakpoint: 'sm',
              collapsed: { mobile: !navbarOpened },
            }
          : undefined
      }
    >
      <AppShell.Header>
        <AppHeader
          navbarOpened={hasNavbar ? navbarOpened : undefined}
          onToggleNavbar={toggleNavbar}
        />
      </AppShell.Header>
      {hasNavbar && (
        <AppShell.Navbar p="xs">
          <AppNavbar onNavigate={closeNavbar} />
        </AppShell.Navbar>
      )}
      <AppShell.Main>
        <Routes>
          <Route
            path="/"
            element={<RootRedirect />}
          />
          <Route
            path="/profiles"
            element={<ProfileSelectPage />}
          />
          <Route
            path="/profiles/new"
            element={<ProfileFormPage />}
          />
          <Route
            path="/profiles/:id/edit"
            element={<ProfileFormPage />}
          />
          <Route
            path="/dashboard"
            element={
              <RequireActiveProfile>
                <Dashboard />
              </RequireActiveProfile>
            }
          />
          <Route
            path="/incomes"
            element={
              <RequireActiveProfile>
                <IncomesPage />
              </RequireActiveProfile>
            }
          />
          <Route
            path="/fixed-expenses"
            element={
              <RequireActiveProfile>
                <FixedExpensesPage />
              </RequireActiveProfile>
            }
          />
          <Route
            path="/households"
            element={
              <RequireActiveProfile>
                <HouseholdsPage />
              </RequireActiveProfile>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireActiveProfile>
                <Settings />
              </RequireActiveProfile>
            }
          />
        </Routes>
      </AppShell.Main>
    </AppShell>
  )
}

export default App
