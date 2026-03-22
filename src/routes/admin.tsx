import { createFileRoute, Outlet, Link, useRouter } from '@tanstack/react-router'
import { AdminSidebar } from '~/components/layout/AdminSidebar'
import { useState } from 'react'
import { useAuth } from '~/hooks/use-auth'
import { Loader2, ShieldAlert, LogIn, ArrowLeft } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { motion } from 'framer-motion'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
  errorComponent: AdminErrorPage,
})

function AdminErrorPage({ error }: { error: Error }) {
  const isUnauthorized = /unauthorized|forbidden/i.test(error.message)

  if (isUnauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--secondary))]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="h-16 w-16 rounded-2xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-8">
            You need to sign in with an admin account to access this area.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <LogIn className="h-4 w-4" />
                Sign in
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4" />
                Go home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // Generic error fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--secondary))]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-md mx-auto px-6"
      >
        <div className="h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="h-8 w-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={() => window.location.reload()} className="gap-2">
            Try again
          </Button>
          <Link to="/">
            <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4" />
              Go home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

function AdminLayout() {
  const { isAuthenticated, loading } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--secondary))]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="h-16 w-16 rounded-2xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-8">
            You need to sign in with an admin account to access this area.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <LogIn className="h-4 w-4" />
                Sign in
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4" />
                Go home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
