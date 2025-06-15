// =============================================================================
// 💰 REVENUE STREAMS DASHBOARD - GESTION MONÉTISATION ADS
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CurrencyEuroIcon,
  ChartBarIcon,
  TrendingUpIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurring: number;
  setupFees: number;
  commissions: number;
  clientCount: number;
  averageClientValue: number;
  projectedAnnual: number;
  growthRate: number;
}

interface RevenueBreakdown {
  setupFees: {
    count: number;
    revenue: number;
    averageValue: number;
  };
  monthlyManagement: {
    activeClients: number;
    platformsManaged: number;
    revenue: number;
    churnRate: number;
  };
  commissions: {
    totalAdSpend: number;
    commissionRate: number;
    revenue: number;
    topClients: Array<{
      name: string;
      spend: number;
      commission: number;
    }>;
  };
}

interface ProjectedGrowth {
  month1: number;
  month3: number;
  month6: number;
  month12: number;
  targetAnnual: number;
}

export default function AdsRevenueStreams() {
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    monthlyRecurring: 0,
    setupFees: 0,
    commissions: 0,
    clientCount: 0,
    averageClientValue: 0,
    projectedAnnual: 0,
    growthRate: 0,
  });

  const [breakdown, setBreakdown] = useState<RevenueBreakdown>({
    setupFees: { count: 0, revenue: 0, averageValue: 299 },
    monthlyManagement: { activeClients: 0, platformsManaged: 0, revenue: 0, churnRate: 0 },
    commissions: { totalAdSpend: 0, commissionRate: 20, revenue: 0, topClients: [] },
  });

  const [projectedGrowth] = useState<ProjectedGrowth>({
    month1: 2500,
    month3: 8500,
    month6: 18000,
    month12: 45000,
    targetAnnual: 120000,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      // Simuler la récupération des données
      setTimeout(() => {
        setMetrics({
          totalRevenue: 3250,
          monthlyRecurring: 1590,
          setupFees: 1200,
          commissions: 460,
          clientCount: 12,
          averageClientValue: 270,
          projectedAnnual: 42000,
          growthRate: 25.5,
        });

        setBreakdown({
          setupFees: { count: 4, revenue: 1196, averageValue: 299 },
          monthlyManagement: { 
            activeClients: 8, 
            platformsManaged: 18, 
            revenue: 1592, 
            churnRate: 8.5 
          },
          commissions: { 
            totalAdSpend: 2300, 
            commissionRate: 20, 
            revenue: 460,
            topClients: [
              { name: 'Restaurant Le Gourmet', spend: 850, commission: 170 },
              { name: 'Salon Beauté Plus', spend: 620, commission: 124 },
              { name: 'Garage Auto Pro', spend: 530, commission: 106 },
            ]
          },
        });

        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur récupération données revenue:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BanknotesIcon className="h-6 w-6 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Revenue Streams</h3>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Vue d'ensemble */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BanknotesIcon className="h-6 w-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Revenue Streams</h3>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUpIcon className="h-4 w-4 text-green-400" />
            <span className="text-green-400 font-medium">+{metrics.growthRate}%</span>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-green-600/20 to-green-400/20 rounded-xl p-4 border border-green-400/30"
          >
            <div className="flex items-center justify-between mb-2">
              <CurrencyEuroIcon className="h-5 w-5 text-green-400" />
              <span className="text-xs text-green-300">Total</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.totalRevenue.toLocaleString()}€</div>
            <div className="text-xs text-green-300">Ce mois</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-600/20 to-blue-400/20 rounded-xl p-4 border border-blue-400/30"
          >
            <div className="flex items-center justify-between mb-2">
              <CalendarDaysIcon className="h-5 w-5 text-blue-400" />
              <span className="text-xs text-blue-300">Récurrent</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.monthlyRecurring.toLocaleString()}€</div>
            <div className="text-xs text-blue-300">Mensuel</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-600/20 to-purple-400/20 rounded-xl p-4 border border-purple-400/30"
          >
            <div className="flex items-center justify-between mb-2">
              <UserGroupIcon className="h-5 w-5 text-purple-400" />
              <span className="text-xs text-purple-300">Clients</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.clientCount}</div>
            <div className="text-xs text-purple-300">Actifs</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 rounded-xl p-4 border border-yellow-400/30"
          >
            <div className="flex items-center justify-between mb-2">
              <ChartBarIcon className="h-5 w-5 text-yellow-400" />
              <span className="text-xs text-yellow-300">Projection</span>
            </div>
            <div className="text-2xl font-bold text-white">{Math.round(metrics.projectedAnnual / 1000)}k€</div>
            <div className="text-xs text-yellow-300">Annuel</div>
          </motion.div>
        </div>

        {/* Progression vers l'objectif */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">Objectif Annuel: 120k€</h4>
            <span className="text-sm text-gray-300">
              {Math.round((metrics.projectedAnnual / 120000) * 100)}% atteint
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(metrics.projectedAnnual / 120000) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
            ></motion.div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>0€</span>
            <span>120k€</span>
          </div>
        </div>
      </div>

      {/* Détail des revenue streams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Setup Fees */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <CogIcon className="h-5 w-5 text-blue-400" />
            <h4 className="text-white font-medium">Setup Fees</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Prix unitaire</span>
              <span className="text-white font-medium">299€</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Ce mois</span>
              <span className="text-white font-medium">{breakdown.setupFees.count} clients</span>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Revenue</span>
                <span className="text-green-400 font-bold">{breakdown.setupFees.revenue.toLocaleString()}€</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
            <div className="text-xs text-blue-300 mb-1">Objectif mensuel</div>
            <div className="text-sm text-white">8 clients = 2 392€</div>
          </div>
        </motion.div>

        {/* Management Fees */}
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <CalendarDaysIcon className="h-5 w-5 text-green-400" />
            <h4 className="text-white font-medium">Gestion Mensuelle</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Prix par plateforme</span>
              <span className="text-white font-medium">199€/mois</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Plateformes actives</span>
              <span className="text-white font-medium">{breakdown.monthlyManagement.platformsManaged}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Taux de churn</span>
              <span className="text-yellow-400 font-medium">{breakdown.monthlyManagement.churnRate}%</span>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Revenue récurrent</span>
                <span className="text-green-400 font-bold">{breakdown.monthlyManagement.revenue.toLocaleString()}€</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
            <div className="text-xs text-green-300 mb-1">Projection annuelle</div>
            <div className="text-sm text-white">{(breakdown.monthlyManagement.revenue * 12).toLocaleString()}€</div>
          </div>
        </motion.div>

        {/* Commissions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <ChartBarIcon className="h-5 w-5 text-purple-400" />
            <h4 className="text-white font-medium">Commissions</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Taux commission</span>
              <span className="text-white font-medium">{breakdown.commissions.commissionRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Budget publicitaire</span>
              <span className="text-white font-medium">{breakdown.commissions.totalAdSpend.toLocaleString()}€</span>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Revenue</span>
                <span className="text-purple-400 font-bold">{breakdown.commissions.revenue.toLocaleString()}€</span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="text-xs text-gray-400 mb-2">Top clients</div>
            {breakdown.commissions.topClients.slice(0, 2).map((client, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-300 truncate">{client.name}</span>
                <span className="text-white">{client.commission}€</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Projections de croissance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUpIcon className="h-6 w-6 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Projections de Croissance</h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { period: 'Mois 1', value: projectedGrowth.month1, color: 'blue' },
            { period: 'Mois 3', value: projectedGrowth.month3, color: 'green' },
            { period: 'Mois 6', value: projectedGrowth.month6, color: 'yellow' },
            { period: 'Mois 12', value: projectedGrowth.month12, color: 'purple' },
            { period: 'Objectif', value: projectedGrowth.targetAnnual, color: 'red' },
          ].map((projection, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.1 }}
              className={`bg-${projection.color}-500/10 border border-${projection.color}-400/30 rounded-xl p-4 text-center`}
            >
              <div className={`text-${projection.color}-400 text-xs font-medium mb-1`}>
                {projection.period}
              </div>
              <div className="text-white text-lg font-bold">
                {projection.value >= 1000 ? 
                  `${Math.round(projection.value / 1000)}k€` : 
                  `${projection.value.toLocaleString()}€`
                }
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions recommandées */}
        <div className="mt-6 bg-white/5 rounded-xl p-4">
          <h4 className="text-white font-medium mb-3">Actions recommandées pour atteindre 120k€</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-400" />
                <span className="text-sm text-gray-300">Automatiser l'acquisition clients</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-400" />
                <span className="text-sm text-gray-300">Optimiser le taux de conversion</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-400" />
                <span className="text-sm text-gray-300">Développer les services premium</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Réduire le churn à <5%</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Augmenter budgets publicitaires</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Cibler 50+ nouveaux clients/mois</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}