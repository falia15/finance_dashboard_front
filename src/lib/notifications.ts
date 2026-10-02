import { notifications } from '@mantine/notifications'
import i18n from '#/i18n'

/** Red toast titled "Error", shown when a write to the API fails. */
export function notifyError(message: string) {
  notifications.show({ color: 'red', title: i18n.t('common.error'), message })
}
