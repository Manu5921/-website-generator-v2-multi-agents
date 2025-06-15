import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { dbCache } from '@/lib/api/cache-manager';

export interface ConnectionPoolConfig {
  maxConnections: number;
  idleTimeout: number;
  connectionTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface QueryMetrics {
  query: string;
  duration: number;
  cached: boolean;
  timestamp: Date;
  rowCount?: number;
  error?: string;
}

export interface ConnectionPoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  totalQueries: number;
  avgQueryTime: number;
  cacheHitRate: number;
  errorRate: number;
}

class DatabaseConnectionPool {
  private static instance: DatabaseConnectionPool;
  private config: ConnectionPoolConfig;
  private connections: Map<string, any> = new Map();
  private queryMetrics: QueryMetrics[] = [];
  private stats = {
    totalQueries: 0,
    totalQueryTime: 0,
    cachedQueries: 0,
    errors: 0
  };

  private constructor() {
    this.config = {
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // 30 seconds
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'), // 5 seconds
      retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000') // 1 second
    };

    // Cleanup idle connections periodically
    setInterval(() => this.cleanupIdleConnections(), 30000);
    
    // Cleanup old metrics
    setInterval(() => this.cleanupOldMetrics(), 300000); // 5 minutes
  }

  public static getInstance(): DatabaseConnectionPool {
    if (!DatabaseConnectionPool.instance) {
      DatabaseConnectionPool.instance = new DatabaseConnectionPool();
    }
    return DatabaseConnectionPool.instance;
  }

  /**
   * Get or create database connection
   */
  public async getConnection(): Promise<any> {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
      }

      // Create Neon connection
      const sql = neon(process.env.DATABASE_URL);
      const db = drizzle(sql);

      // Store connection info
      this.connections.set(connectionId, {
        db,
        sql,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        queryCount: 0
      });

      return { db, sql, connectionId };
    } catch (error) {
      console.error('Failed to create database connection:', error);
      throw error;
    }
  }

  /**
   * Release database connection
   */
  public releaseConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastUsed = Date.now();
    }
  }

  /**
   * Execute query with caching and metrics
   */
  public async executeQuery<T = any>(
    queryFn: (db: any) => Promise<T>,
    cacheKey?: string,
    cacheTtl: number = 300000, // 5 minutes default
    skipCache: boolean = false
  ): Promise<T> {
    const startTime = Date.now();
    let cached = false;
    let result: T;
    let error: string | undefined;

    try {
      // Try cache first if enabled
      if (cacheKey && !skipCache) {
        const cachedResult = dbCache.get<T>(cacheKey);
        if (cachedResult !== null) {
          cached = true;
          result = cachedResult;
          this.stats.cachedQueries++;
          
          this.recordMetrics({
            query: cacheKey,
            duration: Date.now() - startTime,
            cached: true,
            timestamp: new Date()
          });

          return result;
        }
      }

      // Execute query
      const { db, sql, connectionId } = await this.getConnection();
      
      try {
        result = await this.executeWithRetry(queryFn, db);
        
        // Cache result if cache key provided
        if (cacheKey && !skipCache) {
          dbCache.set(cacheKey, result, { ttl: cacheTtl });
        }

        // Update connection stats
        const connection = this.connections.get(connectionId);
        if (connection) {
          connection.queryCount++;
          connection.lastUsed = Date.now();
        }

        this.releaseConnection(connectionId);
      } catch (queryError) {
        this.releaseConnection(connectionId);
        throw queryError;
      }

    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      this.stats.errors++;
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      this.stats.totalQueries++;
      this.stats.totalQueryTime += duration;

      this.recordMetrics({
        query: cacheKey || 'anonymous',
        duration,
        cached,
        timestamp: new Date(),
        error
      });
    }

    return result!;
  }

  /**
   * Execute query with retry logic
   */
  private async executeWithRetry<T>(
    queryFn: (db: any) => Promise<T>,
    db: any,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await queryFn(db);
    } catch (error) {
      if (attempt < this.config.retryAttempts && this.isRetryableError(error)) {
        console.warn(`Query failed (attempt ${attempt}), retrying in ${this.config.retryDelay}ms...`, error);
        
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
        return this.executeWithRetry(queryFn, db, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    const retryableErrors = [
      'connection timeout',
      'connection reset',
      'connection refused',
      'network error',
      'temporary failure'
    ];

    const errorMessage = error?.message?.toLowerCase() || '';
    return retryableErrors.some(retryableError => 
      errorMessage.includes(retryableError)
    );
  }

  /**
   * Record query metrics
   */
  private recordMetrics(metrics: QueryMetrics): void {
    this.queryMetrics.push(metrics);
    
    // Keep only last 1000 metrics
    if (this.queryMetrics.length > 1000) {
      this.queryMetrics = this.queryMetrics.slice(-1000);
    }
  }

  /**
   * Cleanup idle connections
   */
  private cleanupIdleConnections(): void {
    const now = Date.now();
    const idsToRemove: string[] = [];

    for (const [id, connection] of this.connections.entries()) {
      if (now - connection.lastUsed > this.config.idleTimeout) {
        idsToRemove.push(id);
      }
    }

    idsToRemove.forEach(id => {
      this.connections.delete(id);
    });

    if (idsToRemove.length > 0) {
      console.log(`Cleaned up ${idsToRemove.length} idle database connections`);
    }
  }

  /**
   * Cleanup old metrics
   */
  private cleanupOldMetrics(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.queryMetrics = this.queryMetrics.filter(metric => 
      metric.timestamp > oneHourAgo
    );
  }

  /**
   * Get connection pool statistics
   */
  public getStats(): ConnectionPoolStats {
    const now = Date.now();
    const idleTimeout = this.config.idleTimeout;
    
    let activeConnections = 0;
    let idleConnections = 0;

    for (const connection of this.connections.values()) {
      if (now - connection.lastUsed < idleTimeout) {
        activeConnections++;
      } else {
        idleConnections++;
      }
    }

    const avgQueryTime = this.stats.totalQueries > 0 ? 
      this.stats.totalQueryTime / this.stats.totalQueries : 0;

    const cacheHitRate = this.stats.totalQueries > 0 ? 
      this.stats.cachedQueries / this.stats.totalQueries : 0;

    const errorRate = this.stats.totalQueries > 0 ? 
      this.stats.errors / this.stats.totalQueries : 0;

    return {
      totalConnections: this.connections.size,
      activeConnections,
      idleConnections,
      totalQueries: this.stats.totalQueries,
      avgQueryTime: Math.round(avgQueryTime),
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100
    };
  }

  /**
   * Get recent query metrics
   */
  public getQueryMetrics(limit: number = 50): QueryMetrics[] {
    return this.queryMetrics
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get slow queries
   */
  public getSlowQueries(threshold: number = 1000): QueryMetrics[] {
    return this.queryMetrics
      .filter(metric => metric.duration > threshold && !metric.cached)
      .sort((a, b) => b.duration - a.duration);
  }

  /**
   * Clear all connections
   */
  public async closeAllConnections(): Promise<void> {
    this.connections.clear();
    console.log('All database connections closed');
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      connectionCount: number;
      avgResponseTime: number;
      errorRate: number;
      lastError?: string;
    };
  }> {
    try {
      const startTime = Date.now();
      
      // Execute a simple query
      await this.executeQuery(
        async (db) => db.execute('SELECT 1 as health_check'),
        'health_check',
        0, // No cache for health check
        true // Skip cache
      );

      const responseTime = Date.now() - startTime;
      const stats = this.getStats();
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      if (stats.errorRate > 0.1 || responseTime > 5000) {
        status = 'unhealthy';
      } else if (stats.errorRate > 0.05 || responseTime > 2000) {
        status = 'degraded';
      }

      return {
        status,
        details: {
          connectionCount: stats.totalConnections,
          avgResponseTime: responseTime,
          errorRate: stats.errorRate,
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          connectionCount: this.connections.size,
          avgResponseTime: -1,
          errorRate: 1,
          lastError: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Query optimization helpers
export class QueryOptimizer {
  /**
   * Generate optimized cache key
   */
  static generateCacheKey(
    table: string,
    operation: string,
    params?: Record<string, any>
  ): string {
    const paramsHash = params ? 
      Buffer.from(JSON.stringify(params)).toString('base64').slice(0, 8) : 
      '';
    return `${table}:${operation}:${paramsHash}`;
  }

  /**
   * Batch multiple queries
   */
  static async batchQueries<T>(
    pool: DatabaseConnectionPool,
    queries: Array<() => Promise<T>>
  ): Promise<T[]> {
    // Execute queries in parallel with connection reuse
    return Promise.all(queries.map(query => query()));
  }

  /**
   * Generate pagination query
   */
  static paginationQuery(
    limit: number = 10,
    offset: number = 0
  ): { limit: number; offset: number } {
    return {
      limit: Math.min(Math.max(1, limit), 100), // Max 100 items
      offset: Math.max(0, offset)
    };
  }
}

// Export singleton instance
export const dbPool = DatabaseConnectionPool.getInstance();

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.log('Closing database connections...');
    await dbPool.closeAllConnections();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Closing database connections...');
    await dbPool.closeAllConnections();
    process.exit(0);
  });
}