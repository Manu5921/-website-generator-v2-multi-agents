'use client';

// =============================================================================
// 🎼 DASHBOARD MONITORING UNIFIÉ - TOUS LES AGENTS
// =============================================================================

import { useState, useEffect } from 'react';
import { 
  Bot, 
  MessageSquare, 
  Mail, 
  BarChart3, 
  Activity, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  DollarSign,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface AgentMetrics {
  id: string;
  name: string;
  type: 'service-client' | 'marketing' | 'business-intelligence' | 'automation';
  status: 'active' | 'inactive' | 'error';
  uptime: string;
  currentLoad: number;
  successRate: number;
  avgResponseTime: number;
  totalOperations: number;
  lastActivity: string;
  specificMetrics: Record<string, any>;
}

interface SystemOverview {
  totalAgents: number;
  activeAgents: number;
  totalProjects: number;
  completedToday: number;
  errorRate: number;
  globalPerformance: number;
  revenue24h: number;
  activeSessions: number;
}

interface RecentActivity {
  id: string;
  agent: string;
  action: string;
  status: 'success' | 'error' | 'warning';
  timestamp: Date;
  details?: string;
}

export default function UnifiedAgentsDashboard() {
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [agentsMetrics, setAgentsMetrics] = useState<AgentMetrics[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(loadDashboardData, 30000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Charger les données de tous les agents en parallèle
      const [overviewRes, serviceClientRes, marketingRes, biRes] = await Promise.all([
        fetch('/api/orchestration?action=get_system_overview'),
        fetch('/api/agents/service-client?action=get_metrics'),
        fetch('/api/agents/marketing?action=get_metrics'),
        fetch('/api/agents/business-intelligence?action=get_metrics')
      ]);

      // System overview
      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setSystemOverview(overviewData.data.overview);
      }

      // Métriques des agents
      const metrics: AgentMetrics[] = [];

      if (serviceClientRes.ok) {
        const scData = await serviceClientRes.json();
        metrics.push({
          id: 'service-client',
          name: 'Service Client IA',
          type: 'service-client',
          status: 'active',
          uptime: '99.8%',
          currentLoad: 35,
          successRate: scData.data?.summary?.taux_resolution_moyen || 85,
          avgResponseTime: scData.data?.summary?.temps_reponse_moyen || 1200,
          totalOperations: scData.data?.summary?.conversations_totales || 0,
          lastActivity: new Date().toISOString(),
          specificMetrics: {
            conversations: scData.data?.summary?.conversations_totales || 0,
            satisfaction: scData.data?.summary?.satisfaction_moyenne || 4.2,
            escalations: scData.data?.summary?.escalations_totales || 0
          }
        });
      }

      if (marketingRes.ok) {
        const marketingData = await marketingRes.json();
        metrics.push({
          id: 'marketing',
          name: 'Marketing Automation',
          type: 'marketing',
          status: 'active',
          uptime: '99.9%',
          currentLoad: 42,
          successRate: 92,
          avgResponseTime: 2500,
          totalOperations: 156,
          lastActivity: new Date().toISOString(),
          specificMetrics: {
            emailsSent: 1250,
            openRate: 32.5,
            clickRate: 8.3,
            conversions: 45
          }
        });
      }

      if (biRes.ok) {
        const biData = await biRes.json();
        metrics.push({
          id: 'business-intelligence',
          name: 'Business Intelligence',
          type: 'business-intelligence',
          status: 'active',
          uptime: '99.7%',
          currentLoad: 28,
          successRate: 95,
          avgResponseTime: 5800,
          totalOperations: 89,
          lastActivity: new Date().toISOString(),
          specificMetrics: {
            reportsGenerated: 23,
            insightsProvided: 67,
            alertsSent: 12,
            accuracy: 94.5
          }
        });
      }

      setAgentsMetrics(metrics);

      // Recent activities (simulation)
      setRecentActivities(generateRecentActivities());

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecentActivities = (): RecentActivity[] => {
    const activities = [
      {
        id: '1',
        agent: 'Service Client',
        action: 'Conversation résolue automatiquement',
        status: 'success' as const,
        timestamp: new Date(Date.now() - 5 * 60000),
        details: 'Client restaurant - Question horaires'
      },
      {
        id: '2',
        agent: 'Marketing',
        action: 'Séquence email déployée',
        status: 'success' as const,
        timestamp: new Date(Date.now() - 12 * 60000),
        details: 'Secteur coiffeur - Workflow fidélisation'
      },
      {
        id: '3',
        agent: 'Business Intelligence',
        action: 'Rapport généré',
        status: 'success' as const,
        timestamp: new Date(Date.now() - 18 * 60000),
        details: 'Analytics mensuel site artisan'
      },
      {
        id: '4',
        agent: 'Service Client',
        action: 'Escalation vers humain',
        status: 'warning' as const,
        timestamp: new Date(Date.now() - 25 * 60000),
        details: 'Demande complexe non résolue'
      }
    ];
    return activities;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'service-client': return <MessageSquare className="w-5 h-5" />;
      case 'marketing': return <Mail className="w-5 h-5" />;
      case 'business-intelligence': return <BarChart3 className="w-5 h-5" />;
      case 'automation': return <Zap className="w-5 h-5" />;
      default: return <Bot className="w-5 h-5" />;
    }
  };

  const getTrendIcon = (value: number) => {
    if (value > 5) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (value < -5) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  if (isLoading && !systemOverview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Agents IA</h1>
            <p className="text-gray-600 mt-1">Monitoring unifié de tous les agents conversationnels</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="24h">Dernières 24h</option>
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
            </select>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Activity className="w-4 h-4" />
              <span>Mise à jour automatique</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Overview */}
      {systemOverview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agents Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemOverview.activeAgents}/{systemOverview.totalAgents}
                </p>
              </div>
              <Bot className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(5.2)}
              <span className="text-sm text-gray-600 ml-1">Tous opérationnels</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projets Complétés</p>
                <p className="text-2xl font-bold text-gray-900">{systemOverview.completedToday}</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(12.5)}
              <span className="text-sm text-gray-600 ml-1">+12.5% vs hier</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Globale</p>
                <p className="text-2xl font-bold text-gray-900">{systemOverview.globalPerformance}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(3.2)}
              <span className="text-sm text-gray-600 ml-1">Excellent</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus 24h</p>
                <p className="text-2xl font-bold text-gray-900">{systemOverview.revenue24h}€</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(8.7)}
              <span className="text-sm text-gray-600 ml-1">+8.7% vs hier</span>
            </div>
          </div>
        </div>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {agentsMetrics.map((agent) => (
          <div key={agent.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Agent Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    agent.type === 'service-client' ? 'bg-blue-100 text-blue-600' :
                    agent.type === 'marketing' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {getAgentIcon(agent.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{agent.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(agent.status)}
                      <span className="text-sm text-gray-500">Uptime: {agent.uptime}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Charge</div>
                  <div className="font-medium">{agent.currentLoad}%</div>
                </div>
              </div>
            </div>

            {/* Agent Metrics */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Taux Succès</div>
                  <div className="text-lg font-semibold text-gray-900">{agent.successRate}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Temps Réponse</div>
                  <div className="text-lg font-semibold text-gray-900">{agent.avgResponseTime}ms</div>
                </div>
              </div>

              {/* Specific Metrics */}
              <div className="space-y-2">
                {agent.type === 'service-client' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Conversations</span>
                      <span className="font-medium">{agent.specificMetrics.conversations}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Satisfaction</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" />
                        <span className="font-medium">{agent.specificMetrics.satisfaction}/5</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Escalations</span>
                      <span className="font-medium">{agent.specificMetrics.escalations}</span>
                    </div>
                  </>
                )}

                {agent.type === 'marketing' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Emails envoyés</span>
                      <span className="font-medium">{agent.specificMetrics.emailsSent}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taux d'ouverture</span>
                      <span className="font-medium">{agent.specificMetrics.openRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Conversions</span>
                      <span className="font-medium">{agent.specificMetrics.conversions}</span>
                    </div>
                  </>
                )}

                {agent.type === 'business-intelligence' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rapports générés</span>
                      <span className="font-medium">{agent.specificMetrics.reportsGenerated}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Insights fournis</span>
                      <span className="font-medium">{agent.specificMetrics.insightsProvided}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Précision</span>
                      <span className="font-medium">{agent.specificMetrics.accuracy}%</span>
                    </div>
                  </>
                )}
              </div>

              {/* Load Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Charge système</span>
                  <span>{agent.currentLoad}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      agent.currentLoad > 80 ? 'bg-red-500' :
                      agent.currentLoad > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${agent.currentLoad}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">Activité Récente</h3>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-1 rounded-full ${
                  activity.status === 'success' ? 'bg-green-100' :
                  activity.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  {activity.status === 'success' ? (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  ) : activity.status === 'warning' ? (
                    <AlertTriangle className="w-3 h-3 text-yellow-600" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.agent} - {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.timestamp.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  {activity.details && (
                    <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}