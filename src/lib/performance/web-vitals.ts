/**
 * Web Vitals Monitoring System
 * Collecte et analyse les métriques de performance Core Web Vitals
 */

export interface WebVitalMetric {
  id: string;
  name: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
}

export interface WebVitalsData {
  url: string;
  timestamp: number;
  metrics: WebVitalMetric[];
  userAgent: string;
  connectionType?: string;
  deviceMemory?: number;
}

// Seuils optimaux pour les Core Web Vitals
const THRESHOLDS = {
  FCP: { good: 1200, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
} as const;

class WebVitalsCollector {
  private metrics: Map<string, WebVitalMetric> = new Map();
  private beaconUrl = '/api/analytics/web-vitals';
  private batchSize = 5;
  private flushTimeout = 5000;
  private timeoutId?: NodeJS.Timeout;

  constructor() {
    this.initializePerformanceObserver();
    this.scheduleFlush();
  }

  private initializePerformanceObserver() {
    if (typeof window === 'undefined') return;

    // Observer pour FCP, LCP
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.handlePerformanceEntry(entry);
          }
        });

        observer.observe({ 
          entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] 
        });
      } catch (e) {
        console.warn('PerformanceObserver not supported:', e);
      }
    }

    // Web Vitals via library
    this.initWebVitalsLibrary();
  }

  private async initWebVitalsLibrary() {
    try {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
      
      getCLS(this.handleMetric.bind(this));
      getFID(this.handleMetric.bind(this));
      getFCP(this.handleMetric.bind(this));
      getLCP(this.handleMetric.bind(this));
      getTTFB(this.handleMetric.bind(this));
    } catch (error) {
      console.warn('Web Vitals library not available:', error);
    }
  }

  private handlePerformanceEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'navigation':
        this.handleNavigationTiming(entry as PerformanceNavigationTiming);
        break;
      case 'paint':
        this.handlePaintTiming(entry as PerformancePaintTiming);
        break;
      case 'largest-contentful-paint':
        this.handleLCPTiming(entry as any);
        break;
      case 'first-input':
        this.handleFIDTiming(entry as any);
        break;
      case 'layout-shift':
        this.handleCLSTiming(entry as any);
        break;
    }
  }

  private handleNavigationTiming(entry: PerformanceNavigationTiming) {
    const ttfb = entry.responseStart - entry.requestStart;
    
    this.addMetric({
      id: `ttfb-${Date.now()}`,
      name: 'TTFB',
      value: ttfb,
      rating: this.getRating('TTFB', ttfb),
      delta: ttfb,
      entries: [entry],
    });
  }

  private handlePaintTiming(entry: PerformancePaintTiming) {
    if (entry.name === 'first-contentful-paint') {
      this.addMetric({
        id: `fcp-${Date.now()}`,
        name: 'FCP',
        value: entry.startTime,
        rating: this.getRating('FCP', entry.startTime),
        delta: entry.startTime,
        entries: [entry],
      });
    }
  }

  private handleLCPTiming(entry: any) {
    this.addMetric({
      id: `lcp-${Date.now()}`,
      name: 'LCP',
      value: entry.startTime,
      rating: this.getRating('LCP', entry.startTime),
      delta: entry.startTime,
      entries: [entry],
    });
  }

  private handleFIDTiming(entry: any) {
    const fid = entry.processingStart - entry.startTime;
    
    this.addMetric({
      id: `fid-${Date.now()}`,
      name: 'FID',
      value: fid,
      rating: this.getRating('FID', fid),
      delta: fid,
      entries: [entry],
    });
  }

  private handleCLSTiming(entry: any) {
    if (!entry.hadRecentInput) {
      this.addMetric({
        id: `cls-${Date.now()}`,
        name: 'CLS',
        value: entry.value,
        rating: this.getRating('CLS', entry.value),
        delta: entry.value,
        entries: [entry],
      });
    }
  }

  private handleMetric(metric: any) {
    this.addMetric({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      entries: metric.entries || [],
    });
  }

  private addMetric(metric: WebVitalMetric) {
    this.metrics.set(metric.id, metric);
    
    // Flush si on atteint la taille du batch
    if (this.metrics.size >= this.batchSize) {
      this.flush();
    }
  }

  private getRating(name: WebVitalMetric['name'], value: number): WebVitalMetric['rating'] {
    const threshold = THRESHOLDS[name];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private scheduleFlush() {
    this.timeoutId = setTimeout(() => {
      this.flush();
      this.scheduleFlush();
    }, this.flushTimeout);
  }

  private async flush() {
    if (this.metrics.size === 0) return;

    const data: WebVitalsData = {
      url: window.location.href,
      timestamp: Date.now(),
      metrics: Array.from(this.metrics.values()),
      userAgent: navigator.userAgent,
      connectionType: (navigator as any).connection?.effectiveType,
      deviceMemory: (navigator as any).deviceMemory,
    };

    try {
      // Utiliser sendBeacon pour la fiabilité
      if ('sendBeacon' in navigator) {
        navigator.sendBeacon(this.beaconUrl, JSON.stringify(data));
      } else {
        // Fallback pour les navigateurs plus anciens
        fetch(this.beaconUrl, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        }).catch(console.warn);
      }
    } catch (error) {
      console.warn('Failed to send web vitals data:', error);
    }

    this.metrics.clear();
  }

  // API publique
  public getCurrentMetrics(): WebVitalMetric[] {
    return Array.from(this.metrics.values());
  }

  public getMetricsSummary() {
    const metrics = this.getCurrentMetrics();
    const summary = {
      total: metrics.length,
      good: metrics.filter(m => m.rating === 'good').length,
      needsImprovement: metrics.filter(m => m.rating === 'needs-improvement').length,
      poor: metrics.filter(m => m.rating === 'poor').length,
    };
    
    return {
      ...summary,
      score: summary.total > 0 ? Math.round((summary.good / summary.total) * 100) : 0,
    };
  }

  public destroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.flush();
  }
}

// Instance globale
let webVitalsCollector: WebVitalsCollector | null = null;

export function initWebVitalsTracking() {
  if (typeof window === 'undefined') return null;
  
  if (!webVitalsCollector) {
    webVitalsCollector = new WebVitalsCollector();
  }
  
  return webVitalsCollector;
}

export function getWebVitalsCollector() {
  return webVitalsCollector;
}

// Hook pour React
export function useWebVitals() {
  const [metrics, setMetrics] = React.useState<WebVitalMetric[]>([]);
  const [summary, setSummary] = React.useState({ total: 0, good: 0, needsImprovement: 0, poor: 0, score: 0 });

  React.useEffect(() => {
    const collector = initWebVitalsTracking();
    if (!collector) return;

    const interval = setInterval(() => {
      setMetrics(collector.getCurrentMetrics());
      setSummary(collector.getMetricsSummary());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return { metrics, summary };
}

// Pour Next.js App Router
export function reportWebVitals(metric: any) {
  if (typeof window !== 'undefined') {
    const collector = getWebVitalsCollector();
    if (collector) {
      (collector as any).handleMetric(metric);
    }
  }
}