import { createFileRoute } from '@tanstack/react-router'
import { getChangelogEntries } from '~/server/functions/changelog'
import { Header } from '~/components/layout/Header'
import { Footer } from '~/components/layout/Footer'
import { Badge } from '~/components/ui/badge'
import { formatDate } from '~/lib/utils'
import { motion } from 'framer-motion'
import type { ChangelogType } from '~/types/changelog'

export const Route = createFileRoute('/changelog')({
  loader: () => getChangelogEntries(),
  head: () => ({
    meta: [
      { title: 'Changelog | PenMark' },
      { name: 'description', content: 'See what\'s new and what\'s changed.' },
    ],
  }),
  component: ChangelogPage,
})

function ChangelogPage() {
  const entries = Route.useLoaderData()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Changelog</h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-12">
            All notable changes, new features, and fixes.
          </p>
        </motion.div>

        {entries.length === 0 ? (
          <p className="text-center text-[hsl(var(--muted-foreground))] py-16">No entries yet.</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-[hsl(var(--border))]" />
            <div className="space-y-8">
              {entries.map((entry: any, i: number) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative pl-10"
                >
                  <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-[hsl(var(--primary))] bg-[hsl(var(--background))]" />
                  <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={entry.type as ChangelogType}>{entry.type}</Badge>
                      {entry.version && (
                        <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
                          v{entry.version}
                        </span>
                      )}
                      <span className="text-xs text-[hsl(var(--muted-foreground))] ml-auto">
                        {formatDate(entry.published_at)}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-1">{entry.title}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{entry.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
