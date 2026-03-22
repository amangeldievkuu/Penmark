import { z } from 'zod'

export const ChangelogTypeEnum = z.enum(['feature', 'improvement', 'fix', 'breaking'])

export const ChangelogEntrySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  content: z.string().min(1),
  version: z.string().default(''),
  type: ChangelogTypeEnum,
  published_at: z.string(),
  created_at: z.string(),
})

export const CreateChangelogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  version: z.string().default(''),
  type: ChangelogTypeEnum,
  published_at: z.string().optional(),
})

export const UpdateChangelogSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  version: z.string().optional(),
  type: ChangelogTypeEnum.optional(),
  published_at: z.string().optional(),
})

export type ChangelogEntry = z.infer<typeof ChangelogEntrySchema>
export type CreateChangelog = z.infer<typeof CreateChangelogSchema>
export type UpdateChangelog = z.infer<typeof UpdateChangelogSchema>
export type ChangelogType = z.infer<typeof ChangelogTypeEnum>
