import { BaseAIProvider } from './AIProvider';
import { AIProviderConfig, ReviewRequest, ReviewResponse } from '../types';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIChatCompletionRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface OpenAIChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIProvider extends BaseAIProvider {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    super();
    this.config = {
      apiBaseUrl: 'https://api.openai.com/v1',
      timeout: 30000,
      ...config
    };
  }

  getName(): string {
    return 'openai';
  }

  async generateReview(request: ReviewRequest): Promise<ReviewResponse> {
    const prompt = this.buildPrompt(request);

    const requestBody: OpenAIChatCompletionRequest = {
      model: this.config.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4096
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.apiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }

      const data: OpenAIChatCompletionResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenAI');
      }

      const content = data.choices[0].message.content;
      return this.parseResponse(content);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('AI request timed out');
        }
        throw error;
      }
      throw new Error('Unknown error occurred during AI request');
    }
  }

  supportsStreaming(): boolean {
    return true;
  }
}
