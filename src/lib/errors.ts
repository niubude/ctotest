export class SvnError extends Error {
  constructor(
    message: string,
    public code: string = 'SVN_ERROR',
    public details?: unknown
  ) {
    super(message);
    this.name = 'SvnError';
  }
}

export class SvnConnectionError extends SvnError {
  constructor(message: string, details?: unknown) {
    super(message, 'SVN_CONNECTION_ERROR', details);
    this.name = 'SvnConnectionError';
  }
}

export class SvnAuthenticationError extends SvnError {
  constructor(message: string, details?: unknown) {
    super(message, 'SVN_AUTHENTICATION_ERROR', details);
    this.name = 'SvnAuthenticationError';
  }
}

export class SvnTimeoutError extends SvnError {
  constructor(message: string, details?: unknown) {
    super(message, 'SVN_TIMEOUT_ERROR', details);
    this.name = 'SvnTimeoutError';
  }
}

export class SvnNotFoundError extends SvnError {
  constructor(message: string, details?: unknown) {
    super(message, 'SVN_NOT_FOUND', details);
    this.name = 'SvnNotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
