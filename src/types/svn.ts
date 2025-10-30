export interface SvnConfig {
  url: string;
  username?: string;
  password?: string;
  timeout?: number;
}

export interface SvnCommit {
  revision: number;
  author: string;
  date: Date;
  message: string;
}

export interface SvnFileChange {
  path: string;
  action: 'A' | 'M' | 'D' | 'R';
  copyFromPath?: string;
  copyFromRevision?: number;
}

export interface SvnCommitDetail extends SvnCommit {
  changedFiles: SvnFileChange[];
}

export interface SvnDiff {
  path: string;
  diff: string;
}

export interface CommitFilters {
  keyword?: string;
  author?: string;
  startRevision?: number;
  endRevision?: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}
