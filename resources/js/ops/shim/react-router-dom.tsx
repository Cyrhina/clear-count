/**
 * Thin react-router-dom replacement backed by Inertia, so the copied frontend-ops
 * pages work unchanged. Aliased as `react-router-dom` in vite.config.ts / tsconfig.
 */
import { Link as InertiaLink, router, usePage } from '@inertiajs/react'
import { createContext, useContext, useEffect, useMemo, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react'

type To = string | { pathname?: string; search?: string }
type NavState = unknown

/** Paths owned by the starter-kit app (separate root view + CSS): need a full page load. */
const EXTERNAL = ['/login', '/logout', '/register', '/forgot-password', '/reset-password', '/settings']
const isExternal = (path: string) => EXTERNAL.some((p) => path === p || path.startsWith(`${p}/`))

let pendingState: NavState = null
const toHref = (to: To) => (typeof to === 'string' ? to : `${to.pathname ?? ''}${to.search ?? ''}`)

function go(to: To, opts?: { replace?: boolean; state?: NavState }) {
  const href = toHref(to)
  if (isExternal(href)) {
    window.location.assign(href)
    return
  }
  pendingState = opts?.state ?? null
  router.visit(href, { replace: opts?.replace })
}

export function useNavigate() {
  return useMemo(
    () => (to: To | number, opts?: { replace?: boolean; state?: NavState }) => {
      if (typeof to === 'number') {
        window.history.go(to)
        return
      }
      go(to, opts)
    },
    [],
  )
}

export function useLocation() {
  const { url } = usePage()
  const [pathname, search = ''] = url.split('?')
  return { pathname, search: search ? `?${search}` : '', hash: '', state: pendingState, key: url }
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): Partial<T> {
  const { params } = usePage().props as { params?: T }
  return params ?? {}
}

type ParamsInit = URLSearchParams | Record<string, string | string[]>
export function useSearchParams(): [URLSearchParams, (next: ParamsInit | ((prev: URLSearchParams) => ParamsInit), opts?: { replace?: boolean }) => void] {
  const { url } = usePage()
  const search = url.includes('?') ? url.slice(url.indexOf('?')) : ''
  const params = useMemo(() => new URLSearchParams(search), [search])
  const set = (next: ParamsInit | ((prev: URLSearchParams) => ParamsInit), opts?: { replace?: boolean }) => {
    const resolved = typeof next === 'function' ? next(new URLSearchParams(window.location.search)) : next
    const value = resolved instanceof URLSearchParams ? resolved : new URLSearchParams(resolved as Record<string, string>)
    const qs = value.toString()
    router.visit(`${window.location.pathname}${qs ? `?${qs}` : ''}`, {
      replace: opts?.replace ?? true,
      preserveState: true,
      preserveScroll: true,
    })
  }
  return [params, set]
}

export function Navigate({ to, replace, state }: { to: To; replace?: boolean; state?: NavState }) {
  useEffect(() => go(to, { replace, state }), [to, replace, state])
  return null
}

const OutletContext = createContext<ReactNode>(null)
export const OutletProvider = OutletContext.Provider
export function Outlet() {
  return <>{useContext(OutletContext)}</>
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: To
  replace?: boolean
  state?: NavState
}

export function Link({ to, replace, state, onClick, ...rest }: LinkProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anchorProps = rest as any
  const href = toHref(to)
  if (isExternal(href)) return <a href={href} onClick={onClick} {...rest} />
  return (
    <InertiaLink
      href={href}
      replace={replace}
      onClick={(e) => {
        pendingState = state ?? null
        onClick?.(e as MouseEvent<HTMLAnchorElement>)
      }}
      {...anchorProps}
    />
  )
}

interface NavLinkProps extends Omit<LinkProps, 'className' | 'children'> {
  end?: boolean
  className?: string | ((s: { isActive: boolean; isPending: boolean }) => string)
  children?: ReactNode | ((s: { isActive: boolean; isPending: boolean }) => ReactNode)
}

export function NavLink({ to, end, className, children, ...rest }: NavLinkProps) {
  const { pathname } = useLocation()
  const href = toHref(to)
  const isActive = end ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
  const s = { isActive, isPending: false }
  return (
    <Link to={to} className={typeof className === 'function' ? className(s) : className} {...rest}>
      {typeof children === 'function' ? children(s) : children}
    </Link>
  )
}
