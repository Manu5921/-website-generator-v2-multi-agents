// Production Monitoring and Logging System
// Multi-Agent Platform Monitoring

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  service: string;
  message: string;
  metadata?: Record<string, any>;
  requestId?: string;
  userId?: string;
  agentId?: string;
}

interface MetricEntry {
  timestamp: string;
  metric: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}

interface AlertEntry {
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  service: string;
  message: string;
  threshold?: number;
  currentValue?: number;
  resolved?: boolean;
}

class ProductionLogger {
  private logLevel: keyof LogLevel = 'info';
  private serviceName: string;
  
  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.logLevel = (process.env.LOG_LEVEL as keyof LogLevel) || 'info';
  }

  private shouldLog(level: keyof LogLevel): boolean {
    const levels: Record<keyof LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    
    return levels[level] >= levels[this.logLevel];
  }

  private formatLog(entry: LogEntry): string {
    if (process.env.NODE_ENV === 'production') {
      return JSON.stringify(entry);
    }
    
    // Development format with colors
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    return `[${timestamp}] ${level} [${entry.service}] ${entry.message}`;
  }

  log(level: keyof LogLevel, message: string, metadata?: Record<string, any>, requestId?: string): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      metadata,
      requestId,
    };

    const formattedLog = this.formatLog(entry);
    
    switch (level) {
      case 'error':
        console.error(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'info':
        console.info(formattedLog);
        break;
      case 'debug':
        console.debug(formattedLog);
        break;
    }

    // In production, you would send to external logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogger(entry);
    }
  }

  error(message: string, error?: Error, metadata?: Record<string, any>, requestId?: string): void {
    const errorMetadata = {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };
    
    this.log('error', message, errorMetadata, requestId);
  }

  warn(message: string, metadata?: Record<string, any>, requestId?: string): void {
    this.log('warn', message, metadata, requestId);
  }

  info(message: string, metadata?: Record<string, any>, requestId?: string): void {
    this.log('info', message, metadata, requestId);
  }

  debug(message: string, metadata?: Record<string, any>, requestId?: string): void {
    this.log('debug', message, metadata, requestId);
  }

  private sendToExternalLogger(entry: LogEntry): void {
    // In production, implement sending to services like:
    // - Vercel Analytics
    // - DataDog
    // - New Relic
    // - Custom webhook
    
    // For now, we'll just ensure structured logging
    console.log(JSON.stringify(entry));
  }
}

class PerformanceMonitor {
  private metrics: MetricEntry[] = [];
  private alerts: AlertEntry[] = [];
  
  recordMetric(metric: string, value: number, unit: string, tags?: Record<string, string>): void {
    const entry: MetricEntry = {
      timestamp: new Date().toISOString(),
      metric,
      value,
      unit,
      tags,
    };
    
    this.metrics.push(entry);
    
    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    
    // Check for alert conditions
    this.checkAlerts(entry);
  }

  recordResponseTime(duration: number, endpoint: string, statusCode: number): void {
    this.recordMetric('response_time', duration, 'ms', {
      endpoint,
      status_code: statusCode.toString(),
    });
  }

  recordDatabaseLatency(duration: number, operation: string): void {
    this.recordMetric('database_latency', duration, 'ms', {
      operation,
    });
  }

  recordError(service: string, errorType: string): void {
    this.recordMetric('error_count', 1, 'count', {
      service,
      error_type: errorType,
    });
  }

  private checkAlerts(metric: MetricEntry): void {
    const alertThresholds: Record<string, { threshold: number; severity: 'critical' | 'warning' }> = {
      response_time: { threshold: 1000, severity: 'warning' },
      database_latency: { threshold: 2000, severity: 'critical' },
      error_count: { threshold: 10, severity: 'warning' },
    };

    const config = alertThresholds[metric.metric];
    if (!config) return;

    if (metric.value > config.threshold) {
      const alert: AlertEntry = {
        timestamp: new Date().toISOString(),
        severity: config.severity,
        service: metric.tags?.service || 'unknown',
        message: `${metric.metric} exceeded threshold: ${metric.value}${metric.unit} > ${config.threshold}${metric.unit}`,
        threshold: config.threshold,
        currentValue: metric.value,
        resolved: false,
      };

      this.alerts.push(alert);
      this.sendAlert(alert);
    }
  }

  private sendAlert(alert: AlertEntry): void {
    // In production, send to alerting systems like:
    // - PagerDuty
    // - Slack webhooks
    // - Email notifications
    // - SMS alerts
    
    console.warn(`🚨 ALERT [${alert.severity.toUpperCase()}] ${alert.service}: ${alert.message}`);
  }

  getMetrics(metric?: string, since?: Date): MetricEntry[] {
    let filtered = this.metrics;
    
    if (metric) {
      filtered = filtered.filter(m => m.metric === metric);
    }
    
    if (since) {
      filtered = filtered.filter(m => new Date(m.timestamp) >= since);
    }
    
    return filtered;
  }

  getAlerts(resolved?: boolean): AlertEntry[] {
    if (resolved !== undefined) {
      return this.alerts.filter(a => a.resolved === resolved);
    }
    return this.alerts;
  }
}

// Middleware for API route monitoring
export function withMonitoring<T>(
  handler: (req: Request, logger: ProductionLogger, monitor: PerformanceMonitor) => Promise<T>,
  serviceName: string
) {
  return async (req: Request): Promise<T> => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    const logger = new ProductionLogger(serviceName);
    const monitor = new PerformanceMonitor();
    
    logger.info('Request started', {
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('user-agent'),
    }, requestId);
    
    try {
      const result = await handler(req, logger, monitor);
      const duration = Date.now() - startTime;
      
      monitor.recordResponseTime(duration, req.url || 'unknown', 200);
      logger.info('Request completed', { duration }, requestId);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      monitor.recordResponseTime(duration, req.url || 'unknown', 500);
      monitor.recordError(serviceName, (error as Error).name);
      
      logger.error('Request failed', error as Error, { duration }, requestId);
      throw error;
    }
  };
}

// Global instances for the application
export const orchestratorLogger = new ProductionLogger('orchestrator');
export const coreLogger = new ProductionLogger('core-platform');
export const globalMonitor = new PerformanceMonitor();

// Utility functions
export function generateRequestId(): string {
  return crypto.randomUUID();
}

export function measurePerformance<T>(
  operation: () => Promise<T>,
  metricName: string,
  monitor: PerformanceMonitor = globalMonitor
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      monitor.recordMetric(metricName, duration, 'ms');
      resolve(result);
    } catch (error) {
      const duration = Date.now() - startTime;
      monitor.recordMetric(metricName, duration, 'ms', { status: 'error' });
      reject(error);
    }
  });
}

// Export types for external use
export type { LogEntry, MetricEntry, AlertEntry };