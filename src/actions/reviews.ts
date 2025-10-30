"use server"

import { prisma } from "@/lib/prisma"

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export async function getReviewSessions() {
  try {
    const sessions = await prisma.reviewSession.findMany({
      include: {
        repository: {
          select: {
            id: true,
            name: true,
          },
        },
        rule: {
          select: {
            id: true,
            name: true,
          },
        },
        prompt: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            findings: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    })

    return { success: true, data: sessions }
  } catch (error) {
    console.error("Failed to fetch review sessions:", error)
    return { success: false, error: "Failed to fetch review sessions" }
  }
}

export async function getReviewSession(id: string) {
  try {
    const session = await prisma.reviewSession.findUnique({
      where: { id },
      include: {
        repository: true,
        rule: true,
        prompt: true,
        findings: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!session) {
      return { success: false, error: "Review session not found" }
    }

    return { success: true, data: session }
  } catch (error) {
    console.error("Failed to fetch review session:", error)
    return { success: false, error: "Failed to fetch review session" }
  }
}

export async function getReviewFindings(sessionId: string) {
  try {
    const findings = await prisma.reviewFinding.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: findings }
  } catch (error) {
    console.error("Failed to fetch review findings:", error)
    return { success: false, error: "Failed to fetch review findings" }
  }
}
