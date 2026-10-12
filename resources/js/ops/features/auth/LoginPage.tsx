import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { router, usePage } from '@inertiajs/react'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { BrandLoader } from '@ops/components/ui/BrandLogo'
import { Button } from '@ops/components/ui/Button'
import { Checkbox } from '@ops/components/ui/Checkbox'
import { useToast } from '@ops/components/ui/Toast'
import { AuthLayout, IconField } from '@ops/features/auth/components/AuthLayout'

/** Local-only quick logins, sent by the server (empty outside the local environment). */
interface DemoAccount {
  email: string
  password: string
  roleLabel: string
}

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  keepSignedIn: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { notify } = useToast()
  const { demoAccounts = [] } = usePage<{ demoAccounts?: DemoAccount[] }>().props
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '', keepSignedIn: true } })

  /** Posts to Fortify; on success the server redirects to the role's landing page. */
  function submit(email: string, password: string, remember: boolean) {
    setFormError(null)
    router.post(
      '/login',
      { email, password, remember },
      {
        onStart: () => setIsSubmitting(true),
        onFinish: () => setIsSubmitting(false),
        onError: (errs) => setFormError(errs.email ?? errs.password ?? 'Invalid email or password.'),
      },
    )
  }

  function onSubmit(values: FormValues) {
    submit(values.email, values.password, values.keepSignedIn)
  }

  function onDemoLogin(email: string, password: string) {
    setValue('email', email)
    setValue('password', password)
    submit(email, password, true)
  }

  return (
    <AuthLayout>
      {isSubmitting && <BrandLoader />}
      <h2 className="font-display text-2xl font-semibold tracking-tight">Welcome Back!</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">Log in to your FBS Pay account to continue.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold tracking-tight">
            Email Address
          </label>
          <IconField id="email" icon={Mail} type="email" placeholder="Enter your email address" error={errors.email?.message} {...register('email')} />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-semibold tracking-tight">
            Password
          </label>
          <IconField
            id="password"
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            error={errors.password?.message}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            {...register('password')}
          />
        </div>

        {formError && <p className="text-xs text-danger">{formError}</p>}

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-sm">
            <Controller control={control} name="keepSignedIn" render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />} />
            Keep me signed in
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting} icon={<ArrowRight className="size-4" />}>
          Log In
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button variant="secondary" className="w-full" onClick={() => notify({ title: 'Microsoft sign-in is not available in this demo', tone: 'default' })}>
        Sign in with Microsoft
      </Button>

      {demoAccounts.length > 0 && (
      <div className="mt-7 rounded-xl border border-dashed border-border bg-muted/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick Demo Login</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => onDemoLogin(account.email, account.password)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              {account.roleLabel}
            </button>
          ))}
        </div>
      </div>
      )}
    </AuthLayout>
  )
}
