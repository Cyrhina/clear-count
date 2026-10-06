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

/** Full-screen splash shown while the app boots. */
export function BrandSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <BrandLogo className="size-16 animate-pulse rounded-2xl" />
    </div>
  )
}
