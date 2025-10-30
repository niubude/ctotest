import { PrismaClient } from '@prisma/client';
import { AIProvider } from '../providers/AIProvider';
import { SVNService } from './svnService';
import { ReviewRequest, CommitData } from '../types';

const prisma = new PrismaClient();

export class ReviewService {
  private aiProvider: AIProvider;
  private svnService: SVNService;

  constructor(aiProvider: AIProvider, svnService?: SVNService) {
    this.aiProvider = aiProvider;
    this.svnService = svnService || new SVNService();
  }

  async reviewCommits(commitIds: string[]): Promise<string> {
    const session = await prisma.reviewSession.create({
      data: {
        commitIds,
        aiProvider: this.aiProvider.getName(),
        aiModel: 'default',
        status: 'in_progress'
      }
    });

    try {
      const commits = await this.svnService.getCommits(commitIds);
      
      if (commits.length === 0) {
        throw new Error('No commits found for the provided IDs');
      }

      const systemPrompt = await this.getActiveSystemPrompt();
      const rules = await this.getEnabledRules();

      const request: ReviewRequest = {
        commitIds,
        systemPrompt: systemPrompt.prompt,
        rules,
        commits
      };

      const response = await this.aiProvider.generateReview(request);

      for (const finding of response.findings) {
        await prisma.reviewFinding.create({
          data: {
            reviewSessionId: session.id,
            commitId: finding.commitId,
            severity: finding.severity,
            category: finding.category,
            title: finding.title,
            description: finding.description,
            filePath: finding.filePath,
            lineNumber: finding.lineNumber,
            suggestion: finding.suggestion
          }
        });
      }

      await prisma.reviewSession.update({
        where: { id: session.id },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      });

      return session.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await prisma.reviewSession.update({
        where: { id: session.id },
        data: {
          status: 'failed',
          error: errorMessage,
          completedAt: new Date()
        }
      });

      throw error;
    }
  }

  async getReviewSession(sessionId: string) {
    return prisma.reviewSession.findUnique({
      where: { id: sessionId },
      include: {
        reviewFindings: true
      }
    });
  }

  async getActiveSystemPrompt() {
    const prompt = await prisma.systemPrompt.findFirst({
      where: { isActive: true }
    });

    if (!prompt) {
      return {
        id: 'default',
        name: 'Default',
        prompt: 'You are an expert code reviewer. Review the provided commits for potential issues, bugs, security vulnerabilities, code quality problems, and best practice violations.',
        isActive: true
      };
    }

    return prompt;
  }

  async getEnabledRules() {
    return prisma.reviewRule.findMany({
      where: { enabled: true }
    });
  }
}
