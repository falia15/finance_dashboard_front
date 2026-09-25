import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

interface ConfirmModalProps {
  opened: boolean
  onClose: () => void
  title: string
  message: string
  confirmLabel: string
  loading?: boolean
  onConfirm: () => void
}

export function ConfirmModal({ opened, onClose, title, message, confirmLabel, loading, onConfirm }: ConfirmModalProps) {
  const { t } = useTranslation()

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <Stack gap="md">
        <Text>{message}</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button color="red" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
