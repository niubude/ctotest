import { SvnClient } from './client.js';
import type {
  SvnConfig,
  SvnCommit,
  SvnCommitDetail,
  SvnFileChange,
  SvnDiff,
  CommitFilters,
  PaginationParams,
  PaginatedResponse,
} from '../../types/svn.js';
import { logger } from '../logger.js';
import { SvnError } from '../errors.js';

export class SvnService {
  private client: SvnClient;

  constructor(config: SvnConfig) {
    this.client = new SvnClient(config);
  }

  private parseLogEntry(entry: any): SvnCommit {
    return {
      revision: parseInt(entry.$.revision, 10),
      author: entry.author?.[0] || 'unknown',
      date: new Date(entry.date?.[0] || Date.now()),
      message: entry.msg?.[0] || '',
    };
  }

  private parseFileChanges(entry: any): SvnFileChange[] {
    const paths = entry.paths?.[0]?.path || [];
    
    return paths.map((pathEntry: any) => {
      const change: SvnFileChange = {
        path: pathEntry._,
        action: pathEntry.$.action as 'A' | 'M' | 'D' | 'R',
      };

      if (pathEntry.$['copyfrom-path']) {
        change.copyFromPath = pathEntry.$['copyfrom-path'];
        change.copyFromRevision = parseInt(pathEntry.$['copyfrom-rev'], 10);
      }

      return change;
    });
  }

  async getCommits(
    filters?: CommitFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<SvnCommit>> {
    try {
      logger.info('Fetching commits', { filters, pagination });

      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 20;
      
      const revisionRange = filters?.startRevision && filters?.endRevision
        ? `${filters.endRevision}:${filters.startRevision}`
        : 'HEAD:1';

      const rawLog = await this.client.getLog({
        revision: revisionRange,
        limit: pageSize * page + pageSize,
      });

      let commits: SvnCommit[] = [];

      if (rawLog?.log?.logentry) {
        const entries = Array.isArray(rawLog.log.logentry)
          ? rawLog.log.logentry
          : [rawLog.log.logentry];

        commits = entries.map((entry: any) => this.parseLogEntry(entry));
      }

      let filteredCommits = commits;

      if (filters?.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filteredCommits = filteredCommits.filter(
          (commit) =>
            commit.message.toLowerCase().includes(keyword) ||
            commit.author.toLowerCase().includes(keyword)
        );
      }

      if (filters?.author) {
        const author = filters.author.toLowerCase();
        filteredCommits = filteredCommits.filter(
          (commit) => commit.author.toLowerCase() === author
        );
      }

      const totalItems = filteredCommits.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredCommits.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('Failed to fetch commits', { error });
      throw error;
    }
  }

  async getCommitDetail(revision: number): Promise<SvnCommitDetail> {
    try {
      logger.info('Fetching commit detail', { revision });

      const rawLog = await this.client.getChangedFiles(revision);

      if (!rawLog?.log?.logentry) {
        throw new SvnError(`Commit not found: ${revision}`, 'COMMIT_NOT_FOUND');
      }

      const entry = Array.isArray(rawLog.log.logentry)
        ? rawLog.log.logentry[0]
        : rawLog.log.logentry;

      const commit = this.parseLogEntry(entry);
      const changedFiles = this.parseFileChanges(entry);

      return {
        ...commit,
        changedFiles,
      };
    } catch (error) {
      logger.error('Failed to fetch commit detail', { error, revision });
      throw error;
    }
  }

  async getCommitDiff(revision: number): Promise<SvnDiff[]> {
    try {
      logger.info('Fetching commit diff', { revision });

      const diffOutput = await this.client.getDiff({ revision });

      const diffs: SvnDiff[] = [];
      const diffBlocks = diffOutput.split('Index: ').filter((block) => block.trim());

      for (const block of diffBlocks) {
        const lines = block.split('\n');
        const path = lines[0].trim();
        const diff = block;

        diffs.push({ path, diff });
      }

      return diffs;
    } catch (error) {
      logger.error('Failed to fetch commit diff', { error, revision });
      throw error;
    }
  }

  async getRepositoryInfo(): Promise<{
    url: string;
    uuid?: string;
    revision?: number;
  }> {
    try {
      logger.info('Fetching repository info');

      const info = await this.client.getInfo();

      return {
        url: info?.info?.entry?.[0]?.url?.[0] || this.client['config'].url,
        uuid: info?.info?.entry?.[0]?.repository?.[0]?.uuid?.[0],
        revision: parseInt(info?.info?.entry?.[0]?.$.revision || '0', 10),
      };
    } catch (error) {
      logger.error('Failed to fetch repository info', { error });
      throw error;
    }
  }
}
