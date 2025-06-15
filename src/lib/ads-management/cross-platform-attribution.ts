// =============================================================================
// 🎯 SYSTÈME ATTRIBUTION ML CROSS-PLATFORM
// =============================================================================

import { db } from '@/lib/db';
import { metriquesCampagnes, parametresSysteme } from '@/lib/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';

/**
 * Interface pour les événements de tracking
 */
export interface TrackingEvent {
  eventId: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  eventType: 'impression' | 'click' | 'view' | 'conversion' | 'purchase';
  platform: 'google_ads' | 'facebook_ads' | 'linkedin_ads' | 'organic' | 'direct';
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  term?: string;
  value?: number;
  currency?: string;
  metadata?: Record<string, any>;
}

/**
 * Interface pour les modèles d'attribution
 */
export interface AttributionModel {
  modelType: 'first_click' | 'last_click' | 'linear' | 'time_decay' | 'position_based' | 'data_driven';
  touchpoints: TouchPoint[];
  conversionValue: number;
  attribution: PlatformAttribution[];
}

/**
 * Interface pour les points de contact
 */
export interface TouchPoint {
  platform: string;
  campaign: string;
  timestamp: Date;
  eventType: string;
  value?: number;
  position: number; // Position dans le parcours
  timeSinceLastTouch?: number; // Minutes depuis le dernier point de contact
}

/**
 * Interface pour l'attribution par plateforme
 */
export interface PlatformAttribution {
  platform: string;
  campaign: string;
  attributedValue: number;
  attributedConversions: number;
  weight: number; // Poids d'attribution (0-1)
  touchpoints: number;
}

/**
 * Interface pour les insights ML
 */
export interface MLInsights {
  recommendedBudgetAllocation: Record<string, number>;
  predictedPerformance: Record<string, any>;
  optimizationSuggestions: string[];
  audienceOverlaps: Array<{
    platforms: string[];
    overlapRate: number;
    recommendation: string;
  }>;
}

class CrossPlatformAttribution {
  private trackingEvents: TrackingEvent[] = [];
  private attributionWindows = {
    view: 1 * 24 * 60 * 60 * 1000, // 1 jour
    click: 7 * 24 * 60 * 60 * 1000, // 7 jours
  };

  constructor() {
    this.loadTrackingEvents();
  }

  /**
   * Enregistrer un événement de tracking
   */
  async trackEvent(event: Omit<TrackingEvent, 'eventId' | 'timestamp'>): Promise<void> {
    try {
      const trackingEvent: TrackingEvent = {
        ...event,
        eventId: this.generateEventId(),
        timestamp: new Date(),
      };

      // Sauvegarder en base de données
      await this.saveEventToDB(trackingEvent);

      // Ajouter à la mémoire
      this.trackingEvents.push(trackingEvent);

      // Si c'est une conversion, déclencher l'attribution
      if (event.eventType === 'conversion' || event.eventType === 'purchase') {
        await this.processAttribution(trackingEvent);
      }

      console.log(`✅ Événement tracké: ${event.eventType} - ${event.platform}`);

    } catch (error) {
      console.error('❌ Erreur tracking événement:', error);
      throw error;
    }
  }

  /**
   * Traiter l'attribution pour une conversion
   */
  private async processAttribution(conversionEvent: TrackingEvent): Promise<AttributionModel> {
    try {
      console.log(`🎯 Traitement attribution pour conversion: ${conversionEvent.eventId}`);

      // Récupérer le parcours utilisateur
      const userJourney = await this.getUserJourney(
        conversionEvent.sessionId,
        conversionEvent.userId,
        conversionEvent.timestamp
      );

      // Appliquer différents modèles d'attribution
      const attributionModels = await Promise.all([
        this.applyFirstClickAttribution(userJourney, conversionEvent),
        this.applyLastClickAttribution(userJourney, conversionEvent),
        this.applyLinearAttribution(userJourney, conversionEvent),
        this.applyTimeDecayAttribution(userJourney, conversionEvent),
        this.applyPositionBasedAttribution(userJourney, conversionEvent),
        this.applyDataDrivenAttribution(userJourney, conversionEvent),
      ]);

      // Sélectionner le meilleur modèle (data-driven par défaut)
      const bestModel = attributionModels.find(model => model.modelType === 'data_driven') || attributionModels[0];

      // Sauvegarder les résultats d'attribution
      await this.saveAttributionResults(bestModel);

      console.log(`✅ Attribution traitée: ${bestModel.attribution.length} plateformes impliquées`);
      return bestModel;

    } catch (error) {
      console.error('❌ Erreur traitement attribution:', error);
      throw error;
    }
  }

  /**
   * Récupérer le parcours utilisateur
   */
  private async getUserJourney(
    sessionId: string,
    userId?: string,
    conversionTime?: Date
  ): Promise<TouchPoint[]> {
    try {
      const endTime = conversionTime || new Date();
      const startTime = new Date(endTime.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 jours

      // Filtrer les événements pertinents
      const relevantEvents = this.trackingEvents.filter(event => {
        const matchesSession = event.sessionId === sessionId;
        const matchesUser = userId ? event.userId === userId : true;
        const withinWindow = event.timestamp >= startTime && event.timestamp <= endTime;
        const isInteraction = ['impression', 'click', 'view'].includes(event.eventType);

        return (matchesSession || matchesUser) && withinWindow && isInteraction;
      });

      // Convertir en points de contact
      const touchpoints: TouchPoint[] = relevantEvents
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .map((event, index) => ({
          platform: event.platform,
          campaign: event.campaign || 'unknown',
          timestamp: event.timestamp,
          eventType: event.eventType,
          value: event.value,
          position: index + 1,
          timeSinceLastTouch: index > 0 ? 
            Math.floor((event.timestamp.getTime() - relevantEvents[index - 1].timestamp.getTime()) / (60 * 1000)) : 0,
        }));

      return touchpoints;

    } catch (error) {
      console.error('❌ Erreur récupération parcours utilisateur:', error);
      throw error;
    }
  }

  /**
   * Attribution First Click
   */
  private async applyFirstClickAttribution(
    touchpoints: TouchPoint[],
    conversionEvent: TrackingEvent
  ): Promise<AttributionModel> {
    const firstTouch = touchpoints[0];
    const attribution: PlatformAttribution[] = [];

    if (firstTouch) {
      attribution.push({
        platform: firstTouch.platform,
        campaign: firstTouch.campaign,
        attributedValue: conversionEvent.value || 0,
        attributedConversions: 1,
        weight: 1.0,
        touchpoints: 1,
      });
    }

    return {
      modelType: 'first_click',
      touchpoints,
      conversionValue: conversionEvent.value || 0,
      attribution,
    };
  }

  /**
   * Attribution Last Click
   */
  private async applyLastClickAttribution(
    touchpoints: TouchPoint[],
    conversionEvent: TrackingEvent
  ): Promise<AttributionModel> {
    const lastTouch = touchpoints[touchpoints.length - 1];
    const attribution: PlatformAttribution[] = [];

    if (lastTouch) {
      attribution.push({
        platform: lastTouch.platform,
        campaign: lastTouch.campaign,
        attributedValue: conversionEvent.value || 0,
        attributedConversions: 1,
        weight: 1.0,
        touchpoints: 1,
      });
    }

    return {
      modelType: 'last_click',
      touchpoints,
      conversionValue: conversionEvent.value || 0,
      attribution,
    };
  }

  /**
   * Attribution Linéaire
   */
  private async applyLinearAttribution(
    touchpoints: TouchPoint[],
    conversionEvent: TrackingEvent
  ): Promise<AttributionModel> {
    const attribution: PlatformAttribution[] = [];
    const totalValue = conversionEvent.value || 0;
    const weight = touchpoints.length > 0 ? 1 / touchpoints.length : 0;

    // Grouper par plateforme/campagne
    const grouped = touchpoints.reduce((acc, touch) => {
      const key = `${touch.platform}:${touch.campaign}`;
      if (!acc[key]) {
        acc[key] = {
          platform: touch.platform,
          campaign: touch.campaign,
          touchpoints: 0,
        };
      }
      acc[key].touchpoints++;
      return acc;
    }, {} as Record<string, any>);

    // Calculer l'attribution
    Object.values(grouped).forEach((group: any) => {
      attribution.push({
        platform: group.platform,
        campaign: group.campaign,
        attributedValue: totalValue * weight,
        attributedConversions: weight,
        weight,
        touchpoints: group.touchpoints,
      });
    });

    return {
      modelType: 'linear',
      touchpoints,
      conversionValue: totalValue,
      attribution,
    };
  }

  /**
   * Attribution Time Decay
   */
  private async applyTimeDecayAttribution(
    touchpoints: TouchPoint[],
    conversionEvent: TrackingEvent
  ): Promise<AttributionModel> {
    const attribution: PlatformAttribution[] = [];
    const totalValue = conversionEvent.value || 0;
    const halfLife = 7 * 24 * 60; // 7 jours en minutes

    // Calculer les poids avec décroissance temporelle
    const weights = touchpoints.map(touch => {
      const ageMinutes = (Date.now() - touch.timestamp.getTime()) / (60 * 1000);
      return Math.pow(0.5, ageMinutes / halfLife);
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // Grouper et calculer l'attribution
    const grouped = touchpoints.reduce((acc, touch, index) => {
      const key = `${touch.platform}:${touch.campaign}`;
      if (!acc[key]) {
        acc[key] = {
          platform: touch.platform,
          campaign: touch.campaign,
          totalWeight: 0,
          touchpoints: 0,
        };
      }
      acc[key].totalWeight += weights[index];
      acc[key].touchpoints++;
      return acc;
    }, {} as Record<string, any>);

    Object.values(grouped).forEach((group: any) => {
      const normalizedWeight = group.totalWeight / totalWeight;
      attribution.push({
        platform: group.platform,
        campaign: group.campaign,
        attributedValue: totalValue * normalizedWeight,
        attributedConversions: normalizedWeight,
        weight: normalizedWeight,
        touchpoints: group.touchpoints,
      });
    });

    return {
      modelType: 'time_decay',
      touchpoints,
      conversionValue: totalValue,
      attribution,
    };
  }

  /**
   * Attribution Position-Based (40% first, 40% last, 20% middle)
   */
  private async applyPositionBasedAttribution(
    touchpoints: TouchPoint[],
    conversionEvent: TrackingEvent
  ): Promise<AttributionModel> {
    const attribution: PlatformAttribution[] = [];
    const totalValue = conversionEvent.value || 0;

    if (touchpoints.length === 0) {
      return {
        modelType: 'position_based',
        touchpoints,
        conversionValue: totalValue,
        attribution,
      };
    }

    const weights = touchpoints.map((_, index) => {
      if (touchpoints.length === 1) return 1.0;
      if (touchpoints.length === 2) return 0.5;
      
      if (index === 0) return 0.4; // Premier
      if (index === touchpoints.length - 1) return 0.4; // Dernier
      return 0.2 / (touchpoints.length - 2); // Milieu partagé
    });

    // Grouper et calculer l'attribution
    const grouped = touchpoints.reduce((acc, touch, index) => {
      const key = `${touch.platform}:${touch.campaign}`;
      if (!acc[key]) {
        acc[key] = {
          platform: touch.platform,
          campaign: touch.campaign,
          totalWeight: 0,
          touchpoints: 0,
        };
      }
      acc[key].totalWeight += weights[index];
      acc[key].touchpoints++;
      return acc;
    }, {} as Record<string, any>);

    Object.values(grouped).forEach((group: any) => {
      attribution.push({
        platform: group.platform,
        campaign: group.campaign,
        attributedValue: totalValue * group.totalWeight,
        attributedConversions: group.totalWeight,
        weight: group.totalWeight,
        touchpoints: group.touchpoints,
      });
    });

    return {
      modelType: 'position_based',
      touchpoints,
      conversionValue: totalValue,
      attribution,
    };
  }

  /**
   * Attribution Data-Driven (ML)
   */
  private async applyDataDrivenAttribution(
    touchpoints: TouchPoint[],
    conversionEvent: TrackingEvent
  ): Promise<AttributionModel> {
    try {
      // Récupérer les données historiques pour l'entraînement ML
      const historicalData = await this.getHistoricalAttributionData();
      
      // Calculer les poids basés sur les performances historiques
      const mlWeights = await this.calculateMLWeights(touchpoints, historicalData);
      
      const attribution: PlatformAttribution[] = [];
      const totalValue = conversionEvent.value || 0;

      // Grouper et appliquer les poids ML
      const grouped = touchpoints.reduce((acc, touch, index) => {
        const key = `${touch.platform}:${touch.campaign}`;
        if (!acc[key]) {
          acc[key] = {
            platform: touch.platform,
            campaign: touch.campaign,
            totalWeight: 0,
            touchpoints: 0,
          };
        }
        acc[key].totalWeight += mlWeights[index] || 0;
        acc[key].touchpoints++;
        return acc;
      }, {} as Record<string, any>);

      Object.values(grouped).forEach((group: any) => {
        attribution.push({
          platform: group.platform,
          campaign: group.campaign,
          attributedValue: totalValue * group.totalWeight,
          attributedConversions: group.totalWeight,
          weight: group.totalWeight,
          touchpoints: group.touchpoints,
        });
      });

      return {
        modelType: 'data_driven',
        touchpoints,
        conversionValue: totalValue,
        attribution,
      };

    } catch (error) {
      console.warn('⚠️ Fallback vers attribution linéaire pour ML:', error);
      return this.applyLinearAttribution(touchpoints, conversionEvent);
    }
  }

  /**
   * Calculer les poids ML basés sur les données historiques
   */
  private async calculateMLWeights(
    touchpoints: TouchPoint[],
    historicalData: any[]
  ): Promise<number[]> {
    // Algorithme ML simplifié basé sur les performances historiques
    const platformPerformance = historicalData.reduce((acc, data) => {
      const platform = data.platform;
      if (!acc[platform]) {
        acc[platform] = {
          conversions: 0,
          value: 0,
          touchpoints: 0,
        };
      }
      acc[platform].conversions += data.conversions || 0;
      acc[platform].value += data.value || 0;
      acc[platform].touchpoints += 1;
      return acc;
    }, {} as Record<string, any>);

    // Calculer les scores de performance
    const performanceScores = Object.entries(platformPerformance).reduce((acc, [platform, perf]: [string, any]) => {
      const conversionRate = perf.touchpoints > 0 ? perf.conversions / perf.touchpoints : 0;
      const avgValue = perf.touchpoints > 0 ? perf.value / perf.touchpoints : 0;
      acc[platform] = conversionRate * 0.7 + (avgValue / 100) * 0.3; // Pondération conversion/valeur
      return acc;
    }, {} as Record<string, number>);

    // Appliquer les scores aux touchpoints
    const weights = touchpoints.map(touch => {
      const baseScore = performanceScores[touch.platform] || 0.1;
      const positionFactor = 1 / Math.sqrt(touch.position); // Favoriser les premières interactions
      const timeFactor = Math.exp(-(touch.timeSinceLastTouch || 0) / 1440); // Décroissance temporelle
      return baseScore * positionFactor * timeFactor;
    });

    // Normaliser les poids
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    return totalWeight > 0 ? weights.map(w => w / totalWeight) : weights;
  }

  /**
   * Générer des insights ML
   */
  async generateMLInsights(): Promise<MLInsights> {
    try {
      console.log('🤖 Génération des insights ML...');

      const historicalData = await this.getHistoricalAttributionData();
      const platformStats = await this.analyzePlatformPerformance();

      // Recommandations d'allocation budgétaire
      const recommendedBudgetAllocation = this.optimizeBudgetAllocation(platformStats);

      // Prédictions de performance
      const predictedPerformance = await this.predictPlatformPerformance(historicalData);

      // Suggestions d'optimisation
      const optimizationSuggestions = this.generateOptimizationSuggestions(platformStats);

      // Analyse des chevauchements d'audience
      const audienceOverlaps = await this.analyzeAudienceOverlaps();

      console.log('✅ Insights ML générés');

      return {
        recommendedBudgetAllocation,
        predictedPerformance,
        optimizationSuggestions,
        audienceOverlaps,
      };

    } catch (error) {
      console.error('❌ Erreur génération insights ML:', error);
      throw error;
    }
  }

  // =============================================================================
  // MÉTHODES PRIVÉES UTILITAIRES
  // =============================================================================

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadTrackingEvents(): Promise<void> {
    // Charger les événements récents depuis la base de données
    // Implementation simplifiée
  }

  private async saveEventToDB(event: TrackingEvent): Promise<void> {
    // Sauvegarder l'événement en base de données
    // Implementation avec le schéma DB existant
  }

  private async saveAttributionResults(model: AttributionModel): Promise<void> {
    // Sauvegarder les résultats d'attribution
    // Implementation avec le schéma DB existant
  }

  private async getHistoricalAttributionData(): Promise<any[]> {
    // Récupérer les données historiques d'attribution
    return [];
  }

  private async analyzePlatformPerformance(): Promise<Record<string, any>> {
    // Analyser les performances par plateforme
    return {};
  }

  private optimizeBudgetAllocation(platformStats: Record<string, any>): Record<string, number> {
    // Optimiser l'allocation budgétaire
    return {};
  }

  private async predictPlatformPerformance(historicalData: any[]): Promise<Record<string, any>> {
    // Prédire les performances futures
    return {};
  }

  private generateOptimizationSuggestions(platformStats: Record<string, any>): string[] {
    // Générer des suggestions d'optimisation
    return [];
  }

  private async analyzeAudienceOverlaps(): Promise<Array<{
    platforms: string[];
    overlapRate: number;
    recommendation: string;
  }>> {
    // Analyser les chevauchements d'audience
    return [];
  }
}

// Instance singleton
export const crossPlatformAttribution = new CrossPlatformAttribution();

// =============================================================================
// UTILITAIRES POUR L'INTÉGRATION
// =============================================================================

/**
 * Middleware pour tracker automatiquement les événements
 */
export function createTrackingMiddleware() {
  return {
    trackPageView: async (platform: string, campaign?: string, source?: string) => {
      await crossPlatformAttribution.trackEvent({
        sessionId: generateSessionId(),
        eventType: 'view',
        platform: platform as any,
        source: source || 'unknown',
        medium: 'web',
        campaign,
      });
    },
    
    trackClick: async (platform: string, campaign?: string, element?: string) => {
      await crossPlatformAttribution.trackEvent({
        sessionId: generateSessionId(),
        eventType: 'click',
        platform: platform as any,
        source: 'web',
        medium: 'click',
        campaign,
        content: element,
      });
    },

    trackConversion: async (platform: string, value?: number, currency?: string) => {
      await crossPlatformAttribution.trackEvent({
        sessionId: generateSessionId(),
        eventType: 'conversion',
        platform: platform as any,
        source: 'conversion',
        medium: 'web',
        value,
        currency,
      });
    },
  };
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}