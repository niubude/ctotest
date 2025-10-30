import { ReviewService } from '../services/reviewService';
import { MockAIProvider } from '../providers/MockAIProvider';
import { SVNService } from '../services/svnService';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    reviewSession: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    reviewFinding: {
      create: jest.fn(),
    },
    systemPrompt: {
      findFirst: jest.fn(),
    },
    reviewRule: {
      findMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('ReviewService', () => {
  let reviewService: ReviewService;
  let mockAIProvider: MockAIProvider;
  let mockSVNService: SVNService;
  let prisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAIProvider = new MockAIProvider();
    mockSVNService = new SVNService();
    reviewService = new ReviewService(mockAIProvider, mockSVNService);
    prisma = new PrismaClient();
  });

  describe('reviewCommits', () => {
    it('should create a review session and process commits', async () => {
      const mockSessionId = 'session-123';
      const commitIds = ['commit-1', 'commit-2'];

      prisma.reviewSession.create.mockResolvedValue({
        id: mockSessionId,
        commitIds,
        aiProvider: 'mock',
        aiModel: 'default',
        status: 'in_progress',
      });

      prisma.systemPrompt.findFirst.mockResolvedValue({
        id: 'prompt-1',
        name: 'Default',
        prompt: 'Review this code',
        isActive: true,
      });

      prisma.reviewRule.findMany.mockResolvedValue([
        {
          id: 'rule-1',
          name: 'No console.log',
          rule: 'Avoid console.log',
          enabled: true,
        },
      ]);

      prisma.reviewFinding.create.mockResolvedValue({});
      prisma.reviewSession.update.mockResolvedValue({});

      const result = await reviewService.reviewCommits(commitIds);

      expect(result).toBe(mockSessionId);
      expect(prisma.reviewSession.create).toHaveBeenCalledWith({
        data: {
          commitIds,
          aiProvider: 'mock',
          aiModel: 'default',
          status: 'in_progress',
        },
      });
      expect(prisma.reviewSession.update).toHaveBeenCalledWith({
        where: { id: mockSessionId },
        data: {
          status: 'completed',
          completedAt: expect.any(Date),
        },
      });
    });

    it('should handle errors and update session status', async () => {
      const mockSessionId = 'session-123';
      const commitIds = ['commit-1'];

      prisma.reviewSession.create.mockResolvedValue({
        id: mockSessionId,
        commitIds,
        aiProvider: 'mock',
        aiModel: 'default',
        status: 'in_progress',
      });

      prisma.systemPrompt.findFirst.mockResolvedValue(null);
      prisma.reviewRule.findMany.mockResolvedValue([]);

      const failingProvider = new MockAIProvider(true);
      const failingService = new ReviewService(failingProvider, mockSVNService);

      await expect(failingService.reviewCommits(commitIds)).rejects.toThrow();

      expect(prisma.reviewSession.update).toHaveBeenCalledWith({
        where: { id: mockSessionId },
        data: {
          status: 'failed',
          error: expect.any(String),
          completedAt: expect.any(Date),
        },
      });
    });
  });

  describe('getReviewSession', () => {
    it('should retrieve a review session with findings', async () => {
      const sessionId = 'session-123';
      const mockSession = {
        id: sessionId,
        commitIds: ['commit-1'],
        aiProvider: 'mock',
        aiModel: 'default',
        status: 'completed',
        reviewFindings: [
          {
            id: 'finding-1',
            commitId: 'commit-1',
            severity: 'low',
            category: 'Code Quality',
            title: 'Issue found',
            description: 'Description',
          },
        ],
      };

      prisma.reviewSession.findUnique.mockResolvedValue(mockSession);

      const result = await reviewService.getReviewSession(sessionId);

      expect(result).toEqual(mockSession);
      expect(prisma.reviewSession.findUnique).toHaveBeenCalledWith({
        where: { id: sessionId },
        include: { reviewFindings: true },
      });
    });
  });

  describe('getActiveSystemPrompt', () => {
    it('should return active system prompt', async () => {
      const mockPrompt = {
        id: 'prompt-1',
        name: 'Custom',
        prompt: 'Custom prompt',
        isActive: true,
      };

      prisma.systemPrompt.findFirst.mockResolvedValue(mockPrompt);

      const result = await reviewService.getActiveSystemPrompt();

      expect(result).toEqual(mockPrompt);
    });

    it('should return default prompt if none active', async () => {
      prisma.systemPrompt.findFirst.mockResolvedValue(null);

      const result = await reviewService.getActiveSystemPrompt();

      expect(result.name).toBe('Default');
      expect(result.prompt).toContain('expert code reviewer');
    });
  });

  describe('getEnabledRules', () => {
    it('should return enabled rules', async () => {
      const mockRules = [
        {
          id: 'rule-1',
          name: 'Rule 1',
          rule: 'Rule description',
          enabled: true,
        },
      ];

      prisma.reviewRule.findMany.mockResolvedValue(mockRules);

      const result = await reviewService.getEnabledRules();

      expect(result).toEqual(mockRules);
      expect(prisma.reviewRule.findMany).toHaveBeenCalledWith({
        where: { enabled: true },
      });
    });
  });
});
