import type { ReactNode } from 'react'
import { Button, Group, Select } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { formatMonth } from '#/lib/dates'
import { MoneyInput } from './Money'
import { mockIncomeTypes } from './mockData'

interface IncomeFormProps {
  /** Extra fields before the submit button, e.g. the household split. */
  children?: ReactNode
}

/** Add form shared by the profile and household income tables. */
export function IncomeForm({ children }: IncomeFormProps) {
  const { t, i18n } = useTranslation()

  const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1),
    label: formatMonth(index + 1, i18n.language),
  }))
  const typeOptions = mockIncomeTypes.map((type) => ({
    value: type['@id'],
    label: type.name,
  }))

  return (
    // TODO (étape 10) : useForm + POST /incomes
    <form onSubmit={(event) => event.preventDefault()}>
      <Group
        align="flex-end"
        gap="sm"
      >
        <Select
          label={t('incomes.form.month')}
          data={monthOptions}
          defaultValue="10"
          w={150}
        />
        <Select
          label={t('incomes.form.type')}
          data={typeOptions}
          flex={1}
          miw={180}
        />
        <MoneyInput
          label={t('incomes.form.amount')}
          w={140}
        />
        {children}
        <Button type="submit">{t('incomes.form.add')}</Button>
      </Group>
    </form>
  )
}
