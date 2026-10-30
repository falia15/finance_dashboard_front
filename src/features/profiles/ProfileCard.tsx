import {
  Avatar,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { Profile } from './api'

interface ProfileCardProps {
  profile: Profile
  /** The last profile cannot be deleted */
  canDelete: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

export function ProfileCard({
  profile,
  canDelete,
  onSelect,
  onEdit,
  onDelete,
}: ProfileCardProps) {
  const { t } = useTranslation()

  return (
    <Card
      withBorder
      padding="lg"
      radius="md"
    >
      <Stack
        align="center"
        gap="sm"
      >
        <Avatar
          size="lg"
          radius="xl"
          variant="filled"
          color={profile.color ?? undefined}
          autoContrast
          style={{ cursor: 'pointer' }}
          onClick={onSelect}
        >
          {profile.name.slice(0, 2).toUpperCase()}
        </Avatar>
        <Text
          fw={500}
          style={{ cursor: 'pointer' }}
          onClick={onSelect}
        >
          {profile.name}
        </Text>
        <Group gap="xs">
          <Button
            size="xs"
            variant="subtle"
            onClick={onEdit}
          >
            {t('common.edit')}
          </Button>
          <Tooltip
            label={t('profiles.select.cannotDeleteLast')}
            disabled={canDelete}
          >
            <Button
              size="xs"
              variant="subtle"
              color="red"
              disabled={!canDelete}
              onClick={onDelete}
            >
              {t('common.delete')}
            </Button>
          </Tooltip>
        </Group>
      </Stack>
    </Card>
  )
}
