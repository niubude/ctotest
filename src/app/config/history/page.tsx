import { getReviewSessions } from "@/actions/reviews"
import { ReviewList } from "@/components/reviews/review-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function HistoryPage() {
  const result = await getReviewSessions()
  const sessions = result.success ? result.data || [] : []

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Review History</CardTitle>
          <CardDescription>
            View past code review sessions with their findings and details. Click the expand button to see more information about each session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewList sessions={sessions} />
        </CardContent>
      </Card>
    </div>
  )
}
