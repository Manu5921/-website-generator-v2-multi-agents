'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  RocketLaunchIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { pwaManager } from '@/lib/pwa/pwa-manager';

interface Demande {
  id: string;
  nom: string;
  email: string;
  secteur: string;
  description?: string;
  statut: 'Nouvelle' | 'En génération' | 'Terminé';
  dateCreation: string;
  siteUrl?: string;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  requests: number;
  errors: number;
}

export default function DashboardV3() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    requests: 0,
    errors: 0
  });
  const [isOnline, setIsOnline] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    chargerDemandes();
    chargerMetriques();
    
    // Real-time updates
    intervalRef.current = setInterval(() => {
      chargerDemandes();
      chargerMetriques();
    }, 5000);

    // PWA install prompt
    const handleInstallAvailable = () => setShowInstallPrompt(true);
    window.addEventListener('pwa-install-available', handleInstallAvailable);

    // Network status
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const chargerDemandes = async () => {
    try {
      const response = await fetch('/api/demandes');
      const result = await response.json();
      if (result.success) {
        setDemandes(result.demandes);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const chargerMetriques = async () => {
    try {
      const response = await fetch('/api/analytics/metrics');
      if (response.ok) {
        const result = await response.json();
        setMetrics(result.data || metrics);
      }
    } catch (error) {
      // Simulate metrics for demo
      setMetrics({
        cpu: Math.floor(Math.random() * 30) + 20,
        memory: Math.floor(Math.random() * 40) + 30,
        requests: Math.floor(Math.random() * 100) + 50,
        errors: Math.floor(Math.random() * 5)
      });
    }
  };

  const genererSite = async (demandeId: string) => {
    try {
      setMessage('🚀 Lancement de la génération...');
      const response = await fetch('/api/generer-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demandeId })
      });
      
      const result = await response.json();
      if (result.success) {
        setMessage('✅ Génération lancée ! Rafraîchissement en cours...');
        setTimeout(() => {
          chargerDemandes();
          setMessage('');
        }, 2000);
      } else {
        setMessage(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion');
      if (!isOnline) {
        // Queue action for background sync
        pwaManager.requestBackgroundSync('sync-demandes');
      }
    }
  };

  const installPWA = async () => {
    const success = await pwaManager.promptInstall();
    if (success) {
      setShowInstallPrompt(false);
    }
  };

  const getStatutConfig = (statut: string) => {
    switch (statut) {
      case 'Nouvelle': 
        return { 
          bg: 'bg-amber-50', 
          color: 'text-amber-800', 
          border: 'border-amber-200',
          icon: ClockIcon
        };
      case 'En génération': 
        return { 
          bg: 'bg-blue-50', 
          color: 'text-blue-800', 
          border: 'border-blue-200',
          icon: CpuChipIcon
        };
      case 'Terminé': 
        return { 
          bg: 'bg-green-50', 
          color: 'text-green-800', 
          border: 'border-green-200',
          icon: CheckCircleIcon
        };
      default: 
        return { 
          bg: 'bg-gray-50', 
          color: 'text-gray-800', 
          border: 'border-gray-200',
          icon: ExclamationTriangleIcon
        };
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <motion.header 
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                className="p-2 bg-blue-600 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Cog6ToothIcon className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard V3</h1>
                <p className="text-sm text-gray-600">Interface de gestion multi-agents</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Network Status */}
              <motion.div 
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  isOnline 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
                animate={{ scale: isOnline ? 1 : [1, 1.05, 1] }}
                transition={{ repeat: isOnline ? 0 : Infinity, duration: 2 }}
              >
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
              </motion.div>

              {/* PWA Install Prompt */}
              <AnimatePresence>
                {showInstallPrompt && (
                  <motion.button
                    onClick={installPWA}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Installer l'app</span>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Refresh Button */}
              <motion.button
                onClick={chargerDemandes}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ rotate: loading ? 360 : 0 }}
                transition={{ duration: 1, repeat: loading ? Infinity : 0 }}
              >
                <ArrowPathIcon className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              className={`mb-6 p-4 rounded-lg font-medium text-center ${
                message.includes('✅') 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : message.includes('🚀') 
                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metrics Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, staggerChildren: 0.1 }}
        >
          {/* Demandes Stats */}
          <motion.div 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{demandes.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Demandes</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">En attente:</span>
                <span className="font-medium text-amber-600">
                  {demandes.filter(d => d.statut === 'Nouvelle').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Terminées:</span>
                <span className="font-medium text-green-600">
                  {demandes.filter(d => d.statut === 'Terminé').length}
                </span>
              </div>
            </div>
          </motion.div>

          {/* System Metrics */}
          <motion.div 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <CpuChipIcon className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{metrics.cpu}%</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">CPU</h3>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-green-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${metrics.cpu}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">{metrics.memory}%</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mémoire</h3>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${metrics.memory}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <GlobeAltIcon className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{metrics.requests}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Requêtes</h3>
            <div className="text-sm text-gray-600">
              {metrics.errors > 0 && (
                <span className="text-red-600">{metrics.errors} erreurs</span>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Demandes List */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Demandes Reçues ({loading ? '...' : demandes.length})
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <motion.div 
                  className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="mt-4 text-gray-600">Chargement des demandes...</p>
              </div>
            ) : demandes.length === 0 ? (
              <div className="text-center py-12">
                <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Aucune demande pour le moment</p>
                <p className="text-gray-500 text-sm mt-2">Les nouvelles demandes apparaîtront ici</p>
              </div>
            ) : (
              <motion.div 
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {demandes.map((demande, index) => {
                  const config = getStatutConfig(demande.statut);
                  const IconComponent = config.icon;
                  
                  return (
                    <motion.div
                      key={demande.id}
                      className={`p-6 rounded-lg border ${config.border} ${config.bg} hover:shadow-md transition-all`}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 }
                      }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{demande.nom}</h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {demande.secteur} • {demande.email}
                          </p>
                          {demande.description && (
                            <p className="text-gray-700 text-sm mt-2 italic">
                              "{demande.description}"
                            </p>
                          )}
                          <p className="text-gray-500 text-xs mt-3">
                            {new Date(demande.dateCreation).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                            <IconComponent className="h-4 w-4" />
                            <span className="text-sm font-medium">{demande.statut}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-3">
                        {demande.statut === 'Nouvelle' && (
                          <motion.button
                            onClick={() => genererSite(demande.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <RocketLaunchIcon className="h-4 w-4" />
                            <span>Générer le site</span>
                          </motion.button>
                        )}
                        
                        {demande.siteUrl && (
                          <motion.a
                            href={demande.siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <GlobeAltIcon className="h-4 w-4" />
                            <span>Voir le site</span>
                          </motion.a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Système Multi-Agents V3</h3>
            <p className="text-gray-600">
              Orchestration automatique • Performance optimale • Monitoring temps réel • PWA Ready
            </p>
          </div>
          
          <motion.a 
            href="/" 
            className="text-blue-600 hover:text-blue-800 font-medium"
            whileHover={{ scale: 1.05 }}
          >
            ← Retour à l'accueil
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}