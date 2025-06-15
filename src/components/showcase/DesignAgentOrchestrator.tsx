'use client';

import React, { useState, useEffect } from 'react';
import { BusinessInfo, ExpressGenerationResult } from './ExpressBusinessGenerator';
import { smartTemplateSelector, BusinessRequirements } from './SmartTemplateSelector';
import { autoCustomizationEngine, CustomizationResult } from './AutoCustomizationEngine';

export interface BusinessMission {
  id: string;
  timestamp: string;
  businessInfo: BusinessInfo;
  requirements: BusinessRequirements;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered';
  clientId?: string;
  notes?: string;
}

export interface DesignMissionResult {
  missionId: string;
  businessInfo: BusinessInfo;
  templateSelection: any;
  customization: CustomizationResult;
  generatedAssets: {
    logo: string;
    heroImage: string;
    colorPalette: any;
    contentPack: any;
  };
  deliverables: {
    previewUrl: string;
    downloadUrl: string;
    deployUrl: string;
  };
  qualityScore: number;
  completionTime: string;
  optimizations: string[];
}

class DesignAgentOrchestrator {
  private missions: BusinessMission[] = [];
  private isProcessing = false;
  private eventListeners: ((event: any) => void)[] = [];

  constructor() {
    this.initializeOrchestrator();
  }

  /**
   * Initialise l'orchestrateur et écoute les missions
   */
  private initializeOrchestrator() {
    // Simulation d'écoute des événements orchestrateur global
    if (typeof window !== 'undefined') {
      window.addEventListener('businessMissionReceived', this.handleMissionReceived.bind(this));
      window.addEventListener('designAgentCommand', this.handleCommand.bind(this));
    }
  }

  /**
   * Reçoit une nouvelle mission business de l'orchestrateur global
   */
  public receiveMission(mission: BusinessMission): Promise<DesignMissionResult> {
    return new Promise((resolve, reject) => {
      try {
        // Ajouter à la queue
        this.missions.push(mission);
        this.notifyEvent('missionReceived', { missionId: mission.id, status: 'queued' });

        // Traitement immédiat si express ou urgent
        if (mission.requirements.timeframe === 'express' || mission.priority === 'urgent') {
          this.processMissionImmediately(mission).then(resolve).catch(reject);
        } else {
          // Traitement en batch
          this.scheduleProcessing();
          resolve(this.createPlaceholderResult(mission));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Traite une mission immédiatement (mode express)
   */
  private async processMissionImmediately(mission: BusinessMission): Promise<DesignMissionResult> {
    const startTime = Date.now();
    
    try {
      this.notifyEvent('missionStarted', { missionId: mission.id });
      mission.status = 'in_progress';

      // 1. Sélection intelligente du template
      const templateSelection = smartTemplateSelector.selectOptimalTemplate(mission.requirements);
      
      // 2. Génération des customisations
      const customization = autoCustomizationEngine.generateCustomization(
        mission.businessInfo,
        mission.requirements.preferredStyle,
        mission.requirements.targetAudience
      );

      // 3. Génération des assets
      const generatedAssets = await this.generateAssets(mission.businessInfo, templateSelection, customization);

      // 4. Création des delivrables
      const deliverables = await this.createDeliverables(mission, templateSelection, customization);

      // 5. Calcul qualité et optimisations
      const qualityScore = this.calculateQualityScore(templateSelection, customization);
      const optimizations = this.generateOptimizationReport(mission, templateSelection);

      const completionTime = `${Math.round((Date.now() - startTime) / 1000)}s`;

      const result: DesignMissionResult = {
        missionId: mission.id,
        businessInfo: mission.businessInfo,
        templateSelection,
        customization,
        generatedAssets,
        deliverables,
        qualityScore,
        completionTime,
        optimizations
      };

      mission.status = 'completed';
      this.notifyEvent('missionCompleted', { missionId: mission.id, result });

      return result;

    } catch (error) {
      mission.status = 'pending';
      this.notifyEvent('missionError', { missionId: mission.id, error: error.message });
      throw error;
    }
  }

  /**
   * Génère les assets design
   */
  private async generateAssets(
    businessInfo: BusinessInfo, 
    templateSelection: any, 
    customization: CustomizationResult
  ) {
    return {
      logo: await this.generateLogoAsset(businessInfo, customization),
      heroImage: await this.generateHeroImageAsset(businessInfo, customization),
      colorPalette: customization.colors,
      contentPack: await this.generateContentPack(businessInfo, templateSelection)
    };
  }

  /**
   * Crée les delivrables finaux
   */
  private async createDeliverables(
    mission: BusinessMission,
    templateSelection: any,
    customization: CustomizationResult
  ) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    return {
      previewUrl: `${baseUrl}/preview/${templateSelection.primaryTemplate.id}?mission=${mission.id}`,
      downloadUrl: `${baseUrl}/api/download/mission/${mission.id}`,
      deployUrl: `${baseUrl}/api/deploy/mission/${mission.id}`
    };
  }

  /**
   * Calcule le score qualité du design généré
   */
  private calculateQualityScore(templateSelection: any, customization: CustomizationResult): number {
    let score = 0;

    // Score template (40%)
    score += templateSelection.matchScore * 0.4;

    // Score customisation (30%)
    const customizationScore = this.evaluateCustomizationQuality(customization);
    score += customizationScore * 0.3;

    // Score cohérence design (20%)
    const coherenceScore = this.evaluateDesignCoherence(templateSelection, customization);
    score += coherenceScore * 0.2;

    // Score performance estimée (10%)
    const performanceScore = templateSelection.primaryTemplate.stats.lighthouse;
    score += performanceScore * 0.1;

    return Math.round(score);
  }

  /**
   * Génère le rapport d'optimisations
   */
  private generateOptimizationReport(mission: BusinessMission, templateSelection: any): string[] {
    const optimizations = [...templateSelection.conversionOptimizations];

    // Optimisations spécifiques par secteur
    const sectorOptimizations: Record<string, string[]> = {
      restaurant: [
        "Schema.org Restaurant markup ajouté",
        "Intégration Google My Business optimisée",
        "Menu structuré pour rich snippets"
      ],
      beaute: [
        "Booking widget haute conversion intégré",
        "Galerie avant/après optimisée mobile",
        "Avis clients automatisés"
      ],
      artisan: [
        "Portfolio avec lazy loading optimisé",
        "Formulaire devis simplifié 3 étapes",
        "Certifications en évidence"
      ],
      medical: [
        "Conformité RGPD renforcée",
        "Prise RDV médicale sécurisée",
        "Informations pratiques prioritaires"
      ]
    };

    return [
      ...optimizations,
      ...sectorOptimizations[mission.businessInfo.sector] || []
    ];
  }

  /**
   * Planifie le traitement en batch des missions
   */
  private scheduleProcessing() {
    if (this.isProcessing) return;

    setTimeout(() => {
      this.processBatchMissions();
    }, 5000); // 5 secondes de délai pour batch
  }

  /**
   * Traite les missions en batch
   */
  private async processBatchMissions() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const pendingMissions = this.missions.filter(m => m.status === 'pending');

    for (const mission of pendingMissions) {
      try {
        await this.processMissionImmediately(mission);
      } catch (error) {
        console.error(`Erreur traitement mission ${mission.id}:`, error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Gère les commandes reçues de l'orchestrateur
   */
  private handleCommand(event: CustomEvent) {
    const { command, data } = event.detail;

    switch (command) {
      case 'pauseProcessing':
        this.isProcessing = true;
        break;
      case 'resumeProcessing':
        this.isProcessing = false;
        this.scheduleProcessing();
        break;
      case 'prioritizeMission':
        this.prioritizeMission(data.missionId);
        break;
      case 'cancelMission':
        this.cancelMission(data.missionId);
        break;
      case 'getStatus':
        this.reportStatus();
        break;
    }
  }

  /**
   * Gère la réception de nouvelles missions
   */
  private handleMissionReceived(event: CustomEvent) {
    const mission = event.detail;
    this.receiveMission(mission);
  }

  /**
   * Notifie les événements aux listeners
   */
  private notifyEvent(eventType: string, data: any) {
    const event = { type: eventType, data, timestamp: new Date().toISOString() };
    
    // Notifier les listeners internes
    this.eventListeners.forEach(listener => listener(event));

    // Envoyer à l'orchestrateur global
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('designAgentEvent', { detail: event }));
    }
  }

  /**
   * Ajoute un listener d'événements
   */
  public addEventListener(listener: (event: any) => void) {
    this.eventListeners.push(listener);
  }

  /**
   * Retire un listener d'événements
   */
  public removeEventListener(listener: (event: any) => void) {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Obtient le statut actuel de l'agent
   */
  public getStatus() {
    return {
      isProcessing: this.isProcessing,
      missionsInQueue: this.missions.filter(m => m.status === 'pending').length,
      missionsInProgress: this.missions.filter(m => m.status === 'in_progress').length,
      missionsCompleted: this.missions.filter(m => m.status === 'completed').length,
      totalMissions: this.missions.length
    };
  }

  /**
   * Rapporte le statut à l'orchestrateur
   */
  private reportStatus() {
    this.notifyEvent('statusReport', this.getStatus());
  }

  // Helper methods
  private createPlaceholderResult(mission: BusinessMission): DesignMissionResult {
    return {
      missionId: mission.id,
      businessInfo: mission.businessInfo,
      templateSelection: null,
      customization: null,
      generatedAssets: null,
      deliverables: {
        previewUrl: '',
        downloadUrl: '',
        deployUrl: ''
      },
      qualityScore: 0,
      completionTime: 'pending',
      optimizations: []
    };
  }

  private prioritizeMission(missionId: string) {
    const mission = this.missions.find(m => m.id === missionId);
    if (mission) {
      mission.priority = 'urgent';
      // Réorganiser la queue
      this.missions = this.missions.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    }
  }

  private cancelMission(missionId: string) {
    this.missions = this.missions.filter(m => m.id !== missionId);
    this.notifyEvent('missionCancelled', { missionId });
  }

  private async generateLogoAsset(businessInfo: BusinessInfo, customization: CustomizationResult): Promise<string> {
    // Génération du logo avec les customisations
    return `logo-${businessInfo.name.replace(/\s+/g, '-').toLowerCase()}.svg`;
  }

  private async generateHeroImageAsset(businessInfo: BusinessInfo, customization: CustomizationResult): Promise<string> {
    // Génération de l'image hero avec les customisations
    return `hero-${businessInfo.sector}-${businessInfo.name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
  }

  private async generateContentPack(businessInfo: BusinessInfo, templateSelection: any) {
    return {
      title: `${businessInfo.name} - ${businessInfo.city}`,
      subtitle: businessInfo.description,
      cta: templateSelection.conversionOptimizations[0] || "Contactez-nous",
      sections: templateSelection.primaryTemplate.features
    };
  }

  private evaluateCustomizationQuality(customization: CustomizationResult): number {
    // Évaluation de la qualité des customisations
    let score = 70; // Score de base
    
    // Bonus pour cohérence couleurs
    if (this.isColorPaletteCoherent(customization.colors)) score += 15;
    
    // Bonus pour fonts appropriées
    if (customization.fonts.primary !== customization.fonts.secondary) score += 10;
    
    // Bonus pour animations appropriées
    if (customization.animations.effects.length > 2) score += 5;
    
    return Math.min(score, 100);
  }

  private evaluateDesignCoherence(templateSelection: any, customization: CustomizationResult): number {
    // Évaluation de la cohérence globale
    let score = 80; // Score de base
    
    // Vérifier cohérence style template/customisation
    const templateStyle = templateSelection.primaryTemplate.designType;
    const customizationStyle = customization.animations.type;
    
    if (this.stylesAreCoherent(templateStyle, customizationStyle)) {
      score += 20;
    }
    
    return Math.min(score, 100);
  }

  private isColorPaletteCoherent(colors: any): boolean {
    // Vérification basique de cohérence couleurs
    return colors.primary !== colors.secondary && colors.primary !== colors.accent;
  }

  private stylesAreCoherent(templateStyle: string, customizationStyle: string): boolean {
    const coherenceMatrix: Record<string, string[]> = {
      luxury: ['elegant', 'subtle'],
      premium: ['modern', 'elegant'],
      modern: ['dynamic', 'modern'],
      elegant: ['elegant', 'subtle'],
      professional: ['subtle', 'modern']
    };
    
    return coherenceMatrix[templateStyle]?.includes(customizationStyle) || false;
  }
}

// Instance singleton
export const designAgentOrchestrator = new DesignAgentOrchestrator();

// React Hook pour intégration
export function useDesignAgentOrchestrator() {
  const [status, setStatus] = useState(designAgentOrchestrator.getStatus());
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const handleEvent = (event: any) => {
      setEvents(prev => [...prev.slice(-9), event]); // Garde les 10 derniers événements
      if (event.type.includes('status') || event.type.includes('Completed') || event.type.includes('Started')) {
        setStatus(designAgentOrchestrator.getStatus());
      }
    };

    designAgentOrchestrator.addEventListener(handleEvent);
    
    return () => {
      designAgentOrchestrator.removeEventListener(handleEvent);
    };
  }, []);

  return {
    status,
    events,
    receiveMission: (mission: BusinessMission) => designAgentOrchestrator.receiveMission(mission),
    getStatus: () => designAgentOrchestrator.getStatus()
  };
}

// Composant de monitoring de l'agent
export function DesignAgentMonitor() {
  const { status, events } = useDesignAgentOrchestrator();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">🎨 Agent Design IA</h3>
        <div className={`w-3 h-3 rounded-full ${status.isProcessing ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`}></div>
      </div>

      {/* Statut */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">{status.missionsInQueue}</div>
          <div className="text-xs text-blue-600">En attente</div>
        </div>
        <div className="text-center bg-yellow-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-yellow-600">{status.missionsInProgress}</div>
          <div className="text-xs text-yellow-600">En cours</div>
        </div>
        <div className="text-center bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">{status.missionsCompleted}</div>
          <div className="text-xs text-green-600">Terminées</div>
        </div>
        <div className="text-center bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-600">{status.totalMissions}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
      </div>

      {/* Événements récents */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">📋 Événements récents</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {events.slice(-5).reverse().map((event, idx) => (
            <div key={idx} className="text-sm bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{event.type}</span>
                <span className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {event.data && (
                <div className="text-xs text-gray-600 mt-1">
                  {JSON.stringify(event.data, null, 2).slice(0, 100)}...
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}