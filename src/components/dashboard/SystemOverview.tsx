'use client';

import { useState, useEffect } from 'react';

interface SystemMetrics {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  totalErrors: number;
  averageResponseTime: number;
  systemUptime: number;
  orchestratorStatus: 'active' | 'degraded' | 'offline';
  messageQueueSize: number;
  lastSync: number;
}

interface SystemOverviewProps {
  onRefresh?: () => void;
}

export default function SystemOverview({ onRefresh }: SystemOverviewProps) {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalAgents: 4,
    activeAgents: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalErrors: 0,
    averageResponseTime: 0,
    systemUptime: 0,
    orchestratorStatus: 'offline',
    messageQueueSize: 0,
    lastSync: 0
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchSystemMetrics = async () => {
      try {
        setIsRefreshing(true);
        
        // Try to fetch orchestrator system metrics
        const response = await fetch('http://localhost:3334/api/system/metrics', {
          method: 'GET',
          timeout: 3000,
        });

        if (response.ok) {
          const data = await response.json();
          setMetrics(prev => ({
            ...prev,
            ...data,
            orchestratorStatus: 'active',
            lastSync: Date.now()
          }));
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.warn('System metrics fetch failed:', error);
        setMetrics(prev => ({
          ...prev,
          orchestratorStatus: 'offline',
          lastSync: Date.now()
        }));
      } finally {
        setIsRefreshing(false);
      }
    };

    // Initial fetch
    fetchSystemMetrics();

    // Set up periodic updates
    const interval = setInterval(fetchSystemMetrics, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    // Trigger a manual metrics refresh
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getOrchestratorStatusColor = () => {
    switch (metrics.orchestratorStatus) {
      case 'active': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const getOrchestratorStatusText = () => {
    switch (metrics.orchestratorStatus) {
      case 'active': return 'Operational';
      case 'degraded': return 'Degraded';
      default: return 'Offline';
    }
  };

  const systemHealth = metrics.totalAgents > 0 ? (metrics.activeAgents / metrics.totalAgents) * 100 : 0;
  const taskProgress = metrics.totalTasks > 0 ? (metrics.completedTasks / metrics.totalTasks) * 100 : 0;

  const formatUptime = (uptime: number) => {
    const minutes = Math.floor(uptime / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const formatLastSync = (timestamp: number) => {
    if (timestamp === 0) return 'Never';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🎼</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">System Overview</h2>
            <p className="text-sm text-gray-400">Multi-Agent Platform Status</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          title="Refresh system metrics"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.001 8.001 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/20 rounded-lg p-4 border border-white/5">
          <div className="text-2xl font-bold text-green-400">{metrics.activeAgents}/{metrics.totalAgents}</div>
          <div className="text-sm text-gray-400">Active Agents</div>
          <div className="w-full h-1 bg-gray-700 rounded-full mt-2">
            <div 
              className="h-full bg-green-400 rounded-full transition-all duration-500"
              style={{ width: `${systemHealth}%` }}
            />
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-4 border border-white/5">
          <div className="text-2xl font-bold text-blue-400">{metrics.completedTasks}/{metrics.totalTasks}</div>
          <div className="text-sm text-gray-400">Tasks Progress</div>
          <div className="w-full h-1 bg-gray-700 rounded-full mt-2">
            <div 
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-4 border border-white/5">
          <div className="text-2xl font-bold text-yellow-400">{metrics.averageResponseTime}ms</div>
          <div className="text-sm text-gray-400">Avg Response</div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.averageResponseTime < 50 ? 'Excellent' : 
             metrics.averageResponseTime < 100 ? 'Good' : 
             metrics.averageResponseTime < 200 ? 'Fair' : 'Slow'}
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-4 border border-white/5">
          <div className="text-2xl font-bold text-red-400">{metrics.totalErrors}</div>
          <div className="text-sm text-gray-400">Total Errors</div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.totalErrors === 0 ? 'No issues' : 'Needs attention'}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-black/20 rounded-lg p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-300">Orchestrator Status</span>
          </div>
          <div className={`text-lg font-bold ${getOrchestratorStatusColor()}`}>
            {getOrchestratorStatusText()}
          </div>
          <div className="text-sm text-gray-400">
            Uptime: {formatUptime(metrics.systemUptime)}
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-300">Message Queue</span>
          </div>
          <div className="text-lg font-bold text-pink-400">
            {metrics.messageQueueSize} messages
          </div>
          <div className="text-sm text-gray-400">
            Last sync: {formatLastSync(metrics.lastSync)}
          </div>
        </div>
      </div>

      {/* System Health Indicator */}
      <div className="bg-black/20 rounded-lg p-4 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">Overall System Health</span>
          <span className="text-sm font-bold text-white">{Math.round(systemHealth)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${
              systemHealth >= 80 ? 'bg-gradient-to-r from-green-500 to-green-400' :
              systemHealth >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
              'bg-gradient-to-r from-red-500 to-red-400'
            }`}
            style={{ width: `${systemHealth}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>Critical</span>
          <span>Degraded</span>
          <span>Optimal</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex gap-3">
        <button className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium">
          Start All Agents
        </button>
        <button className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium">
          Emergency Stop
        </button>
        <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium">
          View Logs
        </button>
      </div>
    </div>
  );
}