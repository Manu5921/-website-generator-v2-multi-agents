'use client';

import React, { useState, useEffect } from 'react';
import { ExpressBusinessGenerator, BusinessInfo, ExpressGenerationResult } from './ExpressBusinessGenerator';
import { SmartTemplateSelector, BusinessRequirements, useSmartTemplateSelection } from './SmartTemplateSelector';
import { AutoCustomizationEngine, useAutoCustomization, CustomizationPreview } from './AutoCustomizationEngine';
import { ConversionOptimizer, useConversionOptimizer, ConversionOptimizationDashboard } from './ConversionOptimizer';
import { DesignAgentOrchestrator, useDesignAgentOrchestrator, DesignAgentMonitor, BusinessMission } from './DesignAgentOrchestrator';
import { TemplateGallery } from './TemplateGallery';
import { SectorShowcase } from './SectorShowcase';

interface DesignAIAgentProps {
  mode?: 'express' | 'showcase' | 'orchestrator' | 'full';
  className?: string;
}

export function DesignAIAgent({ mode = 'full', className = '' }: DesignAIAgentProps) {
  const [activeTab, setActiveTab] = useState('express');
  const [selectedSector, setSelectedSector] = useState('all');
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [generationResult, setGenerationResult] = useState<ExpressGenerationResult | null>(null);

  // Hooks pour les systèmes IA
  const orchestrator = useDesignAgentOrchestrator();

  // Génération des requirements business
  const generateRequirements = (info: BusinessInfo): BusinessRequirements => ({
    sector: info.sector,
    businessType: 'généraliste',
    targetAudience: `Clients locaux ${info.city}`,
    businessGoals: ['generer-leads', 'augmenter-visibilite'],
    preferredStyle: 'professional',
    budget: 'premium',
    timeframe: 'express'
  });

  // Hooks conditionnels
  const requirements = businessInfo ? generateRequirements(businessInfo) : null;
  const templateSelection = useSmartTemplateSelection(requirements);
  const customization = businessInfo && templateSelection ? 
    useAutoCustomization(businessInfo, templateSelection.primaryTemplate.designType, requirements!.targetAudience) : null;
  const optimizedTemplate = businessInfo && templateSelection && customization ?
    useConversionOptimizer(templateSelection.primaryTemplate, businessInfo, requirements!.targetAudience) : null;

  const handleGenerationComplete = (result: ExpressGenerationResult) => {
    setGenerationResult(result);
    setBusinessInfo(result.businessInfo);
  };

  const tabs = [
    { id: 'express', label: '⚡ Express', icon: '🚀', description: 'Génération en 5-10 min' },
    { id: 'showcase', label: '🎨 Templates', icon: '🎯', description: 'Galerie complète' },
    { id: 'orchestrator', label: '🤖 Orchestrateur', icon: '⚙️', description: 'Missions IA' },
    { id: 'analytics', label: '📊 Analytics', icon: '📈', description: 'Performance' }
  ];

  if (mode !== 'full') {
    // Modes spécialisés
    switch (mode) {
      case 'express':
        return (
          <div className={className}>
            <ExpressBusinessGenerator onGenerate={handleGenerationComplete} />
          </div>
        );
      case 'showcase':
        return (
          <div className={className}>
            <SectorShowcase />
            <TemplateGallery selectedSector={selectedSector} viewMode={viewMode} />
          </div>
        );
      case 'orchestrator':
        return (
          <div className={className}>
            <DesignAgentMonitor />
          </div>
        );
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ${className}`}>
      {/* Header Agent */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agent Design IA</h1>
                <p className="text-gray-600">Expert templates et expérience visuelle</p>
              </div>
            </div>

            {/* Status Agent */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${orchestrator.status.isProcessing ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-gray-600">
                  {orchestrator.status.isProcessing ? 'Actif' : 'En attente'}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{orchestrator.status.totalMissions}</div>
                <div className="text-xs text-gray-500">Missions traitées</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{tab.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-gray-500">{tab.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu Principal */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'express' && (
          <div className="space-y-8">
            <ExpressBusinessGenerator onGenerate={handleGenerationComplete} />
            
            {/* Résultats et analyses */}
            {generationResult && templateSelection && customization && optimizedTemplate && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CustomizationPreview customization={customization} />
                <ConversionOptimizationDashboard optimizedTemplate={optimizedTemplate} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'showcase' && (
          <div className="space-y-8">
            {/* Contrôles */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">🎨 Galerie Templates</h2>
                <div className="flex items-center space-x-4">
                  {/* Sélecteur secteur */}
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les secteurs</option>
                    <option value="restaurant">🍽️ Restaurant</option>
                    <option value="beaute">💄 Beauté</option>
                    <option value="artisan">🔨 Artisan</option>
                    <option value="medical">⚕️ Médical</option>
                  </select>

                  {/* Sélecteur device */}
                  <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                      <button
                        key={device}
                        onClick={() => setViewMode(device)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          viewMode === device
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        {device === 'desktop' ? '🖥️' : device === 'tablet' ? '📱' : '📱'}
                        {device}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <SectorShowcase />
            <TemplateGallery selectedSector={selectedSector} viewMode={viewMode} />
          </div>
        )}

        {activeTab === 'orchestrator' && (
          <div className="space-y-8">
            <DesignAgentMonitor />
            
            {/* Interface debug orchestrateur */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🔧 Debug Orchestrateur</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{orchestrator.status.missionsInQueue}</div>
                  <div className="text-sm text-blue-600">En file d'attente</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">{orchestrator.status.missionsInProgress}</div>
                  <div className="text-sm text-yellow-600">En traitement</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{orchestrator.status.missionsCompleted}</div>
                  <div className="text-sm text-green-600">Terminées</div>
                </div>
              </div>

              {/* Événements récents */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">📋 Événements récents</h4>
                <div className="bg-gray-50 rounded-lg p-4 h-60 overflow-y-auto">
                  {orchestrator.events.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20">Aucun événement</div>
                  ) : (
                    <div className="space-y-2">
                      {orchestrator.events.slice(-10).reverse().map((event, idx) => (
                        <div key={idx} className="text-sm bg-white rounded p-2 border">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{event.type}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          {event.data && (
                            <div className="text-xs text-gray-600 mt-1 font-mono">
                              {JSON.stringify(event.data).slice(0, 100)}...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Analytics Dashboard */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">📊 Analytics & Performance</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                  <div className="text-2xl font-bold">17</div>
                  <div className="text-sm opacity-90">Templates disponibles</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                  <div className="text-2xl font-bold">98.5</div>
                  <div className="text-sm opacity-90">Score Lighthouse moyen</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                  <div className="text-2xl font-bold">+47%</div>
                  <div className="text-sm opacity-90">Conversion moyenne</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                  <div className="text-2xl font-bold">5-10min</div>
                  <div className="text-sm opacity-90">Temps génération</div>
                </div>
              </div>

              {/* Performance par secteur */}
              <div className="mt-8">
                <h3 className="font-bold text-gray-900 mb-4">Performance par secteur</h3>
                <div className="space-y-3">
                  {[
                    { sector: 'Restaurant', templates: 5, conversion: '+48%', color: 'bg-orange-500' },
                    { sector: 'Beauté', templates: 4, conversion: '+47%', color: 'bg-pink-500' },
                    { sector: 'Medical', templates: 4, conversion: '+52%', color: 'bg-blue-500' },
                    { sector: 'Artisan', templates: 4, conversion: '+45%', color: 'bg-amber-500' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${item.color}`}></div>
                        <span className="font-medium">{item.sector}</span>
                      </div>
                      <div className="flex items-center space-x-6">
                        <span className="text-sm text-gray-600">{item.templates} templates</span>
                        <span className="font-semibold text-green-600">{item.conversion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Agent */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">🎨 Agent Design IA</h3>
            <p className="text-gray-600 mb-4">
              Expert templates et expérience visuelle pour l'orchestration business client
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span>✅ Sélection intelligente templates</span>
              <span>✅ Génération express 5-10min</span>
              <span>✅ Customisation automatique</span>
              <span>✅ Optimisation conversion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesignAIAgent;