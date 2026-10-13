import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@ops/components/ui/Button'
import { Checkbox } from '@ops/components/ui/Checkbox'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useToast } from '@ops/components/ui/Toast'
import type { BranchRecord } from '@ops/features/branches/types'
import { apiErrorMessage, fieldErrors } from '@ops/lib/api/http'
import { copyBranchDepartments } from '@ops/lib/services/branchDepartmentService'
import { createBranch } from '@ops/lib/services/branchService'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  code: z.string().optional(),
  isHeadOffice: z.boolean(),
  address: z.string().optional(),
  city: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.union([z.literal(''), z.string().email('Enter a valid email')]).optional(),
  openedDate: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const DEFAULTS: FormValues = { name: '', code: '', isHeadOffice: false, address: '', city: '', contactNumber: '', email: '', openedDate: '' }

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="border-b border-border pb-1.5">
      <p className="text-sm font-semibold">{title}</p>
    </div>
  )
}

/** Add Branch — details, contact info, and optionally the department list of another branch. Employees are assigned from the Employees module. */
export function AddBranchDialog({ branches, onCreated }: { branches: BranchRecord[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [copyFrom, setCopyFrom] = useState('')
  const { notify } = useToast()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: DEFAULTS })

  function close(next: boolean) {
    setOpen(next)
    if (!next) {
      reset(DEFAULTS)
      setCopyFrom('')
    }
  }

  async function onSubmit(values: FormValues) {
    const clean = (v?: string) => (v?.trim() ? v.trim() : undefined)
    try {
      const branch = await createBranch({
        name: values.name.trim(),
        isHeadOffice: values.isHeadOffice,
        code: clean(values.code),
        address: clean(values.address),
        city: clean(values.city),
        contactNumber: clean(values.contactNumber),
        email: clean(values.email),
        openedDate: clean(values.openedDate),
      })
      if (copyFrom) await copyBranchDepartments(copyFrom, branch.id)
      notify({ title: 'Branch added', description: `${branch.name} is ready.`, tone: 'success' })
      close(false)
      onCreated()
    } catch (error) {
      const fields = fieldErrors(error)
      if (Object.keys(fields).length === 0) return notify({ title: "Couldn't add the branch", description: apiErrorMessage(error), tone: 'danger' })
      for (const [field, message] of Object.entries(fields)) setError(field.replace(/_(\w)/g, (_, c: string) => c.toUpperCase()) as keyof FormValues, { message })
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger asChild>
        <Button size="sm" icon={<Plus className="size-4" />}>
          Add Branch
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Add Branch</DialogTitle>
        <DialogDescription>Set up the branch. Employees are assigned to it from the Employees module.</DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-5">
          <div className="space-y-3">
            <SectionTitle title="Branch Details" />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Branch name" required error={errors.name?.message}>
                <Input {...register('name')} placeholder="Iloilo Branch" />
              </FormField>
              <FormField label="Branch code">
                <Input {...register('code')} placeholder="FL-ILO-01" />
              </FormField>
              <FormField label="Date opened">
                <Input type="date" {...register('openedDate')} />
              </FormField>
              <FormField label="Copy departments from" hint="Optional — start with another branch's department list.">
                <Select value={copyFrom || undefined} onValueChange={setCopyFrom} options={branches.map((b) => ({ value: b.id, label: b.name }))} placeholder="Don't copy" disabled={branches.length === 0} />
              </FormField>
              <label className="flex items-center gap-2 self-end pb-2 text-sm">
                <Controller control={control} name="isHeadOffice" render={({ field }) => <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />} />
                Head office
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <SectionTitle title="Address & Contact" />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Street address" className="sm:col-span-2">
                <Input {...register('address')} placeholder="2F Atrium Building, General Luna Street" />
              </FormField>
              <FormField label="City / Province">
                <Input {...register('city')} placeholder="Iloilo City, Iloilo" />
              </FormField>
              <FormField label="Contact number">
                <Input {...register('contactNumber')} placeholder="(033) 320 1234" />
              </FormField>
              <FormField label="Branch email" error={errors.email?.message} className="sm:col-span-2">
                <Input type="email" {...register('email')} placeholder="iloilo@company.com.ph" />
              </FormField>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Add Branch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
