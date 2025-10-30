"use client"

import { useState } from "react"
import { SystemPrompt } from "@prisma/client"
import { Pencil, Trash2, Plus, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { PromptDialog } from "./prompt-dialog"
import { deletePrompt, setActivePrompt } from "@/actions/prompts"

type PromptListProps = {
  prompts: SystemPrompt[]
}

export function PromptList({ prompts: initialPrompts }: PromptListProps) {
  const [prompts, setPrompts] = useState(initialPrompts)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) {
      return
    }

    const result = await deletePrompt(id)
    if (result.success) {
      setPrompts(prompts.filter((p) => p.id !== id))
      toast.success("Prompt deleted successfully")
    } else {
      toast.error(result.error || "Failed to delete prompt")
    }
  }

  const handleSetActive = async (id: string) => {
    const result = await setActivePrompt(id)
    if (result.success) {
      setPrompts(
        prompts.map((p) => ({
          ...p,
          isActive: p.id === id,
        }))
      )
      toast.success("Active prompt updated")
    } else {
      toast.error(result.error || "Failed to set active prompt")
    }
  }

  const handleEdit = (prompt: SystemPrompt) => {
    setEditingPrompt(prompt)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingPrompt(null)
  }

  const handleSuccess = (prompt: SystemPrompt) => {
    if (editingPrompt) {
      setPrompts(prompts.map((p) => (p.id === prompt.id ? prompt : p)))
    } else {
      setPrompts([prompt, ...prompts])
    }
    handleDialogClose()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Prompts</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Prompt
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prompts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No prompts configured. Add one to get started.
              </TableCell>
            </TableRow>
          ) : (
            prompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="flex items-center gap-2">
                      {prompt.name}
                      {prompt.isActive && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    {prompt.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {prompt.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{prompt.category}</Badge>
                </TableCell>
                <TableCell>v{prompt.version}</TableCell>
                <TableCell>
                  <Badge variant={prompt.isActive ? "default" : "secondary"}>
                    {prompt.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {!prompt.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetActive(prompt.id)}
                    >
                      Set Active
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(prompt)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(prompt.id)}
                    disabled={prompt.isActive}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <PromptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        prompt={editingPrompt}
        onSuccess={handleSuccess}
        onCancel={handleDialogClose}
      />
    </div>
  )
}
