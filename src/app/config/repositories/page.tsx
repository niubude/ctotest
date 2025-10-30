import { getRepositories } from "@/actions/repositories"
import { RepositoryList } from "@/components/repositories/repository-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function RepositoriesPage() {
  const result = await getRepositories()
  const repositories = result.success ? result.data || [] : []

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Repository Configuration</CardTitle>
          <CardDescription>
            Manage SVN repository connections for code review. Credentials are encrypted and stored securely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RepositoryList repositories={repositories} />
        </CardContent>
      </Card>
    </div>
  )
}
