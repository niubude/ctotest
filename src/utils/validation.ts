import { z } from 'zod';

export const reviewRequestSchema = z.object({
  commitIds: z.array(z.string().min(1)).min(1).max(50)
});

export type ReviewRequestInput = z.infer<typeof reviewRequestSchema>;

export function validateReviewRequest(data: unknown): ReviewRequestInput {
  return reviewRequestSchema.parse(data);
}
