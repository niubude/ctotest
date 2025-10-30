import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SvnService } from '../service.js';
import { SvnClient } from '../client.js';
import type { SvnConfig } from '../../../types/svn.js';

vi.mock('../client.js');

describe('SvnService', () => {
  let service: SvnService;
  let mockClient: any;

  const testConfig: SvnConfig = {
    url: 'https://svn.example.com/repo',
    username: 'testuser',
    password: 'testpass',
  };

  beforeEach(() => {
    mockClient = {
      getLog: vi.fn(),
      getInfo: vi.fn(),
      getDiff: vi.fn(),
      getChangedFiles: vi.fn(),
    };

    vi.mocked(SvnClient).mockImplementation(() => mockClient);
    service = new SvnService(testConfig);
  });

  describe('getCommits', () => {
    it('should fetch and parse commits successfully', async () => {
      const mockLogResponse = {
        log: {
          logentry: [
            {
              $: { revision: '123' },
              author: ['john.doe'],
              date: ['2024-01-15T10:30:00.000Z'],
              msg: ['Fix bug in authentication'],
            },
            {
              $: { revision: '122' },
              author: ['jane.smith'],
              date: ['2024-01-14T15:20:00.000Z'],
              msg: ['Add new feature'],
            },
          ],
        },
      };

      mockClient.getLog.mockResolvedValue(mockLogResponse);

      const result = await service.getCommits();

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        revision: 123,
        author: 'john.doe',
        date: new Date('2024-01-15T10:30:00.000Z'),
        message: 'Fix bug in authentication',
      });
      expect(result.pagination.totalItems).toBe(2);
    });

    it('should filter commits by keyword', async () => {
      const mockLogResponse = {
        log: {
          logentry: [
            {
              $: { revision: '123' },
              author: ['john.doe'],
              date: ['2024-01-15T10:30:00.000Z'],
              msg: ['Fix bug in authentication'],
            },
            {
              $: { revision: '122' },
              author: ['jane.smith'],
              date: ['2024-01-14T15:20:00.000Z'],
              msg: ['Add new feature'],
            },
          ],
        },
      };

      mockClient.getLog.mockResolvedValue(mockLogResponse);

      const result = await service.getCommits({ keyword: 'bug' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].message).toContain('bug');
    });

    it('should filter commits by author', async () => {
      const mockLogResponse = {
        log: {
          logentry: [
            {
              $: { revision: '123' },
              author: ['john.doe'],
              date: ['2024-01-15T10:30:00.000Z'],
              msg: ['Fix bug in authentication'],
            },
            {
              $: { revision: '122' },
              author: ['jane.smith'],
              date: ['2024-01-14T15:20:00.000Z'],
              msg: ['Add new feature'],
            },
          ],
        },
      };

      mockClient.getLog.mockResolvedValue(mockLogResponse);

      const result = await service.getCommits({ author: 'jane.smith' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].author).toBe('jane.smith');
    });

    it('should paginate results correctly', async () => {
      const mockLogResponse = {
        log: {
          logentry: Array.from({ length: 50 }, (_, i) => ({
            $: { revision: `${150 - i}` },
            author: ['test.user'],
            date: ['2024-01-15T10:30:00.000Z'],
            msg: [`Commit ${150 - i}`],
          })),
        },
      };

      mockClient.getLog.mockResolvedValue(mockLogResponse);

      const result = await service.getCommits(undefined, { page: 2, pageSize: 10 });

      expect(result.data).toHaveLength(10);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.pageSize).toBe(10);
      expect(result.pagination.totalPages).toBe(5);
    });

    it('should handle empty log response', async () => {
      mockClient.getLog.mockResolvedValue({ log: {} });

      const result = await service.getCommits();

      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalItems).toBe(0);
    });
  });

  describe('getCommitDetail', () => {
    it('should fetch and parse commit detail with file changes', async () => {
      const mockLogResponse = {
        log: {
          logentry: {
            $: { revision: '123' },
            author: ['john.doe'],
            date: ['2024-01-15T10:30:00.000Z'],
            msg: ['Fix bug in authentication'],
            paths: [
              {
                path: [
                  {
                    $: { action: 'M' },
                    _: '/trunk/src/auth.ts',
                  },
                  {
                    $: { action: 'A' },
                    _: '/trunk/src/newfile.ts',
                  },
                ],
              },
            ],
          },
        },
      };

      mockClient.getChangedFiles.mockResolvedValue(mockLogResponse);

      const result = await service.getCommitDetail(123);

      expect(result.revision).toBe(123);
      expect(result.author).toBe('john.doe');
      expect(result.changedFiles).toHaveLength(2);
      expect(result.changedFiles[0]).toEqual({
        path: '/trunk/src/auth.ts',
        action: 'M',
      });
      expect(result.changedFiles[1]).toEqual({
        path: '/trunk/src/newfile.ts',
        action: 'A',
      });
    });

    it('should throw error for non-existent commit', async () => {
      mockClient.getChangedFiles.mockResolvedValue({ log: {} });

      await expect(service.getCommitDetail(999)).rejects.toThrow('Commit not found');
    });
  });

  describe('getCommitDiff', () => {
    it('should parse diff output correctly', async () => {
      const mockDiffOutput = `Index: /trunk/src/auth.ts
===================================================================
--- /trunk/src/auth.ts	(revision 122)
+++ /trunk/src/auth.ts	(revision 123)
@@ -10,7 +10,7 @@
 function authenticate() {
-  return false;
+  return true;
 }
Index: /trunk/src/newfile.ts
===================================================================
--- /trunk/src/newfile.ts	(revision 0)
+++ /trunk/src/newfile.ts	(revision 123)
@@ -0,0 +1,3 @@
+export function newFunction() {
+  return 'new';
+}`;

      mockClient.getDiff.mockResolvedValue(mockDiffOutput);

      const result = await service.getCommitDiff(123);

      expect(result).toHaveLength(2);
      expect(result[0].path).toBe('/trunk/src/auth.ts');
      expect(result[0].diff).toContain('authenticate');
      expect(result[1].path).toBe('/trunk/src/newfile.ts');
    });

    it('should handle empty diff', async () => {
      mockClient.getDiff.mockResolvedValue('');

      const result = await service.getCommitDiff(123);

      expect(result).toHaveLength(0);
    });
  });

  describe('getRepositoryInfo', () => {
    it('should fetch and parse repository info', async () => {
      const mockInfoResponse = {
        info: {
          entry: [
            {
              $: { revision: '500' },
              url: ['https://svn.example.com/repo'],
              repository: [
                {
                  uuid: ['12345678-1234-1234-1234-123456789abc'],
                },
              ],
            },
          ],
        },
      };

      mockClient.getInfo.mockResolvedValue(mockInfoResponse);

      const result = await service.getRepositoryInfo();

      expect(result.url).toBe('https://svn.example.com/repo');
      expect(result.uuid).toBe('12345678-1234-1234-1234-123456789abc');
      expect(result.revision).toBe(500);
    });
  });
});
