/* ─────────────────────────────────────────────────────────────────────────
   app/dashboard/DashboardShell.tsx  — Client shell

   Owns:
   - Sidebar collapse/expand state
   - Mobile sidebar drawer
   - Sign out action
   - Role-based nav item filtering
   - Active route highlighting
───────────────────────────────────────────────────────────────────────── */
'use client';

import { useState, useCallback }  from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link                       from 'next/link';
import { createClient }           from '@/lib/supabase/client';
import type { UserRole }          from '@/lib/supabase/types';

/* ── Nav item definition ──────────────────────────────────────────────── */
interface NavItem {
  label:       string;
  href:        string;
  roles:       UserRole[];          // which roles see this item
  icon:        React.ReactNode;
  badgeCount?: number;              // optional notification count
}

/* ── Role display config ─────────────────────────────────────────────── */
const ROLE_CONFIG: Record<UserRole, { label: string; badgeClass: string }> = {
  founder:    { label: 'Founder',    badgeClass: 'badge-warning'  },
  staff:      { label: 'Staff',      badgeClass: 'badge-pending'  },
  researcher: { label: 'Researcher', badgeClass: 'badge-success'  },
  intern:     { label: 'Intern',     badgeClass: 'badge-idle'     },
};

/* ── Icon components (inline SVG — no icon lib dependency) ───────────── */
const Icon = {
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor"
         strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  ),
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor"
         strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17,8 12,3 7,8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Chart: () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor"
         strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4"  />
      <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor"
         strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  File: () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor"
         strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14,2 14,8 20,8" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor"
         strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83
               0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0
               01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0
               00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0
               004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0
               012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0
               00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0
               009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012
               2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2
               2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0
               001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0
               00-1.51 1z" />
    </svg>
  ),
  Terminal: () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor"
         strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4,17 10,11 4,5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor"
         strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16,17 21,12 16,7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor"
         strokeWidth={1.75} strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Chevron: ({ collapsed }: { collapsed: boolean }) => (
    <svg viewBox="0 0 24 24" fill="none"
         className={`h-4 w-4 transition-transform duration-300
                     ${collapsed ? 'rotate-180' : ''}`}
         stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15,18 9,12 15,6" />
    </svg>
  ),
};

/* ── Nav items ────────────────────────────────────────────────────────────
   Each item declares which roles can see it.
   Founder sees everything. Other roles see only their section.
─────────────────────────────────────────────────────────────────────────*/
const NAV_ITEMS: NavItem[] = [
  {
    label: 'Overview',
    href:  '/dashboard',
    roles: ['founder', 'staff', 'researcher', 'intern'],
    icon:  <Icon.Home />,
  },
  {
    label: 'Admin Terminal',
    href:  '/dashboard/founder',
    roles: ['founder'],
    icon:  <Icon.Terminal />,
  },
  {
    label: 'Team Members',
    href:  '/dashboard/founder/team',
    roles: ['founder'],
    icon:  <Icon.Users />,
  },
  {
    label: 'All Reports',
    href:  '/dashboard/founder/reports',
    roles: ['founder'],
    icon:  <Icon.Chart />,
  },
  {
    label: 'Staff Portal',
    href:  '/dashboard/staff',
    roles: ['staff', 'founder'],
    icon:  <Icon.File />,
  },
  {
    label: 'Research Hub',
    href:  '/dashboard/researcher',
    roles: ['researcher', 'founder'],
    icon:  <Icon.Chart />,
  },
  {
    label: 'Daily Upload',
    href:  '/dashboard/intern',
    roles: ['intern', 'founder'],
    icon:  <Icon.Upload />,
  },
  {
    label: 'Settings',
    href:  '/dashboard/settings',
    roles: ['founder', 'staff', 'researcher', 'intern'],
    icon:  <Icon.Settings />,
  },
];

/* ── Props ───────────────────────────────────────────────────────────── */
interface DashboardShellProps {
  children:  React.ReactNode;
  userEmail: string;
  userName:  string;
  userRole:  UserRole;
  avatarUrl: string | null;
}

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════════ */
export default function DashboardShell({
  children,
  userEmail,
  userName,
  userRole,
  avatarUrl,
}: DashboardShellProps) {
  const pathname              = usePathname();
  const router                = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  /* ── Filter nav items for this role ──────────────────────────────── */
  const visibleItems = NAV_ITEMS.filter(item =>
    item.roles.includes(userRole)
  );

  /* ── Active route check ──────────────────────────────────────────── */
  const isActive = useCallback((href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }, [pathname]);

  /* ── Sign out ────────────────────────────────────────────────────── */
  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }, [router]);

  /* ── Avatar initials fallback ────────────────────────────────────── */
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const roleConfig = ROLE_CONFIG[userRole];

  /* ── Sidebar content (shared between desktop + mobile) ───────────── */
  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar-gradient">

      {/* Logo + collapse toggle */}
      <div className={`flex items-center border-b border-sage-600/20 py-5
                       transition-all duration-300
                       ${collapsed ? 'justify-center px-4' : 'justify-between px-5'}`}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg
                            bg-mint-500 shadow-mint-glow-sm
                            transition-all duration-300
                            group-hover:shadow-mint-glow">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-forest-950"
                   stroke="currentColor" strokeWidth={2.5}
                   strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3C7 3 3 7 3 12c0 3.5 2 6.5 5 8" />
                <path d="M12 3c5 0 9 4 9 9 0 3.5-2 6.5-5 8" />
                <path d="M9 15l2.5 2.5L16 10" />
              </svg>
            </div>
            <span className="font-display text-sm font-bold text-sage-100">
              NEIOX
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(p => !p)}
          className="btn-ghost p-2 hidden lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon.Chevron collapsed={collapsed} />
        </button>
      </div>

      {/* User identity block */}
      <div className={`border-b border-sage-600/20 py-4
                       ${collapsed ? 'px-3' : 'px-5'}`}>
        <div className={`flex items-center gap-3
                         ${collapsed ? 'justify-center' : ''}`}>
          {/* Avatar */}
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="h-9 w-9 rounded-xl object-cover ring-1 ring-sage-600/30"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center
                              rounded-xl bg-forest-700
                              ring-1 ring-sage-600/30
                              text-xs font-bold text-sage-200">
                {initials}
              </div>
            )}
            {/* Online indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5
                             rounded-full bg-status-success
                             ring-2 ring-forest-900" />
          </div>

          {/* Name + role — hidden when collapsed */}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-sage-100">
                {userName}
              </p>
              <span className={`${roleConfig.badgeClass} badge mt-0.5`}>
                {roleConfig.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hidden"
           aria-label="Dashboard navigation">
        <ul className={`space-y-1 ${collapsed ? 'px-2' : 'px-3'}`}>
          {visibleItems.map(item => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    flex items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm font-medium
                    transition-all duration-300
                    ${collapsed ? 'justify-center' : ''}
                    ${active
                      ? 'bg-forest-800 text-sage-100 border-l-2 border-mint-500 pl-[10px]'
                      : 'text-sage-400 hover:bg-forest-800 hover:text-sage-100'
                    }
                  `}
                >
                  <span className={`shrink-0 transition-colors duration-300
                    ${active ? 'text-mint-500' : ''}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {/* Badge count */}
                  {!collapsed && item.badgeCount && item.badgeCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center
                                     rounded-full bg-mint-500/20 text-[10px]
                                     font-bold text-mint-400">
                      {item.badgeCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign out */}
      <div className={`border-t border-sage-600/20 py-4
                       ${collapsed ? 'px-2' : 'px-3'}`}>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          title={collapsed ? 'Sign out' : undefined}
          className={`
            flex w-full items-center gap-3 rounded-xl px-3 py-2.5
            text-sm font-medium text-sage-500
            transition-all duration-300
            hover:bg-forest-800 hover:text-status-error
            disabled:opacity-50 disabled:cursor-not-allowed
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <span className="shrink-0">
            {signingOut
              ? <span className="h-4 w-4 animate-spin rounded-full
                                  border-2 border-sage-600 border-t-mint-500
                                  inline-block" />
              : <Icon.Logout />
            }
          </span>
          {!collapsed && (
            <span>{signingOut ? 'Signing out…' : 'Sign Out'}</span>
          )}
        </button>
      </div>

    </div>
  );

  /* ════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex h-screen overflow-hidden bg-forest-950">

      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside
        className={`
          hidden lg:flex flex-col shrink-0
          border-r border-sage-600/20
          transition-all duration-300
          ${collapsed ? 'w-16' : 'w-60'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ──────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-forest-950/80 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col
          border-r border-sage-600/20
          transition-transform duration-300
          lg:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* ── Main content area ───────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between
                           border-b border-sage-600/20 bg-forest-900/60
                           px-4 backdrop-blur-sm lg:px-6">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(p => !p)}
            className="btn-ghost p-2 lg:hidden"
            aria-label="Open sidebar"
          >
            <Icon.Menu />
          </button>

          {/* Page breadcrumb — desktop */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <span className="text-sage-500">Dashboard</span>
            {pathname !== '/dashboard' && (
              <>
                <span className="text-sage-600">/</span>
                <span className="text-sage-300 capitalize font-medium">
                  {pathname.split('/').pop()?.replace(/-/g, ' ')}
                </span>
              </>
            )}
          </div>

          {/* Right side — role badge + email */}
          <div className="flex items-center gap-3 ml-auto">
            <span className={`${roleConfig.badgeClass} badge hidden sm:inline-flex`}>
              {roleConfig.label}
            </span>
            <span className="hidden md:block text-xs text-sage-500 font-mono truncate
                             max-w-[180px]">
              {userEmail}
            </span>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}