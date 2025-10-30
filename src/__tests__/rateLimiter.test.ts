import { RateLimiter } from '../utils/rateLimiter';

describe('RateLimiter', () => {
  it('should allow requests within limit', () => {
    const limiter = new RateLimiter(5, 60000);
    const clientId = 'client-1';

    for (let i = 0; i < 5; i++) {
      const result = limiter.check(clientId);
      expect(result.allowed).toBe(true);
    }
  });

  it('should block requests exceeding limit', () => {
    const limiter = new RateLimiter(3, 60000);
    const clientId = 'client-1';

    for (let i = 0; i < 3; i++) {
      limiter.check(clientId);
    }

    const result = limiter.check(clientId);
    expect(result.allowed).toBe(false);
    expect(result.resetTime).toBeDefined();
  });

  it('should reset after window expires', () => {
    const limiter = new RateLimiter(2, 100);
    const clientId = 'client-1';

    limiter.check(clientId);
    limiter.check(clientId);

    const blockedResult = limiter.check(clientId);
    expect(blockedResult.allowed).toBe(false);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const allowedResult = limiter.check(clientId);
        expect(allowedResult.allowed).toBe(true);
        resolve();
      }, 150);
    });
  });

  it('should track different clients separately', () => {
    const limiter = new RateLimiter(2, 60000);

    limiter.check('client-1');
    limiter.check('client-1');
    limiter.check('client-2');

    const result1 = limiter.check('client-1');
    const result2 = limiter.check('client-2');

    expect(result1.allowed).toBe(false);
    expect(result2.allowed).toBe(true);
  });

  it('should reset specific client', () => {
    const limiter = new RateLimiter(2, 60000);
    const clientId = 'client-1';

    limiter.check(clientId);
    limiter.check(clientId);

    const blockedResult = limiter.check(clientId);
    expect(blockedResult.allowed).toBe(false);

    limiter.reset(clientId);

    const allowedResult = limiter.check(clientId);
    expect(allowedResult.allowed).toBe(true);
  });

  it('should cleanup expired entries', () => {
    const limiter = new RateLimiter(5, 100);

    limiter.check('client-1');
    limiter.check('client-2');

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        limiter.cleanup();
        resolve();
      }, 150);
    });
  });
});
