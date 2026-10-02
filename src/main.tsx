import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'
import './i18n'
import App from './App.tsx'
import { ActiveProfileProvider } from './features/profiles/ActiveProfileContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="auto">
      <Notifications />
      <ActiveProfileProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ActiveProfileProvider>
    </MantineProvider>
  </StrictMode>,
)
