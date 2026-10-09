import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@ops/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useToast } from '@ops/components/ui/Toast'
import { ApiError, apiErrorMessage } from '@ops/lib/api/http'
import { inviteAccessUser } from '@ops/lib/services/userAccessService'

const schema = z.object({
  firstName: z.string().trim().min(1, 'Required'),
  lastName: z.string().trim().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  role: z.enum(['company_admin', 'hr_admin', 'payroll_admin', 'manager', 'employee']),
})

type FormValues = z.infer<typeof schema>

const ROLE_OPTIONS = [
  { value: 'company_admin', label: 'Company Admin' },
  { value: 'hr_admin', label: 'HR Admin' },
  { value: 'payroll_admin', label: 'Payroll Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
]

// API field name -> form field, so a server-side "email already taken" shows under the email box.
const API_FIELDS: Record<string, keyof FormValues> = { first_name: 'firstName', last_name: 'lastName', email: 'email', role: 'role' }

export function InviteUserDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const { notify } = useToast()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: 'employee' } })

  async function onSubmit(values: FormValues) {
    try {
      await inviteAccessUser(values)
    } catch (e) {
      // Show each server-side validation message under its field; anything else as a toast.
      if (e instanceof ApiError && e.status === 422) {
        let placed = false
        for (const [field, messages] of Object.entries(e.errors)) {
          const target = API_FIELDS[field]
          if (target) {
            setError(target, { message: messages[0] })
            placed = true
          }
        }
        if (placed) return
      }
      notify({ title: 'Could not send the invite', description: apiErrorMessage(e), tone: 'danger' })
      return
    }
    notify({ title: 'Invite sent', description: `${values.firstName} ${values.lastName} will get an email to create a password.`, tone: 'success' })
    reset()
    setOpen(false)
    onCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button icon={<UserPlus className="size-4" />}>Invite User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Invite User</DialogTitle>
        <DialogDescription>They get an email with a link to create their own password. Grant a role scoped to what they need.</DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid grid-cols-2 gap-4">
          <FormField label="First name" required error={errors.firstName?.message}>
            <Input {...register('firstName')} placeholder="Jane" />
          </FormField>
          <FormField label="Last name" required error={errors.lastName?.message}>
            <Input {...register('lastName')} placeholder="Dela Cruz" />
          </FormField>
          <FormField label="Email" required error={errors.email?.message} className="col-span-2">
            <Input type="email" {...register('email')} placeholder="jane.delacruz@company.com" />
          </FormField>
          <FormField label="Role" required error={errors.role?.message} className="col-span-2">
            <Controller
              control={control}
              name="role"
              render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={ROLE_OPTIONS} />}
            />
          </FormField>

          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Send Invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
