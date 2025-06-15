import { NextRequest, NextResponse } from 'next/server';

interface WebVitalData {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  url: string;
  userAgent: string;
  timestamp: number;
}

// In-memory storage for demonstration (replace with database in production)
const metricsStore: WebVitalData[] = [];

export async function POST(request: NextRequest) {
  try {
    const data: WebVitalData = await request.json();
    
    // Validate required fields
    if (!data.name || typeof data.value !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // Store metric
    metricsStore.push({
      ...data,
      timestamp: Date.now(),
    });

    // Keep only last 1000 metrics to prevent memory overflow
    if (metricsStore.length > 1000) {
      metricsStore.splice(0, metricsStore.length - 1000);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing web vital:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Calculate aggregated metrics
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    const recentMetrics = metricsStore.filter(m => m.timestamp > oneDayAgo);
    
    const aggregated = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = {
          values: [],
          ratings: { good: 0, 'needs-improvement': 0, poor: 0 }
        };
      }
      
      acc[metric.name].values.push(metric.value);
      acc[metric.name].ratings[metric.rating]++;
      
      return acc;
    }, {} as Record<string, { values: number[], ratings: Record<string, number> }>);

    // Calculate averages and percentiles
    const summary = Object.entries(aggregated).reduce((acc, [name, data]) => {
      const sorted = data.values.sort((a, b) => a - b);
      const avg = sorted.reduce((sum, val) => sum + val, 0) / sorted.length;
      const p75 = sorted[Math.floor(sorted.length * 0.75)] || 0;
      const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
      
      acc[name] = {
        average: Math.round(avg),
        p75: Math.round(p75),
        p95: Math.round(p95),
        count: sorted.length,
        ratings: data.ratings
      };
      
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        totalMetrics: recentMetrics.length,
        timeRange: '24h'
      }
    });
  } catch (error) {
    console.error('Error retrieving web vitals:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}