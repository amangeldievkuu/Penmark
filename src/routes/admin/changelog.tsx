import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getChangelogEntries, createChangelogEntry, updateChangelogEntry, deleteChangelogEntry } from '~/server/functions/changelog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Card } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Dialog, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { useToast } from '~/components/ui/toast'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { formatDateShort } from '~/lib/utils'
import type { ChangelogType } from '~/types/changelog'
import { getAuthHeaders } from '~/lib/auth-headers'

export const Route = createFileRoute('/admin/changelog')({
  loader: () => getChangelogEntries(),
  component: AdminChangelogPage,
})

function AdminChangelogPage() {
  const entries = Route.useLoaderData()
  const router = useRouter()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<{ id: string; title: string; content: string; version?: string; type: ChangelogType } | null>(null)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [version, setVersion] = useState('')
  const [type, setType] = useState<ChangelogType>('improvement')

  const resetForm = () => {
    setTitle('')
    setContent('')
    setVersion('')
    setType('improvement')
    setEditing(null)
  }

  const openNew = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = (entry: { id: string; title: string; content: string; version?: string; type: ChangelogType }) => {
    setEditing(entry)
    setTitle(entry.title)
    setContent(entry.content)
    setVersion(entry.version || '')
    setType(entry.type)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast('Title and content are required', 'error')
      return
    }
    setSaving(true)
    try {
      const headers = await getAuthHeaders()
      if (editing) {
        await updateChangelogEntry({ headers, data: { id: editing.id, title, content, version, type } })
        toast('Entry updated', 'success')
      } else {
        await createChangelogEntry({ headers, data: { title, content, version, type } })
        toast('Entry created', 'success')
      }
      setDialogOpen(false)
      resetForm()
      router.invalidate()
    } catch (err: any) {
      toast(err.message || 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, entryTitle: string) => {
    if (!confirm(`Delete "${entryTitle}"?`)) return
    try {
      const headers = await getAuthHeaders()
      await deleteChangelogEntry({ headers, data: { id } })
      toast('Entry deleted', 'success')
      router.invalidate()
    } catch {
      toast('Failed to delete', 'error')
    }
  }

  const types: ChangelogType[] = ['feature', 'improvement', 'fix', 'breaking']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Changelog</h1>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> New Entry
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-[hsl(var(--muted-foreground))] mb-4">No changelog entries yet.</p>
          <Button onClick={openNew}>Create Entry</Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm">{entry.title}</h3>
                    <Badge variant={entry.type as ChangelogType}>{entry.type}</Badge>
                    {entry.version && (
                      <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">v{entry.version}</span>
                    )}
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-1">{entry.content}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-[hsl(var(--muted-foreground))] mr-2">{formatDateShort(entry.published_at)}</span>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(entry)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry.id, entry.title)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Entry' : 'New Entry'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What changed?" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Content</label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Describe the change..." rows={3} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Version</label>
              <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ChangelogType)}
                className="flex h-9 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-1 text-sm"
              >
                {types.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
