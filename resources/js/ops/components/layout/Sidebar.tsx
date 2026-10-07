import { ChevronsLeft, ChevronsRight, Lock, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BRAND_NAME, BrandLogo } from '@ops/components/ui/BrandLogo'
import { useSession } from '@ops/hooks/useSession'
import { usePermission } from '@ops/hooks/usePermission'
import { useActivePlanTier } from '@ops/hooks/useActivePlanTier'
import { ADMIN_NAV, EMPLOYEE_NAV, MANAGER_NAV, SUPER_ADMIN_NAV } from '@ops/components/layout/navConfig'
import type { NavGroup } from '@ops/components/layout/navConfig'
import { NotificationsBell } from '@ops/components/layout/NotificationsBell'
import { SidebarPlanWidget } from '@ops/components/layout/SidebarPlanWidget'
import { PLAN_DETAILS, minimumPlanFor, planHasFeature } from '@ops/lib/plans'
import { cn } from '@ops/lib/utils/cn'

export interface SidebarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

function useNavGroups(): NavGroup[] {
  const { user } = useSession()

  if (user.role === 'employee') return EMPLOYEE_NAV
  if (user.role === 'manager') return MANAGER_NAV
  if (user.role === 'super_admin') return SUPER_ADMIN_NAV
  return ADMIN_NAV
}

function NavItemLink({ item, collapsed, onNavigate }: { item: NavGroup['items'][number]; collapsed: boolean; onNavigate?: () => void }) {
  const { user } = useSession()
  const hasCapability = usePermission(item.capability ?? 'dashboard.view')
  const { tier } = useActivePlanTier()
  if (item.capability && !hasCapability) return null

  // Company Admin gets a bolder "pill" active state (per its dashboard redesign); other
  // roles keep the existing subtle highlight untouched.
  const isCompanyAdmin = user.role === 'company_admin'

  // Module isn't included in the active plan tier (real, or a Demo Portal preview tier) — render
  // it locked instead of hiding it, with a direct link to the Subscription page to upgrade.
  if (item.feature && !planHasFeature(tier, item.feature)) {
    const requiredPlan = minimumPlanFor(item.feature)
    return (
      <Link
        to="/subscription"
        onClick={onNavigate}
        title={`Available in ${PLAN_DETAILS[requiredPlan].label} Plan — click to upgrade`}
        className={cn(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-muted/50 transition-colors duration-150',
          'hover:bg-sidebar-active/50 hover:text-sidebar-muted',
          collapsed && 'justify-center px-0',
        )}
      >
        <item.icon className="size-4 shrink-0" />
        <span className={cn('flex-1 truncate', collapsed && 'sr-only')}>{item.label}</span>
        {!collapsed && <Lock className="size-3 shrink-0" />}
      </Link>
    )
  }

  return (
    <NavLink
      to={item.path}
      end={item.exactMatch}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-muted transition-colors duration-150',
          'hover:bg-sidebar-active hover:text-sidebar-foreground',
          collapsed && 'justify-center px-0',
          isActive &&
            (isCompanyAdmin
              ? 'bg-primary text-primary-foreground shadow-soft hover:bg-primary'
              : 'bg-sidebar-active text-sidebar-foreground'),
        )
      }
    >
      <item.icon className="size-4 shrink-0" />
      <span className={cn('truncate', collapsed && 'sr-only')}>{item.label}</span>
    </NavLink>
  )
}

/** Inertia re-mounts the whole page on every visit, which would reset the menu to the top — so its scroll position outlives the component. */
let savedNavScroll = 0

function SidebarNav({ groups, collapsed, onNavigate }: { groups: NavGroup[]; collapsed: boolean; onNavigate?: () => void }) {
  // The scrollbar is fainter while the menu is idle: flag the nav as "scrolling" for a moment after each scroll event.
  const [scrolling, setScrolling] = useState(false)
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const navRef = useRef<HTMLElement>(null)
  useEffect(() => () => clearTimeout(idleTimer.current), [])
  // Put the menu back where the user left it, instantly (the nav is scroll-smooth, which would otherwise animate down from the top).
  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return
    nav.style.scrollBehavior = 'auto'
    nav.scrollTop = savedNavScroll
    nav.style.scrollBehavior = ''
  }, [])
  function handleScroll() {
    // Restoring the saved position fires a scroll event too; it isn't the user scrolling, so don't light the scrollbar up for it.
    if (!navRef.current || navRef.current.scrollTop === savedNavScroll) return
    savedNavScroll = navRef.current.scrollTop
    setScrolling(true)
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => setScrolling(false), 800)
  }

  return (
    <nav ref={navRef} onScroll={handleScroll} data-scrolling={scrolling} className="sidebar-scroll flex flex-1 scroll-smooth flex-col gap-4 overflow-y-auto">
      {groups.map((group, idx) => (
        <div key={group.label ?? idx} className="flex flex-col gap-1">
          {group.label && !collapsed && (
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted/70">{group.label}</p>
          )}
          {group.items.map((item) => (
            <NavItemLink key={item.path} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
    </nav>
  )
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 px-2 pb-6', collapsed ? 'justify-center px-0' : 'justify-between')}>
      <div className="flex min-w-0 items-center gap-2">
        <BrandLogo className="size-7" />
        {!collapsed && <span className="truncate font-display text-sm font-semibold tracking-tight text-sidebar-foreground">{BRAND_NAME}</span>}
      </div>
      {!collapsed && <NotificationsBell />}
    </div>
  )
}

function SidebarTagline({ collapsed }: { collapsed: boolean }) {
  const { user } = useSession()
  if (user.role !== 'company_admin' || collapsed) return null

  return <SidebarPlanWidget />
}

export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const groups = useNavGroups()

  return (
    <>
      {/* Desktop persistent sidebar — collapsible to an icon-only rail. */}
      <aside
        className={cn(
          'hidden shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar py-5 lg:flex print:hidden',
          'transition-[width] duration-200 ease-[var(--ease-editorial)]',
          collapsed ? 'w-16 px-2' : 'w-64 px-3',
        )}
      >
        <SidebarBrand collapsed={collapsed} />
        <SidebarNav groups={groups} collapsed={collapsed} />
        <SidebarTagline collapsed={collapsed} />
        <button
          type="button"
          onClick={onToggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-muted transition-colors duration-150',
            'hover:bg-sidebar-active hover:text-sidebar-foreground',
            collapsed && 'justify-center px-0',
          )}
        >
          {collapsed ? <ChevronsRight className="size-4 shrink-0" /> : <ChevronsLeft className="size-4 shrink-0" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </aside>

      {/* Mobile/tablet off-canvas drawer — always full width/labels, opened via the Topbar menu button. */}
      <div className="lg:hidden">
        <div
          className={cn(
            'fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 print:hidden',
            mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
          )}
          onClick={onCloseMobile}
          aria-hidden="true"
        />
        <aside
          className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar px-3 py-5 shadow-soft-lg transition-transform print:hidden duration-300 ease-[var(--ease-editorial)]"
          style={{ transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)' }}
        >
          <div className="flex items-center justify-between pb-6">
            <div className="flex items-center gap-2 px-2">
              <BrandLogo className="size-7" />
              <span className="font-display text-sm font-semibold tracking-tight text-sidebar-foreground">{BRAND_NAME}</span>
            </div>
            <div className="flex items-center gap-1">
              <NotificationsBell />
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation menu"
                className="flex size-8 items-center justify-center rounded-lg text-sidebar-muted transition-colors hover:bg-sidebar-active hover:text-sidebar-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
          <SidebarNav groups={groups} collapsed={false} onNavigate={onCloseMobile} />
          <SidebarTagline collapsed={false} />
        </aside>
      </div>
    </>
  )
}
