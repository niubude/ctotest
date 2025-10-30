import { BaseAIProvider } from './AIProvider';
import { ReviewRequest, ReviewResponse, ReviewFinding } from '../types';

export class MockAIProvider extends BaseAIProvider {
  private shouldFail: boolean;
  private delay: number;

  constructor(shouldFail = false, delay = 100) {
    super();
    this.shouldFail = shouldFail;
    this.delay = delay;
  }

  getName(): string {
    return 'mock';
  }

  async generateReview(request: ReviewRequest): Promise<ReviewResponse> {
    await new Promise(resolve => setTimeout(resolve, this.delay));

    if (this.shouldFail) {
      throw new Error('Mock AI provider failure');
    }

    const findings: ReviewFinding[] = [];

    request.commits.forEach(commit => {
      const lines = commit.diff.split('\n');
      const addedLines = lines.filter(line => line.startsWith('+')).length;
      const removedLines = lines.filter(line => line.startsWith('-')).length;

      if (addedLines > 100) {
        findings.push({
          commitId: commit.id,
          severity: 'medium',
          category: 'Code Quality',
          title: 'Large commit detected',
          description: `This commit adds ${addedLines} lines. Consider breaking it into smaller, more focused commits.`,
          suggestion: 'Split the commit into logical units of work.'
        });
      }

      if (commit.message.length < 10) {
        findings.push({
          commitId: commit.id,
          severity: 'low',
          category: 'Documentation',
          title: 'Short commit message',
          description: 'The commit message is too brief. A more descriptive message would improve project history.',
          suggestion: 'Write commit messages that explain the what and why of your changes.'
        });
      }

      if (commit.diff.includes('console.log')) {
        findings.push({
          commitId: commit.id,
          severity: 'low',
          category: 'Code Quality',
          title: 'Debug statement detected',
          description: 'Found console.log statement in the code. Remove debug statements before committing.',
          suggestion: 'Use a proper logging library or remove debug statements.'
        });
      }

      if (commit.diff.includes('TODO') || commit.diff.includes('FIXME')) {
        findings.push({
          commitId: commit.id,
          severity: 'info',
          category: 'Documentation',
          title: 'TODO/FIXME comment found',
          description: 'Found TODO or FIXME comments in the code.',
          suggestion: 'Consider creating tickets for these items or addressing them before committing.'
        });
      }
    });

    if (findings.length === 0) {
      findings.push({
        commitId: request.commits[0]?.id || 'unknown',
        severity: 'info',
        category: 'General',
        title: 'No issues found',
        description: 'The code looks good! No significant issues detected.',
        suggestion: 'Keep up the good work!'
      });
    }

    return {
      findings,
      summary: `Reviewed ${request.commits.length} commit(s) and found ${findings.length} finding(s). This is a mock review generated for testing purposes.`
    };
  }
}
