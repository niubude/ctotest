import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export type SVNCommit = {
  revision: number
  author: string
  date: string
  message: string
  changedPaths: string[]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const repositoryId = searchParams.get('repositoryId')
    const keyword = searchParams.get('keyword')
    const author = searchParams.get('author')

    if (!repositoryId) {
      return NextResponse.json(
        { error: 'Repository ID is required' },
        { status: 400 }
      )
    }

    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
    })

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      )
    }

    const mockCommits: SVNCommit[] = [
      {
        revision: 1234,
        author: 'john.doe',
        date: new Date('2024-01-15T10:30:00Z').toISOString(),
        message: 'Fix authentication bug in login module',
        changedPaths: ['/trunk/src/auth/login.ts', '/trunk/tests/auth.test.ts'],
      },
      {
        revision: 1233,
        author: 'jane.smith',
        date: new Date('2024-01-14T15:45:00Z').toISOString(),
        message: 'Add new dashboard feature with charts',
        changedPaths: [
          '/trunk/src/dashboard/index.ts',
          '/trunk/src/dashboard/charts.ts',
          '/trunk/src/styles/dashboard.css',
        ],
      },
      {
        revision: 1232,
        author: 'john.doe',
        date: new Date('2024-01-14T09:20:00Z').toISOString(),
        message: 'Update dependencies and fix security vulnerabilities',
        changedPaths: ['/trunk/package.json', '/trunk/package-lock.json'],
      },
      {
        revision: 1231,
        author: 'bob.wilson',
        date: new Date('2024-01-13T14:15:00Z').toISOString(),
        message: 'Refactor database queries for better performance',
        changedPaths: [
          '/trunk/src/database/queries.ts',
          '/trunk/src/database/index.ts',
        ],
      },
      {
        revision: 1230,
        author: 'jane.smith',
        date: new Date('2024-01-12T11:00:00Z').toISOString(),
        message: 'Add unit tests for user service',
        changedPaths: ['/trunk/tests/user.test.ts'],
      },
    ]

    let filteredCommits = mockCommits

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase()
      filteredCommits = filteredCommits.filter(
        (commit) =>
          commit.message.toLowerCase().includes(lowerKeyword) ||
          commit.changedPaths.some((path) =>
            path.toLowerCase().includes(lowerKeyword)
          )
      )
    }

    if (author) {
      const lowerAuthor = author.toLowerCase()
      filteredCommits = filteredCommits.filter((commit) =>
        commit.author.toLowerCase().includes(lowerAuthor)
      )
    }

    return NextResponse.json(filteredCommits)
  } catch (error) {
    console.error('Error fetching commits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commits' },
      { status: 500 }
    )
  }
}
