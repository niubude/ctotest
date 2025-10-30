import { MockAIProvider } from '../providers/MockAIProvider';
import { OpenAIProvider } from '../providers/OpenAIProvider';
import { ReviewRequest } from '../types';

describe('MockAIProvider', () => {
  it('should generate review findings for commits', async () => {
    const provider = new MockAIProvider();
    
    const request: ReviewRequest = {
      commitIds: ['commit-1'],
      systemPrompt: 'Review this code',
      rules: [],
      commits: [
        {
          id: 'commit-1',
          message: 'Short',
          author: 'test@example.com',
          timestamp: new Date(),
          diff: 'console.log("test");'
        }
      ]
    };

    const response = await provider.generateReview(request);

    expect(response.findings).toBeDefined();
    expect(response.findings.length).toBeGreaterThan(0);
    expect(response.summary).toBeDefined();
    expect(response.findings[0]).toHaveProperty('commitId');
    expect(response.findings[0]).toHaveProperty('severity');
    expect(response.findings[0]).toHaveProperty('category');
    expect(response.findings[0]).toHaveProperty('title');
    expect(response.findings[0]).toHaveProperty('description');
  });

  it('should detect console.log statements', async () => {
    const provider = new MockAIProvider();
    
    const request: ReviewRequest = {
      commitIds: ['commit-1'],
      systemPrompt: 'Review this code',
      rules: [],
      commits: [
        {
          id: 'commit-1',
          message: 'Add logging',
          author: 'test@example.com',
          timestamp: new Date(),
          diff: '+ console.log("debug");'
        }
      ]
    };

    const response = await provider.generateReview(request);
    const consoleLogFinding = response.findings.find(f => 
      f.title.toLowerCase().includes('debug')
    );

    expect(consoleLogFinding).toBeDefined();
  });

  it('should detect short commit messages', async () => {
    const provider = new MockAIProvider();
    
    const request: ReviewRequest = {
      commitIds: ['commit-1'],
      systemPrompt: 'Review this code',
      rules: [],
      commits: [
        {
          id: 'commit-1',
          message: 'fix',
          author: 'test@example.com',
          timestamp: new Date(),
          diff: '+ // fix'
        }
      ]
    };

    const response = await provider.generateReview(request);
    const shortMessageFinding = response.findings.find(f => 
      f.title.toLowerCase().includes('short')
    );

    expect(shortMessageFinding).toBeDefined();
  });

  it('should handle failure scenarios', async () => {
    const provider = new MockAIProvider(true);
    
    const request: ReviewRequest = {
      commitIds: ['commit-1'],
      systemPrompt: 'Review this code',
      rules: [],
      commits: [
        {
          id: 'commit-1',
          message: 'Test commit',
          author: 'test@example.com',
          timestamp: new Date(),
          diff: '+ test'
        }
      ]
    };

    await expect(provider.generateReview(request)).rejects.toThrow('Mock AI provider failure');
  });

  it('should build proper prompt', async () => {
    const provider = new MockAIProvider();
    
    const request: ReviewRequest = {
      commitIds: ['commit-1'],
      systemPrompt: 'You are a code reviewer',
      rules: [
        {
          id: '1',
          name: 'No console.log',
          description: 'Avoid console.log',
          rule: 'Do not use console.log in production code',
          enabled: true
        }
      ],
      commits: [
        {
          id: 'commit-1',
          message: 'Test commit',
          author: 'test@example.com',
          timestamp: new Date(),
          diff: '+ test'
        }
      ]
    };

    const response = await provider.generateReview(request);
    expect(response).toBeDefined();
  });
});

describe('OpenAIProvider', () => {
  it('should have correct name', () => {
    const provider = new OpenAIProvider({
      apiKey: 'test-key',
      model: 'gpt-4'
    });

    expect(provider.getName()).toBe('openai');
  });

  it('should support streaming', () => {
    const provider = new OpenAIProvider({
      apiKey: 'test-key',
      model: 'gpt-4'
    });

    expect(provider.supportsStreaming()).toBe(true);
  });
});
