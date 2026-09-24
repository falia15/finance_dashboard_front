import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@mantine/core'
import { AppHeader } from './components/AppHeader'
import { useActiveProfile } from './features/profiles/ActiveProfileContext'
import { ProfileSelectPage } from './features/profiles/ProfileSelectPage'
import { ProfileFormPage } from './features/profiles/ProfileFormPage'
import { Dashboard } from './pages/Dashboard'
import { Settings } from './pages/Settings'

function RootRedirect() {
  const { activeProfileId } = useActiveProfile()
  return <Navigate to={activeProfileId !== null ? '/dashboard' : '/profiles'} replace />
}

function RequireActiveProfile({ children }: { children: ReactNode }) {
  const { activeProfileId } = useActiveProfile()
  if (activeProfileId === null) {
    return <Navigate to="/profiles" replace />
  }
  return children
}

function App() {
  return (
    <AppShell header={{ height: 50 }}>
      <AppShell.Header>
        <AppHeader />
      </AppShell.Header>
      <AppShell.Main>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/profiles" element={<ProfileSelectPage />} />
          <Route path="/profiles/new" element={<ProfileFormPage />} />
          <Route path="/profiles/:id/edit" element={<ProfileFormPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireActiveProfile>
                <Dashboard />
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
