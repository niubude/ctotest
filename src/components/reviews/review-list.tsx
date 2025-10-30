"use client"

import { useState } from "react"
import { ReviewSession, SvnRepository, ReviewRule, SystemPrompt, ReviewFinding } from "@prisma/client"
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type ReviewSessionWithRelations = ReviewSession & {
  repository: Pick<SvnRepository, "id" | "name">
  rule: Pick<ReviewRule, "id" | "name"> | null
  prompt: Pick<SystemPrompt, "id" | "name"> | null
  _count: {
    findings: number
  }
}

type ReviewListProps = {
  sessions: ReviewSessionWithRelations[]
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  "in-progress": "default",
  completed: "default",
  failed: "destructive",
}

export function ReviewList({ sessions: initialSessions }: ReviewListProps) {
  const [sessions] = useState(initialSessions)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  const toggleExpand = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDuration = (startedAt: Date, completedAt: Date | null) => {
    if (!completedAt) return "N/A"
    const duration = new Date(completedAt).getTime() - new Date(startedAt).getTime()
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Review History</h2>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No review sessions found. Start a code review to see history here.
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Repository</TableHead>
              <TableHead>SVN Revision</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Files</TableHead>
              <TableHead>Findings</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <>
                <TableRow key={session.id}>
                  <TableCell>{formatDate(session.startedAt)}</TableCell>
                  <TableCell className="font-medium">
                    {session.repository.name}
                  </TableCell>
                  <TableCell>
                    {session.svnRevision || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[session.status] || "default"}>
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{session.totalFiles}</TableCell>
                  <TableCell>
                    <Badge variant={session.totalFindings > 0 ? "destructive" : "secondary"}>
                      {session.totalFindings}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getDuration(session.startedAt, session.completedAt)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(session.id)}
                    >
                      {expandedSession === session.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedSession === session.id && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-semibold mb-2">Session Details</h4>
                              <div className="space-y-1">
                                <div>
                                  <span className="text-muted-foreground">ID:</span>{" "}
                                  {session.id}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">AI Model:</span>{" "}
                                  {session.aiModel || "N/A"}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Rule:</span>{" "}
                                  {session.rule?.name || "N/A"}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Prompt:</span>{" "}
                                  {session.prompt?.name || "N/A"}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Metadata</h4>
                              <div className="space-y-1">
                                <div>
                                  <span className="text-muted-foreground">Started:</span>{" "}
                                  {formatDate(session.startedAt)}
                                </div>
                                {session.completedAt && (
                                  <div>
                                    <span className="text-muted-foreground">Completed:</span>{" "}
                                    {formatDate(session.completedAt)}
                                  </div>
                                )}
                                <div>
                                  <span className="text-muted-foreground">Total Findings:</span>{" "}
                                  {session._count.findings}
                                </div>
                              </div>
                            </div>
                          </div>
                          {session.metadata && (
                            <div className="mt-4">
                              <h4 className="font-semibold mb-2 text-sm">Additional Metadata</h4>
                              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                {JSON.stringify(JSON.parse(session.metadata), null, 2)}
                              </pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
