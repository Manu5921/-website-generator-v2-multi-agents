// =============================================================================
// 📊 SYSTÈME DE COLLECTE MÉTRIQUES AVANCÉ - CORE PLATFORM
// =============================================================================

import { db } from '@/lib/db';
import { metriquesOrchestration } from '@/lib/db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';
import { coreLogger } from '@/lib/monitoring';

// =============================================================================
// 🎯 TYPES ET INTERFACES
// =============================================================================

export interface MetricPoint {
  timestamp: number;
  value: number;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface MetricSeries {
  name: string;
  unit: string;
  points: MetricPoint[];
  aggregations?: {
    avg: number;
    min: number;
    max: number;
    sum: number;
    count: number;
    p50: number;
    p95: number;
    p99: number;
  };
}

export interface PerformanceMetrics {
  // Métriques système
  responseTime: MetricSeries;
  throughput: MetricSeries;
  errorRate: MetricSeries;
  uptime: MetricSeries;
  
  // Métriques agents
  agentHealth: Record<string, MetricSeries>;
  taskCompletion: MetricSeries;
  queueSize: MetricSeries;
  
  // Métriques business
  projectsCreated: MetricSeries;
  clientSatisfaction: MetricSeries;
  revenue: MetricSeries;
}

export interface AlertThreshold {
  metricName: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne';
  value: number;
  duration: number; // minutes
  severity: 'info' | 'warning' | 'critical';
  channels: ('slack' | 'email' | 'webhook')[];
}

// =============================================================================
// 🔧 COLLECTEUR DE MÉTRIQUES
// =============================================================================

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metricsBuffer: Map<string, MetricPoint[]> = new Map();
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds

  private constructor() {
    this.startPeriodicFlush();
  }

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  // =============================================================================
  // 📊 COLLECTION DE MÉTRIQUES
  // =============================================================================

  async recordMetric(
    name: string,
    value: number,
    unit: string,
    tags?: Record<string, string>,
    metadata?: Record<string, any>
  ): Promise<void> {
    const point: MetricPoint = {
      timestamp: Date.now(),
      value,
      tags,
      metadata
    };

    const key = this.getMetricKey(name, tags);
    
    if (!this.metricsBuffer.has(key)) {
      this.metricsBuffer.set(key, []);
    }
    
    const buffer = this.metricsBuffer.get(key)!;
    buffer.push(point);
    
    // Flush si le buffer est plein
    if (buffer.length >= this.BUFFER_SIZE) {
      await this.flushMetric(name, unit, buffer, tags);
      this.metricsBuffer.set(key, []);
    }
  }

  async recordResponseTime(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    agentType?: string
  ): Promise<void> {
    await this.recordMetric(
      'response_time',
      duration,
      'ms',
      {
        endpoint,
        method,
        status_code: statusCode.toString(),
        agent_type: agentType || 'unknown'
      }
    );
  }

  async recordThroughput(
    agentType: string,
    requestsPerMinute: number
  ): Promise<void> {
    await this.recordMetric(
      'throughput',
      requestsPerMinute,
      'requests/min',
      { agent_type: agentType }
    );
  }

  async recordError(
    agentType: string,
    errorType: string,
    errorMessage?: string
  ): Promise<void> {
    await this.recordMetric(
      'error_count',
      1,
      'count',
      {
        agent_type: agentType,
        error_type: errorType
      },
      { error_message: errorMessage }
    );
  }

  async recordTaskCompletion(
    agentType: string,
    taskType: string,
    duration: number,
    success: boolean
  ): Promise<void> {
    await this.recordMetric(
      'task_completion',
      duration,
      'ms',
      {
        agent_type: agentType,
        task_type: taskType,
        success: success.toString()
      }
    );
  }

  async recordBusinessMetric(
    name: string,
    value: number,
    unit: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.recordMetric(
      `business_${name}`,
      value,
      unit,
      { category: 'business' },
      metadata
    );
  }

  // =============================================================================
  // 💾 FLUSH ET PERSISTANCE
  // =============================================================================

  private async flushMetric(
    name: string,
    unit: string,
    points: MetricPoint[],
    tags?: Record<string, string>
  ): Promise<void> {
    if (points.length === 0) return;

    try {
      // Calculer les agrégations
      const values = points.map(p => p.value);
      const aggregations = this.calculateAggregations(values);
      
      // Sauvegarder les points individuels pour les métriques critiques
      const criticalMetrics = ['response_time', 'error_count', 'task_completion'];
      if (criticalMetrics.includes(name)) {
        const insertValues = points.map(point => ({
          metrique: name,
          valeur: point.value.toString(),
          unite: unit,
          agentType: tags?.agent_type,
          metadonnees: JSON.stringify({
            tags: point.tags,
            metadata: point.metadata,
            aggregations
          })
        }));

        await db.insert(metriquesOrchestration).values(insertValues);
      } else {
        // Pour les autres métriques, ne sauvegarder que les agrégations
        await db.insert(metriquesOrchestration).values({
          metrique: `${name}_aggregated`,
          valeur: aggregations.avg.toString(),
          unite: unit,
          agentType: tags?.agent_type,
          metadonnees: JSON.stringify({
            aggregations,
            pointCount: points.length,
            timeRange: {
              start: Math.min(...points.map(p => p.timestamp)),
              end: Math.max(...points.map(p => p.timestamp))
            },
            tags
          })
        });
      }

      coreLogger.debug(`Flushed ${points.length} points for metric ${name}`);

    } catch (error) {
      coreLogger.error(`Failed to flush metric ${name}`, error as Error);
    }
  }

  private calculateAggregations(values: number[]): {
    avg: number;
    min: number;
    max: number;
    sum: number;
    count: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    const sorted = values.slice().sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    
    return {
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      sum,
      count: values.length,
      p50: this.percentile(sorted, 0.5),
      p95: this.percentile(sorted, 0.95),
      p99: this.percentile(sorted, 0.99)
    };
  }

  private percentile(sortedValues: number[], p: number): number {
    const index = Math.ceil(sortedValues.length * p) - 1;
    return sortedValues[Math.max(0, index)];
  }

  private getMetricKey(name: string, tags?: Record<string, string>): string {
    const tagString = tags ? 
      Object.entries(tags).sort().map(([k, v]) => `${k}:${v}`).join(',') : 
      '';
    return `${name}#${tagString}`;
  }

  private startPeriodicFlush(): void {
    this.flushInterval = setInterval(async () => {
      await this.flushAllMetrics();
    }, this.FLUSH_INTERVAL);
  }

  private async flushAllMetrics(): Promise<void> {
    for (const [key, points] of this.metricsBuffer.entries()) {
      if (points.length > 0) {
        const [name] = key.split('#');
        await this.flushMetric(name, 'unknown', points);
        this.metricsBuffer.set(key, []);
      }
    }
  }

  // =============================================================================
  // 📈 REQUÊTES ET ANALYSES
  // =============================================================================

  async getMetricSeries(
    metricName: string,
    timeRangeHours: number = 24,
    agentType?: string
  ): Promise<MetricSeries> {
    try {
      const since = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);
      
      let query = db.select({
        timestamp: metriquesOrchestration.dateCreation,
        value: metriquesOrchestration.valeur,
        metadata: metriquesOrchestration.metadonnees,
        unit: metriquesOrchestration.unite
      })
      .from(metriquesOrchestration)
      .where(
        and(
          eq(metriquesOrchestration.metrique, metricName),
          sql`date_creation >= ${since}`
        )
      );

      if (agentType) {
        query = query.where(eq(metriquesOrchestration.agentType, agentType));
      }

      const results = await query
        .orderBy(desc(metriquesOrchestration.dateCreation))
        .limit(1000);

      const points: MetricPoint[] = results.map(row => ({
        timestamp: row.timestamp.getTime(),
        value: parseFloat(row.value),
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined
      }));

      // Calculer les agrégations
      const values = points.map(p => p.value);
      const aggregations = values.length > 0 ? this.calculateAggregations(values) : undefined;

      return {
        name: metricName,
        unit: results[0]?.unit || 'unknown',
        points,
        aggregations
      };

    } catch (error) {
      coreLogger.error(`Failed to get metric series for ${metricName}`, error as Error);
      return {
        name: metricName,
        unit: 'unknown',
        points: []
      };
    }
  }

  async getPerformanceDashboard(timeRangeHours: number = 1): Promise<PerformanceMetrics> {
    const [responseTime, throughput, errorRate, taskCompletion] = await Promise.all([
      this.getMetricSeries('response_time', timeRangeHours),
      this.getMetricSeries('throughput', timeRangeHours),
      this.getMetricSeries('error_count', timeRangeHours),
      this.getMetricSeries('task_completion', timeRangeHours)
    ]);

    // Métriques par agent
    const agentTypes = ['design-ia', 'automation', 'ads-management', 'core-platform'];
    const agentHealth: Record<string, MetricSeries> = {};
    
    for (const agentType of agentTypes) {
      agentHealth[agentType] = await this.getMetricSeries('response_time', timeRangeHours, agentType);
    }

    return {
      responseTime,
      throughput,
      errorRate,
      uptime: await this.getMetricSeries('uptime', timeRangeHours),
      agentHealth,
      taskCompletion,
      queueSize: await this.getMetricSeries('queue_size', timeRangeHours),
      projectsCreated: await this.getMetricSeries('business_projects_created', timeRangeHours),
      clientSatisfaction: await this.getMetricSeries('business_client_satisfaction', timeRangeHours),
      revenue: await this.getMetricSeries('business_revenue', timeRangeHours)
    };
  }

  // =============================================================================
  // 🚨 ALERTES ET SEUILS
  // =============================================================================

  async checkAlertThresholds(): Promise<void> {
    // TODO: Implémenter la vérification des seuils d'alerte
    // Cette méthode sera appelée périodiquement pour vérifier les seuils
  }

  // =============================================================================
  // 🧹 NETTOYAGE
  // =============================================================================

  async cleanup(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    await this.flushAllMetrics();
  }

  // =============================================================================
  // 📊 MÉTRIQUES SYSTÈME
  // =============================================================================

  async recordSystemMetrics(): Promise<void> {
    try {
      // Métriques Node.js
      const memUsage = process.memoryUsage();
      await this.recordMetric('memory_usage', memUsage.heapUsed / 1024 / 1024, 'MB');
      await this.recordMetric('memory_total', memUsage.heapTotal / 1024 / 1024, 'MB');
      
      // CPU usage (approximatif)
      const cpuUsage = process.cpuUsage();
      await this.recordMetric('cpu_user', cpuUsage.user / 1000, 'ms');
      await this.recordMetric('cpu_system', cpuUsage.system / 1000, 'ms');
      
      // Uptime
      await this.recordMetric('process_uptime', process.uptime(), 'seconds');
      
    } catch (error) {
      coreLogger.error('Failed to record system metrics', error as Error);
    }
  }
}

// =============================================================================
// 🎯 EXPORT ET INSTANCE SINGLETON
// =============================================================================

export const metricsCollector = MetricsCollector.getInstance();

// Démarrer la collecte automatique des métriques système
setInterval(() => {
  metricsCollector.recordSystemMetrics();
}, 60000); // Toutes les minutes

export default metricsCollector;