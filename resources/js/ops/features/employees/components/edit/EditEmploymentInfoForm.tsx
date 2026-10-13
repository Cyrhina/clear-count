import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@ops/components/ui/Button'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { useBranches } from '@ops/features/branches/hooks/useBranches'
import { DepartmentSelect } from '@ops/features/employees/components/DepartmentSelect'
import { Select } from '@ops/components/ui/Select'
import { useSectionSave } from '@ops/features/employees/hooks/useSectionSave'
import { saveEmployeeEmployment, type UpdateEmploymentInfoInput } from '@ops/lib/services/employeeService'
import type { Employee } from '@ops/types/domain'

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'regular', label: 'Regular' },
  { value: 'probationary', label: 'Probationary' },
  { value: 'contractual', label: 'Contractual' },
  { value: 'part_time', label: 'Part-time' },
]

const CATEGORY_OPTIONS = [
  { value: 'regular', label: 'Regular Employee' },
  { value: 'admin_staff', label: 'Admin Staff' },
  { value: 'production_worker', label: 'Production Worker' },
  { value: 'field_worker', label: 'Field Worker' },
  { value: 'contractor', label: 'Contractor' },
]

export function EditEmploymentInfoForm({
  employee,
  onSaved,
  onCancel,
}: {
  employee: Employee
  onSaved: () => void
  onCancel: () => void
}) {
  const save = useSectionSave(onSaved)
  const { branches } = useBranches()
  // Moving to another branch means picking one of that branch's departments.
  const [branchId, setBranchId] = useState(employee.branchId)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateEmploymentInfoInput>({
    defaultValues: {
      position: employee.employment.position,
      department: employee.employment.department,
      employmentType: employee.employment.employmentType,
      dateHired: employee.employment.dateHired,
      category: employee.employment.category,
    },
  })

  async function onSubmit(values: UpdateEmploymentInfoInput) {
    await save(() => saveEmployeeEmployment(employee.id, values, branchId !== employee.branchId ? { branchId } : {}), 'Employment information updated')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3">
      <FormField label="Position" required error={errors.position?.message}>
        <Input {...register('position', { required: 'Required' })} />
      </FormField>
      <FormField label="Branch">
        <Select
          value={branchId}
          onValueChange={(v) => {
            setBranchId(v)
            setValue('department', '')
          }}
          options={branches.map((b) => ({ value: b.id, label: b.name }))}
        />
      </FormField>
      <FormField label="Department" required error={errors.department?.message}>
        <DepartmentSelect branchId={branchId} value={watch('department')} onChange={(v) => setValue('department', v, { shouldValidate: true })} />
      </FormField>
      <FormField label="Employment type">
        <Select
          value={watch('employmentType')}
          onValueChange={(v) => setValue('employmentType', v as UpdateEmploymentInfoInput['employmentType'])}
          options={EMPLOYMENT_TYPE_OPTIONS}
        />
      </FormField>
      <FormField label="Date hired">
        <Input type="date" {...register('dateHired')} />
      </FormField>
      <FormField label="Employee category" hint="Used only to suggest Payroll Group assignment — never restricts it.">
        <Select
          value={watch('category')}
          onValueChange={(v) => setValue('category', v as UpdateEmploymentInfoInput['category'])}
          options={CATEGORY_OPTIONS}
        />
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
