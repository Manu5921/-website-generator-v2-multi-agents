'use client';

// ROI Dashboard Component
// Ads Management Agent - Simple Business Performance Dashboard

import React, { useState, useEffect } from 'react';
import { MarketingStrategy, AdRecommendation } from '@/lib/ads-recommendations';
import { coreLogger } from '@/lib/monitoring';

interface ROIMetrics {
  totalSpend: number;
  totalRevenue: number;
  roas: number;
  conversions: number;
  cpa: number;
  clicks: number;
  impressions: number;
  ctr: number;
  platformBreakdown: PlatformMetrics[];
  conversionTrend: TrendData[];
  topPerformingAds: AdPerformance[];
}

interface PlatformMetrics {
  platform: string;
  spend: number;
  revenue: number;
  roas: number;
  conversions: number;
  clicks: number;
  ctr: number;
}

interface TrendData {
  date: string;
  conversions: number;
  spend: number;
  revenue: number;
}

interface AdPerformance {
  campaignName: string;
  platform: string;
  spend: number;
  conversions: number;
  roas: number;
  status: 'active' | 'paused' | 'ended';
}

interface ROIDashboardProps {
  strategy?: MarketingStrategy;
  businessName: string;
}

export default function ROIDashboard({ strategy, businessName }: ROIDashboardProps) {
  const [metrics, setMetrics] = useState<ROIMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  useEffect(() => {
    loadROIMetrics();
  }, [selectedPeriod, selectedPlatform]);

  const loadROIMetrics = async () => {
    try {
      setLoading(true);
      // In production, this would fetch real data from analytics APIs
      const mockMetrics = generateMockROIData(strategy);
      setMetrics(mockMetrics);
      coreLogger.info('ROI metrics loaded', { period: selectedPeriod, platform: selectedPlatform });
    } catch (error) {
      coreLogger.error('Failed to load ROI metrics', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockROIData = (strategy?: MarketingStrategy): ROIMetrics => {
    const platforms = strategy?.recommendations || [];
    const totalBudget = strategy?.budgetOptimization.totalBudget || 5000;

    const platformBreakdown: PlatformMetrics[] = platforms.map(rec => {
      const spend = rec.budgetAllocation.amount;
      const conversions = rec.expectedResults.conversions;
      const revenue = conversions * 150; // Estimated value per conversion
      const clicks = rec.expectedResults.clicks;
      const impressions = rec.expectedResults.impressions;

      return {
        platform: rec.platform.replace('_', ' ').toUpperCase(),
        spend,
        revenue,
        roas: revenue / spend,
        conversions,
        clicks,
        ctr: (clicks / impressions) * 100,
      };
    });

    const totalSpend = platformBreakdown.reduce((sum, p) => sum + p.spend, 0);
    const totalRevenue = platformBreakdown.reduce((sum, p) => sum + p.revenue, 0);
    const totalConversions = platformBreakdown.reduce((sum, p) => sum + p.conversions, 0);
    const totalClicks = platformBreakdown.reduce((sum, p) => sum + p.clicks, 0);
    const totalImpressions = platformBreakdown.reduce((sum, p) => sum + (p.clicks / p.ctr * 100), 0);

    // Generate trend data for the last 30 days
    const conversionTrend: TrendData[] = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      
      return {
        date: date.toISOString().split('T')[0],
        conversions: Math.floor(Math.random() * 10) + 1,
        spend: Math.floor(Math.random() * 200) + 50,
        revenue: Math.floor(Math.random() * 500) + 100,
      };
    });

    const topPerformingAds: AdPerformance[] = platforms.slice(0, 5).map((rec, i) => ({
      campaignName: `${rec.platform.replace('_', ' ')} - ${rec.campaignType}`,
      platform: rec.platform.replace('_', ' ').toUpperCase(),
      spend: rec.budgetAllocation.amount,
      conversions: rec.expectedResults.conversions,
      roas: rec.expectedResults.roas,
      status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'paused' : 'ended',
    }));

    return {
      totalSpend,
      totalRevenue,
      roas: totalRevenue / totalSpend,
      conversions: totalConversions,
      cpa: totalSpend / totalConversions,
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: (totalClicks / totalImpressions) * 100,
      platformBreakdown,
      conversionTrend,
      topPerformingAds,
    };
  };

  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getROASColor = (roas: number) => {
    if (roas >= 4) return 'text-green-600';
    if (roas >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Aucune donnée disponible</h3>
        <p className="text-gray-500">Les métriques ROI apparaîtront une fois les campagnes lancées.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard ROI</h2>
            <p className="text-gray-600">{businessName} - Performance Marketing</p>
          </div>
          <div className="flex space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
            </select>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Toutes les plateformes</option>
              {metrics.platformBreakdown.map((platform) => (
                <option key={platform.platform} value={platform.platform}>
                  {platform.platform}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-bold">€</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">ROAS</h3>
              <p className={`text-2xl font-bold ${getROASColor(metrics.roas)}`}>
                {metrics.roas.toFixed(2)}×
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-bold">↗</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Revenus</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(metrics.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-bold">🎯</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Conversions</h3>
              <p className="text-2xl font-bold text-gray-900">{metrics.conversions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-bold">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">CPA</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(metrics.cpa)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Performance */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Performance par Plateforme</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plateforme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dépense
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Revenus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ROAS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  CTR
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.platformBreakdown.map((platform) => (
                <tr key={platform.platform} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {platform.platform}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(platform.spend)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(platform.revenue)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getROASColor(platform.roas)}`}>
                    {platform.roas.toFixed(2)}×
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {platform.conversions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPercentage(platform.ctr)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performing Ads */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Meilleures Campagnes</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {metrics.topPerformingAds.map((ad, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-sm font-medium text-gray-900">{ad.campaignName}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                      {ad.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{ad.platform}</p>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{formatCurrency(ad.spend)}</p>
                    <p className="text-gray-500">Dépense</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{ad.conversions}</p>
                    <p className="text-gray-500">Conversions</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-medium ${getROASColor(ad.roas)}`}>
                      {ad.roas.toFixed(2)}×
                    </p>
                    <p className="text-gray-500">ROAS</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Chart Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Évolution des Conversions</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-2">Graphique des tendances</p>
            <p className="text-sm text-gray-400">
              {metrics.conversionTrend.length} points de données disponibles
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Intégration Chart.js ou Recharts recommandée pour la visualisation
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Optimiser les Budgets</h4>
            <p className="text-sm text-gray-500 mt-1">
              Réajuster la répartition selon les performances
            </p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Analyser les Audiences</h4>
            <p className="text-sm text-gray-500 mt-1">
              Identifier les segments les plus performants
            </p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Rapport Détaillé</h4>
            <p className="text-sm text-gray-500 mt-1">
              Générer un rapport complet PDF
            </p>
          </button>
        </div>
      </div>

      {/* Recommendations Panel */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Recommandations</h3>
        <div className="space-y-3">
          {generateRecommendations(metrics).map((rec, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs">!</span>
              </div>
              <p className="text-sm text-blue-800">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function generateRecommendations(metrics: ROIMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.roas < 2) {
    recommendations.push('ROAS faible détecté. Considérez l\'optimisation des audiences et des créatifs.');
  }

  if (metrics.ctr < 1) {
    recommendations.push('CTR bas sur plusieurs plateformes. Testez de nouveaux formats d\'annonces.');
  }

  const topPlatform = metrics.platformBreakdown.sort((a, b) => b.roas - a.roas)[0];
  if (topPlatform && topPlatform.roas > 3) {
    recommendations.push(`${topPlatform.platform} performe très bien (ROAS: ${topPlatform.roas.toFixed(2)}). Considérez augmenter le budget.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Performances solides ! Continuez le monitoring et les tests A/B réguliers.');
  }

  return recommendations;
}