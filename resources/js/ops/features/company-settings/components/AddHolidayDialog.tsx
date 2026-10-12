import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@ops/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useToast } from '@ops/components/ui/Toast'
import { apiErrorMessage, fieldErrors } from '@ops/lib/api/http'
import { createHoliday } from '@ops/lib/services/holidayService'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  type: z.enum(['regular', 'special_non_working', 'special_working', 'double_holiday']),
})

type FormValues = z.infer<typeof schema>

const TYPE_OPTIONS = [
  { value: 'regular', label: 'Regular Holiday' },
  { value: 'special_non_working', label: 'Special Non-Working Day' },
  { value: 'special_working', label: 'Special Working Day' },
  { value: 'double_holiday', label: 'Double Holiday' },
]

export function AddHolidayDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const { notify } = useToast()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { type: 'regular' } })

  async function onSubmit(values: FormValues) {
    try {
      await createHoliday(values)
    } catch (error) {
      const fields = fieldErrors(error)
      if (fields.name || fields.date) {
        if (fields.name) setError('name', { message: fields.name })
        if (fields.date) setError('date', { message: fields.date })
      } else {
        notify({ title: 'Could not add the holiday', description: apiErrorMessage(error), tone: 'danger' })
      }
      return
    }
    notify({ title: 'Holiday added', tone: 'success' })
    reset()
    setOpen(false)
    onCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" icon={<Plus className="size-4" />}>
          Add Holiday
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add Company Holiday</DialogTitle>
        <DialogDescription>Holidays affect attendance and payroll calculations.</DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid grid-cols-2 gap-4">
          <FormField label="Name" required error={errors.name?.message} className="col-span-2">
            <Input {...register('name')} placeholder="Rizal Day" />
          </FormField>
          <FormField label="Date" required error={errors.date?.message}>
            <Input type="date" {...register('date')} />
          </FormField>
          <FormField label="Type" required>
            <Controller control={control} name="type" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={TYPE_OPTIONS} />} />
          </FormField>

          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Add Holiday
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
