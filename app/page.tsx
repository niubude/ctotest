'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Repository } from '@prisma/client'
import { SVNCommit } from '@/app/api/svn/commits/route'
import { RepositorySelector } from '@/components/repository-selector'
import { CommitList } from '@/components/commit-list'
import { CommitDetail } from '@/components/commit-detail'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GitBranch, AlertCircle } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Home() {
  const [selectedRepository, setSelectedRepository] = useState<string | null>(null)
  const [selectedCommits, setSelectedCommits] = useState<Set<number>>(new Set())
  const [selectedCommit, setSelectedCommit] = useState<SVNCommit | null>(null)
  const [filters, setFilters] = useState({ keyword: '', author: '' })
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const {
    data: repositories,
    error: repoError,
    isLoading: repoLoading,
  } = useSWR<Repository[]>('/api/svn/repositories', fetcher)

  const commitsUrl = selectedRepository
    ? `/api/svn/commits?repositoryId=${selectedRepository}&keyword=${filters.keyword}&author=${filters.author}`
    : null

  const {
    data: commits,
    error: commitsError,
    isLoading: commitsLoading,
  } = useSWR<SVNCommit[]>(commitsUrl, fetcher)

  useEffect(() => {
    if (repositories && repositories.length > 0 && !selectedRepository) {
      setSelectedRepository(repositories[0].id)
    }
  }, [repositories, selectedRepository])

  const handleRepositoryChange = (repositoryId: string) => {
    setSelectedRepository(repositoryId)
    setSelectedCommits(new Set())
    setFilters({ keyword: '', author: '' })
  }

  const handleCommitSelect = (revision: number, selected: boolean) => {
    setSelectedCommits((prev) => {
      const next = new Set(prev)
      if (selected) {
        next.add(revision)
      } else {
        next.delete(revision)
      }
      return next
    })
  }

  const handleCommitClick = (commit: SVNCommit) => {
    setSelectedCommit(commit)
    setIsDetailOpen(true)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center gap-3">
          <GitBranch className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">SVN Commit Viewer</h1>
            <p className="text-muted-foreground">
              Browse and manage SVN repository commits
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Repository Selection</CardTitle>
            <CardDescription>
              Select a repository to view its commit history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {repoError && (
              <div className="flex items-center gap-2 p-4 border border-destructive rounded-md text-destructive mb-4">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Failed to load repositories</span>
              </div>
            )}
            <RepositorySelector
              repositories={repositories || []}
              selectedRepository={selectedRepository}
              onRepositoryChange={handleRepositoryChange}
              isLoading={repoLoading}
            />
          </CardContent>
        </Card>

        {selectedRepository && (
          <Card>
            <CardHeader>
              <CardTitle>Commit History</CardTitle>
              <CardDescription>
                Filter and select commits to view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {commitsError && (
                <div className="flex items-center gap-2 p-4 border border-destructive rounded-md text-destructive mb-4">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm">Failed to load commits</span>
                </div>
              )}
              <CommitList
                commits={commits || []}
                selectedCommits={selectedCommits}
                onCommitSelect={handleCommitSelect}
                onCommitClick={handleCommitClick}
                onFilterChange={setFilters}
                isLoading={commitsLoading}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <CommitDetail
        commit={selectedCommit}
        repositoryId={selectedRepository}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </main>
  )
}
