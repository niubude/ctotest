import { AIProvider } from './AIProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { MockAIProvider } from './MockAIProvider';
import { AIProviderConfig } from '../types';

export { AIProvider, OpenAIProvider, MockAIProvider };

export function createAIProvider(
  providerName: string,
  config: AIProviderConfig
): AIProvider {
  switch (providerName.toLowerCase()) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'mock':
      return new MockAIProvider();
    default:
      throw new Error(`Unknown AI provider: ${providerName}`);
  }
}
