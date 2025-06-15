// =============================================================================
// 🎯 AGENT ADS MANAGEMENT - INDEX PRINCIPAL
// =============================================================================

// Système de tracking attribution
export { attributionTracker } from './attribution-tracker';
export type { 
  TrackingEventData, 
  ConversionData, 
  AttributionModel 
} from './attribution-tracker';

// Algorithmes ML d'optimisation
export { mlAlgorithms } from './ml-algorithms';
export type { 
  TrainingData, 
  PredictionResult, 
  BudgetAllocation, 
  AudienceRecommendation 
} from './ml-algorithms';

// Client Google Ads
export { googleAdsClient } from './google-ads-client';
export type { 
  GoogleAdsConfig, 
  GoogleAdsMetrics, 
  CreateCampaignData 
} from './google-ads-client';

// Client Facebook Ads
export { facebookAdsClient } from './facebook-ads-client';
export type { 
  FacebookAdsConfig, 
  PixelEvent, 
  FacebookCampaignData 
} from './facebook-ads-client';

// Moteur A/B Testing
export { abTestingEngine } from './ab-testing-engine';
export type { 
  ABTestConfig, 
  StatisticalResult, 
  CreativeRecommendation 
} from './ab-testing-engine';

// Analytics ROI
export { roiAnalytics } from './roi-analytics';
export type { 
  ROIMetrics, 
  ROIPredictions 
} from './roi-analytics';

// Système d'alertes
export { alertsSystem } from './alerts-system';
export type { 
  AlertThresholds, 
  AutomatedAction, 
  OpportunityAlert 
} from './alerts-system';

// =============================================================================
// 🎯 CLASSE PRINCIPALE ADS MANAGEMENT AGENT
// =============================================================================

import { attributionTracker } from './attribution-tracker';
import { mlAlgorithms } from './ml-algorithms';
import { googleAdsClient } from './google-ads-client';
import { facebookAdsClient } from './facebook-ads-client';
import { abTestingEngine } from './ab-testing-engine';
import { roiAnalytics } from './roi-analytics';
import { alertsSystem } from './alerts-system';

class AdsManagementAgent {
  
  /**
   * Initialiser l'agent avec tous ses modules
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initialisation Agent Ads Management...');
      
      // Vérifier la configuration
      await this.checkConfiguration();
      
      // Démarrer la surveillance automatique
      await this.startAutomaticMonitoring();
      
      console.log('✅ Agent Ads Management initialisé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur initialisation Agent Ads Management:', error);
      throw error;
    }
  }

  /**
   * Orchestrer une campagne publicitaire complète
   */
  async orchestrateCampaign(
    siteId: string,
    secteur: string,
    budget: number,
    platforme: 'google_ads' | 'facebook_ads' | 'both' = 'both'
  ): Promise<any> {
    try {
      console.log(`🎯 Orchestration campagne pour ${siteId} - Budget: ${budget}€ - Secteur: ${secteur}`);

      // 1. Optimiser l'allocation de budget avec ML
      const budgetAllocation = await mlAlgorithms.optimizeBudgetAllocation(siteId, budget, secteur);
      
      // 2. Générer les audiences optimisées
      const audienceRecommendations = await mlAlgorithms.optimizeAudienceTargeting('temp-campaign', secteur);
      
      // 3. Créer les campagnes selon la plateforme
      const campaignResults: any = {
        budgetAllocation,
        audienceRecommendations,
        campaigns: [],
      };

      if (platforme === 'google_ads' || platforme === 'both') {
        // Créer campagne Google Ads
        const googleCampaign = await googleAdsClient.createCampaign(siteId, {
          name: `${secteur} - Campaign Google`,
          type: 'SEARCH',
          budget: budgetAllocation.length > 0 ? budgetAllocation[0].recommendedBudget : budget * 0.6,
          keywords: this.getSectorKeywords(secteur),
          geoTargeting: ['FR'],
        });
        
        campaignResults.campaigns.push({
          platform: 'google_ads',
          campaignId: googleCampaign,
          budget: budgetAllocation.length > 0 ? budgetAllocation[0].recommendedBudget : budget * 0.6,
        });
      }

      if (platforme === 'facebook_ads' || platforme === 'both') {
        // Créer campagne Facebook Ads
        const facebookCampaign = await facebookAdsClient.createCampaign(siteId, {
          name: `${secteur} - Campaign Facebook`,
          objective: 'CONVERSIONS',
          budget: platforme === 'both' ? budget * 0.4 : budget,
          budgetType: 'DAILY',
          targeting: {
            age_min: 25,
            age_max: 65,
            geo_locations: { countries: ['FR'] },
            interests: this.getSectorInterests(secteur),
          },
        });
        
        campaignResults.campaigns.push({
          platform: 'facebook_ads',
          campaignId: facebookCampaign,
          budget: platforme === 'both' ? budget * 0.4 : budget,
        });
      }

      // 4. Mettre en place le tracking attribution
      await this.setupAttributionTracking(siteId, campaignResults.campaigns);

      console.log(`✅ Orchestration terminée: ${campaignResults.campaigns.length} campagnes créées`);
      return campaignResults;

    } catch (error) {
      console.error('❌ Erreur orchestration campagne:', error);
      throw error;
    }
  }

  /**
   * Optimiser automatiquement toutes les campagnes
   */
  async optimizeAllCampaigns(): Promise<any> {
    try {
      console.log('🔧 Optimisation automatique de toutes les campagnes...');

      const results = {
        sitesOptimized: 0,
        budgetAdjustments: 0,
        alertsGenerated: 0,
        testsLaunched: 0,
      };

      // Surveillance et alertes
      await alertsSystem.monitorAllCampaigns();
      
      // Synchronisation des métriques
      // Note: En production, récupérer la liste des sites actifs
      const activeSites = ['site1', 'site2']; // Placeholder
      
      for (const siteId of activeSites) {
        try {
          // Synchroniser Google Ads
          await googleAdsClient.syncMetricsToDB(siteId);
          
          // Synchroniser Facebook Ads
          await facebookAdsClient.syncMetricsToDB(siteId);
          
          // Générer rapport ROI
          const roiReport = await roiAnalytics.calculateROIMetrics(
            siteId,
            new Date(Date.now() - 24 * 60 * 60 * 1000),
            new Date()
          );
          
          // Optimiser budgets si nécessaire
          if (roiReport.global.roi > 50) {
            // Site performant - opportunité de scaling
            const budgetOptimization = await mlAlgorithms.optimizeBudgetAllocation(
              siteId, 
              roiReport.global.depenseTotal * 1.2, 
              'general'
            );
            results.budgetAdjustments += budgetOptimization.length;
          }
          
          results.sitesOptimized++;
          
        } catch (siteError) {
          console.error(`❌ Erreur optimisation site ${siteId}:`, siteError);
        }
      }

      console.log(`✅ Optimisation terminée: ${JSON.stringify(results)}`);
      return results;

    } catch (error) {
      console.error('❌ Erreur optimisation globale:', error);
      throw error;
    }
  }

  /**
   * Générer un rapport complet de performance
   */
  async generatePerformanceReport(
    siteId: string,
    period: 'day' | 'week' | 'month' = 'week'
  ): Promise<any> {
    try {
      console.log(`📊 Génération rapport performance ${period} pour ${siteId}`);

      const { dateStart, dateEnd } = this.getPeriodDates(period);

      const report = {
        period: { start: dateStart, end: dateEnd },
        roi: await roiAnalytics.calculateROIMetrics(siteId, dateStart, dateEnd),
        attribution: await attributionTracker.getAttributionReport(siteId, dateStart, dateEnd),
        channelEffectiveness: await attributionTracker.analyzeChannelEffectiveness(siteId),
        commissionAnalysis: await roiAnalytics.analyzeCommissionEffectiveness(siteId, period === 'month' ? 'month' : 'month'),
        predictions: await roiAnalytics.generateROIPredictions(siteId),
        alertsSummary: await alertsSystem.getAlertsSummary(siteId),
      };

      console.log(`✅ Rapport généré: ROI ${report.roi.global.roi.toFixed(2)}%, Commission ${report.commissionAnalysis.commission.commissionNette.toFixed(2)}€`);
      return report;

    } catch (error) {
      console.error('❌ Erreur génération rapport:', error);
      throw error;
    }
  }

  // =============================================================================
  // MÉTHODES PRIVÉES
  // =============================================================================

  private async checkConfiguration(): Promise<void> {
    const requiredEnvVars = [
      'GOOGLE_ADS_DEVELOPER_TOKEN',
      'FACEBOOK_APP_ID',
      'FACEBOOK_APP_SECRET',
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.warn(`⚠️ Variable d'environnement manquante: ${envVar}`);
      }
    }
  }

  private async startAutomaticMonitoring(): Promise<void> {
    // En production, utiliser un scheduler (cron job, Bull Queue, etc.)
    console.log('🔍 Surveillance automatique démarrée');
    
    // Simuler une surveillance périodique
    setInterval(async () => {
      try {
        await alertsSystem.monitorAllCampaigns();
      } catch (error) {
        console.error('❌ Erreur surveillance automatique:', error);
      }
    }, 60 * 60 * 1000); // Toutes les heures
  }

  private getSectorKeywords(secteur: string): string[] {
    const keywordsBySector = {
      restaurant: ['restaurant', 'livraison', 'menu', 'réservation', 'cuisine'],
      coiffeur: ['coiffeur', 'salon de coiffure', 'coupe', 'coloration', 'brushing'],
      artisan: ['artisan', 'rénovation', 'travaux', 'devis', 'bricolage'],
    };

    return keywordsBySector[secteur] || keywordsBySector['restaurant'];
  }

  private getSectorInterests(secteur: string): any[] {
    const interestsBySector = {
      restaurant: [
        { name: 'Food and drink', id: '6003107902433' },
        { name: 'Restaurants', id: '6003020834333' },
      ],
      coiffeur: [
        { name: 'Beauty', id: '6002714398172' },
        { name: 'Hair care', id: '6003020834833' },
      ],
      artisan: [
        { name: 'Home improvement', id: '6003275126094' },
        { name: 'Do it yourself', id: '6003600348878' },
      ],
    };

    return interestsBySector[secteur] || interestsBySector['restaurant'];
  }

  private async setupAttributionTracking(siteId: string, campaigns: any[]): Promise<void> {
    // Configuration du tracking pour chaque campagne
    for (const campaign of campaigns) {
      console.log(`🎯 Configuration tracking attribution pour campagne ${campaign.campaignId} (${campaign.platform})`);
      
      // Le tracking sera automatique via les webhooks et les pixels
      // Ici on pourrait configurer des événements spécifiques
    }
  }

  private getPeriodDates(period: string): { dateStart: Date; dateEnd: Date } {
    const dateEnd = new Date();
    const dateStart = new Date();

    switch (period) {
      case 'day':
        dateStart.setDate(dateStart.getDate() - 1);
        break;
      case 'week':
        dateStart.setDate(dateStart.getDate() - 7);
        break;
      case 'month':
        dateStart.setMonth(dateStart.getMonth() - 1);
        break;
    }

    return { dateStart, dateEnd };
  }
}

// Instance singleton
export const adsManagementAgent = new AdsManagementAgent();

// Export par défaut
export default adsManagementAgent;