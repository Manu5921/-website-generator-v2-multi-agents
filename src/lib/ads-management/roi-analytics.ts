// =============================================================================
// 📊 ROI ANALYTICS - CALCULS ET MÉTRIQUES EN TEMPS RÉEL
// =============================================================================

import { db } from '@/lib/db';
import { 
  campagnesPublicitaires,
  metriquesCampagnes,
  attributionsMultiTouch,
  revenusCommissions,
  sitesGeneres,
  customerJourney,
  alertesAds,
  InsertAlerteAds
} from '@/lib/db/schema';
import { eq, and, gte, lte, desc, sql, sum, avg, count } from 'drizzle-orm';

/**
 * Interface pour les métriques ROI en temps réel
 */
export interface ROIMetrics {
  siteId: string;
  periode: {
    debut: Date;
    fin: Date;
  };
  global: {
    depenseTotal: number;
    revenueTotal: number;
    roi: number;
    roas: number;
    conversions: number;
    commissionBrute: number;
    commissionNette: number;
    profitabilite: number;
  };
  parPlateforme: {
    [key: string]: {
      depense: number;
      revenue: number;
      roi: number;
      roas: number;
      conversions: number;
      cpa: number;
      ctr: number;
    };
  };
  parCampagne: Array<{
    campaignId: string;
    nom: string;
    plateforme: string;
    depense: number;
    revenue: number;
    roi: number;
    roas: number;
    conversions: number;
    cpa: number;
    statut: 'profitable' | 'breakeven' | 'losing' | 'unknown';
  }>;
  tendances: {
    roiTrend: number; // % change vs période précédente
    revenueTrend: number;
    depenseTrend: number;
    conversionTrend: number;
  };
  alertes: Array<{
    type: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    campagneId?: string;
  }>;
}

/**
 * Interface pour les prédictions ML
 */
export interface ROIPredictions {
  nextPeriod: {
    predictedRevenue: number;
    predictedSpend: number;
    predictedROI: number;
    confidence: number;
  };
  recommendations: Array<{
    type: 'budget_increase' | 'budget_decrease' | 'pause_campaign' | 'optimize_targeting';
    campaignId: string;
    message: string;
    expectedImpact: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  seasonality: {
    bestDays: string[];
    bestHours: number[];
    seasonalMultiplier: number;
  };
}

class ROIAnalytics {

  /**
   * Calculer les métriques ROI complètes pour un site
   */
  async calculateROIMetrics(
    siteId: string, 
    dateDebut: Date, 
    dateFin: Date
  ): Promise<ROIMetrics> {
    try {
      console.log(`📊 Calcul métriques ROI pour ${siteId} du ${dateDebut.toISOString()} au ${dateFin.toISOString()}`);

      // 1. Métriques globales
      const globalMetrics = await this.getGlobalMetrics(siteId, dateDebut, dateFin);
      
      // 2. Métriques par plateforme
      const platformMetrics = await this.getPlatformMetrics(siteId, dateDebut, dateFin);
      
      // 3. Métriques par campagne
      const campaignMetrics = await this.getCampaignMetrics(siteId, dateDebut, dateFin);
      
      // 4. Tendances vs période précédente
      const trends = await this.calculateTrends(siteId, dateDebut, dateFin);
      
      // 5. Alertes actives
      const alerts = await this.getActiveAlerts(siteId);

      const result: ROIMetrics = {
        siteId,
        periode: { debut: dateDebut, fin: dateFin },
        global: globalMetrics,
        parPlateforme: platformMetrics,
        parCampagne: campaignMetrics,
        tendances: trends,
        alertes: alerts,
      };

      console.log(`✅ ROI calculé: ${globalMetrics.roi.toFixed(2)}% (ROAS: ${globalMetrics.roas.toFixed(2)})`);
      return result;

    } catch (error) {
      console.error('❌ Erreur calcul métriques ROI:', error);
      throw error;
    }
  }

  /**
   * Générer des prédictions ML pour optimiser le ROI
   */
  async generateROIPredictions(
    siteId: string,
    historicalDays: number = 30
  ): Promise<ROIPredictions> {
    try {
      console.log(`🔮 Génération prédictions ROI pour ${siteId} (${historicalDays} jours d'historique)`);

      // Récupérer les données historiques
      const dateEnd = new Date();
      const dateStart = new Date(dateEnd.getTime() - historicalDays * 24 * 60 * 60 * 1000);
      
      const historicalData = await this.getHistoricalPerformance(siteId, dateStart, dateEnd);
      
      // 1. Prédictions pour la prochaine période
      const nextPeriod = this.predictNextPeriod(historicalData);
      
      // 2. Recommandations d'optimisation
      const recommendations = await this.generateOptimizationRecommendations(siteId, historicalData);
      
      // 3. Analyse de saisonnalité
      const seasonality = this.analyzeSeasonality(historicalData);

      return {
        nextPeriod,
        recommendations,
        seasonality,
      };

    } catch (error) {
      console.error('❌ Erreur génération prédictions ROI:', error);
      throw error;
    }
  }

  /**
   * Surveillance en temps réel et déclenchement d'alertes
   */
  async monitorRealTimePerformance(siteId: string): Promise<void> {
    try {
      console.log(`🚨 Surveillance temps réel pour ${siteId}`);

      // Métriques des dernières 24h
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const now = new Date();
      
      const currentMetrics = await this.calculateROIMetrics(siteId, yesterday, now);
      
      // Vérifier les seuils d'alerte
      await this.checkAlertThresholds(siteId, currentMetrics);
      
      // Détecter les anomalies
      await this.detectAnomalies(siteId, currentMetrics);
      
      console.log(`✅ Surveillance terminée: ${currentMetrics.alertes.length} alertes actives`);

    } catch (error) {
      console.error('❌ Erreur surveillance temps réel:', error);
      throw error;
    }
  }

  /**
   * Analyser l'efficacité de la commission 20%
   */
  async analyzeCommissionEffectiveness(
    siteId: string,
    period: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<any> {
    try {
      console.log(`💰 Analyse efficacité commission 20% pour ${siteId} (${period})`);

      const { dateStart, dateEnd } = this.getPeriodDates(period);
      
      // Revenus et commissions
      const commissionData = await db.select({
        totalSpend: sum(revenusCommissions.depenseClient),
        totalCommissionBrute: sum(revenusCommissions.commissionBrute),
        totalCommissionNette: sum(revenusCommissions.commissionNette),
        avgROAS: avg(sql`${revenusCommissions.depenseClient} / NULLIF(${revenusCommissions.commissionBrute}, 0)`),
      })
      .from(revenusCommissions)
      .where(
        and(
          eq(revenusCommissions.siteId, siteId),
          gte(revenusCommissions.datePeriodeDebut, dateStart),
          lte(revenusCommissions.datePeriodeFin, dateEnd)
        )
      );

      const data = commissionData[0];
      
      // Calculs de rentabilité
      const clientSpend = Number(data.totalSpend) || 0;
      const ourCommission = Number(data.totalCommissionNette) || 0;
      const clientROAS = Number(data.avgROAS) || 0;
      
      // ROI client (retour sur investissement publicitaire du client)
      const clientROI = clientROAS > 0 ? ((clientROAS - 1) * 100) : 0;
      
      // Notre rentabilité (commission / coûts opérationnels estimés)
      const operationalCosts = ourCommission * 0.3; // Estimation 30% de coûts
      const ourProfit = ourCommission - operationalCosts;
      const ourProfitMargin = ourCommission > 0 ? (ourProfit / ourCommission) * 100 : 0;

      return {
        periode: { debut: dateStart, fin: dateEnd },
        client: {
          depenseTotal: clientSpend,
          roasEscompte: clientROAS,
          roiPourcentage: clientROI,
          satisfaction: clientROI > 200 ? 'excellent' : clientROI > 100 ? 'bon' : 'à améliorer',
        },
        commission: {
          tauxCommission: 20,
          commissionBrute: Number(data.totalCommissionBrute) || 0,
          commissionNette: ourCommission,
          coutsOperationnels: operationalCosts,
          profit: ourProfit,
          margeProfit: ourProfitMargin,
        },
        justification: {
          valeurAjoutee: this.calculateValueAdd(clientROI),
          recommandations: this.getCommissionRecommendations(clientROI, ourProfitMargin),
        }
      };

    } catch (error) {
      console.error('❌ Erreur analyse commission:', error);
      throw error;
    }
  }

  // =============================================================================
  // MÉTHODES PRIVÉES
  // =============================================================================

  private async getGlobalMetrics(siteId: string, dateDebut: Date, dateFin: Date): Promise<any> {
    // Métriques des campagnes
    const campaignData = await db.select({
      totalSpend: sum(metriquesCampagnes.depense),
      totalConversions: sum(metriquesCampagnes.conversions),
      totalRevenue: sum(metriquesCampagnes.valeurConversions),
      avgROAS: avg(metriquesCampagnes.roas),
    })
    .from(metriquesCampagnes)
    .leftJoin(creatifsPublicitaires, eq(metriquesCampagnes.creatifId, creatifsPublicitaires.id))
    .leftJoin(campagnesPublicitaires, eq(creatifsPublicitaires.campagneId, campagnesPublicitaires.id))
    .where(
      and(
        eq(campagnesPublicitaires.siteId, siteId),
        gte(metriquesCampagnes.date, dateDebut),
        lte(metriquesCampagnes.date, dateFin)
      )
    );

    // Métriques de commission
    const commissionData = await db.select({
      totalCommissionBrute: sum(revenusCommissions.commissionBrute),
      totalCommissionNette: sum(revenusCommissions.commissionNette),
    })
    .from(revenusCommissions)
    .where(
      and(
        eq(revenusCommissions.siteId, siteId),
        gte(revenusCommissions.datePeriodeDebut, dateDebut),
        lte(revenusCommissions.datePeriodeFin, dateFin)
      )
    );

    const campaign = campaignData[0];
    const commission = commissionData[0];

    const depenseTotal = Number(campaign.totalSpend) || 0;
    const revenueTotal = Number(campaign.totalRevenue) || 0;
    const conversions = Number(campaign.totalConversions) || 0;
    const commissionBrute = Number(commission.totalCommissionBrute) || 0;
    const commissionNette = Number(commission.totalCommissionNette) || 0;

    const roi = depenseTotal > 0 ? ((revenueTotal - depenseTotal) / depenseTotal) * 100 : 0;
    const roas = depenseTotal > 0 ? revenueTotal / depenseTotal : 0;
    const profitabilite = commissionNette > 0 ? ((commissionNette - (commissionNette * 0.3)) / commissionNette) * 100 : 0;

    return {
      depenseTotal,
      revenueTotal,
      roi,
      roas,
      conversions,
      commissionBrute,
      commissionNette,
      profitabilite,
    };
  }

  private async getPlatformMetrics(siteId: string, dateDebut: Date, dateFin: Date): Promise<any> {
    const platformData = await db.select({
      plateforme: campagnesPublicitaires.plateforme,
      totalSpend: sum(metriquesCampagnes.depense),
      totalRevenue: sum(metriquesCampagnes.valeurConversions),
      totalConversions: sum(metriquesCampagnes.conversions),
      totalImpressions: sum(metriquesCampagnes.impressions),
      totalClicks: sum(metriquesCampagnes.clics),
      avgCPA: avg(metriquesCampagnes.cpa),
    })
    .from(metriquesCampagnes)
    .leftJoin(creatifsPublicitaires, eq(metriquesCampagnes.creatifId, creatifsPublicitaires.id))
    .leftJoin(campagnesPublicitaires, eq(creatifsPublicitaires.campagneId, campagnesPublicitaires.id))
    .where(
      and(
        eq(campagnesPublicitaires.siteId, siteId),
        gte(metriquesCampagnes.date, dateDebut),
        lte(metriquesCampagnes.date, dateFin)
      )
    )
    .groupBy(campagnesPublicitaires.plateforme);

    const result: any = {};

    platformData.forEach(platform => {
      const depense = Number(platform.totalSpend) || 0;
      const revenue = Number(platform.totalRevenue) || 0;
      const conversions = Number(platform.totalConversions) || 0;
      const impressions = Number(platform.totalImpressions) || 0;
      const clicks = Number(platform.totalClicks) || 0;

      result[platform.plateforme] = {
        depense,
        revenue,
        roi: depense > 0 ? ((revenue - depense) / depense) * 100 : 0,
        roas: depense > 0 ? revenue / depense : 0,
        conversions,
        cpa: conversions > 0 ? depense / conversions : 0,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      };
    });

    return result;
  }

  private async getCampaignMetrics(siteId: string, dateDebut: Date, dateFin: Date): Promise<any[]> {
    const campaignData = await db.select({
      campaignId: campagnesPublicitaires.id,
      nom: campagnesPublicitaires.nom,
      plateforme: campagnesPublicitaires.plateforme,
      totalSpend: sum(metriquesCampagnes.depense),
      totalRevenue: sum(metriquesCampagnes.valeurConversions),
      totalConversions: sum(metriquesCampagnes.conversions),
      avgCPA: avg(metriquesCampagnes.cpa),
    })
    .from(metriquesCampagnes)
    .leftJoin(creatifsPublicitaires, eq(metriquesCampagnes.creatifId, creatifsPublicitaires.id))
    .leftJoin(campagnesPublicitaires, eq(creatifsPublicitaires.campagneId, campagnesPublicitaires.id))
    .where(
      and(
        eq(campagnesPublicitaires.siteId, siteId),
        gte(metriquesCampagnes.date, dateDebut),
        lte(metriquesCampagnes.date, dateFin)
      )
    )
    .groupBy(
      campagnesPublicitaires.id,
      campagnesPublicitaires.nom,
      campagnesPublicitaires.plateforme
    );

    return campaignData.map(campaign => {
      const depense = Number(campaign.totalSpend) || 0;
      const revenue = Number(campaign.totalRevenue) || 0;
      const conversions = Number(campaign.totalConversions) || 0;
      const roi = depense > 0 ? ((revenue - depense) / depense) * 100 : 0;

      let statut: 'profitable' | 'breakeven' | 'losing' | 'unknown' = 'unknown';
      if (roi > 20) statut = 'profitable';
      else if (roi > -10 && roi <= 20) statut = 'breakeven';
      else if (roi <= -10) statut = 'losing';

      return {
        campaignId: campaign.campaignId,
        nom: campaign.nom,
        plateforme: campaign.plateforme,
        depense,
        revenue,
        roi,
        roas: depense > 0 ? revenue / depense : 0,
        conversions,
        cpa: Number(campaign.avgCPA) || 0,
        statut,
      };
    });
  }

  private async calculateTrends(siteId: string, dateDebut: Date, dateFin: Date): Promise<any> {
    // Période précédente (même durée)
    const periodLength = dateFin.getTime() - dateDebut.getTime();
    const prevDateFin = new Date(dateDebut.getTime());
    const prevDateDebut = new Date(dateDebut.getTime() - periodLength);

    const currentMetrics = await this.getGlobalMetrics(siteId, dateDebut, dateFin);
    const previousMetrics = await this.getGlobalMetrics(siteId, prevDateDebut, prevDateFin);

    const calculateTrend = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      roiTrend: calculateTrend(currentMetrics.roi, previousMetrics.roi),
      revenueTrend: calculateTrend(currentMetrics.revenueTotal, previousMetrics.revenueTotal),
      depenseTrend: calculateTrend(currentMetrics.depenseTotal, previousMetrics.depenseTotal),
      conversionTrend: calculateTrend(currentMetrics.conversions, previousMetrics.conversions),
    };
  }

  private async getActiveAlerts(siteId: string): Promise<any[]> {
    const alerts = await db.select()
      .from(alertesAds)
      .where(
        and(
          eq(alertesAds.siteId, siteId),
          eq(alertesAds.statut, 'nouvelle')
        )
      )
      .orderBy(desc(alertesAds.dateCreation))
      .limit(10);

    return alerts.map(alert => ({
      type: alert.type,
      severity: alert.severite,
      message: alert.message,
      campagneId: alert.campagneId,
    }));
  }

  private async checkAlertThresholds(siteId: string, metrics: ROIMetrics): Promise<void> {
    const alerts: InsertAlerteAds[] = [];

    // Alerte ROI faible
    if (metrics.global.roi < 0) {
      alerts.push({
        siteId,
        type: 'roas_faible',
        severite: 'critical',
        titre: 'ROI Négatif Détecté',
        message: `Le ROI global est de ${metrics.global.roi.toFixed(2)}%. Action immédiate requise.`,
        valeurActuelle: metrics.global.roi.toString(),
        seuilDeclenche: '0',
        recommandationAction: 'Pauser les campagnes non-performantes et optimiser le targeting',
      });
    }

    // Alerte CPA élevé par campagne
    for (const campaign of metrics.parCampagne) {
      if (campaign.statut === 'losing') {
        alerts.push({
          siteId,
          campagneId: campaign.campaignId,
          type: 'cpa_eleve',
          severite: 'warning',
          titre: 'Campagne Non-Rentable',
          message: `La campagne "${campaign.nom}" a un ROI de ${campaign.roi.toFixed(2)}%`,
          valeurActuelle: campaign.roi.toString(),
          seuilDeclenche: '0',
          recommandationAction: 'Optimiser le targeting ou réduire le budget',
        });
      }
    }

    // Sauvegarder les nouvelles alertes
    if (alerts.length > 0) {
      await db.insert(alertesAds).values(alerts);
      console.log(`🚨 ${alerts.length} nouvelles alertes créées`);
    }
  }

  private async detectAnomalies(siteId: string, metrics: ROIMetrics): Promise<void> {
    // Détecter les anomalies dans les tendances
    const { tendances } = metrics;

    if (Math.abs(tendances.roiTrend) > 50) {
      await db.insert(alertesAds).values({
        siteId,
        type: 'opportunity_detected',
        severite: tendances.roiTrend > 0 ? 'info' : 'warning',
        titre: 'Anomalie ROI Détectée',
        message: `Le ROI a ${tendances.roiTrend > 0 ? 'augmenté' : 'diminué'} de ${Math.abs(tendances.roiTrend).toFixed(1)}%`,
        valeurActuelle: tendances.roiTrend.toString(),
        recommandationAction: tendances.roiTrend > 0 ? 'Considérer augmenter le budget' : 'Analyser les changements récents',
      });
    }
  }

  private async getHistoricalPerformance(siteId: string, dateStart: Date, dateEnd: Date): Promise<any[]> {
    return await db.select({
      date: metriquesCampagnes.date,
      spend: metriquesCampagnes.depense,
      revenue: metriquesCampagnes.valeurConversions,
      conversions: metriquesCampagnes.conversions,
      impressions: metriquesCampagnes.impressions,
      clicks: metriquesCampagnes.clics,
    })
    .from(metriquesCampagnes)
    .leftJoin(creatifsPublicitaires, eq(metriquesCampagnes.creatifId, creatifsPublicitaires.id))
    .leftJoin(campagnesPublicitaires, eq(creatifsPublicitaires.campagneId, campagnesPublicitaires.id))
    .where(
      and(
        eq(campagnesPublicitaires.siteId, siteId),
        gte(metriquesCampagnes.date, dateStart),
        lte(metriquesCampagnes.date, dateEnd)
      )
    )
    .orderBy(metriquesCampagnes.date);
  }

  private predictNextPeriod(historicalData: any[]): any {
    if (historicalData.length === 0) {
      return {
        predictedRevenue: 0,
        predictedSpend: 0,
        predictedROI: 0,
        confidence: 0,
      };
    }

    // Calcul de tendance simple (moyenne mobile)
    const recentData = historicalData.slice(-7); // 7 derniers jours
    const avgRevenue = recentData.reduce((sum, day) => sum + Number(day.revenue), 0) / recentData.length;
    const avgSpend = recentData.reduce((sum, day) => sum + Number(day.spend), 0) / recentData.length;

    // Prédiction simple basée sur la tendance
    const predictedRevenue = avgRevenue * 7; // Projection sur 7 jours
    const predictedSpend = avgSpend * 7;
    const predictedROI = predictedSpend > 0 ? ((predictedRevenue - predictedSpend) / predictedSpend) * 100 : 0;

    return {
      predictedRevenue,
      predictedSpend,
      predictedROI,
      confidence: Math.min(historicalData.length / 30, 1), // Confiance basée sur la quantité de données
    };
  }

  private async generateOptimizationRecommendations(siteId: string, historicalData: any[]): Promise<any[]> {
    const recommendations = [];
    
    // Analyser les campagnes sous-performantes
    const recentMetrics = await this.getCampaignMetrics(
      siteId,
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date()
    );

    for (const campaign of recentMetrics) {
      if (campaign.roi < -20) {
        recommendations.push({
          type: 'pause_campaign',
          campaignId: campaign.campaignId,
          message: `Pauser la campagne "${campaign.nom}" (ROI: ${campaign.roi.toFixed(1)}%)`,
          expectedImpact: Math.abs(campaign.depense),
          priority: 'high',
        });
      } else if (campaign.roi > 50 && campaign.depense > 0) {
        recommendations.push({
          type: 'budget_increase',
          campaignId: campaign.campaignId,
          message: `Augmenter le budget de "${campaign.nom}" (ROI: ${campaign.roi.toFixed(1)}%)`,
          expectedImpact: campaign.depense * 0.5,
          priority: 'high',
        });
      }
    }

    return recommendations.slice(0, 5); // Top 5
  }

  private analyzeSeasonality(historicalData: any[]): any {
    // Analyse simple de saisonnalité
    const dayStats: { [key: string]: { revenue: number; count: number } } = {};
    const hourStats: { [key: number]: { revenue: number; count: number } } = {};

    historicalData.forEach(day => {
      const date = new Date(day.date);
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
      const hour = date.getHours();
      const revenue = Number(day.revenue) || 0;

      // Statistiques par jour
      if (!dayStats[dayName]) dayStats[dayName] = { revenue: 0, count: 0 };
      dayStats[dayName].revenue += revenue;
      dayStats[dayName].count += 1;

      // Statistiques par heure
      if (!hourStats[hour]) hourStats[hour] = { revenue: 0, count: 0 };
      hourStats[hour].revenue += revenue;
      hourStats[hour].count += 1;
    });

    // Trouver les meilleurs jours
    const bestDays = Object.entries(dayStats)
      .map(([day, stats]) => ({ day, avgRevenue: stats.revenue / stats.count }))
      .sort((a, b) => b.avgRevenue - a.avgRevenue)
      .slice(0, 3)
      .map(item => item.day);

    // Trouver les meilleures heures
    const bestHours = Object.entries(hourStats)
      .map(([hour, stats]) => ({ hour: parseInt(hour), avgRevenue: stats.revenue / stats.count }))
      .sort((a, b) => b.avgRevenue - a.avgRevenue)
      .slice(0, 6)
      .map(item => item.hour);

    return {
      bestDays,
      bestHours,
      seasonalMultiplier: 1.0, // Placeholder pour multiplicateur saisonnier
    };
  }

  private getPeriodDates(period: string): { dateStart: Date; dateEnd: Date } {
    const dateEnd = new Date();
    const dateStart = new Date();

    switch (period) {
      case 'month':
        dateStart.setDate(1);
        dateStart.setHours(0, 0, 0, 0);
        break;
      case 'quarter':
        const quarterStart = Math.floor(dateEnd.getMonth() / 3) * 3;
        dateStart.setMonth(quarterStart, 1);
        dateStart.setHours(0, 0, 0, 0);
        break;
      case 'year':
        dateStart.setMonth(0, 1);
        dateStart.setHours(0, 0, 0, 0);
        break;
    }

    return { dateStart, dateEnd };
  }

  private calculateValueAdd(clientROI: number): string[] {
    const valueAdds = [];
    
    if (clientROI > 0) {
      valueAdds.push('Génération de profit positif pour le client');
    }
    if (clientROI > 100) {
      valueAdds.push('Doublage de l\'investissement publicitaire');
    }
    if (clientROI > 200) {
      valueAdds.push('ROI exceptionnel dépassant les standards du marché');
    }
    
    valueAdds.push('Optimisation continue par IA');
    valueAdds.push('Tracking attribution multi-touch');
    valueAdds.push('Reporting en temps réel');
    valueAdds.push('Support technique spécialisé');

    return valueAdds;
  }

  private getCommissionRecommendations(clientROI: number, ourMargin: number): string[] {
    const recommendations = [];

    if (clientROI < 50) {
      recommendations.push('Intensifier l\'optimisation pour améliorer le ROI client');
      recommendations.push('Considérer une réduction temporaire de commission');
    } else if (clientROI > 300) {
      recommendations.push('Excellent ROI - justifie pleinement la commission 20%');
      recommendations.push('Opportunité d\'augmenter les budgets publicitaires');
    }

    if (ourMargin < 50) {
      recommendations.push('Optimiser les coûts opérationnels internes');
    }

    return recommendations;
  }
}

// Instance singleton
export const roiAnalytics = new ROIAnalytics();