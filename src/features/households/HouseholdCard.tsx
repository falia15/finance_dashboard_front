import { Card, Group, Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useCurrentProfile } from '../profiles/useCurrentProfile'
import type { Household } from './api'
import { AddMemberButton } from './actions/AddMemberButton'
import { DeleteHouseholdButton } from './actions/DeleteHouseholdButton'
import { RenameHouseholdButton } from './actions/RenameHouseholdButton'
import { MemberTable } from './MemberTable'

export function HouseholdCard({ household }: { household: Household }) {
  const { t } = useTranslation()
  const activeProfile = useCurrentProfile()

  const activeMembers = household.members.filter((member) => !member.leftAt)
  const pastMembers = household.members.filter((member) => member.leftAt)
  // Only the owner manages the household (the API answers 403 otherwise)
  const isOwner = activeMembers.some((member) => member.isOwner && member.profile === activeProfile?.['@id'])

  return (
    <Card withBorder padding="lg" radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>{household.name}</Title>
          {isOwner && (
            <Group gap="xs">
              <RenameHouseholdButton household={household} />
              <DeleteHouseholdButton household={household} />
            </Group>
          )}
        </Group>

        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={500}>{t('households.members.active', { count: activeMembers.length })}</Text>
            {isOwner && <AddMemberButton household={household} />}
          </Group>
          <MemberTable members={activeMembers} canManage={isOwner} />
        </Stack>

        {pastMembers.length > 0 && (
          <Stack gap="xs">
            <Text fw={500} c="dimmed">
              {t('households.members.past')}
            </Text>
            <MemberTable members={pastMembers} canManage={false} />
          </Stack>
        )}
      </Stack>
    </Card>
  )
}
