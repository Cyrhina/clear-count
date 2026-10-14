import { RoleSwitcherDropdown } from '@ops/components/layout/DemoSwitchers'

/**
 * Mobile-only (<768px) fixed bottom bar holding the demo role/company switcher — moved out of the Topbar on small screens to keep the header
 * uncluttered (see Topbar.tsx). Dropdown content opens upward (`side="top"`) since the trigger
 * sits at the bottom of the viewport. `env(safe-area-inset-bottom)` keeps it clear of the iOS
 * home indicator.
 */
export function MobileDemoBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex flex-wrap items-center justify-center gap-2 border-t border-border bg-card/95 px-3 pt-2 backdrop-blur-sm md:hidden print:hidden"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
    >
      <div className="min-w-0 max-w-xs flex-1">
        <RoleSwitcherDropdown side="top" triggerClassName="w-full justify-center" />
      </div>
    </div>
  )
}
