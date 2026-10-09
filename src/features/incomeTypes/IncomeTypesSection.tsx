import { useState } from 'react'
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  ColorSwatch,
  Group,
  Loader,
  Stack,
  Table,
  Text,
} from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { ApiError } from '#/api/client'
import { ConfirmModal } from '#/components/ConfirmModal'
import { notifyError } from '#/lib/notifications'
import type { IncomeType } from './api'
import { IncomeTypeFormModal } from './IncomeTypeFormModal'
import {
  useCreateIncomeType,
  useDeleteIncomeType,
  useIncomeTypes,
  useReorderIncomeTypes,
  useUpdateIncomeType,
} from './queries'

/** Income types list of the settings: add, reorder, edit, delete. */
export function IncomeTypesSection() {
  const { t } = useTranslation()
  const { data: types, isLoading, isError } = useIncomeTypes()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<IncomeType | null>(null)
  const [deleting, setDeleting] = useState<IncomeType | null>(null)
  const createIncomeType = useCreateIncomeType()
  const updateIncomeType = useUpdateIncomeType()
  const reorderIncomeTypes = useReorderIncomeTypes()
  const deleteIncomeType = useDeleteIncomeType()

  /** Swaps the type with its neighbour (`offset` -1: up, +1: down). */
  function move(index: number, offset: -1 | 1) {
    if (!types) return
    const order = types.map((type) => type['@id'])
    ;[order[index], order[index + offset]] = [
      order[index + offset],
      order[index],
    ]
    reorderIncomeTypes.mutate(order, {
      onError: () => notifyError(t('incomeTypes.saveError')),
    })
  }

  function handleDelete() {
    if (!deleting) return
    deleteIncomeType.mutate(deleting.id, {
      onSuccess: () => setDeleting(null),
      // 422: incomes still use the type
      onError: (error) =>
        notifyError(
          error instanceof ApiError && error.status === 422
            ? t('incomeTypes.deleteBlocked')
            : t('incomeTypes.deleteError'),
        ),
    })
  }

  return (
    <Card withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text c="dimmed">{t('incomeTypes.description')}</Text>
          <Button
            size="xs"
            onClick={() => setCreating(true)}
          >
            {t('incomeTypes.new')}
          </Button>
        </Group>

        {isLoading && <Loader />}

        {isError && (
          <Alert
            color="red"
            title={t('incomeTypes.loadError')}
          />
        )}

        {types && types.length > 0 && (
          <Table verticalSpacing="xs">
            <Table.Tbody>
              {types.map((type, index) => (
                <Table.Tr key={type.id}>
                  <Table.Td w={32}>
                    {type.color && (
                      <ColorSwatch
                        color={type.color}
                        size={16}
                      />
                    )}
                  </Table.Td>
                  <Table.Td>{type.name}</Table.Td>
                  <Table.Td>
                    <Group
                      gap="xs"
                      justify="flex-end"
                      wrap="nowrap"
                    >
                      <ActionIcon
                        variant="default"
                        size="sm"
                        aria-label={t('incomeTypes.moveUp', {
                          name: type.name,
                        })}
                        disabled={index === 0 || reorderIncomeTypes.isPending}
                        onClick={() => move(index, -1)}
                      >
                        ↑
                      </ActionIcon>
                      <ActionIcon
                        variant="default"
                        size="sm"
                        aria-label={t('incomeTypes.moveDown', {
                          name: type.name,
                        })}
                        disabled={
                          index === types.length - 1 ||
                          reorderIncomeTypes.isPending
                        }
                        onClick={() => move(index, 1)}
                      >
                        ↓
                      </ActionIcon>
                      <Button
                        variant="subtle"
                        size="compact-xs"
                        aria-label={`${t('common.edit')} ${type.name}`}
                        onClick={() => setEditing(type)}
                      >
                        {t('common.edit')}
                      </Button>
                      <Button
                        variant="subtle"
                        color="red"
                        size="compact-xs"
                        aria-label={`${t('common.delete')} ${type.name}`}
                        onClick={() => setDeleting(type)}
                      >
                        {t('common.delete')}
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Stack>

      <IncomeTypeFormModal
        opened={creating}
        onClose={() => setCreating(false)}
        title={t('incomeTypes.newTitle')}
        submitLabel={t('incomeTypes.create')}
        loading={createIncomeType.isPending}
        onSubmit={(input) =>
          createIncomeType.mutateAsync(input, {
            onError: () => notifyError(t('incomeTypes.saveError')),
          })
        }
      />

      <IncomeTypeFormModal
        opened={editing !== null}
        onClose={() => setEditing(null)}
        title={t('incomeTypes.editTitle')}
        submitLabel={t('incomeTypes.save')}
        initialValues={
          editing
            ? { name: editing.name, color: editing.color ?? null }
            : undefined
        }
        loading={updateIncomeType.isPending}
        onSubmit={(input) =>
          updateIncomeType.mutateAsync(
            { id: editing?.id ?? 0, input },
            { onError: () => notifyError(t('incomeTypes.saveError')) },
          )
        }
      />

      <ConfirmModal
        opened={deleting !== null}
        onClose={() => setDeleting(null)}
        title={t('incomeTypes.deleteTitle')}
        message={t('incomeTypes.deleteConfirm', { name: deleting?.name })}
        confirmLabel={t('common.delete')}
        loading={deleteIncomeType.isPending}
        onConfirm={handleDelete}
      />
    </Card>
  )
}
