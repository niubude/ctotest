'use client'

import { useState } from 'react'
import { SVNCommit } from '@/app/api/svn/commits/route'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, User, FileText, Loader2 } from 'lucide-react'

interface CommitListProps {
  commits: SVNCommit[]
  selectedCommits: Set<number>
  onCommitSelect: (revision: number, selected: boolean) => void
  onCommitClick: (commit: SVNCommit) => void
  onFilterChange: (filters: { keyword: string; author: string }) => void
  isLoading?: boolean
}

export function CommitList({
  commits,
  selectedCommits,
  onCommitSelect,
  onCommitClick,
  onFilterChange,
  isLoading,
}: CommitListProps) {
  const [keyword, setKeyword] = useState('')
  const [author, setAuthor] = useState('')

  const handleFilterApply = () => {
    onFilterChange({ keyword, author })
  }

  const handleSelectAll = (checked: boolean) => {
    commits.forEach((commit) => {
      onCommitSelect(commit.revision, checked)
    })
  }

  const allSelected = commits.length > 0 && commits.every((c) => selectedCommits.has(c.revision))
  const someSelected = commits.some((c) => selectedCommits.has(c.revision)) && !allSelected

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="sr-only">Loading commits...</span>
      </div>
    )
  }

  if (commits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No commits found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or select a different repository
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterApply()}
              className="pl-9"
              data-testid="keyword-filter"
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by author..."
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterApply()}
              className="pl-9"
              data-testid="author-filter"
            />
          </div>
        </div>
        <Button onClick={handleFilterApply} data-testid="apply-filters">
          Apply Filters
        </Button>
      </div>

      {selectedCommits.size > 0 && (
        <div className="bg-muted px-4 py-2 rounded-md text-sm">
          {selectedCommits.size} commit{selectedCommits.size !== 1 ? 's' : ''} selected
        </div>
      )}

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected || someSelected ? (someSelected ? 'indeterminate' : true) : false}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all commits"
                />
              </TableHead>
              <TableHead className="w-24">Revision</TableHead>
              <TableHead className="w-40">Author</TableHead>
              <TableHead className="w-48">Date</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-24">Files</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commits.map((commit) => (
              <TableRow
                key={commit.revision}
                className="cursor-pointer"
                onClick={() => onCommitClick(commit)}
                data-testid={`commit-row-${commit.revision}`}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedCommits.has(commit.revision)}
                    onCheckedChange={(checked) =>
                      onCommitSelect(commit.revision, checked as boolean)
                    }
                    aria-label={`Select commit ${commit.revision}`}
                    data-testid={`commit-checkbox-${commit.revision}`}
                  />
                </TableCell>
                <TableCell className="font-mono">r{commit.revision}</TableCell>
                <TableCell>{commit.author}</TableCell>
                <TableCell>
                  {new Date(commit.date).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell className="max-w-md truncate">{commit.message}</TableCell>
                <TableCell className="text-center">
                  {commit.changedPaths.length}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
