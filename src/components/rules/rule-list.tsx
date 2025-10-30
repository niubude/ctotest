"use client"

import { useState } from "react"
import { ReviewRule } from "@prisma/client"
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
import { RuleDialog } from "./rule-dialog"
import { deleteRule, toggleRuleEnabled } from "@/actions/rules"

type RuleListProps = {
  rules: ReviewRule[]
}

const severityColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
  critical: "destructive",
}

export function RuleList({ rules: initialRules }: RuleListProps) {
  const [rules, setRules] = useState(initialRules)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<ReviewRule | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) {
      return
    }

    const result = await deleteRule(id)
    if (result.success) {
      setRules(rules.filter((r) => r.id !== id))
      toast.success("Rule deleted successfully")
    } else {
      toast.error(result.error || "Failed to delete rule")
    }
  }

  const handleToggleEnabled = async (id: string, isEnabled: boolean) => {
    const result = await toggleRuleEnabled(id, isEnabled)
    if (result.success) {
      setRules(rules.map((r) => (r.id === id ? { ...r, isEnabled } : r)))
      toast.success(`Rule ${isEnabled ? "enabled" : "disabled"}`)
    } else {
      toast.error(result.error || "Failed to toggle rule status")
    }
  }

  const handleEdit = (rule: ReviewRule) => {
    setEditingRule(rule)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingRule(null)
  }

  const handleSuccess = (rule: ReviewRule) => {
    if (editingRule) {
      setRules(rules.map((r) => (r.id === rule.id ? rule : r)))
    } else {
      setRules([rule, ...rules])
    }
    handleDialogClose()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Review Rules</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Enabled</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No rules configured. Add one to get started.
              </TableCell>
            </TableRow>
          ) : (
            rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{rule.name}</div>
                    {rule.description && (
                      <div className="text-xs text-muted-foreground">
                        {rule.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{rule.ruleType}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={severityColors[rule.severity] || "default"}>
                    {rule.severity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={rule.isEnabled ? "default" : "secondary"}>
                    {rule.isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={rule.isEnabled}
                    onCheckedChange={(checked) =>
                      handleToggleEnabled(rule.id, checked)
                    }
                  />
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(rule)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <RuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={editingRule}
        onSuccess={handleSuccess}
        onCancel={handleDialogClose}
      />
    </div>
  )
}
