import { validateReviewRequest } from '../utils/validation';
import { z } from 'zod';

describe('Validation', () => {
  describe('validateReviewRequest', () => {
    it('should validate valid request', () => {
      const validRequest = {
        commitIds: ['commit-1', 'commit-2']
      };

      const result = validateReviewRequest(validRequest);

      expect(result.commitIds).toEqual(['commit-1', 'commit-2']);
    });

    it('should reject empty commitIds array', () => {
      const invalidRequest = {
        commitIds: []
      };

      expect(() => validateReviewRequest(invalidRequest)).toThrow(z.ZodError);
    });

    it('should reject missing commitIds', () => {
      const invalidRequest = {};

      expect(() => validateReviewRequest(invalidRequest)).toThrow(z.ZodError);
    });

    it('should reject too many commitIds', () => {
      const invalidRequest = {
        commitIds: Array(51).fill('commit')
      };

      expect(() => validateReviewRequest(invalidRequest)).toThrow(z.ZodError);
    });

    it('should reject empty commit id strings', () => {
      const invalidRequest = {
        commitIds: ['']
      };

      expect(() => validateReviewRequest(invalidRequest)).toThrow(z.ZodError);
    });

    it('should reject non-array commitIds', () => {
      const invalidRequest = {
        commitIds: 'not-an-array'
      };

      expect(() => validateReviewRequest(invalidRequest)).toThrow(z.ZodError);
    });
  });
});
