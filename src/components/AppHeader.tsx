import { Avatar, Group, Menu, SegmentedControl, UnstyledButton } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Language } from '../i18n'
import { useActiveProfile } from '../features/profiles/ActiveProfileContext'
import { useProfiles } from '../features/profiles/queries'

export function AppHeader() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { activeProfileId, setActiveProfileId } = useActiveProfile()
  const { data } = useProfiles()
  const activeProfile = data?.member.find((profile) => profile.id === activeProfileId)

  function handleChangeProfile() {
    setActiveProfileId(null)
    navigate('/profiles')
  }

  return (
    <Group h="100%" px="md" justify="flex-end" gap="sm">
      <SegmentedControl
        size="xs"
        aria-label={t('nav.language')}
        value={i18n.resolvedLanguage ?? 'en'}
        onChange={(language) => void i18n.changeLanguage(language as Language)}
        data={[
          { value: 'en', label: 'EN' },
          { value: 'fr', label: 'FR' },
        ]}
      />
      {activeProfile && (
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <UnstyledButton aria-label={t('nav.profileMenu')}>
              <Avatar
                size="sm"
                radius="xl"
                style={{ backgroundColor: activeProfile.color ?? undefined, color: '#fff' }}
              >
                {activeProfile.name.slice(0, 2).toUpperCase()}
              </Avatar>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{activeProfile.name}</Menu.Label>
            <Menu.Item onClick={handleChangeProfile}>{t('nav.changeProfile')}</Menu.Item>
            <Menu.Item onClick={() => navigate('/settings')}>{t('nav.settings')}</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
    </Group>
  )
}
