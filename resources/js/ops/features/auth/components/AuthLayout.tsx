import { CalendarCheck, ChartColumn, Mail, ShieldCheck, UsersRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { BRAND_NAME, BrandLogo } from '@ops/components/ui/BrandLogo'
import { ThemeToggle } from '@ops/components/ui/ThemeToggle'
import { BRAND } from '@ops/lib/brand'
import { cn } from '@ops/lib/utils/cn'

const FEATURES = [
  { icon: UsersRound, title: 'Manage Employees', text: 'Keep your team information organized and up to date.' },
  { icon: CalendarCheck, title: 'Automate Payroll', text: 'Accurate, on-time, and hassle-free processing.' },
  { icon: ShieldCheck, title: 'Stay Compliant', text: 'Built with Philippine labor laws and tax regulations.' },
  { icon: ChartColumn, title: 'Track & Grow', text: 'Get real-time reports and make informed decisions.' },
]

export function IconField({
  icon: Icon,
  trailing,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: typeof Mail; trailing?: ReactNode; error?: string }) {
  return (
    <div>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
        <input
          className={cn(
            'w-full rounded-xl border border-border bg-card py-3 pl-11 pr-11 text-sm text-foreground placeholder:text-muted-foreground',
            'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            error && 'border-danger focus-visible:ring-danger',
          )}
          {...props}
        />
        {trailing && <div className="absolute right-4 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  )
}

function BrandingHero() {
  return (
    <div className="relative hidden overflow-hidden bg-background [container-type:inline-size] lg:block">
      <div className="relative flex h-full min-h-screen flex-col px-10 py-12 xl:px-[6cqw]">
        <div className="flex items-center gap-4">
          <img src="/brand/clear-count-dark.png" alt={BRAND_NAME} className="size-14 shrink-0 object-contain" />
          <div>
            <p className="font-display text-xl font-semibold leading-tight tracking-tight text-brand-800 dark:text-foreground">{BRAND_NAME}</p>
            <p className="text-sm text-brand-500 dark:text-brand-300">{BRAND.subtitle}</p>
          </div>
        </div>

        <h1 className="mt-14 font-display text-[clamp(2.1rem,5.2cqw,3.6rem)] font-semibold leading-[1.05] tracking-tight">
          <span className="block text-brand-900 dark:text-foreground">Simpler Payroll.</span>
          <span className="block text-brand-500 dark:text-brand-400">Stronger Teams.</span>
        </h1>
        <p className="mt-6 max-w-[22rem] text-base leading-relaxed text-muted-foreground">
          Automate payroll, manage your people, and keep your business running smoothly. All in one secure system.
        </p>

        <ul className="mt-12 space-y-6 xl:max-w-[44%]">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-brand-900 dark:text-foreground">{title}</p>
                <p className="mt-0.5 text-[0.8rem] leading-snug text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-auto pt-12 text-[0.7rem] font-medium tracking-[0.25em] text-brand-300">PEOPLE &nbsp;•&nbsp; PAYROLL &nbsp;•&nbsp; PROGRESS</p>

        {/* Product photo with its two accent tiles. Only where the panel is wide enough to sit beside the text. */}
        <div className="pointer-events-none absolute inset-0 hidden xl:block" aria-hidden="true">
          <div className="absolute right-[6%] top-[14.5%] size-[9.6cqw] rounded-2xl bg-brand-100 dark:bg-brand-900/60" />
          <img
            src="/brand/login-hero.jpg"
            alt=""
            className="absolute right-[6%] top-[23%] w-[41.6cqw] max-w-none rounded-bl-none rounded-br-[11cqw] rounded-tl-[16cqw] object-cover [clip-path:polygon(0_0,71%_0,71%_15%,100%_15%,100%_100%,0_100%)] dark:opacity-90"
          />
          <div className="absolute left-[47.6%] top-[69%] size-[9.6cqw] rounded-2xl bg-brand-400/80" />
        </div>
      </div>
    </div>
  )
}

/** Split auth screen shared by Login, Forgot Password and Reset Password: light branding hero + a Regal Blue form panel. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen w-full bg-background lg:grid-cols-[55fr_45fr]">
      <BrandingHero />

      {/* Always a dark panel (Regal Blue in light mode, deep navy in dark mode): the `dark` + `auth-panel` classes re-point the colour tokens for everything inside. */}
      <div className="dark auth-panel relative flex flex-col items-center justify-center overflow-hidden bg-background px-6 py-12 text-foreground sm:px-10">
        <div className="absolute right-4 top-4 z-10">
          <ThemeToggle />
        </div>
        <div className="pointer-events-none absolute -right-24 -top-32 size-[26rem] rounded-full bg-brand-300/15" />
        <div className="pointer-events-none absolute -bottom-40 -left-28 size-[22rem] rounded-full bg-brand-300/10" />

        <div className="relative w-full max-w-[26rem]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandLogo className="size-11 rounded-xl" />
            <div>
              <p className="font-display text-lg font-semibold leading-tight tracking-tight">{BRAND_NAME}</p>
              <p className="text-xs text-muted-foreground">{BRAND.subtitle}</p>
            </div>
          </div>

          {children}

          <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            Your information is protected and secure.
          </p>
        </div>
      </div>
    </div>
  )
}
