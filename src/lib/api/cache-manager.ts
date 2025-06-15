export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  staleWhileRevalidate?: number; // SWR time in milliseconds
  tags?: string[]; // Cache tags for invalidation
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  etag: string;
  staleWhileRevalidate?: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, CacheEntry>();
  private stats = { hits: 0, misses: 0 };
  private maxSize: number;

  private constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
    
    // Cleanup expired entries periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  public static getInstance(maxSize?: number): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(maxSize);
    }
    return CacheManager.instance;
  }

  private generateETag(data: any): string {
    return `"${Date.now()}-${JSON.stringify(data).length}"`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private isStale(entry: CacheEntry): boolean {
    if (!entry.staleWhileRevalidate) return this.isExpired(entry);
    return Date.now() - entry.timestamp > entry.staleWhileRevalidate;
  }

  private evictLRU(): void {
    if (this.cache.size <= this.maxSize) return;

    // Find least recently used entry
    let oldestKey: string | undefined;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  public set<T>(
    key: string, 
    data: T, 
    config: CacheConfig = {}
  ): void {
    const {
      ttl = 5 * 60 * 1000, // 5 minutes default
      tags = [],
      staleWhileRevalidate
    } = config;

    this.evictLRU();

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
      etag: this.generateETag(data),
      staleWhileRevalidate
    };

    this.cache.set(key, entry);
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update timestamp for LRU
    entry.timestamp = Date.now();
    this.cache.set(key, entry);
    
    this.stats.hits++;
    return entry.data as T;
  }

  public getWithStale<T>(key: string): { data: T | null; stale: boolean } {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return { data: null, stale: false };
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return { data: null, stale: false };
    }

    const stale = this.isStale(entry);
    
    // Update timestamp for LRU
    entry.timestamp = Date.now();
    this.cache.set(key, entry);
    
    this.stats.hits++;
    return { data: entry.data as T, stale };
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry ? !this.isExpired(entry) : false;
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public invalidateByTag(tag: string): number {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    return invalidated;
  }

  public clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  public cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  public getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0
    };
  }

  public getEntry(key: string): CacheEntry | undefined {
    return this.cache.get(key);
  }

  public keys(): string[] {
    return Array.from(this.cache.keys());
  }

  public values(): CacheEntry[] {
    return Array.from(this.cache.values());
  }

  // Response caching utilities
  public cacheResponse(
    key: string,
    response: any,
    config: CacheConfig = {}
  ): void {
    const cacheableResponse = {
      status: response.status,
      headers: Object.fromEntries(response.headers || []),
      data: response.data || response.body
    };

    this.set(key, cacheableResponse, config);
  }

  public getCachedResponse(key: string): any | null {
    return this.get(key);
  }

  // Memoization decorator
  public memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string,
    config: CacheConfig = {}
  ): T {
    const cache = this;
    
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = keyGenerator ? 
        keyGenerator(...args) : 
        `memo:${fn.name}:${JSON.stringify(args)}`;
      
      let cached = cache.get(key);
      
      if (cached !== null) {
        return cached;
      }

      const result = fn(...args);
      cache.set(key, result, config);
      
      return result;
    }) as T;
  }

  // Async memoization
  public memoizeAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string,
    config: CacheConfig = {}
  ): T {
    const cache = this;
    const pending = new Map<string, Promise<any>>();
    
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const key = keyGenerator ? 
        keyGenerator(...args) : 
        `async_memo:${fn.name}:${JSON.stringify(args)}`;
      
      // Check cache first
      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Check if already pending
      if (pending.has(key)) {
        return pending.get(key);
      }

      // Execute function
      const promise = fn(...args).then(result => {
        cache.set(key, result, config);
        pending.delete(key);
        return result;
      }).catch(error => {
        pending.delete(key);
        throw error;
      });

      pending.set(key, promise);
      return promise;
    }) as T;
  }
}

// Specific cache instances
export const apiCache = CacheManager.getInstance(2000);
export const staticCache = CacheManager.getInstance(5000);
export const dbCache = CacheManager.getInstance(1000);

// Cache middleware for API routes
export function withCache(
  handler: Function,
  keyGenerator: (...args: any[]) => string,
  config: CacheConfig = {}
) {
  return async (...args: any[]) => {
    const key = keyGenerator(...args);
    
    // Try to get from cache
    const cached = apiCache.get(key);
    if (cached) {
      return cached;
    }

    // Execute handler
    const result = await handler(...args);
    
    // Cache the result
    apiCache.set(key, result, config);
    
    return result;
  };
}

// HTTP cache headers utility
export function getCacheHeaders(config: CacheConfig = {}): Record<string, string> {
  const {
    ttl = 5 * 60, // 5 minutes in seconds
    staleWhileRevalidate
  } = config;

  const maxAge = Math.floor(ttl / 1000);
  let cacheControl = `public, max-age=${maxAge}`;
  
  if (staleWhileRevalidate) {
    const swr = Math.floor(staleWhileRevalidate / 1000);
    cacheControl += `, stale-while-revalidate=${swr}`;
  }

  return {
    'Cache-Control': cacheControl,
    'ETag': `"${Date.now()}"`,
    'Last-Modified': new Date().toUTCString()
  };
}