import { useState } from 'react'
import { Badge, Button, Card, Group, Stack, Table, Text, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../api/client'
import type { Profile } from '../profiles/api'
import type { Household, HouseholdMember } from './api'
import { ConfirmModal } from './ConfirmModal'
import { formatIsoDate, todayIsoDate } from './dates'
import { addExternalMember, deleteHousehold, detachMember, renameHousehold } from './queries'
import { TextPromptModal } from './TextPromptModal'

interface HouseholdCardProps {
  household: Household
  /** IRI of the active profile, e.g. '/api/profiles/1' */
  activeProfileIri: string
  profiles: Profile[]
  /** Reloads the households list, called after each write */
  onChanged: () => Promise<void>
}

export function HouseholdCard({ household, activeProfileIri, profiles, onChanged }: HouseholdCardProps) {
  const { t, i18n } = useTranslation()

  const [renameOpened, setRenameOpened] = useState(false)
  const [addMemberOpened, setAddMemberOpened] = useState(false)
  const [deleteOpened, setDeleteOpened] = useState(false)
  const [memberToDetach, setMemberToDetach] = useState<HouseholdMember | null>(null)
  // A single modal is open at a time, so one flag covers them all
  const [isSaving, setIsSaving] = useState(false)

  const activeMembers = household.members.filter((member) => !member.leftAt)
  const pastMembers = household.members.filter((member) => member.leftAt)
  // Only the owner manages the household (the API answers 403 otherwise)
  const isOwner = activeMembers.some((member) => member.isOwner && member.profile === activeProfileIri)

  function memberName(member: HouseholdMember) {
    if (member.externalLabel) return member.externalLabel
    return profiles.find((profile) => profile['@id'] === member.profile)?.name ?? t('households.unknownProfile')
  }

  function showError(message: string) {
    notifications.show({ color: 'red', title: t('common.error'), message })
  }

  /** Runs a write then reloads the list, keeping the modal's button in a loading state meanwhile. */
  async function save(write: () => Promise<unknown>) {
    setIsSaving(true)
    try {
      await write()
      await onChanged()
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRename(name: string) {
    try {
      await save(() => renameHousehold(household.id, name))
    } catch (error) {
      showError(t('households.saveError'))
      throw error
    }
  }

  async function handleAddMember(externalLabel: string) {
    try {
      await save(() => addExternalMember(household.id, externalLabel))
    } catch (error) {
      showError(t('households.members.addError'))
      throw error
    }
  }

  async function handleConfirmDetach() {
    if (!memberToDetach) return
    try {
      await save(() => detachMember(memberToDetach.id, todayIsoDate()))
      setMemberToDetach(null)
    } catch {
      showError(t('households.members.detachError'))
    }
  }

  async function handleConfirmDelete() {
    try {
      await save(() => deleteHousehold(household.id))
      setDeleteOpened(false)
    } catch (error) {
      // 422: incomes/expenses/fixed expenses are still attached to the household
      showError(
        error instanceof ApiError && error.status === 422 ? t('households.deleteBlocked') : t('households.deleteError'),
      )
    }
  }

  function renderMemberRow(member: HouseholdMember) {
    return (
      <Table.Tr key={member.id}>
        <Table.Td>
          <Group gap="xs">
            <Text size="sm">{memberName(member)}</Text>
            {member.isOwner && (
              <Badge size="sm" variant="light">
                {t('households.members.owner')}
              </Badge>
            )}
            {member.externalLabel && (
              <Badge size="sm" variant="light" color="gray">
                {t('households.members.external')}
              </Badge>
            )}
          </Group>
        </Table.Td>
        <Table.Td>
          <Text size="sm" c="dimmed">
            {member.leftAt
              ? t('households.members.period', {
                  joinedAt: formatIsoDate(member.joinedAt, i18n.language),
                  leftAt: formatIsoDate(member.leftAt, i18n.language),
                })
              : t('households.members.since', { joinedAt: formatIsoDate(member.joinedAt, i18n.language) })}
          </Text>
        </Table.Td>
        <Table.Td ta="right">
          {isOwner && !member.isOwner && !member.leftAt && (
            <Button size="xs" variant="subtle" color="red" onClick={() => setMemberToDetach(member)}>
              {t('households.members.detach')}
            </Button>
          )}
        </Table.Td>
      </Table.Tr>
    )
  }

  return (
    <Card withBorder padding="lg" radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>{household.name}</Title>
          {isOwner && (
            <Group gap="xs">
              <Button size="xs" variant="subtle" onClick={() => setRenameOpened(true)}>
                {t('households.rename')}
              </Button>
              <Button size="xs" variant="subtle" color="red" onClick={() => setDeleteOpened(true)}>
                {t('common.delete')}
              </Button>
            </Group>
          )}
        </Group>

        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={500}>{t('households.members.active', { count: activeMembers.length })}</Text>
            {isOwner && (
              <Button size="xs" variant="light" onClick={() => setAddMemberOpened(true)}>
                {t('households.members.add')}
              </Button>
            )}
          </Group>
          <Table>
            <Table.Tbody>{activeMembers.map(renderMemberRow)}</Table.Tbody>
          </Table>
        </Stack>

        {pastMembers.length > 0 && (
          <Stack gap="xs">
            <Text fw={500} c="dimmed">
              {t('households.members.past')}
            </Text>
            <Table>
              <Table.Tbody>{pastMembers.map(renderMemberRow)}</Table.Tbody>
            </Table>
          </Stack>
        )}
      </Stack>

      <TextPromptModal
        opened={renameOpened}
        onClose={() => setRenameOpened(false)}
        title={t('households.renameTitle')}
        label={t('households.name')}
        requiredMessage={t('households.nameRequired')}
        submitLabel={t('households.save')}
        initialValue={household.name}
        loading={isSaving}
        onSubmit={handleRename}
      />

      <TextPromptModal
        opened={addMemberOpened}
        onClose={() => setAddMemberOpened(false)}
        title={t('households.members.addTitle')}
        label={t('households.members.label')}
        placeholder={t('households.members.labelPlaceholder')}
        requiredMessage={t('households.members.labelRequired')}
        submitLabel={t('households.members.addSubmit')}
        loading={isSaving}
        onSubmit={handleAddMember}
      />

      <ConfirmModal
        opened={memberToDetach !== null}
        onClose={() => setMemberToDetach(null)}
        title={t('households.members.detachTitle')}
        message={t('households.members.detachConfirm', { name: memberToDetach ? memberName(memberToDetach) : '' })}
        confirmLabel={t('households.members.detach')}
        loading={isSaving}
        onConfirm={handleConfirmDetach}
      />

      <ConfirmModal
        opened={deleteOpened}
        onClose={() => setDeleteOpened(false)}
        title={t('households.deleteTitle')}
        message={t('households.deleteConfirm', { name: household.name })}
        confirmLabel={t('common.delete')}
        loading={isSaving}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  )
}
