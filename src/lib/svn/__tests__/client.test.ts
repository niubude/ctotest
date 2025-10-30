import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SvnClient } from '../client.js';
import {
  SvnConnectionError,
  SvnAuthenticationError,
  SvnTimeoutError,
  SvnNotFoundError,
} from '../../errors.js';
import type { SvnConfig } from '../../../types/svn.js';

vi.mock('node-svn-ultimate', () => ({
  default: {
    commands: {
      log: vi.fn(),
      info: vi.fn(),
      diff: vi.fn(),
    },
  },
}));

describe('SvnClient', () => {
  let client: SvnClient;

  const testConfig: SvnConfig = {
    url: 'https://svn.example.com/repo',
    username: 'testuser',
    password: 'testpass',
    timeout: 5000,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    client = new SvnClient(testConfig);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(client).toBeDefined();
    });

    it('should use default timeout if not provided', () => {
      const configWithoutTimeout: SvnConfig = {
        url: 'https://svn.example.com/repo',
      };
      const clientWithDefault = new SvnClient(configWithoutTimeout);
      expect(clientWithDefault).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should throw SvnAuthenticationError for auth failures', async () => {
      const mockError = new Error('authentication failed');
      
      await expect(async () => {
        await client['executeCommand']((callback) => {
          callback(mockError);
        });
      }).rejects.toThrow(SvnAuthenticationError);
    });

    it('should throw SvnConnectionError for connection failures', async () => {
      const mockError = new Error('connection refused');
      
      await expect(async () => {
        await client['executeCommand']((callback) => {
          callback(mockError);
        });
      }).rejects.toThrow(SvnConnectionError);
    });

    it('should throw SvnNotFoundError for not found errors', async () => {
      const mockError = new Error('not found in repository');
      
      await expect(async () => {
        await client['executeCommand']((callback) => {
          callback(mockError);
        });
      }).rejects.toThrow(SvnNotFoundError);
    });

    it('should throw SvnTimeoutError on timeout', async () => {
      vi.useFakeTimers();

      const promise = client['executeCommand']((_callback) => {
        // Never call callback to simulate hang
      });

      vi.advanceTimersByTime(6000);

      await expect(promise).rejects.toThrow(SvnTimeoutError);
      
      vi.useRealTimers();
    });
  });

  describe('getAuthParams', () => {
    it('should return auth params when credentials provided', () => {
      const params = client['getAuthParams']();
      expect(params).toEqual({
        username: 'testuser',
        password: 'testpass',
      });
    });

    it('should return empty object when no credentials', () => {
      const noAuthConfig: SvnConfig = {
        url: 'https://svn.example.com/repo',
      };
      const noAuthClient = new SvnClient(noAuthConfig);
      const params = noAuthClient['getAuthParams']();
      expect(params).toEqual({});
    });
  });
});
