import { prisma } from '@/lib/prisma'
import {
  createPrompt,
  getPrompts,
  updatePrompt,
  deletePrompt,
  setActivePrompt,
} from '@/actions/prompts'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    systemPrompt: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('Prompt Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getPrompts', () => {
    it('should fetch all prompts successfully', async () => {
      const mockPrompts = [
        {
          id: '1',
          name: 'Test Prompt',
          promptText: 'Test prompt text',
          description: 'Test prompt',
          category: 'general',
          isActive: true,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      ;(prisma.systemPrompt.findMany as jest.Mock).mockResolvedValue(mockPrompts)

      const result = await getPrompts()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPrompts)
    })

    it('should handle errors when fetching prompts', async () => {
      ;(prisma.systemPrompt.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const result = await getPrompts()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch prompts')
    })
  })

  describe('createPrompt', () => {
    it('should create a prompt successfully', async () => {
      const mockPrompt = {
        id: '1',
        name: 'New Prompt',
        promptText: 'New prompt text',
        description: 'New prompt',
        category: 'general',
        isActive: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.systemPrompt.create as jest.Mock).mockResolvedValue(mockPrompt)

      const result = await createPrompt({
        name: 'New Prompt',
        promptText: 'New prompt text',
        description: 'New prompt',
        category: 'general',
        isActive: false,
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPrompt)
    })
  })

  describe('updatePrompt', () => {
    it('should increment version when prompt text changes', async () => {
      const currentPrompt = {
        id: '1',
        name: 'Test Prompt',
        promptText: 'Old text',
        description: 'Test',
        category: 'general',
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedPrompt = {
        ...currentPrompt,
        promptText: 'New text',
        version: 2,
      }

      ;(prisma.systemPrompt.findUnique as jest.Mock).mockResolvedValue(currentPrompt)
      ;(prisma.systemPrompt.update as jest.Mock).mockResolvedValue(updatedPrompt)

      const result = await updatePrompt('1', {
        name: 'Test Prompt',
        promptText: 'New text',
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedPrompt)
    })
  })

  describe('setActivePrompt', () => {
    it('should set active prompt and deactivate others', async () => {
      ;(prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}])

      const result = await setActivePrompt('1')

      expect(result.success).toBe(true)
      expect(prisma.$transaction).toHaveBeenCalled()
    })
  })
})
