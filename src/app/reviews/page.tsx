import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Code Reviews</h1>
          <p className="text-muted-foreground">
            Browse and manage your code reviews
          </p>
        </div>
        <Button>New Review</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No reviews yet</CardTitle>
          <CardDescription>
            Create your first code review from a commit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Once you&apos;ve connected a repository, you can select commits and generate AI-powered code reviews.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
