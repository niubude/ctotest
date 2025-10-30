import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../app.js';
import { SvnService } from '../../../lib/svn/service.js';

vi.mock('../../../lib/svn/service.js');
vi.mock('../../../config/index.js', () => ({
  loadConfig: vi.fn(() => ({
    port: 3000,
    nodeEnv: 'test',
    svn: {
      url: 'https://svn.example.com/repo',
      username: 'testuser',
      password: 'testpass',
      timeout: 30000,
    },
    pagination: {
      defaultPageSize: 20,
      maxPageSize: 100,
    },
    logLevel: 'info',
  })),
}));

describe('SVN API Routes', () => {
  let app: any;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      getCommits: vi.fn(),
      getCommitDetail: vi.fn(),
      getCommitDiff: vi.fn(),
      getRepositoryInfo: vi.fn(),
    };

    vi.mocked(SvnService).mockImplementation(() => mockService);
    app = createApp();
  });

  describe('GET /api/svn/info', () => {
    it('should return repository info', async () => {
      mockService.getRepositoryInfo.mockResolvedValue({
        url: 'https://svn.example.com/repo',
        uuid: '12345678-1234-1234-1234-123456789abc',
        revision: 500,
      });

      const response = await request(app).get('/api/svn/info');

      expect(response.status).toBe(200);
      expect(response.body.url).toBe('https://svn.example.com/repo');
      expect(response.body.uuid).toBe('12345678-1234-1234-1234-123456789abc');
      expect(response.body.revision).toBe(500);
    });
  });

  describe('GET /api/svn/commits', () => {
    it('should return paginated commits', async () => {
      const mockCommits = {
        data: [
          {
            revision: 123,
            author: 'john.doe',
            date: new Date('2024-01-15T10:30:00.000Z'),
            message: 'Fix bug',
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          totalItems: 1,
          totalPages: 1,
        },
      };

      mockService.getCommits.mockResolvedValue(mockCommits);

      const response = await request(app).get('/api/svn/commits');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.page).toBe(1);
    });

    it('should apply keyword filter', async () => {
      const mockCommits = {
        data: [
          {
            revision: 123,
            author: 'john.doe',
            date: new Date('2024-01-15T10:30:00.000Z'),
            message: 'Fix authentication bug',
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          totalItems: 1,
          totalPages: 1,
        },
      };

      mockService.getCommits.mockResolvedValue(mockCommits);

      const response = await request(app)
        .get('/api/svn/commits')
        .query({ keyword: 'authentication' });

      expect(response.status).toBe(200);
      expect(mockService.getCommits).toHaveBeenCalledWith(
        expect.objectContaining({ keyword: 'authentication' }),
        expect.any(Object)
      );
    });

    it('should apply author filter', async () => {
      mockService.getCommits.mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          pageSize: 20,
          totalItems: 0,
          totalPages: 0,
        },
      });

      const response = await request(app)
        .get('/api/svn/commits')
        .query({ author: 'john.doe' });

      expect(response.status).toBe(200);
      expect(mockService.getCommits).toHaveBeenCalledWith(
        expect.objectContaining({ author: 'john.doe' }),
        expect.any(Object)
      );
    });

    it('should apply pagination parameters', async () => {
      mockService.getCommits.mockResolvedValue({
        data: [],
        pagination: {
          page: 2,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
        },
      });

      const response = await request(app)
        .get('/api/svn/commits')
        .query({ page: 2, pageSize: 10 });

      expect(response.status).toBe(200);
      expect(mockService.getCommits).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ page: 2, pageSize: 10 })
      );
    });
  });

  describe('GET /api/svn/commits/:revision', () => {
    it('should return commit detail', async () => {
      const mockDetail = {
        revision: 123,
        author: 'john.doe',
        date: new Date('2024-01-15T10:30:00.000Z'),
        message: 'Fix bug',
        changedFiles: [
          {
            path: '/trunk/src/auth.ts',
            action: 'M' as const,
          },
        ],
      };

      mockService.getCommitDetail.mockResolvedValue(mockDetail);

      const response = await request(app).get('/api/svn/commits/123');

      expect(response.status).toBe(200);
      expect(response.body.revision).toBe(123);
      expect(response.body.changedFiles).toHaveLength(1);
    });

    it('should return 400 for invalid revision', async () => {
      const response = await request(app).get('/api/svn/commits/invalid');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/svn/commits/:revision/diff', () => {
    it('should return commit diff', async () => {
      const mockDiffs = [
        {
          path: '/trunk/src/auth.ts',
          diff: 'diff content here',
        },
      ];

      mockService.getCommitDiff.mockResolvedValue(mockDiffs);

      const response = await request(app).get('/api/svn/commits/123/diff');

      expect(response.status).toBe(200);
      expect(response.body.revision).toBe(123);
      expect(response.body.diffs).toHaveLength(1);
    });
  });

  describe('Error handling', () => {
    it('should handle SVN errors gracefully', async () => {
      const error = new Error('SVN connection failed');
      mockService.getRepositoryInfo.mockRejectedValue(error);

      const response = await request(app).get('/api/svn/info');

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
