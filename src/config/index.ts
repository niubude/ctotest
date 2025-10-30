import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || ''
  },
  
  ai: {
    provider: process.env.AI_PROVIDER || 'openai',
    useMock: process.env.USE_MOCK_AI === 'true',
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      apiBaseUrl: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1',
      model: process.env.OPENAI_MODEL || 'gpt-4'
    },
    timeout: parseInt(process.env.AI_REQUEST_TIMEOUT || '30000', 10)
  },
  
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10)
  }
};

export function validateConfig(): void {
  if (!config.ai.useMock && config.ai.provider === 'openai' && !config.ai.openai.apiKey) {
    throw new Error('OPENAI_API_KEY is required when using OpenAI provider');
  }
  
  if (!config.database.url) {
    console.warn('DATABASE_URL is not set. Database operations will fail.');
  }
}
