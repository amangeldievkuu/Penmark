import { createFileRoute } from '@tanstack/react-router'
import { getAdminProfile } from '~/server/functions/profile'
import { Header } from '~/components/layout/Header'
import { Footer } from '~/components/layout/Footer'
import { Avatar } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Github, Twitter, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/about')({
  loader: async () => {
    const profile = await getAdminProfile()
    return profile ?? null
  },
  head: () => ({
    meta: [
      { title: 'About | PenMark' },
      { name: 'description', content: 'Learn more about me and what I do.' },
    ],
  }),
  component: AboutPage,
})

function AboutPage() {
  const profile = Route.useLoaderData()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Full Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-12"
        >
          <img
            src={dark ? '/penmark-logo-full-dark.svg' : '/penmark-logo-full-light.svg'}
            alt="PenMark"
            className="h-20 sm:h-24"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-12"
        >
          <Avatar
            src={profile?.avatar_url}
            fallback={profile?.full_name || 'K'}
            size="lg"
            className="mx-auto mb-6 h-24 w-24 text-2xl"
          />
          <h1 className="text-3xl font-bold mb-3">{profile?.full_name || 'PenMark'}</h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-xl mx-auto">
            {profile?.bio || 'Developer, writer, and lifelong learner.'}
          </p>
          <div className="flex justify-center gap-3 mt-6">
            {profile?.github && (
              <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <Github className="h-4 w-4" /> GitHub
                </Button>
              </a>
            )}
            {profile?.twitter && (
              <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <Twitter className="h-4 w-4" /> Twitter
                </Button>
              </a>
            )}
            {profile?.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="h-4 w-4" /> Website
                </Button>
              </a>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose dark:prose-invert max-w-none"
        >
          <h2 className="text-xl font-semibold mb-4">About Me</h2>
          <div className="space-y-4 text-[hsl(var(--muted-foreground))] leading-relaxed">
            <p>
              Welcome to my corner of the internet. I'm a developer passionate about building
              beautiful, functional web applications and sharing what I learn along the way.
            </p>
            <p>
              This blog is where I write about technology, web development, software architecture,
              and the occasional side project. I believe in learning in public and documenting the journey.
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
