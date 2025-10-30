"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export type SystemPromptInput = {
  name: string
  promptText: string
  description?: string
  category?: string
  isActive?: boolean
}

export async function getPrompts() {
  try {
    const prompts = await prisma.systemPrompt.findMany({
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: prompts }
  } catch (error) {
    console.error("Failed to fetch prompts:", error)
    return { success: false, error: "Failed to fetch prompts" }
  }
}

export async function getPrompt(id: string) {
  try {
    const prompt = await prisma.systemPrompt.findUnique({
      where: { id },
    })

    if (!prompt) {
      return { success: false, error: "Prompt not found" }
    }

    return { success: true, data: prompt }
  } catch (error) {
    console.error("Failed to fetch prompt:", error)
    return { success: false, error: "Failed to fetch prompt" }
  }
}

export async function getActivePrompt() {
  try {
    const prompt = await prisma.systemPrompt.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    })

    return { success: true, data: prompt }
  } catch (error) {
    console.error("Failed to fetch active prompt:", error)
    return { success: false, error: "Failed to fetch active prompt" }
  }
}

export async function createPrompt(
  input: SystemPromptInput
): Promise<ActionResult> {
  try {
    const prompt = await prisma.systemPrompt.create({
      data: {
        name: input.name,
        promptText: input.promptText,
        description: input.description || null,
        category: input.category || "general",
        isActive: input.isActive ?? false,
        version: 1,
      },
    })

    revalidatePath("/config/prompts")
    return { success: true, data: prompt }
  } catch (error) {
    console.error("Failed to create prompt:", error)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, error: "Prompt name already exists" }
    }
    return { success: false, error: "Failed to create prompt" }
  }
}

export async function updatePrompt(
  id: string,
  input: Partial<SystemPromptInput>
): Promise<ActionResult> {
  try {
    const currentPrompt = await prisma.systemPrompt.findUnique({
      where: { id },
    })

    if (!currentPrompt) {
      return { success: false, error: "Prompt not found" }
    }

    const prompt = await prisma.systemPrompt.update({
      where: { id },
      data: {
        name: input.name,
        promptText: input.promptText,
        description: input.description || null,
        category: input.category,
        isActive: input.isActive,
        version: input.promptText !== currentPrompt.promptText 
          ? currentPrompt.version + 1 
          : currentPrompt.version,
      },
    })

    revalidatePath("/config/prompts")
    return { success: true, data: prompt }
  } catch (error) {
    console.error("Failed to update prompt:", error)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, error: "Prompt name already exists" }
    }
    return { success: false, error: "Failed to update prompt" }
  }
}

export async function deletePrompt(id: string): Promise<ActionResult> {
  try {
    await prisma.systemPrompt.delete({
      where: { id },
    })

    revalidatePath("/config/prompts")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete prompt:", error)
    return { success: false, error: "Failed to delete prompt" }
  }
}

export async function setActivePrompt(id: string): Promise<ActionResult> {
  try {
    await prisma.$transaction([
      prisma.systemPrompt.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      }),
      prisma.systemPrompt.update({
        where: { id },
        data: { isActive: true },
      }),
    ])

    revalidatePath("/config/prompts")
    return { success: true }
  } catch (error) {
    console.error("Failed to set active prompt:", error)
    return { success: false, error: "Failed to set active prompt" }
  }
}
