"use client"

import { useState } from "react"
import { SvnRepository } from "@prisma/client"
import { Pencil, Trash2, Plus } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { RepositoryDialog } from "./repository-dialog"
import { deleteRepository, toggleRepositoryActive } from "@/actions/repositories"

type RepositoryListProps = {
  repositories: Omit<SvnRepository, "password">[]
}

export function RepositoryList({ repositories: initialRepositories }: RepositoryListProps) {
  const [repositories, setRepositories] = useState(initialRepositories)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRepository, setEditingRepository] = useState<Omit<SvnRepository, "password"> | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this repository?")) {
      return
    }

    const result = await deleteRepository(id)
    if (result.success) {
      setRepositories(repositories.filter((r) => r.id !== id))
      toast.success("Repository deleted successfully")
    } else {
      toast.error(result.error || "Failed to delete repository")
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const result = await toggleRepositoryActive(id, isActive)
    if (result.success) {
      setRepositories(
        repositories.map((r) => (r.id === id ? { ...r, isActive } : r))
      )
      toast.success(`Repository ${isActive ? "activated" : "deactivated"}`)
    } else {
      toast.error(result.error || "Failed to toggle repository status")
    }
  }

  const handleEdit = (repository: Omit<SvnRepository, "password">) => {
    setEditingRepository(repository)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingRepository(null)
  }

  const handleSuccess = (repository: Omit<SvnRepository, "password">) => {
    if (editingRepository) {
      setRepositories(
        repositories.map((r) => (r.id === repository.id ? repository : r))
      )
    } else {
      setRepositories([repository, ...repositories])
    }
    handleDialogClose()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">SVN Repositories</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Repository
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repositories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No repositories configured. Add one to get started.
              </TableCell>
            </TableRow>
          ) : (
            repositories.map((repository) => (
              <TableRow key={repository.id}>
                <TableCell className="font-medium">{repository.name}</TableCell>
                <TableCell className="max-w-xs truncate">{repository.url}</TableCell>
                <TableCell>{repository.username || "-"}</TableCell>
                <TableCell>
                  <Badge variant={repository.isActive ? "default" : "secondary"}>
                    {repository.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={repository.isActive}
                    onCheckedChange={(checked) =>
                      handleToggleActive(repository.id, checked)
                    }
                  />
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(repository)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(repository.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <RepositoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        repository={editingRepository}
        onSuccess={handleSuccess}
        onCancel={handleDialogClose}
      />
    </div>
  )
}
