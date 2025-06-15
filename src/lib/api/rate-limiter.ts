import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
  onLimitReached?: (req: NextRequest) => void;
}

export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: number;
}

interface RateLimitRecord {
  requests: number;
  windowStart: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitRecord>();

export class RateLimiter {
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: this.defaultKeyGenerator,
      onLimitReached: () => {},
      ...config
    };
  }

  private defaultKeyGenerator(req: NextRequest): string {
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               req.ip || 
               'unknown';
    return `rate_limit:${ip}`;
  }

  private cleanupExpiredRecords(): void {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now - record.windowStart > this.config.windowMs) {
        rateLimitStore.delete(key);
      }
    }
  }

  public checkLimit(req: NextRequest): RateLimitInfo {
    this.cleanupExpiredRecords();

    const key = this.config.keyGenerator(req);
    const now = Date.now();
    
    let record = rateLimitStore.get(key);
    
    // Create new record if doesn't exist or window expired
    if (!record || now - record.windowStart > this.config.windowMs) {
      record = {
        requests: 0,
        windowStart: now
      };
      rateLimitStore.set(key, record);
    }

    const resetTime = record.windowStart + this.config.windowMs;
    const remaining = Math.max(0, this.config.maxRequests - record.requests);

    return {
      limit: this.config.maxRequests,
      current: record.requests,
      remaining,
      resetTime
    };
  }

  public recordRequest(req: NextRequest, statusCode?: number): boolean {
    const shouldSkip = 
      (this.config.skipSuccessfulRequests && statusCode && statusCode < 400) ||
      (this.config.skipFailedRequests && statusCode && statusCode >= 400);

    if (shouldSkip) {
      return false;
    }

    const key = this.config.keyGenerator(req);
    const record = rateLimitStore.get(key);
    
    if (record) {
      record.requests++;
      rateLimitStore.set(key, record);
      
      if (record.requests > this.config.maxRequests) {
        this.config.onLimitReached(req);
        return true; // Rate limit exceeded
      }
    }

    return false;
  }

  public middleware() {
    return async (req: NextRequest) => {
      const limitInfo = this.checkLimit(req);
      
      if (limitInfo.current >= limitInfo.limit) {
        this.recordRequest(req, 429);
        
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((limitInfo.resetTime - Date.now()) / 1000)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limitInfo.limit.toString(),
              'X-RateLimit-Remaining': limitInfo.remaining.toString(),
              'X-RateLimit-Reset': limitInfo.resetTime.toString(),
              'Retry-After': Math.ceil((limitInfo.resetTime - Date.now()) / 1000).toString()
            }
          }
        );
      }

      // Record the request
      this.recordRequest(req);

      // Add rate limit headers to response
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', limitInfo.limit.toString());
      response.headers.set('X-RateLimit-Remaining', (limitInfo.remaining - 1).toString());
      response.headers.set('X-RateLimit-Reset', limitInfo.resetTime.toString());

      return response;
    };
  }
}

// Predefined rate limiters
export const rateLimiters = {
  // Strict rate limiting for authentication endpoints
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
    onLimitReached: (req) => {
      console.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    }
  }),

  // Standard API rate limiting
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    skipSuccessfulRequests: false
  }),

  // Generous rate limiting for static assets
  static: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000, // 1000 requests per minute
    skipSuccessfulRequests: true
  }),

  // Heavy operations (site generation)
  heavy: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 site generations per hour
    onLimitReached: (req) => {
      console.warn(`Heavy operation rate limit exceeded for IP: ${req.ip}`);
    }
  }),

  // Upload endpoints
  upload: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 uploads per hour
  })
};

// Utility function to apply rate limiting to API routes
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  limiter: RateLimiter
) {
  return async (req: NextRequest) => {
    const limitInfo = limiter.checkLimit(req);
    
    if (limitInfo.current >= limitInfo.limit) {
      limiter.recordRequest(req, 429);
      
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((limitInfo.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limitInfo.limit.toString(),
            'X-RateLimit-Remaining': limitInfo.remaining.toString(),
            'X-RateLimit-Reset': limitInfo.resetTime.toString(),
            'Retry-After': Math.ceil((limitInfo.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    try {
      const response = await handler(req);
      const statusCode = response.status;
      
      // Record request after successful processing
      limiter.recordRequest(req, statusCode);
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', limitInfo.limit.toString());
      response.headers.set('X-RateLimit-Remaining', (limitInfo.remaining - 1).toString());
      response.headers.set('X-RateLimit-Reset', limitInfo.resetTime.toString());
      
      return response;
    } catch (error) {
      // Record failed request
      limiter.recordRequest(req, 500);
      throw error;
    }
  };
}