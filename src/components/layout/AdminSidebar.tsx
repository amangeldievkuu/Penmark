import { Link } from '@tanstack/react-router'
import { LayoutDashboard, FileText, History, User, LogOut, ChevronLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '~/lib/utils'
import { useAuth } from '~/hooks/use-auth'
import { Button } from '~/components/ui/button'

interface AdminSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const { signOut } = useAuth()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const links = [
    { to: '/admin' as const, icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/posts' as const, icon: FileText, label: 'Posts' },
    { to: '/admin/changelog' as const, icon: History, label: 'Changelog' },
    { to: '/admin/profile' as const, icon: User, label: 'Profile' },
  ]

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
        {!collapsed ? (
          <Link to="/">
            <img
              src={dark ? '/penmark-logo-navbar-dark.svg' : '/penmark-logo-navbar.svg'}
              alt="PenMark"
              className="h-7"
            />
          </Link>
        ) : (
          <Link to="/" className="mx-auto">
            <img src="/penmark-icon.svg" alt="PenMark" className="h-8 w-8" />
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} className="ml-auto">
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors',
              collapsed && 'justify-center px-2',
            )}
            activeOptions={{ exact: true }}
            activeProps={{
              className: 'bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]',
            }}
          >
            <link.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-2 border-t border-[hsl(var(--border))]">
        <button
          onClick={() => signOut()}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full',
            collapsed && 'justify-center px-2',
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
