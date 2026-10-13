import { useForm } from 'react-hook-form'
import { Button } from '@ops/components/ui/Button'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { useSectionSave } from '@ops/features/employees/hooks/useSectionSave'
import { saveEmployeeBank } from '@ops/lib/services/employeeService'
import type { Employee, EmployeeBank } from '@ops/types/domain'

export function EditBankInfoForm({
  employee,
  onSaved,
  onCancel,
}: {
  employee: Employee
  onSaved: () => void
  onCancel: () => void
}) {
  const save = useSectionSave(onSaved)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<EmployeeBank>({ defaultValues: employee.bank })

  async function onSubmit(values: EmployeeBank) {
    await save(() => saveEmployeeBank(employee.id, values), 'Bank/payment information updated')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3">
      <FormField label="Bank name">
        <Input {...register('bankName')} />
      </FormField>
      <FormField label="Account number">
        <Input {...register('accountNumber')} />
      </FormField>

      <div className="col-span-1 flex justify-end gap-2 sm:col-span-2 md:col-span-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}
