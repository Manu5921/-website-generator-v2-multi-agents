// =============================================================================
// 📘 FACEBOOK ADS API CLIENT - INTÉGRATION COMPLÈTE AVEC PIXEL & CONVERSIONS API
// =============================================================================

import { db } from '@/lib/db';
import { 
  campagnesPublicitaires, 
  metriquesCampagnes, 
  creatifsPublicitaires,
  customerJourney,
  InsertCampagnePublicitaire,
  InsertMetriqueCampagne,
  InsertCreatifPublicitaire,
  InsertCustomerJourney
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Interface pour la configuration Facebook Ads
 */
export interface FacebookAdsConfig {
  appId: string;
  appSecret: string;
  accessToken: string;
  adAccountId: string;
  pixelId: string;
  verifyToken: string;
}

/**
 * Interface pour les événements Pixel
 */
export interface PixelEvent {
  event_name: string;
  event_time: number;
  user_data: {
    em?: string; // Email hashé
    ph?: string; // Téléphone hashé
    fn?: string; // Prénom hashé
    ln?: string; // Nom hashé
    external_id?: string;
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook Click ID
    fbp?: string; // Facebook Browser ID
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_ids?: string[];
    content_type?: string;
    content_name?: string;
    content_category?: string;
    num_items?: number;
  };
  event_source_url?: string;
  action_source: 'website' | 'email' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'app';
}

/**
 * Interface pour les données de campagne Facebook
 */
export interface FacebookCampaignData {
  name: string;
  objective: 'CONVERSIONS' | 'TRAFFIC' | 'REACH' | 'BRAND_AWARENESS' | 'LEAD_GENERATION' | 'APP_INSTALLS';
  budget: number;
  budgetType: 'DAILY' | 'LIFETIME';
  targeting: {
    age_min?: number;
    age_max?: number;
    genders?: number[]; // 1 = Male, 2 = Female
    geo_locations?: {
      countries?: string[];
      regions?: any[];
      cities?: any[];
    };
    interests?: any[];
    behaviors?: any[];
    custom_audiences?: string[];
    lookalike_audiences?: string[];
  };
  placement?: string[];
  bidStrategy?: 'LOWEST_COST_WITHOUT_CAP' | 'LOWEST_COST_WITH_BID_CAP' | 'TARGET_COST';
  bidAmount?: number;
}

class FacebookAdsClient {
  private config: FacebookAdsConfig;
  private apiVersion = 'v19.0';
  private baseUrl = `https://graph.facebook.com/${this.apiVersion}`;

  constructor() {
    this.config = {
      appId: process.env.FACEBOOK_APP_ID || '',
      appSecret: process.env.FACEBOOK_APP_SECRET || '',
      accessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
      adAccountId: process.env.FACEBOOK_AD_ACCOUNT_ID || '',
      pixelId: process.env.FACEBOOK_PIXEL_ID || '',
      verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || '',
    };
  }

  /**
   * Effectuer une requête à l'API Facebook
   */
  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    try {
      const url = `${this.baseUrl}/${endpoint}`;
      const queryParams = new URLSearchParams({
        access_token: this.config.accessToken,
      });

      const fullUrl = method === 'GET' && body ? 
        `${url}?${queryParams}&${new URLSearchParams(body)}` : 
        `${url}?${queryParams}`;

      const response = await fetch(fullUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method !== 'GET' ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Erreur API Facebook: ${response.status} - ${errorData}`);
        throw new Error(`Facebook API Error: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('❌ Erreur requête Facebook Ads:', error);
      throw error;
    }
  }

  /**
   * Récupérer les campagnes du compte publicitaire
   */
  async getCampaigns(): Promise<any[]> {
    try {
      console.log('📊 Récupération des campagnes Facebook Ads...');

      const response = await this.makeRequest(
        `act_${this.config.adAccountId}/campaigns`,
        'GET',
        {
          fields: 'id,name,status,objective,budget_rebalance_flag,daily_budget,lifetime_budget,created_time,updated_time',
        }
      );

      const campaigns = response.data || [];
      console.log(`✅ ${campaigns.length} campagnes récupérées`);

      return campaigns;

    } catch (error) {
      console.error('❌ Erreur récupération campagnes Facebook:', error);
      throw error;
    }
  }

  /**
   * Récupérer les métriques de performance
   */
  async getCampaignInsights(dateStart: string, dateEnd: string): Promise<any[]> {
    try {
      console.log(`📈 Récupération insights Facebook ${dateStart} à ${dateEnd}...`);

      const response = await this.makeRequest(
        `act_${this.config.adAccountId}/insights`,
        'GET',
        {
          time_range: JSON.stringify({
            since: dateStart,
            until: dateEnd,
          }),
          fields: 'campaign_id,campaign_name,impressions,clicks,spend,actions,cost_per_action_type,cpm,cpc,ctr,frequency,reach,date_start,date_stop',
          level: 'campaign',
          action_attribution_windows: JSON.stringify(['7d_click', '1d_view']),
        }
      );

      const insights = response.data || [];
      console.log(`✅ ${insights.length} insights récupérés`);

      return insights;

    } catch (error) {
      console.error('❌ Erreur récupération insights Facebook:', error);
      throw error;
    }
  }

  /**
   * Créer une nouvelle campagne Facebook Ads
   */
  async createCampaign(siteId: string, campaignData: FacebookCampaignData): Promise<string> {
    try {
      console.log(`🚀 Création campagne Facebook: ${campaignData.name}`);

      // 1. Créer la campagne
      const campaignResponse = await this.makeRequest(
        `act_${this.config.adAccountId}/campaigns`,
        'POST',
        {
          name: campaignData.name,
          objective: campaignData.objective,
          status: 'PAUSED', // Démarrer en pause
          special_ad_categories: [],
        }
      );

      const campaignId = campaignResponse.id;

      // 2. Créer l'ad set (ensemble de publicités)
      const adSetData = {
        name: `AdSet - ${campaignData.name}`,
        campaign_id: campaignId,
        status: 'PAUSED',
        targeting: campaignData.targeting,
        billing_event: 'IMPRESSIONS',
        optimization_goal: this.getOptimizationGoal(campaignData.objective),
        bid_strategy: campaignData.bidStrategy || 'LOWEST_COST_WITHOUT_CAP',
        promoted_object: {
          pixel_id: this.config.pixelId,
          custom_event_type: 'PURCHASE',
        },
      };

      // Ajouter le budget
      if (campaignData.budgetType === 'DAILY') {
        adSetData.daily_budget = Math.round(campaignData.budget * 100); // En centimes
      } else {
        adSetData.lifetime_budget = Math.round(campaignData.budget * 100);
      }

      // Ajouter le bid amount si spécifié
      if (campaignData.bidAmount) {
        adSetData.bid_amount = Math.round(campaignData.bidAmount * 100);
      }

      const adSetResponse = await this.makeRequest(
        `act_${this.config.adAccountId}/adsets`,
        'POST',
        adSetData
      );

      const adSetId = adSetResponse.id;

      // 3. Sauvegarder en base de données
      await this.saveCampaignToDB(siteId, campaignId, campaignData, adSetId);

      console.log(`✅ Campagne Facebook créée: ${campaignId}`);
      return campaignId;

    } catch (error) {
      console.error('❌ Erreur création campagne Facebook:', error);
      throw error;
    }
  }

  /**
   * Créer une publicité (Ad Creative + Ad)
   */
  async createAd(
    adSetId: string, 
    creative: {
      name: string;
      title: string;
      body: string;
      image_url?: string;
      video_id?: string;
      call_to_action: string;
      link_url: string;
    }
  ): Promise<string> {
    try {
      console.log(`🎨 Création publicité pour AdSet ${adSetId}`);

      // 1. Créer l'Ad Creative
      const adCreativeData = {
        name: creative.name,
        object_story_spec: {
          page_id: process.env.FACEBOOK_PAGE_ID, // ID de la page Facebook
          link_data: {
            link: creative.link_url,
            message: creative.body,
            name: creative.title,
            call_to_action: {
              type: creative.call_to_action,
            },
          },
        },
      };

      // Ajouter l'image ou la vidéo
      if (creative.image_url) {
        adCreativeData.object_story_spec.link_data.picture = creative.image_url;
      } else if (creative.video_id) {
        adCreativeData.object_story_spec.video_data = {
          video_id: creative.video_id,
          title: creative.title,
          message: creative.body,
          call_to_action: {
            type: creative.call_to_action,
            value: {
              link: creative.link_url,
            },
          },
        };
        delete adCreativeData.object_story_spec.link_data;
      }

      const creativeResponse = await this.makeRequest(
        `act_${this.config.adAccountId}/adcreatives`,
        'POST',
        adCreativeData
      );

      const creativeId = creativeResponse.id;

      // 2. Créer la publicité
      const adResponse = await this.makeRequest(
        `act_${this.config.adAccountId}/ads`,
        'POST',
        {
          name: creative.name,
          adset_id: adSetId,
          creative: {
            creative_id: creativeId,
          },
          status: 'PAUSED',
        }
      );

      console.log(`✅ Publicité créée: ${adResponse.id}`);
      return adResponse.id;

    } catch (error) {
      console.error('❌ Erreur création publicité:', error);
      throw error;
    }
  }

  /**
   * Envoyer des événements via la Conversions API
   */
  async sendConversionEvent(event: PixelEvent): Promise<void> {
    try {
      console.log(`📡 Envoi événement conversion: ${event.event_name}`);

      // Hasher les données PII
      if (event.user_data.em) {
        event.user_data.em = this.hashData(event.user_data.em.toLowerCase());
      }
      if (event.user_data.ph) {
        event.user_data.ph = this.hashData(event.user_data.ph.replace(/[^0-9]/g, ''));
      }
      if (event.user_data.fn) {
        event.user_data.fn = this.hashData(event.user_data.fn.toLowerCase());
      }
      if (event.user_data.ln) {
        event.user_data.ln = this.hashData(event.user_data.ln.toLowerCase());
      }

      const response = await this.makeRequest(
        `${this.config.pixelId}/events`,
        'POST',
        {
          data: [event],
          test_event_code: process.env.NODE_ENV === 'development' ? 'TEST12345' : undefined,
        }
      );

      console.log(`✅ Événement envoyé: ${response.events_received} événements reçus`);

    } catch (error) {
      console.error('❌ Erreur envoi événement conversion:', error);
      throw error;
    }
  }

  /**
   * Synchroniser les métriques avec la base de données
   */
  async syncMetricsToDB(siteId: string): Promise<void> {
    try {
      console.log('🔄 Synchronisation métriques Facebook Ads...');

      // Récupérer les insights des 7 derniers jours
      const dateEnd = new Date().toISOString().split('T')[0];
      const dateStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const insights = await this.getCampaignInsights(dateStart, dateEnd);

      for (const insight of insights) {
        // Vérifier si la campagne existe en DB
        const [campaign] = await db.select()
          .from(campagnesPublicitaires)
          .where(
            and(
              eq(campagnesPublicitaires.idExterne, insight.campaign_id),
              eq(campagnesPublicitaires.siteId, siteId)
            )
          )
          .limit(1);

        if (!campaign) {
          console.warn(`⚠️ Campagne Facebook ${insight.campaign_id} non trouvée en DB`);
          continue;
        }

        // Extraire les conversions et leurs valeurs
        const actions = insight.actions || [];
        const conversions = actions.find(action => 
          action.action_type === 'purchase' || action.action_type === 'lead'
        );
        const conversionValue = actions.find(action => 
          action.action_type === 'purchase' || action.action_type === 'lead'
        );

        // Calculer les métriques
        const impressions = parseInt(insight.impressions || '0');
        const clicks = parseInt(insight.clicks || '0');
        const spend = parseFloat(insight.spend || '0');
        const conversionCount = conversions ? parseFloat(conversions.value || '0') : 0;
        const conversionVal = conversionValue ? parseFloat(conversionValue.value || '0') : 0;

        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cpc = clicks > 0 ? spend / clicks : 0;
        const cpa = conversionCount > 0 ? spend / conversionCount : 0;
        const roas = spend > 0 ? conversionVal / spend : 0;

        // Vérifier si la métrique existe déjà
        const metricDate = new Date(insight.date_start);
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
          impressions,
          clics: clicks,
          depense: spend.toString(),
          conversions: conversionCount,
          valeurConversions: conversionVal.toString(),
          ctr: ctr.toString(),
          cpc: cpc.toString(),
          cpa: cpa.toString(),
          roas: roas.toString(),
          tauxConversion: clicks > 0 ? (conversionCount / clicks * 100).toString() : '0',
          donneesDetaillees: JSON.stringify({
            reach: insight.reach,
            frequency: insight.frequency,
            cpm: insight.cpm,
            actions: insight.actions,
          }),
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

      console.log(`✅ ${insights.length} métriques Facebook synchronisées`);

    } catch (error) {
      console.error('❌ Erreur synchronisation métriques Facebook:', error);
      throw error;
    }
  }

  /**
   * Créer une audience personnalisée (Custom Audience)
   */
  async createCustomAudience(
    name: string, 
    description: string, 
    customerList?: string[]
  ): Promise<string> {
    try {
      console.log(`👥 Création audience personnalisée: ${name}`);

      const audienceData = {
        name,
        description,
        subtype: customerList ? 'CUSTOM' : 'WEBSITE',
        customer_file_source: customerList ? 'USER_PROVIDED_ONLY' : 'WEBSITE',
      };

      // Si c'est une audience basée sur le pixel
      if (!customerList) {
        audienceData.rule = JSON.stringify({
          inclusions: {
            operator: 'or',
            rules: [
              {
                event_sources: [
                  {
                    id: this.config.pixelId,
                    type: 'pixel',
                  },
                ],
                retention_seconds: 2592000, // 30 jours
                filter: {
                  operator: 'and',
                  filters: [
                    {
                      field: 'event',
                      operator: 'eq',
                      value: 'PageView',
                    },
                  ],
                },
              },
            ],
          },
        });
      }

      const response = await this.makeRequest(
        `act_${this.config.adAccountId}/customaudiences`,
        'POST',
        audienceData
      );

      // Si on a une liste de clients, l'uploader
      if (customerList && customerList.length > 0) {
        await this.uploadCustomerList(response.id, customerList);
      }

      console.log(`✅ Audience créée: ${response.id}`);
      return response.id;

    } catch (error) {
      console.error('❌ Erreur création audience:', error);
      throw error;
    }
  }

  /**
   * Créer une audience similaire (Lookalike Audience)
   */
  async createLookalikeAudience(
    name: string,
    sourceAudienceId: string,
    targetCountries: string[],
    ratio: number = 0.01 // 1% par défaut
  ): Promise<string> {
    try {
      console.log(`🎯 Création audience similaire: ${name}`);

      const response = await this.makeRequest(
        `act_${this.config.adAccountId}/customaudiences`,
        'POST',
        {
          name,
          subtype: 'LOOKALIKE',
          origin_audience_id: sourceAudienceId,
          lookalike_spec: {
            ratio,
            country: targetCountries[0], // Facebook ne prend qu'un pays pour les LAL
          },
        }
      );

      console.log(`✅ Audience similaire créée: ${response.id}`);
      return response.id;

    } catch (error) {
      console.error('❌ Erreur création audience similaire:', error);
      throw error;
    }
  }

  // =============================================================================
  // MÉTHODES PRIVÉES
  // =============================================================================

  private hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private getOptimizationGoal(objective: string): string {
    const mapping = {
      'CONVERSIONS': 'OFFSITE_CONVERSIONS',
      'TRAFFIC': 'LINK_CLICKS',
      'REACH': 'REACH',
      'BRAND_AWARENESS': 'BRAND_AWARENESS',
      'LEAD_GENERATION': 'LEAD_GENERATION',
      'APP_INSTALLS': 'APP_INSTALLS',
    };
    return mapping[objective] || 'OFFSITE_CONVERSIONS';
  }

  private async saveCampaignToDB(
    siteId: string, 
    campaignId: string, 
    campaignData: FacebookCampaignData,
    adSetId: string
  ): Promise<void> {
    const insertData: InsertCampagnePublicitaire = {
      siteId,
      nom: campaignData.name,
      plateforme: 'facebook_ads',
      type: 'social_media',
      statut: 'draft',
      budgetQuotidien: campaignData.budgetType === 'DAILY' ? campaignData.budget.toString() : '0',
      budgetTotal: campaignData.budgetType === 'LIFETIME' ? campaignData.budget.toString() : undefined,
      objectif: this.mapObjective(campaignData.objective),
      secteurCible: 'general',
      audienceCible: JSON.stringify(campaignData.targeting),
      strategieEncheres: campaignData.bidStrategy === 'TARGET_COST' ? 'target_cpa' : 'maximize_conversions',
      idExterne: campaignId,
      dateDebut: new Date(),
      metadonneesML: JSON.stringify({
        adSetId,
        placement: campaignData.placement || [],
        bidAmount: campaignData.bidAmount,
      }),
    };

    await db.insert(campagnesPublicitaires).values(insertData);
  }

  private mapObjective(facebookObjective: string): 'conversions' | 'leads' | 'traffic' | 'awareness' | 'app_installs' | 'sales' {
    const mapping = {
      'CONVERSIONS': 'conversions',
      'LEAD_GENERATION': 'leads',
      'TRAFFIC': 'traffic',
      'BRAND_AWARENESS': 'awareness',
      'REACH': 'awareness',
      'APP_INSTALLS': 'app_installs',
    };
    return mapping[facebookObjective] || 'conversions';
  }

  private async uploadCustomerList(audienceId: string, customerList: string[]): Promise<void> {
    try {
      // Hasher les emails
      const hashedEmails = customerList.map(email => this.hashData(email.toLowerCase()));

      await this.makeRequest(
        `${audienceId}/users`,
        'POST',
        {
          payload: {
            schema: ['EMAIL_SHA256'],
            data: hashedEmails.map(email => [email]),
          },
        }
      );

      console.log(`✅ ${customerList.length} emails uploadés dans l'audience`);

    } catch (error) {
      console.error('❌ Erreur upload liste clients:', error);
      throw error;
    }
  }

  /**
   * Webhook pour recevoir les événements en temps réel
   */
  async handleWebhook(body: any, signature: string): Promise<boolean> {
    try {
      // Vérifier la signature
      const expectedSignature = crypto
        .createHmac('sha256', this.config.appSecret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (`sha256=${expectedSignature}` !== signature) {
        console.error('❌ Signature webhook Facebook invalide');
        return false;
      }

      // Traiter les événements
      if (body.object === 'page') {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.field === 'leadgen') {
              await this.processLeadGenEvent(change.value);
            }
          }
        }
      }

      return true;

    } catch (error) {
      console.error('❌ Erreur traitement webhook Facebook:', error);
      return false;
    }
  }

  private async processLeadGenEvent(leadData: any): Promise<void> {
    try {
      console.log(`📝 Nouveau lead Facebook: ${leadData.leadgen_id}`);

      // Récupérer les détails du lead
      const leadDetails = await this.makeRequest(
        `${leadData.leadgen_id}`,
        'GET',
        { fields: 'id,created_time,ad_id,form_id,field_data' }
      );

      // Traiter et sauvegarder le lead
      const leadInfo = {
        leadId: leadDetails.id,
        adId: leadDetails.ad_id,
        formId: leadDetails.form_id,
        createdTime: leadDetails.created_time,
        fieldData: leadDetails.field_data,
      };

      // Ici vous pouvez sauvegarder le lead en base de données
      // et déclencher des workflows automatiques

      console.log(`✅ Lead traité: ${JSON.stringify(leadInfo)}`);

    } catch (error) {
      console.error('❌ Erreur traitement lead:', error);
    }
  }
}

// Instance singleton
export const facebookAdsClient = new FacebookAdsClient();