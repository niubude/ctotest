"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SvnRepository } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { createRepository, updateRepository } from "@/actions/repositories"

const repositorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  url: z.string().url("Must be a valid URL"),
  username: z.string().optional(),
  password: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
})

type RepositoryFormData = z.infer<typeof repositorySchema>

type RepositoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  repository?: Omit<SvnRepository, "password"> | null
  onSuccess: (repository: Omit<SvnRepository, "password">) => void
  onCancel: () => void
}

export function RepositoryDialog({
  open,
  onOpenChange,
  repository,
  onSuccess,
  onCancel,
}: RepositoryDialogProps) {
  const isEditing = !!repository

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RepositoryFormData>({
    resolver: zodResolver(repositorySchema),
    defaultValues: {
      isActive: true,
    },
  })

  const isActive = watch("isActive")

  useEffect(() => {
    if (repository) {
      reset({
        name: repository.name,
        url: repository.url,
        username: repository.username || "",
        password: "",
        description: repository.description || "",
        isActive: repository.isActive,
      })
    } else {
      reset({
        name: "",
        url: "",
        username: "",
        password: "",
        description: "",
        isActive: true,
      })
    }
  }, [repository, reset])

  const onSubmit = async (data: RepositoryFormData) => {
    try {
      const result = isEditing
        ? await updateRepository(repository.id, data)
        : await createRepository(data)

      if (result.success) {
        toast.success(
          isEditing
            ? "Repository updated successfully"
            : "Repository created successfully"
        )
        onSuccess(result.data as Omit<SvnRepository, "password">)
      } else {
        toast.error(result.error || "Failed to save repository")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Repository" : "Add Repository"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the repository configuration."
              : "Add a new SVN repository configuration."}
            <br />
            <span className="text-yellow-600 dark:text-yellow-500">
              Note: Passwords are hashed and stored securely.
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="My SVN Repository"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Repository URL *</Label>
            <Input
              id="url"
              {...register("url")}
              placeholder="https://svn.example.com/repo"
            />
            {errors.url && (
              <p className="text-sm text-red-500">{errors.url.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...register("username")}
                placeholder="svn_user"
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password {isEditing && "(leave blank to keep current)"}
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder={isEditing ? "••••••••" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Optional description for this repository"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
