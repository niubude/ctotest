import { getPrompts } from "@/actions/prompts"
import { PromptList } from "@/components/prompts/prompt-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PromptsPage() {
  const result = await getPrompts()
  const prompts = result.success ? result.data || [] : []

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>System Prompts Configuration</CardTitle>
          <CardDescription>
            Manage AI prompts for code review. Only one prompt can be active at a time. Version is auto-incremented when prompt text changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromptList prompts={prompts} />
        </CardContent>
      </Card>
    </div>
  )
}
