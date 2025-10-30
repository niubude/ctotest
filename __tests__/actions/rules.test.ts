import { prisma } from '@/lib/prisma'
import {
  createRule,
  getRules,
  updateRule,
  deleteRule,
  toggleRuleEnabled,
} from '@/actions/rules'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    reviewRule: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('Rule Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getRules', () => {
    it('should fetch all rules successfully', async () => {
      const mockRules = [
        {
          id: '1',
          name: 'Test Rule',
          description: 'Test rule description',
          ruleType: 'security',
          severity: 'high',
          isEnabled: true,
          configuration: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      ;(prisma.reviewRule.findMany as jest.Mock).mockResolvedValue(mockRules)

      const result = await getRules()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockRules)
    })

    it('should handle errors when fetching rules', async () => {
      ;(prisma.reviewRule.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const result = await getRules()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch rules')
    })
  })

  describe('createRule', () => {
    it('should create a rule successfully', async () => {
      const mockRule = {
        id: '1',
        name: 'New Rule',
        description: 'New rule description',
        ruleType: 'security',
        severity: 'medium',
        isEnabled: true,
        configuration: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.reviewRule.create as jest.Mock).mockResolvedValue(mockRule)

      const result = await createRule({
        name: 'New Rule',
        description: 'New rule description',
        ruleType: 'security',
        severity: 'medium',
        isEnabled: true,
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockRule)
    })

    it('should handle unique constraint error', async () => {
      ;(prisma.reviewRule.create as jest.Mock).mockRejectedValue(
        new Error('Unique constraint failed')
      )

      const result = await createRule({
        name: 'Duplicate',
        ruleType: 'security',
        severity: 'medium',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Rule name already exists')
    })
  })

  describe('toggleRuleEnabled', () => {
    it('should toggle rule enabled status', async () => {
      const mockRule = {
        id: '1',
        isEnabled: false,
      }

      ;(prisma.reviewRule.update as jest.Mock).mockResolvedValue(mockRule)

      const result = await toggleRuleEnabled('1', false)

      expect(result.success).toBe(true)
      expect(prisma.reviewRule.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isEnabled: false },
      })
    })
  })
})
