import { describe, it, expect } from 'vitest';
import {
  SvnError,
  SvnConnectionError,
  SvnAuthenticationError,
  SvnTimeoutError,
  SvnNotFoundError,
  ValidationError,
} from '../errors.js';

describe('Error Classes', () => {
  describe('SvnError', () => {
    it('should create error with default code', () => {
      const error = new SvnError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('SVN_ERROR');
      expect(error.name).toBe('SvnError');
    });

    it('should create error with custom code', () => {
      const error = new SvnError('Test error', 'CUSTOM_CODE');
      
      expect(error.code).toBe('CUSTOM_CODE');
    });

    it('should include details', () => {
      const details = { extra: 'info' };
      const error = new SvnError('Test error', 'SVN_ERROR', details);
      
      expect(error.details).toEqual(details);
    });
  });

  describe('SvnConnectionError', () => {
    it('should create connection error', () => {
      const error = new SvnConnectionError('Connection failed');
      
      expect(error.message).toBe('Connection failed');
      expect(error.code).toBe('SVN_CONNECTION_ERROR');
      expect(error.name).toBe('SvnConnectionError');
    });
  });

  describe('SvnAuthenticationError', () => {
    it('should create authentication error', () => {
      const error = new SvnAuthenticationError('Auth failed');
      
      expect(error.message).toBe('Auth failed');
      expect(error.code).toBe('SVN_AUTHENTICATION_ERROR');
      expect(error.name).toBe('SvnAuthenticationError');
    });
  });

  describe('SvnTimeoutError', () => {
    it('should create timeout error', () => {
      const error = new SvnTimeoutError('Operation timed out');
      
      expect(error.message).toBe('Operation timed out');
      expect(error.code).toBe('SVN_TIMEOUT_ERROR');
      expect(error.name).toBe('SvnTimeoutError');
    });
  });

  describe('SvnNotFoundError', () => {
    it('should create not found error', () => {
      const error = new SvnNotFoundError('Resource not found');
      
      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('SVN_NOT_FOUND');
      expect(error.name).toBe('SvnNotFoundError');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Validation failed');
      
      expect(error.message).toBe('Validation failed');
      expect(error.name).toBe('ValidationError');
    });

    it('should include details', () => {
      const details = { field: 'username', issue: 'required' };
      const error = new ValidationError('Validation failed', details);
      
      expect(error.details).toEqual(details);
    });
  });
});
