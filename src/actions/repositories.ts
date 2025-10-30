"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export type SvnRepositoryInput = {
  name: string
  url: string
  username?: string
  password?: string
  description?: string
  isActive?: boolean
}

export async function getRepositories() {
  try {
    const repositories = await prisma.svnRepository.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        url: true,
        username: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return { success: true, data: repositories }
  } catch (error) {
    console.error("Failed to fetch repositories:", error)
    return { success: false, error: "Failed to fetch repositories" }
  }
}

export async function getRepository(id: string) {
  try {
    const repository = await prisma.svnRepository.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        url: true,
        username: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!repository) {
      return { success: false, error: "Repository not found" }
    }

    return { success: true, data: repository }
  } catch (error) {
    console.error("Failed to fetch repository:", error)
    return { success: false, error: "Failed to fetch repository" }
  }
}

export async function createRepository(
  input: SvnRepositoryInput
): Promise<ActionResult> {
  try {
    const hashedPassword = input.password
      ? await bcrypt.hash(input.password, 10)
      : null

    const repository = await prisma.svnRepository.create({
      data: {
        name: input.name,
        url: input.url,
        username: input.username || null,
        password: hashedPassword,
        description: input.description || null,
        isActive: input.isActive ?? true,
      },
    })

    revalidatePath("/config/repositories")
    return { success: true, data: repository }
  } catch (error) {
    console.error("Failed to create repository:", error)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, error: "Repository name already exists" }
    }
    return { success: false, error: "Failed to create repository" }
  }
}

export async function updateRepository(
  id: string,
  input: Partial<SvnRepositoryInput>
): Promise<ActionResult> {
  try {
    const updateData: any = {
      name: input.name,
      url: input.url,
      username: input.username || null,
      description: input.description || null,
      isActive: input.isActive,
    }

    if (input.password) {
      updateData.password = await bcrypt.hash(input.password, 10)
    }

    const repository = await prisma.svnRepository.update({
      where: { id },
      data: updateData,
    })

    revalidatePath("/config/repositories")
    return { success: true, data: repository }
  } catch (error) {
    console.error("Failed to update repository:", error)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, error: "Repository name already exists" }
    }
    return { success: false, error: "Failed to update repository" }
  }
}

export async function deleteRepository(id: string): Promise<ActionResult> {
  try {
    await prisma.svnRepository.delete({
      where: { id },
    })

    revalidatePath("/config/repositories")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete repository:", error)
    return { success: false, error: "Failed to delete repository" }
  }
}

export async function toggleRepositoryActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const repository = await prisma.svnRepository.update({
      where: { id },
      data: { isActive },
    })

    revalidatePath("/config/repositories")
    return { success: true, data: repository }
  } catch (error) {
    console.error("Failed to toggle repository:", error)
    return { success: false, error: "Failed to toggle repository status" }
  }
}
