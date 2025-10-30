import { getRules } from "@/actions/rules"
import { RuleList } from "@/components/rules/rule-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function RulesPage() {
  const result = await getRules()
  const rules = result.success ? result.data || [] : []

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Review Rules Configuration</CardTitle>
          <CardDescription>
            Define rules and criteria for code review analysis. Enable or disable rules as needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RuleList rules={rules} />
        </CardContent>
      </Card>
    </div>
  )
}
