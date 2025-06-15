'use client';

import { useState, useEffect } from 'react';

interface AgentStatus {
  id: string;
  name: string;
  emoji: string;
  port: number;
  status: 'active' | 'starting' | 'offline' | 'error';
  lastHeartbeat: number;
  responseTime: number;
  uptime: number;
  memory: number;
  cpu: number;
  currentTask: string;
  completedTasks: number;
  totalTasks: number;
  errors: number;
}

interface AgentMonitorProps {
  agentId: string;
  name: string;
  emoji: string;
  port: number;
  compact?: boolean;
}

export default function AgentMonitor({ 
  agentId, 
  name, 
  emoji, 
  port, 
  compact = false 
}: AgentMonitorProps) {
  const [status, setStatus] = useState<AgentStatus>({
    id: agentId,
    name,
    emoji,
    port,
    status: 'offline',
    lastHeartbeat: 0,
    responseTime: 0,
    uptime: 0,
    memory: 0,
    cpu: 0,
    currentTask: 'Initializing...',
    completedTasks: 0,
    totalTasks: 0,
    errors: 0
  });

  const [historicalData, setHistoricalData] = useState<{
    responseTime: number;
    timestamp: number;
  }[]>([]);

  useEffect(() => {
    const checkStatus = async () => {
      const startTime = Date.now();
      
      try {
        // Try to fetch agent health endpoint
        const response = await fetch(`http://localhost:${port}/api/health`, {
          method: 'GET',
          timeout: 5000,
        });

        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          const healthData = await response.json();
          
          setStatus(prev => ({
            ...prev,
            status: 'active',
            lastHeartbeat: Date.now(),
            responseTime,
            uptime: healthData.uptime || 0,
            memory: healthData.memory || 0,
            cpu: healthData.cpu || 0,
            currentTask: healthData.currentTask || 'Running',
            completedTasks: healthData.completedTasks || prev.completedTasks,
            totalTasks: healthData.totalTasks || prev.totalTasks,
            errors: healthData.errors || prev.errors
          }));

          // Update historical data
          setHistoricalData(prev => {
            const newData = [...prev, { responseTime, timestamp: Date.now() }];
            return newData.slice(-20); // Keep last 20 data points
          });
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.warn(`Agent ${name} health check failed:`, error);
        
        // Try basic connection test
        try {
          const basicResponse = await fetch(`http://localhost:${port}`, {
            method: 'HEAD',
            mode: 'no-cors',
            timeout: 2000,
          });
          
          setStatus(prev => ({
            ...prev,
            status: 'starting',
            lastHeartbeat: Date.now(),
            responseTime: Date.now() - startTime,
            currentTask: 'Starting up...'
          }));
        } catch (basicError) {
          setStatus(prev => ({
            ...prev,
            status: 'offline',
            responseTime: 0,
            currentTask: 'Offline'
          }));
        }
      }
    };

    // Initial check
    checkStatus();

    // Set up periodic health checks
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, [name, port]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 shadow-green-500/50';
      case 'starting': return 'bg-yellow-500 shadow-yellow-500/50';
      case 'error': return 'bg-red-500 shadow-red-500/50';
      default: return 'bg-gray-500 shadow-gray-500/50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'starting': return 'Starting';
      case 'error': return 'Error';
      default: return 'Offline';
    }
  };

  const formatUptime = (uptime: number) => {
    const minutes = Math.floor(uptime / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const progress = status.totalTasks > 0 ? (status.completedTasks / status.totalTasks) * 100 : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="text-2xl">{emoji}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{name}</span>
            <div className={`w-2 h-2 rounded-full ${getStatusColor(status.status)} shadow-lg`} />
          </div>
          <div className="text-sm text-gray-400">
            Port {port} • {status.responseTime}ms
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-white">{getStatusText(status.status)}</div>
          <div className="text-xs text-gray-400">{status.currentTask}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/8 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{emoji}</div>
          <div>
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <p className="text-sm text-gray-400">Port {port}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)} shadow-lg animate-pulse`} />
          <span className="text-sm font-medium text-white">{getStatusText(status.status)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-300">Progress</span>
          <span className="text-white font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">{status.responseTime}ms</div>
          <div className="text-xs text-gray-400">Response Time</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{formatUptime(status.uptime)}</div>
          <div className="text-xs text-gray-400">Uptime</div>
        </div>
      </div>

      {/* Current Task */}
      <div className="mb-4">
        <div className="text-sm text-gray-300 mb-1">Current Task</div>
        <div className="text-white font-medium bg-black/20 rounded-lg px-3 py-2 border border-white/5">
          {status.currentTask}
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-lg font-bold text-green-400">{status.completedTasks}</div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
        <div>
          <div className="text-lg font-bold text-blue-400">{status.totalTasks}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        <div>
          <div className="text-lg font-bold text-red-400">{status.errors}</div>
          <div className="text-xs text-gray-400">Errors</div>
        </div>
      </div>

      {/* Performance Chart */}
      {historicalData.length > 1 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-sm text-gray-300 mb-2">Response Time Trend</div>
          <div className="h-16 flex items-end gap-1">
            {historicalData.map((data, index) => {
              const maxResponse = Math.max(...historicalData.map(d => d.responseTime));
              const height = maxResponse > 0 ? (data.responseTime / maxResponse) * 100 : 0;
              
              return (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-purple-500/50 to-purple-400/50 rounded-sm min-h-[2px]"
                  style={{ height: `${height}%` }}
                  title={`${data.responseTime}ms`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}