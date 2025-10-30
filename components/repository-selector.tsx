'use client'

import { Repository } from '@prisma/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { GitBranch } from 'lucide-react'

interface RepositorySelectorProps {
  repositories: Repository[]
  selectedRepository: string | null
  onRepositoryChange: (repositoryId: string) => void
  isLoading?: boolean
}

export function RepositorySelector({
  repositories,
  selectedRepository,
  onRepositoryChange,
  isLoading,
}: RepositorySelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="repository-select" className="flex items-center gap-2">
        <GitBranch className="h-4 w-4" />
        Select Repository
      </Label>
      <Select
        value={selectedRepository || undefined}
        onValueChange={onRepositoryChange}
        disabled={isLoading}
      >
        <SelectTrigger id="repository-select" className="w-full">
          <SelectValue placeholder="Choose a repository..." />
        </SelectTrigger>
        <SelectContent>
          {repositories.map((repo) => (
            <SelectItem key={repo.id} value={repo.id}>
              <div className="flex flex-col">
                <span className="font-medium">{repo.name}</span>
                {repo.description && (
                  <span className="text-xs text-muted-foreground">
                    {repo.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
