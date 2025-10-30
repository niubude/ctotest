import { Router, Request, Response, NextFunction } from 'express';
import { SvnService } from '../../lib/svn/index.js';
import type { SvnConfig } from '../../types/svn.js';
import { loadConfig } from '../../config/index.js';
import {
  commitFiltersSchema,
  paginationSchema,
  revisionParamSchema,
} from '../validation.js';
import { logger } from '../../lib/logger.js';

const router = Router();

function getSvnService(): SvnService {
  const config = loadConfig();
  const svnConfig: SvnConfig = {
    url: config.svn.url,
    username: config.svn.username,
    password: config.svn.password,
    timeout: config.svn.timeout,
  };
  return new SvnService(svnConfig);
}

router.get('/info', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('GET /api/svn/info');
    const service = getSvnService();
    const info = await service.getRepositoryInfo();
    res.json(info);
  } catch (error) {
    next(error);
  }
});

router.get('/commits', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('GET /api/svn/commits', { query: req.query });

    const filters = commitFiltersSchema.parse({
      keyword: req.query.keyword,
      author: req.query.author,
      startRevision: req.query.startRevision 
        ? parseInt(req.query.startRevision as string, 10) 
        : undefined,
      endRevision: req.query.endRevision 
        ? parseInt(req.query.endRevision as string, 10) 
        : undefined,
    });

    const pagination = paginationSchema.parse({
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      pageSize: req.query.pageSize 
        ? parseInt(req.query.pageSize as string, 10) 
        : 20,
    });

    const service = getSvnService();
    const result = await service.getCommits(filters, pagination);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/commits/:revision',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('GET /api/svn/commits/:revision', { params: req.params });

      const { revision } = revisionParamSchema.parse(req.params);
      const revisionNumber = parseInt(revision, 10);

      const service = getSvnService();
      const detail = await service.getCommitDetail(revisionNumber);
      
      res.json(detail);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/commits/:revision/diff',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('GET /api/svn/commits/:revision/diff', { params: req.params });

      const { revision } = revisionParamSchema.parse(req.params);
      const revisionNumber = parseInt(revision, 10);

      const service = getSvnService();
      const diffs = await service.getCommitDiff(revisionNumber);
      
      res.json({ revision: revisionNumber, diffs });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
