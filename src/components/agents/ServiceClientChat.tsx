'use client';

// =============================================================================
// 🤖 COMPOSANT CHAT SERVICE CLIENT IA 24/7
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Phone, Mail, Calendar, Star, X, Minimize2, Maximize2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'client' | 'agent_ia' | 'humain';
  type?: 'texte' | 'action_button' | 'suggestion';
  timestamp: Date;
  actions?: Array<{
    type: 'button' | 'link' | 'phone' | 'email';
    label: string;
    value: string;
  }>;
}

interface ServiceClientChatProps {
  siteId: string;
  secteur: string;
  userInfo?: {
    nom?: string;
    email?: string;
    telephone?: string;
  };
  onConversationStart?: (conversationId: string) => void;
  onConversationEnd?: (conversationId: string, satisfaction: number) => void;
}

export default function ServiceClientChat({
  siteId,
  secteur,
  userInfo,
  onConversationStart,
  onConversationEnd
}: ServiceClientChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSatisfaction, setShowSatisfaction] = useState(false);
  const [satisfaction, setSatisfaction] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startConversation = async (initialMessage?: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/agents/service-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_conversation',
          siteId,
          secteur,
          userInfo,
          sessionData: { startTime: new Date().toISOString() },
          initialMessage
        })
      });

      const { success, data, error } = await response.json();

      if (success) {
        setConversationId(data.conversationId);
        setMessages(data.history.map((msg: any) => ({
          id: msg.id,
          content: msg.contenu,
          sender: msg.expediteur,
          type: msg.type_message,
          timestamp: new Date(msg.dateEnvoi)
        })));
        onConversationStart?.(data.conversationId);
      } else {
        console.error('Erreur démarrage conversation:', error);
      }
    } catch (error) {
      console.error('Erreur API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!conversationId || !message.trim()) return;

    // Ajouter le message client immédiatement
    const clientMessage: ChatMessage = {
      id: `client-${Date.now()}`,
      content: message,
      sender: 'client',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, clientMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agents/service-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          conversationId,
          message,
          siteId,
          secteur
        })
      });

      const { success, data, error } = await response.json();

      if (success) {
        // Ajouter la réponse de l'IA
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          content: data.response,
          sender: 'agent_ia',
          timestamp: new Date(),
          actions: data.actions
        };
        setMessages(prev => [...prev, botMessage]);
        setSuggestions(data.suggestions || []);

        // Gérer l'escalation si nécessaire
        if (data.escalation?.required) {
          const escalationMessage: ChatMessage = {
            id: `escalation-${Date.now()}`,
            content: "Un agent humain va prendre le relais dans quelques instants. Merci de votre patience.",
            sender: 'agent_ia',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, escalationMessage]);
        }
      } else {
        console.error('Erreur envoi message:', error);
      }
    } catch (error) {
      console.error('Erreur API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: { type: string; label: string; value: string }) => {
    switch (action.type) {
      case 'phone':
        window.open(action.value, '_self');
        break;
      case 'email':
        window.open(`mailto:${action.value}`, '_self');
        break;
      case 'link':
        window.open(action.value, '_blank');
        break;
      case 'button':
        sendMessage(`Action: ${action.label}`);
        break;
    }
  };

  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const closeConversation = async () => {
    if (!conversationId) return;

    try {
      await fetch('/api/agents/service-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'close_conversation',
          conversationId,
          satisfaction
        })
      });

      onConversationEnd?.(conversationId, satisfaction);
      setConversationId(null);
      setMessages([]);
      setIsOpen(false);
      setShowSatisfaction(false);
      setSatisfaction(0);
    } catch (error) {
      console.error('Erreur fermeture conversation:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
    }
  };

  const renderMessage = (message: ChatMessage) => (
    <div
      key={message.id}
      className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex max-w-xs lg:max-w-md ${message.sender === 'client' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 ${message.sender === 'client' ? 'ml-2' : 'mr-2'}`}>
          {message.sender === 'client' ? (
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <div
          className={`px-4 py-2 rounded-lg ${
            message.sender === 'client'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          <p className="text-sm">{message.content}</p>
          
          {/* Actions */}
          {message.actions && message.actions.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleAction(action)}
                  className="block w-full text-left px-2 py-1 text-xs bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                >
                  {action.type === 'phone' && <Phone className="w-3 h-3 inline mr-1" />}
                  {action.type === 'email' && <Mail className="w-3 h-3 inline mr-1" />}
                  {action.type === 'button' && <Calendar className="w-3 h-3 inline mr-1" />}
                  {action.label}
                </button>
              ))}
            </div>
          )}
          
          <p className="text-xs opacity-70 mt-1">
            {message.timestamp.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          if (!conversationId) {
            startConversation();
          }
        }}
        className="fixed bottom-4 right-4 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transition-all duration-200 ${isMinimized ? 'h-12' : 'h-96'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-blue-500 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <span className="font-medium text-sm">Assistant IA</span>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-6 h-6 hover:bg-blue-600 rounded flex items-center justify-center"
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setShowSatisfaction(true)}
            className="w-6 h-6 hover:bg-blue-600 rounded flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && isLoading && (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {messages.map(renderMessage)}
            
            {isLoading && messages.length > 0 && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-3 pb-2">
              <div className="flex flex-wrap gap-1">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestion(suggestion)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Tapez votre message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </>
      )}

      {/* Modal de satisfaction */}
      {showSatisfaction && (
        <div className="absolute inset-0 bg-white rounded-lg flex flex-col items-center justify-center p-4">
          <h3 className="text-lg font-medium mb-4">Comment évaluez-vous notre service ?</h3>
          <div className="flex space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setSatisfaction(rating)}
                className={`w-8 h-8 ${satisfaction >= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
              >
                <Star className="w-full h-full fill-current" />
              </button>
            ))}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSatisfaction(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              onClick={closeConversation}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Terminer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}