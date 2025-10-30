"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SystemPrompt } from "@prisma/client"
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
import { createPrompt, updatePrompt } from "@/actions/prompts"

const promptSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  promptText: z.string().min(10, "Prompt text must be at least 10 characters"),
  description: z.string().optional(),
  category: z.string().min(1),
  isActive: z.boolean(),
})

type PromptFormData = z.infer<typeof promptSchema>

type PromptDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt?: SystemPrompt | null
  onSuccess: (prompt: SystemPrompt) => void
  onCancel: () => void
}

export function PromptDialog({
  open,
  onOpenChange,
  prompt,
  onSuccess,
  onCancel,
}: PromptDialogProps) {
  const isEditing = !!prompt

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      category: "general",
      isActive: false,
    },
  })

  const isActive = watch("isActive")

  useEffect(() => {
    if (prompt) {
      reset({
        name: prompt.name,
        promptText: prompt.promptText,
        description: prompt.description || "",
        category: prompt.category,
        isActive: prompt.isActive,
      })
    } else {
      reset({
        name: "",
        promptText: "",
        description: "",
        category: "general",
        isActive: false,
      })
    }
  }, [prompt, reset])

  const onSubmit = async (data: PromptFormData) => {
    try {
      const result = isEditing
        ? await updatePrompt(prompt.id, data)
        : await createPrompt(data)

      if (result.success) {
        toast.success(
          isEditing
            ? "Prompt updated successfully"
            : "Prompt created successfully"
        )
        onSuccess(result.data as SystemPrompt)
      } else {
        toast.error(result.error || "Failed to save prompt")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Prompt" : "Add Prompt"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the system prompt configuration. Changes increment the version."
              : "Add a new system prompt for AI-powered code review."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Security-focused Review"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe the purpose of this prompt"
              rows={2}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="general, security, performance"
            />
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="promptText">Prompt Text *</Label>
            <Textarea
              id="promptText"
              {...register("promptText")}
              placeholder="You are an expert code reviewer. Analyze the following code for security vulnerabilities, performance issues, and best practices..."
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This text will be used as the system prompt for AI code review
            </p>
            {errors.promptText && (
              <p className="text-sm text-red-500">{errors.promptText.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
            <Label htmlFor="isActive">Set as Active</Label>
            <p className="text-xs text-muted-foreground ml-2">
              (Only one prompt can be active at a time)
            </p>
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
