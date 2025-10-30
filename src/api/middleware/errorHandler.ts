import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../../lib/logger.js';
import {
  SvnError,
  SvnConnectionError,
  SvnAuthenticationError,
  SvnTimeoutError,
  SvnNotFoundError,
  ValidationError,
} from '../../lib/errors.js';
import type { ApiErrorResponse } from '../../types/svn.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  let statusCode = 500;
  let errorResponse: ApiErrorResponse = {
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  };

  if (err instanceof SvnAuthenticationError) {
    statusCode = 401;
    errorResponse = {
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    };
  } else if (err instanceof SvnNotFoundError) {
    statusCode = 404;
    errorResponse = {
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    };
  } else if (err instanceof SvnTimeoutError) {
    statusCode = 504;
    errorResponse = {
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    };
  } else if (err instanceof SvnConnectionError) {
    statusCode = 503;
    errorResponse = {
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    };
  } else if (err instanceof SvnError) {
    statusCode = 500;
    errorResponse = {
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    };
  } else if (err instanceof ValidationError || err instanceof z.ZodError) {
    statusCode = 400;
    errorResponse = {
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: err instanceof z.ZodError ? err.errors : err.details,
      },
    };
  }

  res.status(statusCode).json(errorResponse);
}
