import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getAdminProfile, updateProfile } from '~/server/functions/profile'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { ImageUpload } from '~/components/common/ImageUpload'
import { useToast } from '~/components/ui/toast'
import { useAuth } from '~/hooks/use-auth'
import { useState } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { getAuthHeaders } from '~/lib/auth-headers'

export const Route = createFileRoute('/admin/profile')({
  loader: () => getAdminProfile(),
  component: AdminProfilePage,
})

function AdminProfilePage() {
  const profile = Route.useLoaderData()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [website, setWebsite] = useState(profile?.website || '')
  const [twitter, setTwitter] = useState(profile?.twitter || '')
  const [github, setGithub] = useState(profile?.github || '')

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast('Name is required', 'error')
      return
    }
    setSaving(true)
    try {
      const headers = await getAuthHeaders()
      await updateProfile({
        headers,
        data: {
          id: user?.id ?? profile?.id ?? '',
          full_name: fullName,
          bio,
          avatar_url: avatarUrl,
          website,
          twitter,
          github,
        },
      })
      toast('Profile updated!', 'success')
      router.invalidate()
    } catch (err: any) {
      toast(err.message || 'Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Avatar</label>
            <ImageUpload
              value={avatarUrl}
              onChange={setAvatarUrl}
              path="avatars"
              className="max-w-xs"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Full Name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Website</label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Twitter</label>
              <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="username" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">GitHub</label>
              <Input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="username" />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
