// =============================================================================
// 🚀 ROUTE CRÉATION CAMPAGNE TEST GOOGLE ADS - BUDGET 50€
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { googleAdsClient, CreateCampaignData } from '@/lib/ads-management/google-ads-client';
import { db } from '@/lib/db';
import { parametresSysteme } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Créer une campagne de test Google Ads avec budget limité
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Création campagne test Google Ads (Budget 50€)...');

    const body = await request.json();
    const { siteId } = body;

    if (!siteId) {
      return NextResponse.json({
        success: false,
        error: 'Site ID manquant',
      }, { status: 400 });
    }

    // Vérifier la présence des tokens
    const refreshTokenResult = await db.select()
      .from(parametresSysteme)
      .where(eq(parametresSysteme.cle, 'google_ads_refresh_token'))
      .limit(1);

    if (refreshTokenResult.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Google Ads non configuré. Veuillez d\'abord vous authentifier.',
        requiresAuth: true,
      }, { status: 401 });
    }

    // Configuration de la campagne test selon les consignes
    const testCampaignData: CreateCampaignData = {
      name: `Site Web IA - Test ${new Date().toLocaleDateString('fr-FR')}`,
      type: 'SEARCH',
      budget: 50, // Budget limité à 50€ selon les consignes
      targetCPA: 25, // CPA cible à 25€ pour optimiser les conversions
      keywords: [
        // Mots-clés selon les consignes
        'génération site web IA',
        'création site automatique',
        'site web automatique IA',
        'générateur site web',
        'création site internet IA',
        'site web intelligence artificielle',
        'création site web rapide',
        'site web PME automatique',
        'générateur site restaurant',
        'site web coiffeur automatique',
        'création site artisan IA',
      ],
      geoTargeting: ['France'], // Ciblage France selon les consignes
      audiences: [
        {
          type: 'CUSTOM_INTENT',
          name: 'PME Secteurs Ciblés',
          interests: [
            'restaurant',
            'coiffeur', 
            'artisan',
            'services locaux',
            'petite entreprise',
          ],
        },
      ],
    };

    // Créer la campagne
    const campaignId = await googleAdsClient.createCampaign(siteId, testCampaignData);

    // Sauvegarder les informations de la campagne test
    await db.insert(parametresSysteme).values({
      cle: 'google_ads_test_campaign_id',
      valeur: campaignId,
      description: 'ID de la campagne test Google Ads (50€ budget)',
      sensible: false,
    }).onConflictDoUpdate({
      target: parametresSysteme.cle,
      set: {
        valeur: campaignId,
        dateModification: new Date(),
      },
    });

    // Programmer le suivi des métriques
    await scheduleMetricsTracking(campaignId, siteId);

    console.log('✅ Campagne test créée avec succès:', campaignId);

    return NextResponse.json({
      success: true,
      campaignId,
      campaignName: testCampaignData.name,
      budget: testCampaignData.budget,
      keywords: testCampaignData.keywords,
      message: 'Campagne test créée avec succès. Validation requise avant activation.',
      nextSteps: [
        'Vérifier la configuration de la campagne',
        'Valider les mots-clés et audiences',
        'Activer la campagne après approbation',
        'Surveiller les performances en temps réel',
      ],
    });

  } catch (error) {
    console.error('❌ Erreur création campagne test:', error);

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création de la campagne test',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 });
  }
}

/**
 * Obtenir le statut de la campagne test
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Récupération statut campagne test...');

    // Récupérer l'ID de la campagne test
    const testCampaignResult = await db.select()
      .from(parametresSysteme)
      .where(eq(parametresSysteme.cle, 'google_ads_test_campaign_id'))
      .limit(1);

    if (testCampaignResult.length === 0) {
      return NextResponse.json({
        success: true,
        testCampaign: null,
        message: 'Aucune campagne test trouvée',
      });
    }

    const campaignId = testCampaignResult[0].valeur;

    // Récupérer les métriques de la campagne
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const metrics = await googleAdsClient.getCampaignMetrics(weekAgo, today);
      const campaignMetrics = metrics.filter(m => m.campaignId === campaignId);

      // Calculer les totaux
      const totals = campaignMetrics.reduce((acc, metric) => ({
        impressions: acc.impressions + metric.impressions,
        clicks: acc.clicks + metric.clicks,
        cost: acc.cost + metric.cost,
        conversions: acc.conversions + metric.conversions,
        conversionValue: acc.conversionValue + metric.conversionValue,
      }), {
        impressions: 0,
        clicks: 0, 
        cost: 0,
        conversions: 0,
        conversionValue: 0,
      });

      // Calculer les métriques dérivées
      const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions * 100) : 0;
      const cpc = totals.clicks > 0 ? (totals.cost / totals.clicks) : 0;
      const cpa = totals.conversions > 0 ? (totals.cost / totals.conversions) : 0;
      const roas = totals.cost > 0 ? (totals.conversionValue / totals.cost) : 0;

      return NextResponse.json({
        success: true,
        testCampaign: {
          campaignId,
          status: 'active',
          budget: 50,
          metrics: {
            period: '7 derniers jours',
            impressions: totals.impressions,
            clicks: totals.clicks,
            cost: Math.round(totals.cost * 100) / 100,
            conversions: totals.conversions,
            conversionValue: Math.round(totals.conversionValue * 100) / 100,
            ctr: Math.round(ctr * 100) / 100,
            cpc: Math.round(cpc * 100) / 100,
            cpa: Math.round(cpa * 100) / 100,
            roas: Math.round(roas * 100) / 100,
          },
          performance: {
            budgetUsed: totals.cost,
            budgetRemaining: Math.max(0, 50 - totals.cost),
            dailyAverage: Math.round((totals.cost / 7) * 100) / 100,
            projection: {
              monthly: Math.round((totals.cost / 7 * 30) * 100) / 100,
              conversionRate: totals.clicks > 0 ? Math.round((totals.conversions / totals.clicks * 100) * 100) / 100 : 0,
            },
          },
        },
        message: 'Métriques campagne test récupérées avec succès',
      });

    } catch (metricsError) {
      console.warn('⚠️ Impossible de récupérer les métriques:', metricsError);
      
      return NextResponse.json({
        success: true,
        testCampaign: {
          campaignId,
          status: 'created',
          budget: 50,
          message: 'Campagne créée, métriques en cours de collecte',
        },
      });
    }

  } catch (error) {
    console.error('❌ Erreur récupération statut campagne:', error);

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération du statut',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 });
  }
}

/**
 * Programmer le suivi des métriques
 */
async function scheduleMetricsTracking(campaignId: string, siteId: string): Promise<void> {
  try {
    // Sauvegarder la configuration de tracking
    const trackingConfig = {
      campaignId,
      siteId,
      trackingEnabled: true,
      lastSync: new Date().toISOString(),
      syncFrequency: 'hourly', // Selon les consignes pour le temps réel
      alertThresholds: {
        dailyBudget: 10, // Alerte si plus de 10€/jour
        cpa: 30, // Alerte si CPA > 30€
        ctr: 1, // Alerte si CTR < 1%
      },
    };

    await db.insert(parametresSysteme).values({
      cle: 'google_ads_tracking_config',
      valeur: JSON.stringify(trackingConfig),
      description: 'Configuration du tracking automatique Google Ads',
      sensible: false,
    }).onConflictDoUpdate({
      target: parametresSysteme.cle,
      set: {
        valeur: JSON.stringify(trackingConfig),
        dateModification: new Date(),
      },
    });

    console.log('✅ Tracking automatique configuré');

  } catch (error) {
    console.error('❌ Erreur configuration tracking:', error);
    throw error;
  }
}