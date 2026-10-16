import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { router } from '@inertiajs/react'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { BrandLoader } from '@ops/components/ui/BrandLogo'
import { Button } from '@ops/components/ui/Button'
import { Checkbox } from '@ops/components/ui/Checkbox'
import { useToast } from '@ops/components/ui/Toast'
import { AuthLayout, IconField } from '@ops/features/auth/components/AuthLayout'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  keepSignedIn: z.boolean(),
})

type FormValues = z.infer<typeof schema>

/** The four-square Microsoft mark. */
function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 21 21" className="size-5" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="currentColor" />
      <rect x="11" y="1" width="9" height="9" fill="currentColor" />
      <rect x="1" y="11" width="9" height="9" fill="currentColor" />
      <rect x="11" y="11" width="9" height="9" fill="currentColor" />
    </svg>
  )
}

export function LoginPage() {
  const { notify } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
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

  return (
    <AuthLayout>
      {isSubmitting && <BrandLoader />}
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Welcome Back</p>
      <h2 className="mt-3 font-display text-[1.9rem] font-semibold leading-tight tracking-tight">Sign in to your Payroll Account</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Access your payroll system, manage your employees, and keep your data secure.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email Address
          </label>
          <IconField id="email" icon={Mail} type="email" placeholder="you@company.com" error={errors.email?.message} {...register('email')} />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
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

        <Button type="submit" className="auth-cta w-full py-3" isLoading={isSubmitting} icon={<ArrowRight className="size-4" />}>
          Log In
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button variant="secondary" className="w-full bg-transparent py-3" icon={<MicrosoftLogo />} onClick={() => notify({ title: 'Microsoft sign-in is not available in this demo', tone: 'default' })}>
        Sign in with Microsoft
      </Button>
    </AuthLayout>
  )
}
