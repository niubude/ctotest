"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export type ReviewRuleInput = {
  name: string
  description?: string
  ruleType: string
  severity: string
  isEnabled?: boolean
  configuration?: string
}

export async function getRules() {
  try {
    const rules = await prisma.reviewRule.findMany({
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: rules }
  } catch (error) {
    console.error("Failed to fetch rules:", error)
    return { success: false, error: "Failed to fetch rules" }
  }
}

export async function getRule(id: string) {
  try {
    const rule = await prisma.reviewRule.findUnique({
      where: { id },
    })

    if (!rule) {
      return { success: false, error: "Rule not found" }
    }

    return { success: true, data: rule }
  } catch (error) {
    console.error("Failed to fetch rule:", error)
    return { success: false, error: "Failed to fetch rule" }
  }
}

export async function createRule(
  input: ReviewRuleInput
): Promise<ActionResult> {
  try {
    const rule = await prisma.reviewRule.create({
      data: {
        name: input.name,
        description: input.description || null,
        ruleType: input.ruleType,
        severity: input.severity,
        isEnabled: input.isEnabled ?? true,
        configuration: input.configuration || null,
      },
    })

    revalidatePath("/config/rules")
    return { success: true, data: rule }
  } catch (error) {
    console.error("Failed to create rule:", error)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, error: "Rule name already exists" }
    }
    return { success: false, error: "Failed to create rule" }
  }
}

export async function updateRule(
  id: string,
  input: Partial<ReviewRuleInput>
): Promise<ActionResult> {
  try {
    const rule = await prisma.reviewRule.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description || null,
        ruleType: input.ruleType,
        severity: input.severity,
        isEnabled: input.isEnabled,
        configuration: input.configuration || null,
      },
    })

    revalidatePath("/config/rules")
    return { success: true, data: rule }
  } catch (error) {
    console.error("Failed to update rule:", error)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, error: "Rule name already exists" }
    }
    return { success: false, error: "Failed to update rule" }
  }
}

export async function deleteRule(id: string): Promise<ActionResult> {
  try {
    await prisma.reviewRule.delete({
      where: { id },
    })

    revalidatePath("/config/rules")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete rule:", error)
    return { success: false, error: "Failed to delete rule" }
  }
}

export async function toggleRuleEnabled(
  id: string,
  isEnabled: boolean
): Promise<ActionResult> {
  try {
    const rule = await prisma.reviewRule.update({
      where: { id },
      data: { isEnabled },
    })

    revalidatePath("/config/rules")
    return { success: true, data: rule }
  } catch (error) {
    console.error("Failed to toggle rule:", error)
    return { success: false, error: "Failed to toggle rule status" }
  }
}
