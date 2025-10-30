import { ReviewRequest, ReviewResponse } from '../types';

export interface AIProvider {
  generateReview(request: ReviewRequest): Promise<ReviewResponse>;
  supportsStreaming(): boolean;
  getName(): string;
}

export abstract class BaseAIProvider implements AIProvider {
  abstract generateReview(request: ReviewRequest): Promise<ReviewResponse>;

  supportsStreaming(): boolean {
    return false;
  }

  abstract getName(): string;

  protected buildPrompt(request: ReviewRequest): string {
    let prompt = `${request.systemPrompt}\n\n`;
    
    if (request.rules.length > 0) {
      prompt += '## Review Rules\n';
      request.rules.forEach(rule => {
        prompt += `- ${rule.name}: ${rule.rule}\n`;
      });
      prompt += '\n';
    }

    prompt += '## Commits to Review\n\n';
    request.commits.forEach(commit => {
      prompt += `### Commit: ${commit.id}\n`;
      prompt += `Author: ${commit.author}\n`;
      prompt += `Date: ${commit.timestamp.toISOString()}\n`;
      prompt += `Message: ${commit.message}\n\n`;
      prompt += '```diff\n';
      prompt += commit.diff;
      prompt += '\n```\n\n';
    });

    prompt += `\n## Instructions
Please review the above commits and provide structured feedback in the following JSON format:
{
  "findings": [
    {
      "commitId": "commit_id",
      "severity": "critical|high|medium|low|info",
      "category": "category_name",
      "title": "Brief title",
      "description": "Detailed description",
      "filePath": "path/to/file (optional)",
      "lineNumber": 123 (optional),
      "suggestion": "How to fix (optional)"
    }
  ],
  "summary": "Overall summary of the review"
}`;

    return prompt;
  }

  protected parseResponse(content: string): ReviewResponse {
    try {
      const jsonMatch = content.match(/\{[\s\S]*"findings"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          findings: parsed.findings || [],
          summary: parsed.summary || 'No summary provided'
        };
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }

    return {
      findings: [],
      summary: content.slice(0, 500)
    };
  }
}
