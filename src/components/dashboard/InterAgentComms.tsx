'use client';

import { useState, useEffect } from 'react';

interface Message {
  id: string;
  from: string;
  to: string;
  type: 'command' | 'response' | 'event' | 'error';
  content: string;
  timestamp: number;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ConnectionStatus {
  agentId: string;
  agentName: string;
  emoji: string;
  isConnected: boolean;
  lastSeen: number;
  messagesReceived: number;
  messagesSent: number;
}

export default function InterAgentComms() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connections, setConnections] = useState<ConnectionStatus[]>([
    {
      agentId: 'design-ia',
      agentName: 'Design IA',
      emoji: '🎨',
      isConnected: false,
      lastSeen: 0,
      messagesReceived: 0,
      messagesSent: 0
    },
    {
      agentId: 'automation',
      agentName: 'Automation',
      emoji: '🤖',
      isConnected: false,
      lastSeen: 0,
      messagesReceived: 0,
      messagesSent: 0
    },
    {
      agentId: 'ads-management',
      agentName: 'Ads Management',
      emoji: '📊',
      isConnected: false,
      lastSeen: 0,
      messagesReceived: 0,
      messagesSent: 0
    },
    {
      agentId: 'core-platform',
      agentName: 'Core Platform',
      emoji: '💎',
      isConnected: false,
      lastSeen: 0,
      messagesReceived: 0,
      messagesSent: 0
    }
  ]);

  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<Message['type']>('command');
  const [messagePriority, setMessagePriority] = useState<Message['priority']>('medium');

  useEffect(() => {
    // Simulate real-time message updates
    const interval = setInterval(() => {
      // Simulate incoming messages
      if (Math.random() > 0.8) {
        const mockMessage: Message = {
          id: Date.now().toString(),
          from: connections[Math.floor(Math.random() * connections.length)]?.agentId || 'unknown',
          to: 'orchestrator',
          type: ['command', 'response', 'event'][Math.floor(Math.random() * 3)] as Message['type'],
          content: generateMockMessage(),
          timestamp: Date.now(),
          status: 'delivered',
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as Message['priority']
        };

        setMessages(prev => [mockMessage, ...prev.slice(0, 49)]); // Keep last 50 messages
      }

      // Update connection statuses
      setConnections(prev => prev.map(conn => ({
        ...conn,
        isConnected: Math.random() > 0.3, // 70% connection rate
        lastSeen: conn.isConnected ? Date.now() : conn.lastSeen
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, [connections]);

  const generateMockMessage = () => {
    const messages = [
      'Task completed successfully',
      'Processing new request',
      'Synchronizing data with database',
      'Deployment pipeline initiated',
      'Performance metrics updated',
      'Error recovered automatically',
      'Scaling resources up',
      'Health check passed',
      'Configuration updated',
      'Backup process completed'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConnection) return;

    const message: Message = {
      id: Date.now().toString(),
      from: 'orchestrator',
      to: selectedConnection,
      type: messageType,
      content: newMessage,
      timestamp: Date.now(),
      status: 'sent',
      priority: messagePriority
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage('');

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);
  };

  const getMessageTypeColor = (type: Message['type']) => {
    switch (type) {
      case 'command': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'response': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'event': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'error': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: Message['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'sent': return '📤';
      case 'delivered': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <span className="text-xl">💬</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Inter-Agent Communications</h3>
          <p className="text-sm text-gray-400">Real-time message exchange</p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {connections.map((conn) => (
          <div
            key={conn.agentId}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              conn.isConnected 
                ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
                : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
            } ${selectedConnection === conn.agentId ? 'ring-2 ring-blue-500/50' : ''}`}
            onClick={() => setSelectedConnection(conn.agentId)}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{conn.emoji}</span>
              <div className={`w-2 h-2 rounded-full ${conn.isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>
            <div className="text-sm font-medium text-white">{conn.agentName}</div>
            <div className="text-xs text-gray-400">
              {conn.isConnected ? 'Online' : `Last seen: ${formatTimestamp(conn.lastSeen)}`}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ↑{conn.messagesSent} ↓{conn.messagesReceived}
            </div>
          </div>
        ))}
      </div>

      {/* Message Composer */}
      <div className="bg-black/20 rounded-lg p-4 mb-6 border border-white/5">
        <div className="flex gap-3 mb-3">
          <select
            value={selectedConnection || ''}
            onChange={(e) => setSelectedConnection(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">Select recipient...</option>
            {connections.map(conn => (
              <option key={conn.agentId} value={conn.agentId} className="bg-gray-800">
                {conn.emoji} {conn.agentName}
              </option>
            ))}
          </select>
          
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value as Message['type'])}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="command" className="bg-gray-800">Command</option>
            <option value="response" className="bg-gray-800">Response</option>
            <option value="event" className="bg-gray-800">Event</option>
            <option value="error" className="bg-gray-800">Error</option>
          </select>

          <select
            value={messagePriority}
            onChange={(e) => setMessagePriority(e.target.value as Message['priority'])}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="low" className="bg-gray-800">Low</option>
            <option value="medium" className="bg-gray-800">Medium</option>
            <option value="high" className="bg-gray-800">High</option>
            <option value="critical" className="bg-gray-800">Critical</option>
          </select>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !selectedConnection}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-all duration-200"
          >
            Send
          </button>
        </div>
      </div>

      {/* Message Feed */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-2">📭</div>
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const fromConnection = connections.find(c => c.agentId === message.from);
            const toConnection = connections.find(c => c.agentId === message.to);
            
            return (
              <div
                key={message.id}
                className={`p-4 rounded-lg border transition-all hover:bg-white/5 ${
                  message.from === 'orchestrator' 
                    ? 'bg-blue-500/10 border-blue-500/30 ml-8' 
                    : 'bg-white/5 border-white/10 mr-8'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {message.from === 'orchestrator' ? '🎼' : fromConnection?.emoji || '❓'}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {message.from === 'orchestrator' ? 'Orchestrator' : fromConnection?.agentName || message.from}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-lg">
                      {message.to === 'orchestrator' ? '🎼' : toConnection?.emoji || '❓'}
                    </span>
                    <span className="text-sm text-gray-300">
                      {message.to === 'orchestrator' ? 'Orchestrator' : toConnection?.agentName || message.to}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getMessageTypeColor(message.type)}`}>
                      {message.type}
                    </span>
                    <span className={`text-xs ${getPriorityColor(message.priority)}`}>
                      {message.priority}
                    </span>
                    <span className="text-xs">{getStatusIcon(message.status)}</span>
                  </div>
                </div>
                
                <div className="text-white mb-2">{message.content}</div>
                
                <div className="text-xs text-gray-400">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}