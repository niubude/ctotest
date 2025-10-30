import svn from 'node-svn-ultimate';
import type { SvnConfig } from '../../types/svn.js';
import { logger } from '../logger.js';
import {
  SvnConnectionError,
  SvnAuthenticationError,
  SvnTimeoutError,
  SvnNotFoundError,
} from '../errors.js';

export class SvnClient {
  private config: SvnConfig;
  private timeout: number;

  constructor(config: SvnConfig) {
    this.config = config;
    this.timeout = config.timeout || 30000;
    logger.info('SVN Client initialized', { url: config.url });
  }

  private getAuthParams() {
    if (this.config.username && this.config.password) {
      return {
        username: this.config.username,
        password: this.config.password,
      };
    }
    return {};
  }

  private async executeCommand<T>(
    command: (callback: (err: Error | null, data?: T) => void) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new SvnTimeoutError(`SVN operation timed out after ${this.timeout}ms`));
      }, this.timeout);

      command((err, data) => {
        clearTimeout(timeoutId);

        if (err) {
          logger.error('SVN command failed', { error: err.message });
          
          const errorMessage = err.message.toLowerCase();
          
          if (errorMessage.includes('authentication') || errorMessage.includes('authorization')) {
            reject(new SvnAuthenticationError('SVN authentication failed', err));
          } else if (errorMessage.includes('connection') || errorMessage.includes('network')) {
            reject(new SvnConnectionError('SVN connection failed', err));
          } else if (errorMessage.includes('not found') || errorMessage.includes('no such')) {
            reject(new SvnNotFoundError('Requested resource not found', err));
          } else {
            reject(new SvnConnectionError(err.message, err));
          }
        } else {
          resolve(data as T);
        }
      });
    });
  }

  async getLog(options: {
    revision?: string;
    limit?: number;
  }): Promise<any> {
    logger.debug('Fetching SVN log', options);

    const params = [
      this.config.url,
      {
        revision: options.revision || 'HEAD:1',
        limit: options.limit || 100,
        verbose: true,
        ...this.getAuthParams(),
      },
    ];

    return this.executeCommand((callback) => {
      svn.commands.log(...params, callback);
    });
  }

  async getInfo(): Promise<any> {
    logger.debug('Fetching SVN info');

    const params = [
      this.config.url,
      {
        ...this.getAuthParams(),
      },
    ];

    return this.executeCommand((callback) => {
      svn.commands.info(...params, callback);
    });
  }

  async getDiff(options: {
    revision: number;
  }): Promise<string> {
    logger.debug('Fetching SVN diff', options);

    const prevRevision = options.revision - 1;
    const params = [
      this.config.url,
      {
        revision: `${prevRevision}:${options.revision}`,
        ...this.getAuthParams(),
      },
    ];

    return this.executeCommand((callback) => {
      svn.commands.diff(...params, callback);
    });
  }

  async getChangedFiles(revision: number): Promise<any> {
    logger.debug('Fetching changed files', { revision });

    const params = [
      this.config.url,
      {
        revision: `${revision}:${revision}`,
        verbose: true,
        ...this.getAuthParams(),
      },
    ];

    return this.executeCommand((callback) => {
      svn.commands.log(...params, callback);
    });
  }
}
