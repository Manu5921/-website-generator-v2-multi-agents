import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from './schema';

// Production optimizations for Neon
// Note: fetchConnectionCache is now always true by default

// Enhanced database connection with production optimizations
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Configure connection with production settings
const sql = neon(connectionString, {
  // Connection pooling and performance settings
  fullResults: true,
  arrayMode: false,
});

// Create drizzle instance with optimized configuration
export const db = drizzle(sql, { 
  schema,
  logger: process.env.NODE_ENV === 'development',
});

// Connection health check utility
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Connection retry utility for production
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Database operation attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError!;
}

// Performance monitoring for database operations
export async function withDatabaseMetrics<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    if (duration > 1000) {
      console.warn(`Slow database operation: ${operationName} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Database operation failed: ${operationName} after ${duration}ms`, error);
    throw error;
  }
}

// Export du schéma pour utilisation dans l'app
export * from './schema';