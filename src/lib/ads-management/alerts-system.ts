// =============================================================================
// 🚨 SYSTÈME D'ALERTES AUTOMATIQUES - SURVEILLANCE INTELLIGENTE DES CAMPAGNES
// =============================================================================

import { db } from '@/lib/db';
import { 
  alertesAds,
  campagnesPublicitaires,
  metriquesCampagnes,
  creatifsPublicitaires,
  revenusCommissions,
  InsertAlerteAds
} from '@/lib/db/schema';
import { eq, and, gte, lte, desc, sql, avg, sum } from 'drizzle-orm';
import { roiAnalytics } from './roi-analytics';
import { mlAlgorithms } from './ml-algorithms';

/**
 * Interface pour la configuration des seuils d'alerte
 */
export interface AlertThresholds {
  siteId: string;
  roisMinimum: number;        // ROI minimum acceptable (%)
  cpaMaximum: number;         // CPA maximum acceptable (€)
  budgetUtilization: number;  // % utilisation budget avant alerte
  ctrMinimum: number;         // CTR minimum acceptable (%)
  conversionDropPercent: number; // % chute conversions pour alerte
  spendIncrease: number;      // % augmentation dépenses pour alerte
  customThresholds?: {
    [campaignId: string]: Partial<AlertThresholds>;
  };
}

/**
 * Interface pour les actions automatiques recommandées
 */
export interface AutomatedAction {
  type: 'pause_campaign' | 'reduce_budget' | 'increase_budget' | 'change_bidding' | 'alert_only';
  campaignId: string;
  description: string;
  parameters?: any;
  confidence: number;
  expectedImpact: number;
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Interface pour les opportunités détectées
 */
export interface OpportunityAlert {
  type: 'scale_winner' | 'new_audience' | 'seasonal_boost' | 'competitor_gap' | 'keyword_opportunity';
  campaignId?: string;
  title: string;
  description: string;
  potentialGain: number;
  implementation: string;
  priority: 'high' | 'medium' | 'low';
}

class AlertsSystem {
  private defaultThresholds: Omit<AlertThresholds, 'siteId'> = {
    roisMinimum: 0,           // ROI négatif déclenche alerte
    cpaMaximum: 100,          // CPA > 100€ déclenche alerte
    budgetUtilization: 80,    // 80% budget utilisé déclenche alerte
    ctrMinimum: 1.0,          // CTR < 1% déclenche alerte
    conversionDropPercent: 30, // Chute de 30% conversions déclenche alerte
    spendIncrease: 50,        // Augmentation 50% dépenses déclenche alerte
  };

  /**
   * Surveiller toutes les campagnes et déclencher des alertes
   */
  async monitorAllCampaigns(): Promise<void> {
    try {
      console.log('🔍 Surveillance globale des campagnes...');

      // Récupérer tous les sites avec des campagnes actives
      const activeSites = await db.select({
        siteId: campagnesPublicitaires.siteId,
      })
      .from(campagnesPublicitaires)
      .where(eq(campagnesPublicitaires.statut, 'active'))
      .groupBy(campagnesPublicitaires.siteId);

      let totalAlerts = 0;

      for (const site of activeSites) {
        const alerts = await this.monitorSite(site.siteId);
        totalAlerts += alerts;
      }

      console.log(`✅ Surveillance terminée: ${totalAlerts} alertes générées pour ${activeSites.length} sites`);

    } catch (error) {
      console.error('❌ Erreur surveillance globale:', error);
      throw error;
    }
  }

  /**
   * Surveiller un site spécifique
   */
  async monitorSite(siteId: string, customThresholds?: Partial<AlertThresholds>): Promise<number> {
    try {
      console.log(`🎯 Surveillance site ${siteId}...`);

      const thresholds: AlertThresholds = {
        siteId,
        ...this.defaultThresholds,
        ...customThresholds,
      };

      let alertCount = 0;

      // 1. Vérifier les métriques de performance
      alertCount += await this.checkPerformanceAlerts(siteId, thresholds);

      // 2. Vérifier les budgets
      alertCount += await this.checkBudgetAlerts(siteId, thresholds);

      // 3. Détecter les anomalies
      alertCount += await this.detectAnomalies(siteId);

      // 4. Identifier les opportunités
      alertCount += await this.detectOpportunities(siteId);

      // 5. Vérifier les alertes de commission
      alertCount += await this.checkCommissionAlerts(siteId);

      // 6. Générer des recommandations d'actions automatiques
      await this.generateAutomatedActions(siteId, thresholds);

      console.log(`✅ Site ${siteId}: ${alertCount} alertes générées`);
      return alertCount;

    } catch (error) {
      console.error(`❌ Erreur surveillance site ${siteId}:`, error);
      throw error;
    }
  }

  /**
   * Vérifier les alertes de performance
   */
  private async checkPerformanceAlerts(
    siteId: string, 
    thresholds: AlertThresholds
  ): Promise<number> {
    try {
      const alertsCreated: InsertAlerteAds[] = [];
      
      // Métriques des 24 dernières heures
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const now = new Date();

      const campaignMetrics = await db.select({
        campaignId: campagnesPublicitaires.id,
        campaignName: campagnesPublicitaires.nom,
        plateforme: campagnesPublicitaires.plateforme,
        avgROAS: avg(metriquesCampagnes.roas),
        avgCPA: avg(metriquesCampagnes.cpa),
        avgCTR: avg(metriquesCampagnes.ctr),
        totalConversions: sum(metriquesCampagnes.conversions),
        totalSpend: sum(metriquesCampagnes.depense),
      })
      .from(campagnesPublicitaires)
      .leftJoin(creatifsPublicitaires, eq(campagnesPublicitaires.id, creatifsPublicitaires.campagneId))
      .leftJoin(metriquesCampagnes, eq(creatifsPublicitaires.id, metriquesCampagnes.creatifId))
      .where(
        and(
          eq(campagnesPublicitaires.siteId, siteId),
          eq(campagnesPublicitaires.statut, 'active'),
          gte(metriquesCampagnes.date, yesterday)
        )
      )
      .groupBy(
        campagnesPublicitaires.id,
        campagnesPublicitaires.nom,
        campagnesPublicitaires.plateforme
      );

      for (const campaign of campaignMetrics) {
        const avgROAS = Number(campaign.avgROAS) || 0;
        const avgCPA = Number(campaign.avgCPA) || 0;
        const avgCTR = Number(campaign.avgCTR) || 0;
        const totalSpend = Number(campaign.totalSpend) || 0;

        // Calcul ROI simplifié
        const roi = avgROAS > 0 ? (avgROAS - 1) * 100 : -100;

        // Alerte ROI faible
        if (roi < thresholds.roisMinimum) {
          alertsCreated.push({
            siteId,
            campagneId: campaign.campaignId,
            type: 'roas_faible',
            severite: roi < -50 ? 'critical' : 'warning',
            titre: 'ROI Critique',
            message: `Campagne "${campaign.campaignName}" (${campaign.plateforme}): ROI de ${roi.toFixed(1)}%`,
            seuilDeclenche: thresholds.roisMinimum.toString(),
            valeurActuelle: roi.toString(),
            recommandationAction: roi < -50 ? 'Pauser immédiatement la campagne' : 'Optimiser le targeting et les enchères',
            actionRecommandee: JSON.stringify({
              type: roi < -50 ? 'pause_campaign' : 'optimize_targeting',
              urgency: roi < -50 ? 'immediate' : 'high'
            }),
          });
        }

        // Alerte CPA élevé
        if (avgCPA > thresholds.cpaMaximum) {
          alertsCreated.push({
            siteId,
            campagneId: campaign.campaignId,
            type: 'cpa_eleve',
            severite: avgCPA > thresholds.cpaMaximum * 2 ? 'critical' : 'warning',
            titre: 'CPA Élevé',
            message: `Campagne "${campaign.campaignName}": CPA de ${avgCPA.toFixed(2)}€`,
            seuilDeclenche: thresholds.cpaMaximum.toString(),
            valeurActuelle: avgCPA.toString(),
            recommandationAction: 'Ajuster la stratégie d\'enchères ou améliorer la qualité des créatifs',
            actionRecommandee: JSON.stringify({
              type: 'adjust_bidding',
              suggestedCPA: thresholds.cpaMaximum * 0.8
            }),
          });
        }

        // Alerte CTR faible
        if (avgCTR < thresholds.ctrMinimum) {
          alertsCreated.push({
            siteId,
            campagneId: campaign.campaignId,
            type: 'conversion_drop',
            severite: 'warning',
            titre: 'CTR Faible',
            message: `Campagne "${campaign.campaignName}": CTR de ${avgCTR.toFixed(2)}%`,
            seuilDeclenche: thresholds.ctrMinimum.toString(),
            valeurActuelle: avgCTR.toString(),
            recommandationAction: 'Tester de nouveaux créatifs ou ajuster le targeting',
            actionRecommandee: JSON.stringify({
              type: 'test_new_creatives',
              priority: 'medium'
            }),
          });
        }
      }

      if (alertsCreated.length > 0) {
        await db.insert(alertesAds).values(alertsCreated);
        console.log(`📊 ${alertsCreated.length} alertes de performance créées`);
      }

      return alertsCreated.length;

    } catch (error) {
      console.error('❌ Erreur vérification alertes performance:', error);
      return 0;
    }
  }

  /**
   * Vérifier les alertes de budget
   */
  private async checkBudgetAlerts(
    siteId: string,
    thresholds: AlertThresholds
  ): Promise<number> {
    try {
      const alertsCreated: InsertAlerteAds[] = [];

      const campaigns = await db.select({
        id: campagnesPublicitaires.id,
        nom: campagnesPublicitaires.nom,
        budgetQuotidien: campagnesPublicitaires.budgetQuotidien,
        budgetTotal: campagnesPublicitaires.budgetTotal,
      })
      .from(campagnesPublicitaires)
      .where(
        and(
          eq(campagnesPublicitaires.siteId, siteId),
          eq(campagnesPublicitaires.statut, 'active')
        )
      );

      for (const campaign of campaigns) {
        // Récupérer la dépense d'aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [todaySpend] = await db.select({
          totalSpend: sum(metriquesCampagnes.depense),
        })
        .from(metriquesCampagnes)
        .leftJoin(creatifsPublicitaires, eq(metriquesCampagnes.creatifId, creatifsPublicitaires.id))
        .where(
          and(
            eq(creatifsPublicitaires.campagneId, campaign.id),
            gte(metriquesCampagnes.date, today)
          )
        );

        const dailySpend = Number(todaySpend.totalSpend) || 0;
        const dailyBudget = Number(campaign.budgetQuotidien) || 0;

        if (dailyBudget > 0) {
          const utilization = (dailySpend / dailyBudget) * 100;

          if (utilization >= thresholds.budgetUtilization) {
            alertsCreated.push({
              siteId,
              campagneId: campaign.id,
              type: 'budget_epuise',
              severite: utilization >= 95 ? 'critical' : 'warning',
              titre: 'Budget Presque Épuisé',
              message: `Campagne "${campaign.nom}": ${utilization.toFixed(1)}% du budget quotidien utilisé (${dailySpend.toFixed(2)}€/${dailyBudget}€)`,
              seuilDeclenche: thresholds.budgetUtilization.toString(),
              valeurActuelle: utilization.toString(),
              recommandationAction: utilization >= 95 ? 
                'Augmenter le budget ou surveiller la fin de journée' : 
                'Surveiller la consommation budget',
              actionRecommandee: JSON.stringify({
                type: 'monitor_budget',
                suggestedIncrease: dailyBudget * 0.2
              }),
            });
          }
        }
      }

      if (alertsCreated.length > 0) {
        await db.insert(alertesAds).values(alertsCreated);
        console.log(`💰 ${alertsCreated.length} alertes de budget créées`);
      }

      return alertsCreated.length;

    } catch (error) {
      console.error('❌ Erreur vérification alertes budget:', error);
      return 0;
    }
  }

  /**
   * Détecter les anomalies dans les performances
   */
  private async detectAnomalies(siteId: string): Promise<number> {
    try {
      // Utiliser l'analytics ROI pour détecter les anomalies
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const now = new Date();
      
      const currentMetrics = await roiAnalytics.calculateROIMetrics(siteId, yesterday, now);
      
      const alertsCreated: InsertAlerteAds[] = [];

      // Anomalie de tendance ROI
      if (Math.abs(currentMetrics.tendances.roiTrend) > 50) {
        alertsCreated.push({
          siteId,
          type: currentMetrics.tendances.roiTrend > 0 ? 'opportunity_detected' : 'roas_faible',
          severite: Math.abs(currentMetrics.tendances.roiTrend) > 100 ? 'critical' : 'warning',
          titre: 'Anomalie ROI Détectée',
          message: `ROI a ${currentMetrics.tendances.roiTrend > 0 ? 'augmenté' : 'chuté'} de ${Math.abs(currentMetrics.tendances.roiTrend).toFixed(1)}% vs période précédente`,
          valeurActuelle: currentMetrics.tendances.roiTrend.toString(),
          recommandationAction: currentMetrics.tendances.roiTrend > 0 ? 
            'Analyser les facteurs de succès et considérer scaling' : 
            'Investiguer les causes de la chute et optimiser',
        });
      }

      // Anomalie de dépenses
      if (Math.abs(currentMetrics.tendances.depenseTrend) > 30) {
        alertsCreated.push({
          siteId,
          type: 'budget_epuise',
          severite: 'warning',
          titre: 'Anomalie Dépenses',
          message: `Les dépenses ont ${currentMetrics.tendances.depenseTrend > 0 ? 'augmenté' : 'diminué'} de ${Math.abs(currentMetrics.tendances.depenseTrend).toFixed(1)}%`,
          valeurActuelle: currentMetrics.tendances.depenseTrend.toString(),
          recommandationAction: 'Vérifier les changements de configuration des campagnes',
        });
      }

      if (alertsCreated.length > 0) {
        await db.insert(alertesAds).values(alertsCreated);
        console.log(`🔍 ${alertsCreated.length} anomalies détectées`);
      }

      return alertsCreated.length;

    } catch (error) {
      console.error('❌ Erreur détection anomalies:', error);
      return 0;
    }
  }

  /**
   * Détecter les opportunités d'optimisation
   */
  private async detectOpportunities(siteId: string): Promise<number> {
    try {
      const alertsCreated: InsertAlerteAds[] = [];

      // Utiliser les algorithmes ML pour identifier les opportunités
      const campaigns = await db.select()
        .from(campagnesPublicitaires)
        .where(
          and(
            eq(campagnesPublicitaires.siteId, siteId),
            eq(campagnesPublicitaires.statut, 'active')
          )
        );

      for (const campaign of campaigns) {
        // Analyser les recommandations de budget
        const budgetRecs = await mlAlgorithms.optimizeBudgetAllocation(siteId, 1000, campaign.secteurCible);
        
        const campaignRec = budgetRecs.find(rec => rec.campaignId === campaign.id);
        if (campaignRec) {
          const currentBudget = campaignRec.currentBudget;
          const recommendedBudget = campaignRec.recommendedBudget;
          const increase = ((recommendedBudget - currentBudget) / currentBudget) * 100;

          // Opportunité d'augmentation de budget
          if (increase > 20) {
            alertsCreated.push({
              siteId,
              campagneId: campaign.id,
              type: 'opportunity_detected',
              severite: 'info',
              titre: 'Opportunité de Scaling',
              message: `Campagne "${campaign.nom}": Recommandation d'augmenter le budget de ${increase.toFixed(1)}% (de ${currentBudget}€ à ${recommendedBudget}€)`,
              valeurActuelle: currentBudget.toString(),
              recommandationAction: `Augmenter le budget à ${recommendedBudget}€ pour un ROAS estimé de ${campaignRec.expectedROAS}`,
              actionRecommandee: JSON.stringify({
                type: 'increase_budget',
                fromBudget: currentBudget,
                toBudget: recommendedBudget,
                expectedROAS: campaignRec.expectedROAS
              }),
            });
          }
        }
      }

      if (alertsCreated.length > 0) {
        await db.insert(alertesAds).values(alertsCreated);
        console.log(`💡 ${alertsCreated.length} opportunités détectées`);
      }

      return alertsCreated.length;

    } catch (error) {
      console.error('❌ Erreur détection opportunités:', error);
      return 0;
    }
  }

  /**
   * Vérifier les alertes de commission
   */
  private async checkCommissionAlerts(siteId: string): Promise<number> {
    try {
      const alertsCreated: InsertAlerteAds[] = [];

      // Analyser l'efficacité de la commission
      const commissionAnalysis = await roiAnalytics.analyzeCommissionEffectiveness(siteId, 'month');

      // Alerte si le client n'est pas rentable
      if (commissionAnalysis.client.roiPourcentage < 50) {
        alertsCreated.push({
          siteId,
          type: 'roas_faible',
          severite: 'warning',
          titre: 'ROI Client Faible',
          message: `Le ROI client est de ${commissionAnalysis.client.roiPourcentage.toFixed(1)}% ce mois. Risque d'insatisfaction.`,
          valeurActuelle: commissionAnalysis.client.roiPourcentage.toString(),
          seuilDeclenche: '100',
          recommandationAction: 'Intensifier l\'optimisation ou proposer une réduction temporaire de commission',
          actionRecommandee: JSON.stringify({
            type: 'improve_client_roi',
            currentROI: commissionAnalysis.client.roiPourcentage,
            targetROI: 150
          }),
        });
      }

      // Alerte si notre marge est faible
      if (commissionAnalysis.commission.margeProfit < 50) {
        alertsCreated.push({
          siteId,
          type: 'opportunity_detected',
          severite: 'info',
          titre: 'Marge Commission Faible',
          message: `Notre marge sur commission est de ${commissionAnalysis.commission.margeProfit.toFixed(1)}%`,
          valeurActuelle: commissionAnalysis.commission.margeProfit.toString(),
          recommandationAction: 'Optimiser les coûts opérationnels ou ajuster la structure tarifaire',
        });
      }

      if (alertsCreated.length > 0) {
        await db.insert(alertesAds).values(alertsCreated);
        console.log(`💰 ${alertsCreated.length} alertes de commission créées`);
      }

      return alertsCreated.length;

    } catch (error) {
      console.error('❌ Erreur vérification alertes commission:', error);
      return 0;
    }
  }

  /**
   * Générer des actions automatiques recommandées
   */
  private async generateAutomatedActions(
    siteId: string,
    thresholds: AlertThresholds
  ): Promise<AutomatedAction[]> {
    try {
      const actions: AutomatedAction[] = [];

      // Récupérer les alertes critiques récentes (dernières 24h)
      const criticalAlerts = await db.select()
        .from(alertesAds)
        .where(
          and(
            eq(alertesAds.siteId, siteId),
            eq(alertesAds.severite, 'critical'),
            eq(alertesAds.statut, 'nouvelle'),
            gte(alertesAds.dateCreation, new Date(Date.now() - 24 * 60 * 60 * 1000))
          )
        );

      for (const alert of criticalAlerts) {
        if (alert.campagneId) {
          const action = this.generateActionFromAlert(alert, thresholds);
          if (action) {
            actions.push(action);
          }
        }
      }

      // Log des actions recommandées
      if (actions.length > 0) {
        console.log(`🤖 ${actions.length} actions automatiques recommandées:`);
        actions.forEach(action => {
          console.log(`  - ${action.type}: ${action.description} (confiance: ${action.confidence}%)`);
        });
      }

      return actions;

    } catch (error) {
      console.error('❌ Erreur génération actions automatiques:', error);
      return [];
    }
  }

  /**
   * Générer une action depuis une alerte
   */
  private generateActionFromAlert(
    alert: any,
    thresholds: AlertThresholds
  ): AutomatedAction | null {
    if (!alert.campagneId) return null;

    switch (alert.type) {
      case 'roas_faible':
        const roi = parseFloat(alert.valeurActuelle);
        if (roi < -50) {
          return {
            type: 'pause_campaign',
            campaignId: alert.campagneId,
            description: `Pauser la campagne avec ROI de ${roi.toFixed(1)}%`,
            confidence: 90,
            expectedImpact: Math.abs(roi) * 10, // Impact estimé
            riskLevel: 'low',
          };
        } else {
          return {
            type: 'reduce_budget',
            campaignId: alert.campagneId,
            description: `Réduire le budget de 30% pour limiter les pertes`,
            parameters: { budgetReduction: 0.3 },
            confidence: 70,
            expectedImpact: Math.abs(roi) * 5,
            riskLevel: 'medium',
          };
        }

      case 'cpa_eleve':
        return {
          type: 'change_bidding',
          campaignId: alert.campagneId,
          description: `Ajuster la stratégie d'enchères pour réduire le CPA`,
          parameters: { 
            biddingStrategy: 'target_cpa',
            targetCPA: thresholds.cpaMaximum * 0.8
          },
          confidence: 60,
          expectedImpact: 20,
          riskLevel: 'medium',
        };

      case 'opportunity_detected':
        return {
          type: 'increase_budget',
          campaignId: alert.campagneId,
          description: `Augmenter le budget pour profiter de l'opportunité`,
          parameters: { budgetIncrease: 0.25 }, // +25%
          confidence: 75,
          expectedImpact: 30,
          riskLevel: 'low',
        };

      default:
        return {
          type: 'alert_only',
          campaignId: alert.campagneId,
          description: `Surveillance requise: ${alert.message}`,
          confidence: 50,
          expectedImpact: 0,
          riskLevel: 'low',
        };
    }
  }

  /**
   * Résoudre une alerte manuellement
   */
  async resolveAlert(alertId: string, resolution: string, userId?: string): Promise<void> {
    try {
      await db.update(alertesAds)
        .set({
          statut: 'resolue',
          actionPrise: resolution,
          dateResolution: new Date(),
        })
        .where(eq(alertesAds.id, alertId));

      console.log(`✅ Alerte ${alertId} résolue: ${resolution}`);

    } catch (error) {
      console.error('❌ Erreur résolution alerte:', error);
      throw error;
    }
  }

  /**
   * Ignorer une alerte
   */
  async dismissAlert(alertId: string, reason?: string): Promise<void> {
    try {
      await db.update(alertesAds)
        .set({
          statut: 'ignoree',
          actionPrise: reason || 'Alerte ignorée par l\'utilisateur',
          dateResolution: new Date(),
        })
        .where(eq(alertesAds.id, alertId));

      console.log(`🚫 Alerte ${alertId} ignorée`);

    } catch (error) {
      console.error('❌ Erreur suppression alerte:', error);
      throw error;
    }
  }

  /**
   * Obtenir le résumé des alertes pour un site
   */
  async getAlertsSummary(siteId: string): Promise<any> {
    try {
      const alertStats = await db.select({
        type: alertesAds.type,
        severite: alertesAds.severite,
        count: sql<number>`COUNT(*)`,
      })
      .from(alertesAds)
      .where(
        and(
          eq(alertesAds.siteId, siteId),
          eq(alertesAds.statut, 'nouvelle'),
          gte(alertesAds.dateCreation, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // 7 derniers jours
        )
      )
      .groupBy(alertesAds.type, alertesAds.severite);

      const summary = {
        total: 0,
        critical: 0,
        warning: 0,
        info: 0,
        byType: {} as any,
      };

      alertStats.forEach(stat => {
        const count = Number(stat.count);
        summary.total += count;
        summary[stat.severite] += count;
        
        if (!summary.byType[stat.type]) {
          summary.byType[stat.type] = 0;
        }
        summary.byType[stat.type] += count;
      });

      return summary;

    } catch (error) {
      console.error('❌ Erreur résumé alertes:', error);
      throw error;
    }
  }
}

// Instance singleton
export const alertsSystem = new AlertsSystem();