import { Router, Request, Response } from 'express';
import { ReviewService } from '../services/reviewService';
import { createAIProvider } from '../providers';
import { validateReviewRequest } from '../utils/validation';
import { RateLimiter } from '../utils/rateLimiter';
import { config } from '../config';
import { z } from 'zod';

const router = Router();
const rateLimiter = new RateLimiter(
  config.rateLimit.maxRequests,
  config.rateLimit.windowMs
);

setInterval(() => rateLimiter.cleanup(), 60000);

router.post('/review', async (req: Request, res: Response) => {
  try {
    const clientId = req.ip || 'unknown';
    const rateLimitResult = rateLimiter.check(clientId);

    if (!rateLimitResult.allowed) {
      const resetTime = rateLimitResult.resetTime 
        ? new Date(rateLimitResult.resetTime).toISOString()
        : 'unknown';
      
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again after ${resetTime}`,
        resetTime
      });
    }

    const validatedData = validateReviewRequest(req.body);

    const aiProvider = createAIProvider(
      config.ai.useMock ? 'mock' : config.ai.provider,
      {
        apiKey: config.ai.openai.apiKey,
        apiBaseUrl: config.ai.openai.apiBaseUrl,
        model: config.ai.openai.model,
        timeout: config.ai.timeout
      }
    );

    const reviewService = new ReviewService(aiProvider);
    const sessionId = await reviewService.reviewCommits(validatedData.commitIds);
    const session = await reviewService.getReviewSession(sessionId);

    res.status(200).json({
      success: true,
      sessionId,
      session
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    if (error instanceof Error) {
      console.error('Review error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'An unknown error occurred'
    });
  }
});

router.get('/review/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const aiProvider = createAIProvider(
      config.ai.useMock ? 'mock' : config.ai.provider,
      {
        apiKey: config.ai.openai.apiKey,
        apiBaseUrl: config.ai.openai.apiBaseUrl,
        model: config.ai.openai.model,
        timeout: config.ai.timeout
      }
    );

    const reviewService = new ReviewService(aiProvider);
    const session = await reviewService.getReviewSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Review session not found'
      });
    }

    res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error fetching review session:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
