import { z } from 'zod'

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().default(''),
  bio: z.string().default(''),
  avatar_url: z.string().default(''),
  website: z.string().default(''),
  twitter: z.string().default(''),
  github: z.string().default(''),
  role: z.string().default('admin'),
  created_at: z.string(),
  updated_at: z.string(),
})

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  bio: z.string().default(''),
  avatar_url: z.string().default(''),
  website: z.string().default(''),
  twitter: z.string().default(''),
  github: z.string().default(''),
})

export type Profile = z.infer<typeof ProfileSchema>
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>
