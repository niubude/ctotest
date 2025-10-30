import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadConfig } from '../index.js';
import { ValidationError } from '../../lib/errors.js';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load valid configuration', () => {
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'test';
    process.env.SVN_REPO_URL = 'https://svn.example.com/repo';
    process.env.SVN_USERNAME = 'testuser';
    process.env.SVN_PASSWORD = 'testpass';
    process.env.DEFAULT_PAGE_SIZE = '20';
    process.env.MAX_PAGE_SIZE = '100';
    process.env.LOG_LEVEL = 'info';

    const config = loadConfig();

    expect(config.port).toBe(3000);
    expect(config.nodeEnv).toBe('test');
    expect(config.svn.url).toBe('https://svn.example.com/repo');
    expect(config.svn.username).toBe('testuser');
    expect(config.svn.password).toBe('testpass');
    expect(config.pagination.defaultPageSize).toBe(20);
    expect(config.pagination.maxPageSize).toBe(100);
    expect(config.logLevel).toBe('info');
  });

  it('should use default values when optional env vars are missing', () => {
    process.env.SVN_REPO_URL = 'https://svn.example.com/repo';
    delete process.env.NODE_ENV;

    const config = loadConfig();

    expect(config.port).toBe(3000);
    expect(config.nodeEnv).toBe('development');
    expect(config.pagination.defaultPageSize).toBe(20);
    expect(config.pagination.maxPageSize).toBe(100);
    expect(config.logLevel).toBe('info');
  });

  it('should throw ValidationError when required fields are missing', () => {
    delete process.env.SVN_REPO_URL;

    expect(() => loadConfig()).toThrow(ValidationError);
  });

  it('should throw ValidationError for invalid URL', () => {
    process.env.SVN_REPO_URL = 'not-a-valid-url';

    expect(() => loadConfig()).toThrow(ValidationError);
  });
});
