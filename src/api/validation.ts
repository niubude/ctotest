import { z } from 'zod';

export const commitFiltersSchema = z.object({
  keyword: z.string().optional(),
  author: z.string().optional(),
  startRevision: z.number().int().positive().optional(),
  endRevision: z.number().int().positive().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

export const revisionParamSchema = z.object({
  revision: z.string().regex(/^\d+$/, 'Revision must be a positive integer'),
});

export type CommitFiltersInput = z.infer<typeof commitFiltersSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type RevisionParamInput = z.infer<typeof revisionParamSchema>;
