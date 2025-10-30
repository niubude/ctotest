"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ReviewRule } from "@prisma/client"
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
import { createRule, updateRule } from "@/actions/rules"

const ruleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  ruleType: z.string().min(1, "Rule type is required"),
  severity: z.enum(["low", "medium", "high", "critical"]),
  isEnabled: z.boolean(),
  configuration: z.string().optional(),
})

type RuleFormData = z.infer<typeof ruleSchema>

type RuleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule?: ReviewRule | null
  onSuccess: (rule: ReviewRule) => void
  onCancel: () => void
}

export function RuleDialog({
  open,
  onOpenChange,
  rule,
  onSuccess,
  onCancel,
}: RuleDialogProps) {
  const isEditing = !!rule

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      severity: "medium",
      isEnabled: true,
    },
  })

  const isEnabled = watch("isEnabled")

  useEffect(() => {
    if (rule) {
      reset({
        name: rule.name,
        description: rule.description || "",
        ruleType: rule.ruleType,
        severity: rule.severity as "low" | "medium" | "high" | "critical",
        isEnabled: rule.isEnabled,
        configuration: rule.configuration || "",
      })
    } else {
      reset({
        name: "",
        description: "",
        ruleType: "",
        severity: "medium",
        isEnabled: true,
        configuration: "",
      })
    }
  }, [rule, reset])

  const onSubmit = async (data: RuleFormData) => {
    try {
      const result = isEditing
        ? await updateRule(rule.id, data)
        : await createRule(data)

      if (result.success) {
        toast.success(
          isEditing ? "Rule updated successfully" : "Rule created successfully"
        )
        onSuccess(result.data as ReviewRule)
      } else {
        toast.error(result.error || "Failed to save rule")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Rule" : "Add Rule"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the review rule configuration."
              : "Add a new review rule for code analysis."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Check for SQL Injection"
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
              placeholder="Describe what this rule checks for"
              rows={2}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ruleType">Rule Type *</Label>
              <Input
                id="ruleType"
                {...register("ruleType")}
                placeholder="security, performance, style"
              />
              {errors.ruleType && (
                <p className="text-sm text-red-500">{errors.ruleType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity *</Label>
              <select
                id="severity"
                {...register("severity")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              {errors.severity && (
                <p className="text-sm text-red-500">{errors.severity.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="configuration">Configuration (JSON)</Label>
            <Textarea
              id="configuration"
              {...register("configuration")}
              placeholder='{"patterns": ["SELECT.*FROM"], "excludes": []}'
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Optional JSON configuration for rule-specific settings
            </p>
            {errors.configuration && (
              <p className="text-sm text-red-500">
                {errors.configuration.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isEnabled"
              checked={isEnabled}
              onCheckedChange={(checked) => setValue("isEnabled", checked)}
            />
            <Label htmlFor="isEnabled">Enabled</Label>
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
