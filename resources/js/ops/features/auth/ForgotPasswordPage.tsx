import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Mail, MailCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@ops/components/ui/Button'
import { useToast } from '@ops/components/ui/Toast'
import { AuthLayout, IconField } from '@ops/features/auth/components/AuthLayout'
import { router } from '@inertiajs/react'
import { maskEmail } from '@ops/lib/services/authService'

const RESEND_COOLDOWN_SECONDS = 30
/** Matches config('auth.passwords.users.expire'). */
const RESET_TOKEN_TTL_MINUTES = 60

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
})

type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const { notify } = useToast()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  /** Posts to Fortify, which emails the reset link. Resolves true when the request was accepted. */
  function send(email: string): Promise<boolean> {
    return new Promise((resolve) => {
      let ok = false
      router.post(
        '/forgot-password',
        { email },
        {
          preserveState: true,
          onSuccess: () => {
            ok = true
            setSentTo(email)
            setCooldown(RESEND_COOLDOWN_SECONDS)
          },
          onError: (errs) => setError('email', { message: errs.email ?? 'Could not send the reset link.' }),
          onFinish: () => resolve(ok),
        },
      )
    })
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    await send(values.email)
    setIsSubmitting(false)
  }

  async function handleResend() {
    if (!sentTo) return
    setIsResending(true)
    const ok = await send(sentTo)
    setIsResending(false)
    if (ok) notify({ title: 'Reset link sent again', description: 'Any earlier links have been deactivated.', tone: 'success' })
  }

  return (
    <AuthLayout>
      {sentTo ? (
        <div>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MailCheck className="size-6" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight">Check your email</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            If an account exists for <span className="font-medium text-foreground">{maskEmail(sentTo)}</span>, we&apos;ve sent a link to reset your password. The
            link expires in {RESET_TOKEN_TTL_MINUTES} minutes.
          </p>

          <div className="mt-6 space-y-3">
            <Button variant="secondary" className="w-full" onClick={handleResend} isLoading={isResending} disabled={cooldown > 0}>
              {cooldown > 0 ? `Resend link in ${cooldown}s` : 'Resend link'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Didn&apos;t get it? Check your spam folder, or{' '}
              <button type="button" onClick={() => setSentTo(null)} className="font-medium text-primary hover:underline">
                use a different email
              </button>
              .
            </p>
          </div>

        </div>
      ) : (
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Forgot your password?</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Enter the email address linked to your account and we&apos;ll send you a link to reset it.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold tracking-tight">
                Email Address
              </label>
              <IconField id="email" icon={Mail} type="email" autoFocus placeholder="Enter your email address" error={errors.email?.message} {...register('email')} />
            </div>

            <Button type="submit" className="auth-cta w-full py-3" isLoading={isSubmitting} icon={<ArrowRight className="size-4" />}>
              Send Reset Link
            </Button>
          </form>
        </div>
      )}

      <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to login
      </Link>
    </AuthLayout>
  )
}
