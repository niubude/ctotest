import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RepositoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">
            Manage your SVN repositories
          </p>
        </div>
        <Button>Add Repository</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No repositories yet</CardTitle>
          <CardDescription>
            Get started by adding your first SVN repository
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click the &quot;Add Repository&quot; button to connect your SVN repository and start reviewing code.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
