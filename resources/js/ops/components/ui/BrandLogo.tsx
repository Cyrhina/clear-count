import { cn } from '@ops/lib/utils/cn'

export const BRAND_NAME = 'FBS Pay'

/** The FBS Pay mark: the light tile in light mode, the dark tile in dark mode (the theme is the `.dark` class on <html>). */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <>
      <img src="/brand/fbs-pay-light.png" alt={BRAND_NAME} className={cn('shrink-0 object-contain dark:hidden', className)} />
      <img src="/brand/fbs-pay-dark.png" alt={BRAND_NAME} className={cn('hidden shrink-0 object-contain dark:block', className)} />
    </>
  )
}

export const POWERED_BY_NAME = 'Frontline Business Solutions, Inc.'

/** "Powered by [Frontline logo] Frontline Business Solutions, Inc." — the footer line on printed documents (payslips, reports). */
export function PoweredByBrand({ className }: { className?: string }) {
  return (
    <p className={cn('flex items-center justify-center gap-1.5 pb-5 text-[10px] text-muted-foreground print:text-foreground/50', className)}>
      Powered by
      <img src="/brand/frontline.png" alt="" className="size-4 shrink-0 object-contain" />
      <span className="font-semibold">{POWERED_BY_NAME}</span>
    </p>
  )
}

/**
 * Full-screen loader: the FBS Pay mark with a ring spinning around it, over a blurred copy of whatever is behind.
 * It fades in after a short delay (see `.brand-loader` in ops.css) so quick loads don't flash.
 */
export function BrandLoader() {
  return (
    <div role="status" aria-label="Loading" className="brand-loader fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-md">
      <div className="relative flex size-24 items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90 motion-safe:animate-[spin_1.1s_linear_infinite]" aria-hidden>
          <defs>
            <linearGradient id="brand-loader-arc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--primary)" strokeOpacity="0.15" strokeWidth="4" />
          <circle cx="50" cy="50" r="46" fill="none" stroke="url(#brand-loader-arc)" strokeWidth="4" strokeLinecap="round" strokeDasharray="90 200" />
        </svg>
        <BrandLogo className="size-14 rounded-2xl shadow-soft" />
      </div>
    </div>
  )
}

/** Shown while the app boots. */
export function BrandSplash() {
  return <BrandLoader />
}
