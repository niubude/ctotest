import { prisma } from '@/lib/prisma'
import {
  createRepository,
  getRepositories,
  updateRepository,
  deleteRepository,
  toggleRepositoryActive,
} from '@/actions/repositories'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    svnRepository: {
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

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}))

describe('Repository Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getRepositories', () => {
    it('should fetch all repositories successfully', async () => {
      const mockRepos = [
        {
          id: '1',
          name: 'Test Repo',
          url: 'https://svn.test.com',
          username: 'user',
          description: 'Test',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      ;(prisma.svnRepository.findMany as jest.Mock).mockResolvedValue(mockRepos)

      const result = await getRepositories()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockRepos)
      expect(prisma.svnRepository.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      })
    })

    it('should handle errors when fetching repositories', async () => {
      ;(prisma.svnRepository.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const result = await getRepositories()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch repositories')
    })
  })

  describe('createRepository', () => {
    it('should create a repository with hashed password', async () => {
      const mockRepo = {
        id: '1',
        name: 'New Repo',
        url: 'https://svn.new.com',
        username: 'user',
        password: 'hashed_password',
        description: 'New repo',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.svnRepository.create as jest.Mock).mockResolvedValue(mockRepo)

      const result = await createRepository({
        name: 'New Repo',
        url: 'https://svn.new.com',
        username: 'user',
        password: 'plain_password',
        description: 'New repo',
        isActive: true,
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockRepo)
    })

    it('should handle unique constraint error', async () => {
      ;(prisma.svnRepository.create as jest.Mock).mockRejectedValue(
        new Error('Unique constraint failed')
      )

      const result = await createRepository({
        name: 'Duplicate',
        url: 'https://svn.test.com',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Repository name already exists')
    })
  })

  describe('updateRepository', () => {
    it('should update repository successfully', async () => {
      const mockRepo = {
        id: '1',
        name: 'Updated Repo',
        url: 'https://svn.updated.com',
        username: 'user',
        password: null,
        description: 'Updated',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.svnRepository.update as jest.Mock).mockResolvedValue(mockRepo)

      const result = await updateRepository('1', {
        name: 'Updated Repo',
        url: 'https://svn.updated.com',
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockRepo)
    })
  })

  describe('deleteRepository', () => {
    it('should delete repository successfully', async () => {
      ;(prisma.svnRepository.delete as jest.Mock).mockResolvedValue({})

      const result = await deleteRepository('1')

      expect(result.success).toBe(true)
      expect(prisma.svnRepository.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      })
    })
  })

  describe('toggleRepositoryActive', () => {
    it('should toggle repository active status', async () => {
      const mockRepo = {
        id: '1',
        isActive: false,
      }

      ;(prisma.svnRepository.update as jest.Mock).mockResolvedValue(mockRepo)

      const result = await toggleRepositoryActive('1', false)

      expect(result.success).toBe(true)
      expect(prisma.svnRepository.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isActive: false },
      })
    })
  })
})
