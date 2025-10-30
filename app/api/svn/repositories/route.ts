import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const repositories = await prisma.repository.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(repositories)
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, url, description, username, password } = body

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      )
    }

    const repository = await prisma.repository.create({
      data: {
        name,
        url,
        description,
        username,
        password,
      },
    })

    return NextResponse.json(repository, { status: 201 })
  } catch (error) {
    console.error('Error creating repository:', error)
    return NextResponse.json(
      { error: 'Failed to create repository' },
      { status: 500 }
    )
  }
}
