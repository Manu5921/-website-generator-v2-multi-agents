// =============================================================================
// 📊 DASHBOARD GOOGLE ADS MANAGEMENT - INTÉGRATION DASHBOARD V3
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  CurrencyEuroIcon, 
  EyeIcon, 
  CursorArrowRaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  Cog6ToothIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

interface GoogleAdsMetrics {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

interface TestCampaign {
  campaignId: string;
  status: 'created' | 'active' | 'paused';
  budget: number;
  metrics?: GoogleAdsMetrics & {
    period: string;
  };
  performance?: {
    budgetUsed: number;
    budgetRemaining: number;
    dailyAverage: number;
    projection: {
      monthly: number;
      conversionRate: number;
    };
  };
}

interface GoogleAdsSetup {
  isValid: boolean;
  missingVars: string[];
  errors: string[];
  hasRefreshToken: boolean;
  hasCustomerId: boolean;
}

export default function GoogleAdsManagement() {
  const [setup, setSetup] = useState<GoogleAdsSetup | null>(null);
  const [testCampaign, setTestCampaign] = useState<TestCampaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  useEffect(() => {
    checkGoogleAdsSetup();
    fetchTestCampaignStatus();
  }, []);

  const checkGoogleAdsSetup = async () => {
    try {
      const response = await fetch('/api/auth/google-ads/authorize', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setSetup(data.setup);
      }
    } catch (error) {
      console.error('Erreur vérification setup:', error);
    }
  };

  const fetchTestCampaignStatus = async () => {
    try {
      const response = await fetch('/api/ads/campaigns/create-test');
      const data = await response.json();
      
      if (data.success && data.testCampaign) {
        setTestCampaign(data.testCampaign);
      }
    } catch (error) {
      console.error('Erreur récupération campagne:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateGoogleAdsAuth = async () => {
    try {
      const response = await fetch('/api/auth/google-ads/authorize');
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        setAuthUrl(data.authUrl);
        // Ouvrir dans une nouvelle fenêtre
        window.open(data.authUrl, 'google-ads-auth', 'width=600,height=700');
      }
    } catch (error) {
      console.error('Erreur autorisation:', error);
    }
  };

  const createTestCampaign = async () => {
    setIsCreatingCampaign(true);
    try {
      const response = await fetch('/api/ads/campaigns/create-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId: 'demo-site-001', // À adapter selon le contexte
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchTestCampaignStatus();
      }
    } catch (error) {
      console.error('Erreur création campagne:', error);
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <ChartBarIcon className="h-6 w-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Google Ads Management</h3>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="h-6 w-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Google Ads Management</h3>
        </div>
        <div className="flex items-center space-x-2">
          {setup?.isValid && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Configuré
            </span>
          )}
        </div>
      </div>

      {/* Statut de configuration */}
      {!setup?.isValid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6"
        >
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="text-yellow-200 font-medium mb-2">Configuration Google Ads requise</h4>
              {setup?.missingVars && setup.missingVars.length > 0 && (
                <p className="text-yellow-300/80 text-sm mb-3">
                  Variables manquantes: {setup.missingVars.join(', ')}
                </p>
              )}
              <button
                onClick={initiateGoogleAdsAuth}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Configurer Google Ads
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Campagne test */}
      {setup?.isValid && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statut campagne */}
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-white font-medium mb-3">Campagne Test (50€)</h4>
            
            {!testCampaign ? (
              <div className="text-center py-6">
                <p className="text-gray-300 mb-4">Aucune campagne test active</p>
                <button
                  onClick={createTestCampaign}
                  disabled={isCreatingCampaign}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  {isCreatingCampaign ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Créer campagne test
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Statut</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    testCampaign.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : testCampaign.status === 'paused'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {testCampaign.status === 'active' && <PlayIcon className="h-3 w-3 mr-1" />}
                    {testCampaign.status === 'paused' && <PauseIcon className="h-3 w-3 mr-1" />}
                    {testCampaign.status}
                  </span>
                </div>
                
                {testCampaign.performance && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Budget utilisé</span>
                      <span className="text-white font-medium">
                        {testCampaign.performance.budgetUsed.toFixed(2)}€ / {testCampaign.budget}€
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(testCampaign.performance.budgetUsed / testCampaign.budget) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Moyenne/jour: {testCampaign.performance.dailyAverage.toFixed(2)}€</span>
                      <span className="text-gray-400">Projection: {testCampaign.performance.projection.monthly.toFixed(0)}€/mois</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Métriques temps réel */}
          {testCampaign?.metrics && (
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3">Métriques ({testCampaign.metrics.period})</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <EyeIcon className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-gray-400">Impressions</span>
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {testCampaign.metrics.impressions.toLocaleString()}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <CursorArrowRaysIcon className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-gray-400">Clics</span>
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {testCampaign.metrics.clicks.toLocaleString()}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <CurrencyEuroIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-xs text-gray-400">CTR</span>
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {testCampaign.metrics.ctr.toFixed(2)}%
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <CheckCircleIcon className="h-4 w-4 text-purple-400" />
                    <span className="text-xs text-gray-400">Conversions</span>
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {testCampaign.metrics.conversions.toFixed(1)}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-3 mt-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">CPC moyen</span>
                  <span className="text-white">{testCampaign.metrics.cpc.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">CPA</span>
                  <span className="text-white">{testCampaign.metrics.cpa.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">ROAS</span>
                  <span className={`font-medium ${testCampaign.metrics.roas >= 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {testCampaign.metrics.roas.toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mots-clés ciblés */}
      {testCampaign && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-white/5 rounded-xl p-4"
        >
          <h4 className="text-white font-medium mb-3">Mots-clés ciblés</h4>
          <div className="flex flex-wrap gap-2">
            {[
              'génération site web IA',
              'création site automatique', 
              'site web automatique IA',
              'générateur site web',
              'création site internet IA',
              'site web PME automatique',
            ].map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions rapides */}
      {setup?.isValid && testCampaign && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex space-x-3"
        >
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
            📊 Rapport détaillé
          </button>
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
            ⚙️ Optimiser campagne
          </button>
          <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
            🎯 Nouvelles audiences
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}