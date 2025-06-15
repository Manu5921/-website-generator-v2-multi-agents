// =============================================================================
// 🔍 GOOGLE ADS API CLIENT - INTÉGRATION COMPLÈTE
// =============================================================================

import { db } from '@/lib/db';
import { 
  campagnesPublicitaires, 
  metriquesCampagnes, 
  creatifsPublicitaires,
  InsertCampagnePublicitaire,
  InsertMetriqueCampagne,
  InsertCreatifPublicitaire
} from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';

/**
 * Interface pour la configuration Google Ads
 */
export interface GoogleAdsConfig {
  customerId: string;
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

/**
 * Interface pour les métriques Google Ads
 */
export interface GoogleAdsMetrics {
  campaignId: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  date: string;
}

/**
 * Interface pour la création de campagne
 */
export interface CreateCampaignData {
  name: string;
  type: 'SEARCH' | 'DISPLAY' | 'VIDEO' | 'SHOPPING' | 'PERFORMANCE_MAX';
  budget: number;
  targetCPA?: number;
  targetROAS?: number;
  keywords?: string[];
  audiences?: any[];
  geoTargeting?: string[];
}

class GoogleAdsClient {
  private config: GoogleAdsConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.config = {
      customerId: process.env.GOOGLE_ADS_CUSTOMER_ID || '',
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
      clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
      refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
    };
  }

  /**
   * Authentification et obtention d'un access token
   */
  private async authenticate(): Promise<string> {
    try {
      if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
        return this.accessToken;
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.config.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur authentification Google Ads: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));

      console.log('✅ Authentification Google Ads réussie');
      return this.accessToken;

    } catch (error) {
      console.error('❌ Erreur authentification Google Ads:', error);
      throw error;
    }
  }

  /**
   * Effectuer une requête à l'API Google Ads
   */
  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`https://googleads.googleapis.com/v16/${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'developer-token': this.config.developerToken,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Erreur API Google Ads: ${response.status} - ${errorData}`);
        throw new Error(`Google Ads API Error: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('❌ Erreur requête Google Ads:', error);
      throw error;
    }
  }

  /**
   * Récupérer les campagnes d'un compte
   */
  async getCampaigns(): Promise<any[]> {
    try {
      console.log('📊 Récupération des campagnes Google Ads...');

      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign_budget.amount_micros,
          campaign.target_cpa.target_cpa_micros,
          campaign.target_roas.target_roas
        FROM campaign 
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
      `;

      const response = await this.makeRequest(
        `customers/${this.config.customerId}/googleAds:search`,
        'POST',
        { query }
      );

      const campaigns = response.results || [];
      console.log(`✅ ${campaigns.length} campagnes récupérées`);

      return campaigns;

    } catch (error) {
      console.error('❌ Erreur récupération campagnes:', error);
      throw error;
    }
  }

  /**
   * Récupérer les métriques de performance
   */
  async getCampaignMetrics(dateStart: string, dateEnd: string): Promise<GoogleAdsMetrics[]> {
    try {
      console.log(`📈 Récupération métriques ${dateStart} à ${dateEnd}...`);

      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_per_conversion,
          metrics.value_per_conversion,
          segments.date
        FROM campaign 
        WHERE campaign.status = 'ENABLED'
        AND segments.date >= '${dateStart}'
        AND segments.date <= '${dateEnd}'
        ORDER BY segments.date DESC
      `;

      const response = await this.makeRequest(
        `customers/${this.config.customerId}/googleAds:search`,
        'POST',
        { query }
      );

      const results = response.results || [];
      
      const metrics: GoogleAdsMetrics[] = results.map((result: any) => ({
        campaignId: result.campaign.id,
        impressions: parseInt(result.metrics.impressions || '0'),
        clicks: parseInt(result.metrics.clicks || '0'),
        cost: parseInt(result.metrics.cost_micros || '0') / 1000000, // Convertir de micros à euros
        conversions: parseFloat(result.metrics.conversions || '0'),
        conversionValue: parseFloat(result.metrics.conversions_value || '0'),
        ctr: parseFloat(result.metrics.ctr || '0') * 100, // Convertir en pourcentage
        cpc: parseInt(result.metrics.average_cpc || '0') / 1000000,
        cpa: parseInt(result.metrics.cost_per_conversion || '0') / 1000000,
        roas: parseFloat(result.metrics.value_per_conversion || '0') / (parseInt(result.metrics.cost_per_conversion || '1') / 1000000),
        date: result.segments.date,
      }));

      console.log(`✅ ${metrics.length} métriques récupérées`);
      return metrics;

    } catch (error) {
      console.error('❌ Erreur récupération métriques:', error);
      throw error;
    }
  }

  /**
   * Créer une nouvelle campagne
   */
  async createCampaign(siteId: string, campaignData: CreateCampaignData): Promise<string> {
    try {
      console.log(`🚀 Création campagne: ${campaignData.name}`);

      // 1. Créer le budget
      const budgetResource = await this.createCampaignBudget(campaignData.budget);

      // 2. Créer la campagne
      const campaignResource = {
        name: campaignData.name,
        advertising_channel_type: campaignData.type,
        status: 'PAUSED', // Démarrer en pause pour configuration
        campaign_budget: budgetResource,
        network_settings: {
          target_google_search: true,
          target_search_network: true,
          target_content_network: campaignData.type === 'DISPLAY',
        },
      };

      // Ajouter les stratégies d'enchères
      if (campaignData.targetCPA) {
        campaignResource.target_cpa = {
          target_cpa_micros: campaignData.targetCPA * 1000000,
        };
      } else if (campaignData.targetROAS) {
        campaignResource.target_roas = {
          target_roas: campaignData.targetROAS,
        };
      } else {
        campaignResource.bidding_strategy_type = 'MAXIMIZE_CONVERSIONS';
      }

      const response = await this.makeRequest(
        `customers/${this.config.customerId}/campaigns:mutate`,
        'POST',
        {
          operations: [{
            create: campaignResource,
          }],
        }
      );

      const createdCampaign = response.results[0];
      const campaignId = createdCampaign.resource_name.split('/').pop();

      // 3. Sauvegarder en base de données
      await this.saveCampaignToDB(siteId, campaignId, campaignData);

      // 4. Ajouter les mots-clés si c'est une campagne Search
      if (campaignData.type === 'SEARCH' && campaignData.keywords) {
        await this.addKeywords(campaignId, campaignData.keywords);
      }

      console.log(`✅ Campagne créée: ${campaignId}`);
      return campaignId;

    } catch (error) {
      console.error('❌ Erreur création campagne:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le budget d'une campagne
   */
  async updateCampaignBudget(campaignId: string, newBudget: number): Promise<void> {
    try {
      console.log(`💰 Mise à jour budget campagne ${campaignId}: ${newBudget}€`);

      // Récupérer le budget actuel
      const query = `
        SELECT campaign_budget.resource_name
        FROM campaign 
        WHERE campaign.id = ${campaignId}
      `;

      const response = await this.makeRequest(
        `customers/${this.config.customerId}/googleAds:search`,
        'POST',
        { query }
      );

      if (response.results.length === 0) {
        throw new Error(`Campagne ${campaignId} non trouvée`);
      }

      const budgetResourceName = response.results[0].campaign_budget.resource_name;

      // Mettre à jour le budget
      await this.makeRequest(
        `customers/${this.config.customerId}/campaignBudgets:mutate`,
        'POST',
        {
          operations: [{
            update: {
              resource_name: budgetResourceName,
              amount_micros: newBudget * 1000000,
            },
            update_mask: 'amount_micros',
          }],
        }
      );

      console.log(`✅ Budget mis à jour: ${newBudget}€`);

    } catch (error) {
      console.error('❌ Erreur mise à jour budget:', error);
      throw error;
    }
  }

  /**
   * Synchroniser les métriques avec la base de données
   */
  async syncMetricsToDB(siteId: string): Promise<void> {
    try {
      console.log('🔄 Synchronisation métriques Google Ads...');

      // Récupérer les métriques des 7 derniers jours
      const dateEnd = new Date().toISOString().split('T')[0];
      const dateStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const metrics = await this.getCampaignMetrics(dateStart, dateEnd);

      for (const metric of metrics) {
        // Vérifier si la campagne existe en DB
        const [campaign] = await db.select()
          .from(campagnesPublicitaires)
          .where(
            and(
              eq(campagnesPublicitaires.idExterne, metric.campaignId),
              eq(campagnesPublicitaires.siteId, siteId)
            )
          )
          .limit(1);

        if (!campaign) {
          console.warn(`⚠️ Campagne ${metric.campaignId} non trouvée en DB`);
          continue;
        }

        // Vérifier si la métrique existe déjà
        const metricDate = new Date(metric.date);
        const [existingMetric] = await db.select()
          .from(metriquesCampagnes)
          .where(
            and(
              eq(metriquesCampagnes.campagneId, campaign.id),
              eq(metriquesCampagnes.date, metricDate)
            )
          )
          .limit(1);

        const metricData: InsertMetriqueCampagne = {
          campagneId: campaign.id,
          date: metricDate,
          impressions: metric.impressions,
          clics: metric.clicks,
          depense: metric.cost.toString(),
          conversions: metric.conversions,
          valeurConversions: metric.conversionValue.toString(),
          ctr: metric.ctr.toString(),
          cpc: metric.cpc.toString(),
          cpa: metric.cpa.toString(),
          roas: metric.roas.toString(),
          tauxConversion: metric.conversions > 0 ? (metric.conversions / metric.clicks * 100).toString() : '0',
        };

        if (existingMetric) {
          // Mettre à jour
          await db.update(metriquesCampagnes)
            .set(metricData)
            .where(eq(metriquesCampagnes.id, existingMetric.id));
        } else {
          // Créer
          await db.insert(metriquesCampagnes).values(metricData);
        }
      }

      console.log(`✅ ${metrics.length} métriques synchronisées`);

    } catch (error) {
      console.error('❌ Erreur synchronisation métriques:', error);
      throw error;
    }
  }

  // =============================================================================
  // MÉTHODES PRIVÉES
  // =============================================================================

  private async createCampaignBudget(budgetAmount: number): Promise<string> {
    const response = await this.makeRequest(
      `customers/${this.config.customerId}/campaignBudgets:mutate`,
      'POST',
      {
        operations: [{
          create: {
            name: `Budget ${Date.now()}`,
            amount_micros: budgetAmount * 1000000,
            delivery_method: 'STANDARD',
          },
        }],
      }
    );

    return response.results[0].resource_name;
  }

  private async saveCampaignToDB(
    siteId: string, 
    campaignId: string, 
    campaignData: CreateCampaignData
  ): Promise<void> {
    const insertData: InsertCampagnePublicitaire = {
      siteId,
      nom: campaignData.name,
      plateforme: 'google_ads',
      type: this.mapCampaignType(campaignData.type),
      statut: 'draft',
      budgetQuotidien: campaignData.budget.toString(),
      objectif: 'conversions',
      secteurCible: 'general', // À personnaliser selon le contexte
      audienceCible: JSON.stringify(campaignData.audiences || []),
      strategieEncheres: campaignData.targetCPA ? 'target_cpa' : 
                        campaignData.targetROAS ? 'target_roas' : 'maximize_conversions',
      cpaTarget: campaignData.targetCPA?.toString(),
      roasTarget: campaignData.targetROAS?.toString(),
      idExterne: campaignId,
      dateDebut: new Date(),
      metadonneesML: JSON.stringify({
        keywords: campaignData.keywords || [],
        geoTargeting: campaignData.geoTargeting || [],
      }),
    };

    await db.insert(campagnesPublicitaires).values(insertData);
  }

  private mapCampaignType(googleType: string): 'search' | 'display' | 'video' | 'shopping' | 'performance_max' | 'social_media' {
    const mapping: Record<string, any> = {
      'SEARCH': 'search',
      'DISPLAY': 'display',
      'VIDEO': 'video',
      'SHOPPING': 'shopping',
      'PERFORMANCE_MAX': 'performance_max',
    };
    return mapping[googleType] || 'search';
  }

  private async addKeywords(campaignId: string, keywords: string[]): Promise<void> {
    try {
      // Créer un ad group pour les mots-clés
      const adGroupResponse = await this.makeRequest(
        `customers/${this.config.customerId}/adGroups:mutate`,
        'POST',
        {
          operations: [{
            create: {
              name: 'Ad Group Principal',
              campaign: `customers/${this.config.customerId}/campaigns/${campaignId}`,
              status: 'ENABLED',
              type: 'SEARCH_STANDARD',
              cpc_bid_micros: 1000000, // 1€ par défaut
            },
          }],
        }
      );

      const adGroupResourceName = adGroupResponse.results[0].resource_name;

      // Ajouter les mots-clés
      const keywordOperations = keywords.map(keyword => ({
        create: {
          ad_group: adGroupResourceName,
          status: 'ENABLED',
          keyword: {
            text: keyword,
            match_type: 'BROAD',
          },
        },
      }));

      await this.makeRequest(
        `customers/${this.config.customerId}/adGroupCriteria:mutate`,
        'POST',
        { operations: keywordOperations }
      );

      console.log(`✅ ${keywords.length} mots-clés ajoutés`);

    } catch (error) {
      console.error('❌ Erreur ajout mots-clés:', error);
      throw error;
    }
  }

  /**
   * Recommandations automatiques basées sur l'IA
   */
  async getAIRecommendations(campaignId: string): Promise<any[]> {
    try {
      console.log(`🤖 Génération recommandations IA pour campagne ${campaignId}`);

      const query = `
        SELECT 
          recommendation.type,
          recommendation.impact,
          recommendation.resource_name
        FROM recommendation 
        WHERE recommendation.campaign = 'customers/${this.config.customerId}/campaigns/${campaignId}'
        AND recommendation.dismissed != true
      `;

      const response = await this.makeRequest(
        `customers/${this.config.customerId}/googleAds:search`,
        'POST',
        { query }
      );

      const recommendations = response.results || [];
      console.log(`✅ ${recommendations.length} recommandations trouvées`);

      return recommendations.map(rec => ({
        type: rec.recommendation.type,
        impact: rec.recommendation.impact,
        resourceName: rec.recommendation.resource_name,
      }));

    } catch (error) {
      console.error('❌ Erreur récupération recommandations:', error);
      throw error;
    }
  }
}

// Instance singleton
export const googleAdsClient = new GoogleAdsClient();