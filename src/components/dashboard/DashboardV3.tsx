'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  CloudIcon, 
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  GlobeAltIcon,
  RocketLaunchIcon,
  PaintBrushIcon,
  CogIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import WebVitalsReporter from '../performance/WebVitalsReporter';

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error' | 'stopping';
  icon: React.ReactNode;
  color: string;
  tasks: number;
  completedTasks: number;
  avgResponseTime: number;
  lastActivity: Date;
  resources: {
    cpu: number;
    memory: number;
  };
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  network: {
    upload: number;
    download: number;
    latency: number;
  };
  uptime: number;
  activeConnections: number;
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function DashboardV3() {
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      id: 'design-ia',
      name: '🎨 Design IA',
      status: 'active',
      icon: <PaintBrushIcon className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      tasks: 12,
      completedTasks: 8,
      avgResponseTime: 1.2,
      lastActivity: new Date(),
      resources: { cpu: 45, memory: 62 }
    },
    {
      id: 'automation',
      name: '🤖 Automation',
      status: 'active',
      icon: <CogIcon className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      tasks: 8,
      completedTasks: 6,
      avgResponseTime: 0.8,
      lastActivity: new Date(),
      resources: { cpu: 32, memory: 48 }
    },
    {
      id: 'ads-management',
      name: '📊 Ads Management',
      status: 'active',
      icon: <ChartPieIcon className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      tasks: 15,
      completedTasks: 11,
      avgResponseTime: 1.5,
      lastActivity: new Date(),
      resources: { cpu: 38, memory: 55 }
    },
    {
      id: 'core-platform',
      name: '💎 Core Platform',
      status: 'active',
      icon: <RocketLaunchIcon className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      tasks: 6,
      completedTasks: 4,
      avgResponseTime: 2.1,
      lastActivity: new Date(),
      resources: { cpu: 55, memory: 71 }
    }
  ]);

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 42,
    memory: 58,
    network: {
      upload: 2.4,
      download: 8.1,
      latency: 45
    },
    uptime: 86400,
    activeConnections: 24
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Agent Design IA',
      message: 'Template restaurant généré avec succès',
      timestamp: new Date(),
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Système',
      message: 'Usage mémoire élevé (>70%)',
      timestamp: new Date(Date.now() - 300000),
      read: false
    }
  ]);

  const [isOnline, setIsOnline] = useState(true);

  // Simulation de données temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      // Mise à jour des métriques système
      setSystemMetrics(prev => ({
        ...prev,
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 8)),
        network: {
          upload: Math.max(0, prev.network.upload + (Math.random() - 0.5) * 2),
          download: Math.max(0, prev.network.download + (Math.random() - 0.5) * 3),
          latency: Math.max(10, Math.min(200, prev.network.latency + (Math.random() - 0.5) * 20))
        },
        uptime: prev.uptime + 1,
        activeConnections: Math.max(0, prev.activeConnections + Math.floor((Math.random() - 0.5) * 5))
      }));

      // Mise à jour des agents
      setAgents(prev => prev.map(agent => ({
        ...agent,
        resources: {
          cpu: Math.max(0, Math.min(100, agent.resources.cpu + (Math.random() - 0.5) * 15)),
          memory: Math.max(0, Math.min(100, agent.resources.memory + (Math.random() - 0.5) * 12))
        },
        avgResponseTime: Math.max(0.1, agent.avgResponseTime + (Math.random() - 0.5) * 0.5),
        lastActivity: Math.random() > 0.7 ? new Date() : agent.lastActivity
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'idle':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMetricColor = (value: number, type: 'cpu' | 'memory') => {
    if (value < 50) return 'text-green-600';
    if (value < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header avec glassmorphism */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <RocketLaunchIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard V3</h1>
                <p className="text-sm text-gray-500">Monitoring Multi-Agents</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Statut réseau */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-sm text-gray-600">
                  {isOnline ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-colors">
                  <BellIcon className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métriques système */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">CPU Usage</p>
                <p className={`text-2xl font-bold ${getMetricColor(systemMetrics.cpu, 'cpu')}`}>
                  {systemMetrics.cpu.toFixed(1)}%
                </p>
              </div>
              <CpuChipIcon className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${systemMetrics.cpu}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Memory</p>
                <p className={`text-2xl font-bold ${getMetricColor(systemMetrics.memory, 'memory')}`}>
                  {systemMetrics.memory.toFixed(1)}%
                </p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${systemMetrics.memory}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Network</p>
                <p className="text-lg font-bold text-cyan-600">
                  ↓ {systemMetrics.network.download.toFixed(1)} MB/s
                </p>
                <p className="text-sm text-gray-500">
                  ↑ {systemMetrics.network.upload.toFixed(1)} MB/s
                </p>
              </div>
              <CloudIcon className="w-8 h-8 text-cyan-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatUptime(systemMetrics.uptime)}
                </p>
                <p className="text-sm text-gray-500">
                  {systemMetrics.activeConnections} connexions
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-orange-500" />
            </div>
          </motion.div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${agent.color} rounded-lg flex items-center justify-center text-white`}>
                    {agent.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tâches</span>
                  <span className="font-medium">{agent.completedTasks}/{agent.tasks}</span>
                </div>
                
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${agent.color} h-2 rounded-full transition-all duration-1000`}
                    style={{ width: `${(agent.completedTasks / agent.tasks) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">CPU:</span>
                    <span className={`ml-1 font-medium ${getMetricColor(agent.resources.cpu, 'cpu')}`}>
                      {agent.resources.cpu.toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">RAM:</span>
                    <span className={`ml-1 font-medium ${getMetricColor(agent.resources.memory, 'memory')}`}>
                      {agent.resources.memory.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Réponse: {agent.avgResponseTime.toFixed(1)}s
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Web Vitals et Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WebVitalsReporter showDetailedMetrics={true} />
          
          {/* Notifications */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-3 rounded-lg border-l-4 ${
                      notification.type === 'success' ? 'bg-green-50 border-green-500' :
                      notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                      notification.type === 'error' ? 'bg-red-50 border-red-500' :
                      'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {notification.type === 'success' ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : notification.type === 'warning' ? (
                          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <BellIcon className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}