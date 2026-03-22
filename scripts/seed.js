// Seed script — run with: node --env-file=.env scripts/seed.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

function doc(...paragraphs) {
  return {
    type: 'doc',
    content: paragraphs.map((text) => ({
      type: 'paragraph',
      content: [{ type: 'text', text }],
    })),
  }
}

// ─── Posts ────────────────────────────────────────────────────────────────────

const posts = [
  {
    title: 'Getting Started with TypeScript in 2025',
    slug: 'getting-started-with-typescript-2025',
    excerpt: 'A practical guide to adopting TypeScript in modern web projects.',
    tags: ['typescript', 'javascript', 'development'],
    reading_time_minutes: 6,
    published: true,
    published_at: '2025-01-10T08:00:00Z',
    content: doc(
      'TypeScript has become the default choice for serious web projects. In this post I walk through the essentials you need to be productive from day one.',
      'We cover tsconfig.json, strict mode, utility types, and how to integrate TypeScript with popular frameworks like React and TanStack.',
      'By the end you will have a solid mental model of the type system and know which patterns to reach for when things get complex.',
    ),
  },
  {
    title: 'Why I Switched from Next.js to TanStack Start',
    slug: 'switching-from-nextjs-to-tanstack-start',
    excerpt: 'My experience migrating a production app and what I learned.',
    tags: ['react', 'tanstack', 'development'],
    reading_time_minutes: 8,
    published: true,
    published_at: '2025-01-22T09:00:00Z',
    content: doc(
      'After two years building with Next.js I decided to try TanStack Start for my personal site. Here is what surprised me.',
      'TanStack Router gives you type-safe routes out of the box — no more string-based navigation with silent typos. Server functions replace API routes with a cleaner mental model.',
      'The migration took a weekend and the resulting codebase is noticeably smaller and easier to reason about.',
    ),
  },
  {
    title: 'A Weekend in Kyoto: Cherry Blossoms and Hidden Temples',
    slug: 'weekend-in-kyoto-cherry-blossoms',
    excerpt: 'Exploring Kyoto during sakura season — where to go and what to skip.',
    tags: ['travel', 'japan', 'photography'],
    reading_time_minutes: 5,
    published: true,
    published_at: '2025-02-03T07:30:00Z',
    content: doc(
      'Kyoto in late March is everything the postcards promise and more. I arrived expecting crowds and left amazed by how many quiet corners still exist.',
      'My favourite discovery was Fushimi Inari at 5 am — most tourists visit mid-morning, but at dawn the vermilion gates are completely empty and bathed in soft light.',
      'Practical tip: stay in Gion rather than near Kyoto Station. The fifteen-minute walk to Yasaka Shrine each morning is worth every step.',
    ),
  },
  {
    title: 'Supabase Row-Level Security: A Practical Guide',
    slug: 'supabase-row-level-security-practical-guide',
    excerpt: 'How to write RLS policies that actually make sense.',
    tags: ['supabase', 'postgresql', 'security'],
    reading_time_minutes: 7,
    published: true,
    published_at: '2025-02-14T10:00:00Z',
    content: doc(
      'Row-Level Security is one of the most powerful features in PostgreSQL, and Supabase makes it approachable. But the mental model takes a bit of time to click.',
      'The key insight: policies are filters, not gates. Every query runs through them automatically — you never need to remember to add a WHERE clause in your application code.',
      'I cover the four policy commands (SELECT, INSERT, UPDATE, DELETE), the USING vs WITH CHECK distinction, and common pitfalls like forgetting to enable RLS before writing policies.',
    ),
  },
  {
    title: 'Hiking the Cinque Terre Coastal Trail',
    slug: 'hiking-cinque-terre-coastal-trail',
    excerpt: 'Five villages, one trail, and the best focaccia of my life.',
    tags: ['travel', 'italy', 'hiking'],
    reading_time_minutes: 6,
    published: true,
    published_at: '2025-02-28T08:00:00Z',
    content: doc(
      'The Cinque Terre trail runs roughly 12 kilometres along the Ligurian coast connecting five pastel-coloured villages perched above the sea.',
      'I walked from Riomaggiore to Monterosso over two days, stopping in each village for lunch. The path between Corniglia and Vernazza was the most dramatic — steep switchbacks with the Mediterranean far below.',
      'Go in May or October. The summer heat and crowds make the experience significantly less enjoyable, and several sections of the trail close anyway.',
    ),
  },
  {
    title: 'Building a Blog with TipTap and React',
    slug: 'building-blog-tiptap-react',
    excerpt: 'How I integrated the TipTap rich-text editor into my personal site.',
    tags: ['react', 'tiptap', 'development'],
    reading_time_minutes: 9,
    published: true,
    published_at: '2025-03-05T09:30:00Z',
    content: doc(
      'TipTap is a headless rich-text editor built on ProseMirror. Headless means you own all the styling, which is perfect when you already have a design system.',
      'The extension model is where TipTap shines. I added syntax-highlighted code blocks with lowlight, task lists, and custom image handling in about two hours.',
      'One gotcha: TipTap stores content as a JSON document, so make sure your database column is jsonb, not text.',
    ),
  },
  {
    title: 'Tokyo on a Budget: Two Weeks for Under $1500',
    slug: 'tokyo-budget-two-weeks',
    excerpt: 'Proof that Japan is not as expensive as people think.',
    tags: ['travel', 'japan', 'budget'],
    reading_time_minutes: 7,
    published: true,
    published_at: '2025-03-12T08:00:00Z',
    content: doc(
      'Japan has a reputation for being expensive. My two weeks in Tokyo proved otherwise — if you eat where locals eat and stay in a well-located guesthouse, the daily cost is very manageable.',
      'Convenience store meals (7-Eleven, Lawson, FamilyMart) are genuinely delicious and cost around $3–5. Ramen shops typically charge $8–12 for a full bowl. Restaurant meals rarely exceed $15.',
      'The IC card (Suica or Pasmo) makes getting around effortless. Top it up with cash at any station machine and tap in and out of trains and buses seamlessly.',
    ),
  },
  {
    title: 'CSS Container Queries Are Ready for Production',
    slug: 'css-container-queries-production',
    excerpt: 'Why container queries change how you think about responsive design.',
    tags: ['css', 'web', 'development'],
    reading_time_minutes: 5,
    published: true,
    published_at: '2025-03-18T10:00:00Z',
    content: doc(
      'For years we sized components based on the viewport. Container queries let us size them based on their parent — which is almost always what we actually want.',
      'Browser support is now excellent across all major browsers. The syntax is intentionally familiar: @container instead of @media, with the same breakpoint syntax.',
      'The biggest shift is conceptual. Instead of thinking "how does this look on mobile?", you think "how does this look when it has 300px of space?" — a much more reusable mental model.',
    ),
  },
  {
    title: 'Santorini in November: The Off-Season Secret',
    slug: 'santorini-november-off-season',
    excerpt: 'The famous island with a fraction of the tourists and twice the charm.',
    tags: ['travel', 'greece', 'photography'],
    reading_time_minutes: 5,
    published: true,
    published_at: '2025-03-25T07:00:00Z',
    content: doc(
      'Everyone tells you to visit Santorini in summer. I went in November and would not trade it. The caldera views are the same; the selfie-stick crowds are not.',
      'Most restaurants and shops in Oia close for winter, but Fira stays lively year-round. I found a small family-run taverna there that served the best grilled octopus I have ever eaten.',
      'The light in November is incredible for photography — golden hour lasts nearly two hours and the low sun catches the white walls at angles that summer tourists never see.',
    ),
  },
  {
    title: 'Understanding React Server Components',
    slug: 'understanding-react-server-components',
    excerpt: 'A clear explanation of what RSC actually means for your app.',
    tags: ['react', 'javascript', 'development'],
    reading_time_minutes: 8,
    published: true,
    published_at: '2025-04-01T09:00:00Z',
    content: doc(
      'React Server Components render on the server and send HTML to the client with zero JavaScript bundle cost. That one sentence is the whole idea — the rest is implementation details.',
      'The boundary between server and client components is explicit: client components are marked with "use client". Everything else is a server component by default in frameworks that support RSC.',
      'The practical win is enormous for data-fetching. You can query your database directly inside a component without an API layer, and the result ships as static HTML.',
    ),
  },
  {
    title: 'Three Days in Lisbon: Pastéis, Trams, and Fado',
    slug: 'three-days-lisbon-pasteis-trams-fado',
    excerpt: 'A city that rewards slow walking and getting happily lost.',
    tags: ['travel', 'portugal', 'food'],
    reading_time_minutes: 6,
    published: true,
    published_at: '2025-04-08T08:00:00Z',
    content: doc(
      'Lisbon is built on seven hills and best explored on foot — ignoring the temptation to take a tram everywhere means you discover the hidden miradouros (viewpoints) that most tourists miss.',
      'The Pastéis de Belém bakery near the Jerónimos Monastery has been making custard tarts to the same secret recipe since 1837. The queue moves fast; the tarts are worth every minute of waiting.',
      'Catch a fado show in Alfama on a weekday evening. The weekend performances are more polished but the smaller weeknight shows at local adega restaurants feel genuinely authentic.',
    ),
  },
  {
    title: 'Framer Motion: Animations That Feel Native',
    slug: 'framer-motion-animations-feel-native',
    excerpt: 'Practical animation patterns that enhance UX without overwhelming it.',
    tags: ['react', 'animation', 'development'],
    reading_time_minutes: 6,
    published: true,
    published_at: '2025-04-15T10:00:00Z',
    content: doc(
      'The best animations are the ones users do not notice — they just feel like the UI is alive. Framer Motion makes this the path of least resistance.',
      'Three patterns I use constantly: fade-in on mount with initial/animate, staggered list children with variants, and layout animations when items reorder or resize.',
      'One rule I follow: keep duration under 300ms for interactive elements and under 500ms for page transitions. Anything longer starts to feel sluggish regardless of how smooth the easing is.',
    ),
  },
  {
    title: 'Chiang Mai for Digital Nomads: A Practical Guide',
    slug: 'chiang-mai-digital-nomads-guide',
    excerpt: 'Fast internet, great food, and a community that makes remote work easy.',
    tags: ['travel', 'thailand', 'nomad'],
    reading_time_minutes: 8,
    published: true,
    published_at: '2025-04-22T07:30:00Z',
    content: doc(
      'Chiang Mai has earned its reputation as a digital nomad hub for simple reasons: co-working spaces with reliable 100Mbps+ connections cost $5–8 per day, a good apartment runs $300–400 per month, and the food scene is extraordinary.',
      'The Nimman area is the most popular among the tech crowd. Punspace and CAMP (inside Maya Mall) are the two best-known co-working spots, but a dozen alternatives have opened in the last two years.',
      'The Sunday Walking Street market on Wualai Road is something I looked forward to every week. Handmade goods, street food, and live traditional music — a perfect way to close out the work week.',
    ),
  },
  {
    title: 'Zod: Runtime Type Safety for TypeScript',
    slug: 'zod-runtime-type-safety-typescript',
    excerpt: 'How Zod fills the gap between compile-time types and runtime data.',
    tags: ['typescript', 'zod', 'development'],
    reading_time_minutes: 5,
    published: true,
    published_at: '2025-05-01T09:00:00Z',
    content: doc(
      'TypeScript types disappear at runtime. When data arrives from an API or a form submission, you are back to trusting that the shape matches — unless you use a runtime validator like Zod.',
      'Zod schemas double as both validators and type generators. Write the schema once and get parse(), safeParse(), and the TypeScript type all from the same definition.',
      'My favourite pattern: define a Zod schema at the boundary (form submit, API response) and infer the TypeScript type from it. Your types are now guaranteed to match what you actually validate.',
    ),
  },
  {
    title: 'The Amalfi Coast by Scooter: What Nobody Warns You About',
    slug: 'amalfi-coast-scooter-honest-guide',
    excerpt: 'Stunning roads, terrifying buses, and the best limoncello I have ever tasted.',
    tags: ['travel', 'italy', 'adventure'],
    reading_time_minutes: 7,
    published: true,
    published_at: '2025-05-10T08:00:00Z',
    content: doc(
      'The Amalfi Coast road (SS163) is one of the most scenic drives in the world and also one of the narrowest. A rented scooter is the ideal way to experience it — pull over anywhere, park for free, and stop whenever the view demands it.',
      'What nobody tells you: the SITA buses have absolute right of way and the drivers know it. Give them every inch of space when they appear around a blind corner. They are not slowing down.',
      'Ravello, perched 350m above the sea, is the stop most day-trippers skip. The Villa Rufolo gardens at golden hour with the Tyrrhenian below are worth the extra hour of climbing.',
    ),
  },
]

// ─── Changelog entries ────────────────────────────────────────────────────────

const changelog = [
  {
    title: 'Launched PenMark',
    content: 'Initial release of the personal blog. Posts, about page, and admin dashboard are live.',
    version: '1.0.0',
    type: 'feature',
    published_at: '2025-01-01T00:00:00Z',
  },
  {
    title: 'Dark mode support',
    content: 'Added a theme toggle in the header. Preference is persisted across sessions.',
    version: '1.1.0',
    type: 'feature',
    published_at: '2025-01-15T00:00:00Z',
  },
  {
    title: 'Rich-text editor',
    content: 'Replaced the plain textarea with a full TipTap editor supporting headings, lists, code blocks, and images.',
    version: '1.2.0',
    type: 'feature',
    published_at: '2025-01-28T00:00:00Z',
  },
  {
    title: 'Fix: slug uniqueness validation',
    content: 'Duplicate slugs on the create post form now show an inline error instead of a generic server error.',
    version: '1.2.1',
    type: 'fix',
    published_at: '2025-02-03T00:00:00Z',
  },
  {
    title: 'Image upload with HEIC support',
    content: 'Cover images and avatars can now be uploaded directly. HEIC files from iPhone are automatically converted to JPEG.',
    version: '1.3.0',
    type: 'feature',
    published_at: '2025-02-10T00:00:00Z',
  },
  {
    title: 'Improved reading time estimate',
    content: 'Reading time is now calculated automatically from the post content instead of requiring manual input.',
    version: '1.3.1',
    type: 'improvement',
    published_at: '2025-02-20T00:00:00Z',
  },
  {
    title: 'Tag filtering on home page',
    content: 'Readers can now filter posts by tag directly on the home page without a page reload.',
    version: '1.4.0',
    type: 'feature',
    published_at: '2025-03-01T00:00:00Z',
  },
  {
    title: 'Fix: mobile navigation overflow',
    content: 'The mobile menu no longer causes horizontal scroll on small screens.',
    version: '1.4.1',
    type: 'fix',
    published_at: '2025-03-08T00:00:00Z',
  },
  {
    title: 'Changelog page',
    content: 'Added this changelog so readers can follow along with site updates over time.',
    version: '1.5.0',
    type: 'feature',
    published_at: '2025-03-15T00:00:00Z',
  },
  {
    title: 'Performance: lazy-load images',
    content: 'All post cover images now use native lazy loading, improving initial page load on the home page.',
    version: '1.5.1',
    type: 'improvement',
    published_at: '2025-03-22T00:00:00Z',
  },
  {
    title: 'Animated page transitions',
    content: 'Smooth fade-and-slide transitions added between pages using Framer Motion.',
    version: '1.6.0',
    type: 'feature',
    published_at: '2025-04-01T00:00:00Z',
  },
  {
    title: 'Fix: admin sidebar collapse state',
    content: 'The sidebar now remembers its collapsed/expanded state across navigation.',
    version: '1.6.1',
    type: 'fix',
    published_at: '2025-04-10T00:00:00Z',
  },
  {
    title: 'About page redesign',
    content: 'The about page now pulls from the profile data in real time and includes social links.',
    version: '1.7.0',
    type: 'improvement',
    published_at: '2025-04-18T00:00:00Z',
  },
  {
    title: 'Previous / Next post navigation',
    content: 'Added previous and next post links at the bottom of each blog post for easier reading.',
    version: '1.7.1',
    type: 'feature',
    published_at: '2025-04-28T00:00:00Z',
  },
  {
    title: 'Renamed to PenMark',
    content: 'The site has been rebranded from Kutman to PenMark. All titles, headers, and footers updated.',
    version: '1.8.0',
    type: 'improvement',
    published_at: '2025-05-10T00:00:00Z',
  },
]

// ─── Run ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('Fetching admin profile...')
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()

  const authorId = profile?.id ?? null
  if (authorId) console.log(`Using author_id: ${authorId}`)
  else console.log('No admin profile found — posts will have null author_id')

  console.log('\nSeeding posts...')
  const { error: postsError } = await supabase.from('posts').insert(
    posts.map((p) => ({ ...p, author_id: authorId })),
  )
  if (postsError) {
    console.error('Posts error:', postsError.message)
  } else {
    console.log(`✓ Inserted ${posts.length} posts`)
  }

  console.log('\nSeeding changelog...')
  const { error: changelogError } = await supabase.from('changelog_entries').insert(changelog)
  if (changelogError) {
    console.error('Changelog error:', changelogError.message)
  } else {
    console.log(`✓ Inserted ${changelog.length} changelog entries`)
  }

  console.log('\nDone.')
}

seed()
