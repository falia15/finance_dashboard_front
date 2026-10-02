import { Badge, Group, Table, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { formatIsoDate } from '#/lib/dates'
import { useProfiles } from '#/features/profiles/queries'
import type { HouseholdMember } from './api'
import { DetachMemberButton } from './actions/DetachMemberButton'

interface MemberTableProps {
  members: HouseholdMember[]
  /** Shows the "Detach" button on current members other than the owner */
  canManage: boolean
}

export function MemberTable({ members, canManage }: MemberTableProps) {
  const { t, i18n } = useTranslation()
  const { data: profiles = [] } = useProfiles()

  function memberName(member: HouseholdMember) {
    if (member.externalLabel) return member.externalLabel
    return (
      profiles.find((profile) => profile['@id'] === member.profile)?.name ??
      t('households.unknownProfile')
    )
  }

  function memberPeriod(member: HouseholdMember) {
    const joinedAt = formatIsoDate(member.joinedAt, i18n.language)
    return member.leftAt
      ? t('households.members.period', {
          joinedAt,
          leftAt: formatIsoDate(member.leftAt, i18n.language),
        })
      : t('households.members.since', { joinedAt })
  }

  return (
    <Table>
      <Table.Tbody>
        {members.map((member) => (
          <Table.Tr key={member.id}>
            <Table.Td>
              <Group gap="xs">
                <Text size="sm">{memberName(member)}</Text>
                {member.isOwner && (
                  <Badge
                    size="sm"
                    variant="light"
                  >
                    {t('households.members.owner')}
                  </Badge>
                )}
                {member.externalLabel && (
                  <Badge
                    size="sm"
                    variant="light"
                    color="gray"
                  >
                    {t('households.members.external')}
                  </Badge>
                )}
              </Group>
            </Table.Td>
            <Table.Td>
              <Text
                size="sm"
                c="dimmed"
              >
                {memberPeriod(member)}
              </Text>
            </Table.Td>
            <Table.Td ta="right">
              {canManage && !member.isOwner && !member.leftAt && (
                <DetachMemberButton
                  member={member}
                  name={memberName(member)}
                />
              )}
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}
