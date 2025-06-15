'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon, BoltIcon, ClockIcon, SignalIcon } from '@heroicons/react/24/outline';
import { WebVitalMetric, initWebVitalsTracking, getWebVitalsCollector } from '@/lib/performance/web-vitals';

interface WebVitalsReporterProps {
  className?: string;
  showDetailedMetrics?: boolean;
}

interface VitalsState {
  metrics: WebVitalMetric[];
  summary: {
    total: number;
    good: number;
    needsImprovement: number;
    poor: number;
    score: number;
  };
  isLoading: boolean;
}

export default function WebVitalsReporter({ 
  className = '', 
  showDetailedMetrics = false 
}: WebVitalsReporterProps) {
  const [vitals, setVitals] = useState<VitalsState>({
    metrics: [],
    summary: { total: 0, good: 0, needsImprovement: 0, poor: 0, score: 0 },
    isLoading: true,
  });

  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  }>({});

  useEffect(() => {
    // Initialiser le collecteur Web Vitals
    const collector = initWebVitalsTracking();
    
    // Récupérer les infos réseau
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkInfo({
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
      });
    }

    // Mise à jour périodique des métriques
    const interval = setInterval(() => {
      if (collector) {
        setVitals({
          metrics: collector.getCurrentMetrics(),
          summary: collector.getMetricsSummary(),
          isLoading: false,
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getMetricIcon = (name: string) => {
    switch (name) {
      case 'FCP':
      case 'LCP':
        return <BoltIcon className="w-4 h-4" />;
      case 'FID':
      case 'INP':
        return <ClockIcon className="w-4 h-4" />;
      case 'CLS':
        return <ChartBarIcon className="w-4 h-4" />;
      case 'TTFB':
        return <SignalIcon className="w-4 h-4" />;
      default:
        return <ChartBarIcon className="w-4 h-4" />;
    }
  };

  const getMetricColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatMetricValue = (name: string, value: number) => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return Math.round(value) + 'ms';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (vitals.isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header avec score global */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Web Vitals</h3>
            <p className="text-sm text-gray-500">Performance en temps réel</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(vitals.summary.score)}`}>
              {vitals.summary.score}
            </div>
            <div className="text-sm text-gray-500">Score</div>
          </div>
        </div>
      </div>

      {/* Résumé des métriques */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">{vitals.summary.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-green-600">{vitals.summary.good}</div>
            <div className="text-xs text-gray-500">Bon</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-yellow-600">{vitals.summary.needsImprovement}</div>
            <div className="text-xs text-gray-500">À améliorer</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-red-600">{vitals.summary.poor}</div>
            <div className="text-xs text-gray-500">Faible</div>
          </div>
        </div>

        {/* Dernières métriques */}
        {vitals.metrics.length > 0 && (
          <div className="space-y-2">
            {vitals.metrics.slice(-5).map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-2 rounded-md border ${getMetricColor(metric.rating)}`}
              >
                <div className="flex items-center space-x-2">
                  {getMetricIcon(metric.name)}
                  <span className="text-sm font-medium">{metric.name}</span>
                </div>
                <div className="text-sm font-mono">
                  {formatMetricValue(metric.name, metric.value)}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Informations réseau */}
        {networkInfo.effectiveType && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Réseau</span>
              <span className="font-medium">
                {networkInfo.effectiveType?.toUpperCase()}
                {networkInfo.downlink && ` • ${networkInfo.downlink} Mbps`}
                {networkInfo.rtt && ` • ${networkInfo.rtt}ms RTT`}
              </span>
            </div>
          </div>
        )}

        {/* Métriques détaillées */}
        {showDetailedMetrics && vitals.metrics.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Historique détaillé</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {vitals.metrics.map((metric) => (
                <div key={metric.id} className="flex items-center justify-between text-xs py-1">
                  <span className="text-gray-600">
                    {metric.name} • {new Date(Date.now()).toLocaleTimeString()}
                  </span>
                  <span className={`font-mono ${
                    metric.rating === 'good' ? 'text-green-600' :
                    metric.rating === 'needs-improvement' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {formatMetricValue(metric.name, metric.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}