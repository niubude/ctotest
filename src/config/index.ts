import dotenv from 'dotenv';
import { z } from 'zod';
import { ValidationError } from '../lib/errors.js';

dotenv.config();

const configSchema = z.object({
  port: z.number().default(3000),
  nodeEnv: z.string().default('development'),
  svn: z.object({
    url: z.string().url(),
    username: z.string().optional(),
    password: z.string().optional(),
    timeout: z.number().optional().default(30000),
  }),
  pagination: z.object({
    defaultPageSize: z.number().default(20),
    maxPageSize: z.number().default(100),
  }),
  logLevel: z.string().default('info'),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  try {
    const raw = {
      port: parseInt(process.env.PORT || '3000', 10),
      nodeEnv: process.env.NODE_ENV || 'development',
      svn: {
        url: process.env.SVN_REPO_URL || '',
        username: process.env.SVN_USERNAME,
        password: process.env.SVN_PASSWORD,
        timeout: process.env.SVN_TIMEOUT 
          ? parseInt(process.env.SVN_TIMEOUT, 10) 
          : 30000,
      },
      pagination: {
        defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
        maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
      },
      logLevel: process.env.LOG_LEVEL || 'info',
    };

    return configSchema.parse(raw);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Configuration validation failed', error.errors);
    }
    throw error;
  }
}
