import { NavLink } from '@mantine/core'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface AppNavbarProps {
  /** Called when a link is clicked, e.g. to close the navbar on mobile */
  onNavigate?: () => void
}

export function AppNavbar({ onNavigate }: AppNavbarProps) {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const links = [
    { to: '/dashboard', label: t('nav.dashboard') },
    { to: '/incomes', label: t('nav.incomes') },
    { to: '/fixed-expenses', label: t('nav.fixedExpenses') },
  ]

  return (
    <nav aria-label={t('nav.main')}>
      {links.map((link) => (
        <NavLink
          key={link.to}
          component={Link}
          to={link.to}
          label={link.label}
          active={pathname.startsWith(link.to)}
          onClick={onNavigate}
        />
      ))}
    </nav>
  )
}
