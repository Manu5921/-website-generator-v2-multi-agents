'use client';

import { useState, useEffect } from 'react';

interface MetricData {
  timestamp: number;
  value: number;
}

interface PerformanceData {
  responseTime: MetricData[];
  cpuUsage: MetricData[];
  memoryUsage: MetricData[];
  throughput: MetricData[];
  errorRate: MetricData[];
}

interface AlertRule {
  id: string;
  metric: string;
  threshold: number;
  condition: 'above' | 'below';
  severity: 'info' | 'warning' | 'critical';
  isActive: boolean;
}

export default function PerformanceMetrics() {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [selectedMetric, setSelectedMetric] = useState<keyof PerformanceData>('responseTime');
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    responseTime: [],
    cpuUsage: [],
    memoryUsage: [],
    throughput: [],
    errorRate: []
  });

  const [alerts, setAlerts] = useState<AlertRule[]>([
    {
      id: '1',
      metric: 'responseTime',
      threshold: 200,
      condition: 'above',
      severity: 'warning',
      isActive: true
    },
    {
      id: '2',
      metric: 'cpuUsage',
      threshold: 80,
      condition: 'above',
      severity: 'critical',
      isActive: true
    },
    {
      id: '3',
      metric: 'errorRate',
      threshold: 5,
      condition: 'above',
      severity: 'critical',
      isActive: true
    }
  ]);

  const [currentAlerts, setCurrentAlerts] = useState<string[]>([]);

  useEffect(() => {
    // Generate mock performance data
    const generateData = () => {
      const now = Date.now();
      const points = 20;
      const interval = getIntervalForTimeRange(timeRange);
      
      const newData: PerformanceData = {
        responseTime: [],
        cpuUsage: [],
        memoryUsage: [],
        throughput: [],
        errorRate: []
      };

      for (let i = points - 1; i >= 0; i--) {
        const timestamp = now - (i * interval);
        
        newData.responseTime.push({
          timestamp,
          value: 30 + Math.random() * 150 + Math.sin(i * 0.5) * 20
        });
        
        newData.cpuUsage.push({
          timestamp,
          value: 20 + Math.random() * 60 + Math.sin(i * 0.3) * 10
        });
        
        newData.memoryUsage.push({
          timestamp,
          value: 40 + Math.random() * 40 + Math.sin(i * 0.4) * 5
        });
        
        newData.throughput.push({
          timestamp,
          value: 100 + Math.random() * 200 + Math.sin(i * 0.6) * 50
        });
        
        newData.errorRate.push({
          timestamp,
          value: Math.random() * 8 + Math.sin(i * 0.2) * 2
        });
      }

      setPerformanceData(newData);
    };

    generateData();
    const interval = setInterval(generateData, 5000);

    return () => clearInterval(interval);
  }, [timeRange]);

  useEffect(() => {
    // Check for alert conditions
    const checkAlerts = () => {
      const activeAlerts: string[] = [];
      const latestData = performanceData[selectedMetric]?.slice(-1)[0];
      
      if (!latestData) return;

      alerts.forEach(alert => {
        if (!alert.isActive) return;
        
        const metricData = performanceData[alert.metric as keyof PerformanceData]?.slice(-1)[0];
        if (!metricData) return;

        const isTriggered = alert.condition === 'above' 
          ? metricData.value > alert.threshold
          : metricData.value < alert.threshold;

        if (isTriggered) {
          activeAlerts.push(`${alert.metric} is ${alert.condition} ${alert.threshold}`);
        }
      });

      setCurrentAlerts(activeAlerts);
    };

    checkAlerts();
  }, [performanceData, alerts, selectedMetric]);

  const getIntervalForTimeRange = (range: string) => {
    switch (range) {
      case '1h': return 3 * 60 * 1000; // 3 minutes
      case '6h': return 18 * 60 * 1000; // 18 minutes
      case '24h': return 72 * 60 * 1000; // 72 minutes
      case '7d': return 504 * 60 * 1000; // 8.4 hours
      default: return 3 * 60 * 1000;
    }
  };

  const formatValue = (metric: keyof PerformanceData, value: number) => {
    switch (metric) {
      case 'responseTime': return `${Math.round(value)}ms`;
      case 'cpuUsage': return `${Math.round(value)}%`;
      case 'memoryUsage': return `${Math.round(value)}%`;
      case 'throughput': return `${Math.round(value)} req/min`;
      case 'errorRate': return `${value.toFixed(1)}%`;
      default: return value.toString();
    }
  };

  const getMetricColor = (metric: keyof PerformanceData) => {
    switch (metric) {
      case 'responseTime': return 'text-blue-400 border-blue-400';
      case 'cpuUsage': return 'text-red-400 border-red-400';
      case 'memoryUsage': return 'text-yellow-400 border-yellow-400';
      case 'throughput': return 'text-green-400 border-green-400';
      case 'errorRate': return 'text-purple-400 border-purple-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getLatestValue = (metric: keyof PerformanceData) => {
    const data = performanceData[metric];
    return data.length > 0 ? data[data.length - 1].value : 0;
  };

  const getMetricTrend = (metric: keyof PerformanceData) => {
    const data = performanceData[metric];
    if (data.length < 2) return 'stable';
    
    const current = data[data.length - 1].value;
    const previous = data[data.length - 2].value;
    const change = ((current - previous) / previous) * 100;
    
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const renderChart = (data: MetricData[], color: string) => {
    if (data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    return (
      <div className="h-32 flex items-end gap-1 px-4">
        {data.map((point, index) => {
          const height = ((point.value - minValue) / range) * 100;
          return (
            <div
              key={index}
              className={`flex-1 bg-gradient-to-t ${color} rounded-sm min-h-[2px] opacity-80 hover:opacity-100 transition-opacity`}
              style={{ height: `${height}%` }}
              title={`${formatValue(selectedMetric, point.value)} at ${new Date(point.timestamp).toLocaleTimeString()}`}
            />
          );
        })}
      </div>
    );
  };

  const metrics = [
    { key: 'responseTime' as const, label: 'Response Time', icon: '⚡' },
    { key: 'cpuUsage' as const, label: 'CPU Usage', icon: '🔥' },
    { key: 'memoryUsage' as const, label: 'Memory Usage', icon: '💾' },
    { key: 'throughput' as const, label: 'Throughput', icon: '🚀' },
    { key: 'errorRate' as const, label: 'Error Rate', icon: '⚠️' }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
            <p className="text-sm text-gray-400">System health monitoring</p>
          </div>
        </div>

        <div className="flex gap-2">
          {['1h', '6h', '24h', '7d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {currentAlerts.length > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-400">🚨</span>
            <span className="text-sm font-medium text-red-300">Active Alerts</span>
          </div>
          <div className="space-y-1">
            {currentAlerts.map((alert, index) => (
              <div key={index} className="text-sm text-red-200">
                • {alert}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {metrics.map((metric) => {
          const isSelected = selectedMetric === metric.key;
          const currentValue = getLatestValue(metric.key);
          const trend = getMetricTrend(metric.key);
          
          return (
            <div
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-white/10 border-white/30'
                  : 'bg-black/20 border-white/10 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{metric.icon}</span>
                <span className="text-sm font-medium text-gray-300">{metric.label}</span>
              </div>
              <div className={`text-lg font-bold ${getMetricColor(metric.key).split(' ')[0]}`}>
                {formatValue(metric.key, currentValue)}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>{getTrendIcon(trend)}</span>
                <span>{trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-black/20 rounded-lg border border-white/5 mb-6">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white">
              {metrics.find(m => m.key === selectedMetric)?.icon} {metrics.find(m => m.key === selectedMetric)?.label}
            </h4>
            <div className="text-sm text-gray-400">
              Current: {formatValue(selectedMetric, getLatestValue(selectedMetric))}
            </div>
          </div>
        </div>
        
        <div className="p-2">
          {renderChart(
            performanceData[selectedMetric],
            selectedMetric === 'responseTime' ? 'from-blue-500 to-blue-600' :
            selectedMetric === 'cpuUsage' ? 'from-red-500 to-red-600' :
            selectedMetric === 'memoryUsage' ? 'from-yellow-500 to-yellow-600' :
            selectedMetric === 'throughput' ? 'from-green-500 to-green-600' :
            'from-purple-500 to-purple-600'
          )}
        </div>
      </div>

      {/* Alert Configuration */}
      <div className="bg-black/20 rounded-lg border border-white/5 p-4">
        <h4 className="text-sm font-medium text-white mb-3">Alert Rules</h4>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={alert.isActive}
                  onChange={(e) => setAlerts(prev => prev.map(a => 
                    a.id === alert.id ? { ...a, isActive: e.target.checked } : a
                  ))}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm text-white">
                    {alert.metric} {alert.condition} {alert.threshold}
                  </div>
                  <div className={`text-xs ${
                    alert.severity === 'critical' ? 'text-red-400' :
                    alert.severity === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    {alert.severity}
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-white transition-colors">
                ⚙️
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}