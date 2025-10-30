'use client'

import { useEffect, useState } from 'react'
import { SVNCommit } from '@/app/api/svn/commits/route'
import { FileDiff } from '@/app/api/svn/diff/route'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, File, AlertCircle } from 'lucide-react'
import ReactDiffViewer from 'react-diff-viewer-continued'

interface CommitDetailProps {
  commit: SVNCommit | null
  repositoryId: string | null
  open: boolean
  onClose: () => void
}

export function CommitDetail({
  commit,
  repositoryId,
  open,
  onClose,
}: CommitDetailProps) {
  const [diffs, setDiffs] = useState<FileDiff[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && commit && repositoryId) {
      setIsLoading(true)
      setError(null)

      fetch(`/api/svn/diff?repositoryId=${repositoryId}&revision=${commit.revision}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch diff')
          return res.json()
        })
        .then((data) => {
          setDiffs(data)
          setIsLoading(false)
        })
        .catch((err) => {
          setError(err.message)
          setIsLoading(false)
        })
    }
  }, [open, commit, repositoryId])

  if (!commit) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Commit r{commit.revision}
          </SheetTitle>
          <SheetDescription>
            by {commit.author} on{' '}
            {new Date(commit.date).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Commit Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{commit.message}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Changed Files ({commit.changedPaths.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {commit.changedPaths.map((path) => (
                  <li key={path} className="text-sm font-mono text-muted-foreground">
                    {path}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 border border-destructive rounded-md text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {!isLoading && !error && diffs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">File Diffs</h3>
              {diffs.map((diff, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <File className="h-4 w-4" />
                      {diff.path}
                      <span
                        className={`ml-auto text-xs px-2 py-1 rounded ${
                          diff.changeType === 'added'
                            ? 'bg-green-100 text-green-800'
                            : diff.changeType === 'deleted'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {diff.changeType}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-xs overflow-x-auto">
                      <ReactDiffViewer
                        oldValue={diff.oldContent}
                        newValue={diff.newContent}
                        splitView={false}
                        hideLineNumbers={false}
                        showDiffOnly={false}
                        useDarkTheme={false}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
