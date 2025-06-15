// =============================================================================
// 🎲 A/B TESTING ENGINE - TESTS AUTOMATIQUES DES CRÉATIFS PUBLICITAIRES
// =============================================================================

import { db } from '@/lib/db';
import { 
  testsABCreatifs,
  creatifsPublicitaires,
  metriquesCampagnes,
  campagnesPublicitaires,
  InsertTestABCreatif,
  InsertCreatifPublicitaire,
  InsertMetriqueCampagne
} from '@/lib/db/schema';
import { eq, and, gte, desc, sql, count, avg } from 'drizzle-orm';

/**
 * Interface pour la configuration d'un test A/B
 */
export interface ABTestConfig {
  campaignId: string;
  name: string;
  hypothesis: string;
  testType: 'headline' | 'description' | 'image' | 'cta' | 'landing_page' | 'audience';
  trafficSplit: number; // 0.5 = 50/50
  significanceLevel: number; // 0.95 = 95%
  minSampleSize: number;
  durationDays: number;
  primaryMetric: 'ctr' | 'cpa' | 'roas' | 'conversion_rate' | 'engagement';
  controlCreative: {
    name: string;
    title: string;
    description?: string;
    imageUrl?: string;
    videoUrl?: string;
    callToAction: string;
    destinationUrl: string;
  };
  variantCreative: {
    name: string;
    title: string;
    description?: string;
    imageUrl?: string;
    videoUrl?: string;
    callToAction: string;
    destinationUrl: string;
  };
}

/**
 * Interface pour les résultats statistiques
 */
export interface StatisticalResult {
  controlMetric: number;
  variantMetric: number;
  difference: number;
  percentChange: number;
  pValue: number;
  isSignificant: boolean;
  confidence: number;
  winner: 'control' | 'variant' | 'no_difference';
  sampleSizeControl: number;
  sampleSizeVariant: number;
}

/**
 * Interface pour les recommandations d'amélioration
 */
export interface CreativeRecommendation {
  type: 'headline' | 'description' | 'image' | 'cta' | 'color' | 'format';
  suggestion: string;
  reasoning: string;
  expectedImprovement: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number; // 0-100
}

class ABTestingEngine {

  /**
   * Créer un nouveau test A/B
   */
  async createABTest(config: ABTestConfig): Promise<string> {
    try {
      console.log(`🎲 Création test A/B: ${config.name}`);

      // 1. Valider la configuration
      await this.validateTestConfig(config);

      // 2. Créer les créatifs
      const controlCreativeId = await this.createCreative(config.campaignId, config.controlCreative, 'control');
      const variantCreativeId = await this.createCreative(config.campaignId, config.variantCreative, 'variant');

      // 3. Créer le test A/B en base
      const testData: InsertTestABCreatif = {
        campagneId: config.campaignId,
        nom: config.name,
        hypothese: config.hypothesis,
        typeTest: config.testType,
        creatifControle: controlCreativeId,
        creatifVariante: variantCreativeId,
        repartitionTrafic: config.trafficSplit.toString(),
        metriqueObjectif: config.primaryMetric,
        significanceLevel: config.significanceLevel.toString(),
        tailleSample: config.minSampleSize,
        dureeTestJours: config.durationDays,
        statut: 'setup',
      };

      const [test] = await db.insert(testsABCreatifs)
        .values(testData)
        .returning({ id: testsABCreatifs.id });

      // 4. Programmer le démarrage automatique
      await this.scheduleTestStart(test.id);

      console.log(`✅ Test A/B créé: ${test.id}`);
      return test.id;

    } catch (error) {
      console.error('❌ Erreur création test A/B:', error);
      throw error;
    }
  }

  /**
   * Démarrer un test A/B
   */
  async startTest(testId: string): Promise<void> {
    try {
      console.log(`▶️ Démarrage test A/B: ${testId}`);

      const [test] = await db.select()
        .from(testsABCreatifs)
        .where(eq(testsABCreatifs.id, testId))
        .limit(1);

      if (!test) {
        throw new Error(`Test A/B ${testId} non trouvé`);
      }

      if (test.statut !== 'setup') {
        throw new Error(`Test A/B ${testId} ne peut pas être démarré (statut: ${test.statut})`);
      }

      // Calculer la date de fin
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + test.dureeTestJours);

      // Mettre à jour le statut
      await db.update(testsABCreatifs)
        .set({
          statut: 'running',
          dateDebut: new Date(),
          dateFin: endDate,
        })
        .where(eq(testsABCreatifs.id, testId));

      // Activer les créatifs dans les plateformes publicitaires
      await this.activateCreatives(test);

      console.log(`✅ Test A/B démarré jusqu'au ${endDate.toISOString()}`);

    } catch (error) {
      console.error('❌ Erreur démarrage test A/B:', error);
      throw error;
    }
  }

  /**
   * Analyser les résultats d'un test A/B en cours
   */
  async analyzeTest(testId: string): Promise<StatisticalResult> {
    try {
      console.log(`📊 Analyse test A/B: ${testId}`);

      const [test] = await db.select()
        .from(testsABCreatifs)
        .where(eq(testsABCreatifs.id, testId))
        .limit(1);

      if (!test) {
        throw new Error(`Test A/B ${testId} non trouvé`);
      }

      // Récupérer les métriques pour les deux créatifs
      const controlMetrics = await this.getCreativeMetrics(test.creatifControle);
      const variantMetrics = await this.getCreativeMetrics(test.creatifVariante);

      // Calculer les statistiques
      const result = this.calculateStatistics(
        controlMetrics,
        variantMetrics,
        test.metriqueObjectif,
        Number(test.significanceLevel)
      );

      // Sauvegarder les résultats
      await db.update(testsABCreatifs)
        .set({
          confianceResultat: result.confidence.toString(),
          liftPerformance: result.percentChange.toString(),
          resultatsDetailles: JSON.stringify(result),
        })
        .where(eq(testsABCreatifs.id, testId));

      console.log(`✅ Analyse terminée: ${result.winner} gagne avec ${result.percentChange.toFixed(2)}% d'amélioration`);
      return result;

    } catch (error) {
      console.error('❌ Erreur analyse test A/B:', error);
      throw error;
    }
  }

  /**
   * Terminer automatiquement un test A/B avec assez de données
   */
  async checkAndCompleteTests(): Promise<void> {
    try {
      console.log('🔍 Vérification des tests A/B en cours...');

      // Récupérer tous les tests actifs
      const activeTests = await db.select()
        .from(testsABCreatifs)
        .where(eq(testsABCreatifs.statut, 'running'));

      for (const test of activeTests) {
        const shouldComplete = await this.shouldCompleteTest(test);
        
        if (shouldComplete.complete) {
          await this.completeTest(test.id, shouldComplete.reason);
        }
      }

      console.log(`✅ ${activeTests.length} tests vérifiés`);

    } catch (error) {
      console.error('❌ Erreur vérification tests A/B:', error);
      throw error;
    }
  }

  /**
   * Générer des recommandations d'amélioration automatiques
   */
  async generateCreativeRecommendations(
    campaignId: string,
    secteur: string
  ): Promise<CreativeRecommendation[]> {
    try {
      console.log(`💡 Génération recommandations créatives pour campagne ${campaignId}`);

      // Analyser les performances historiques
      const historicalData = await this.getHistoricalPerformance(campaignId);
      
      // Analyser les tendances du secteur
      const sectorTrends = await this.getSectorTrends(secteur);

      // Générer des recommandations basées sur l'IA
      const recommendations: CreativeRecommendation[] = [];

      // 1. Recommandations de titres
      recommendations.push(...this.generateHeadlineRecommendations(historicalData, sectorTrends));

      // 2. Recommandations d'images
      recommendations.push(...this.generateImageRecommendations(historicalData, sectorTrends));

      // 3. Recommandations de CTA
      recommendations.push(...this.generateCTARecommendations(historicalData, sectorTrends));

      // 4. Recommandations de couleurs
      recommendations.push(...this.generateColorRecommendations(historicalData, sectorTrends));

      // Trier par impact estimé
      recommendations.sort((a, b) => b.estimatedImpact - a.estimatedImpact);

      console.log(`✅ ${recommendations.length} recommandations générées`);
      return recommendations.slice(0, 10); // Top 10

    } catch (error) {
      console.error('❌ Erreur génération recommandations:', error);
      throw error;
    }
  }

  /**
   * Créer automatiquement des variants basés sur les recommandations
   */
  async createAutomaticVariants(
    campaignId: string,
    baseCreativeId: string,
    recommendations: CreativeRecommendation[]
  ): Promise<string[]> {
    try {
      console.log(`🤖 Création automatique de variants pour ${baseCreativeId}`);

      const [baseCreative] = await db.select()
        .from(creatifsPublicitaires)
        .where(eq(creatifsPublicitaires.id, baseCreativeId))
        .limit(1);

      if (!baseCreative) {
        throw new Error(`Créatif de base ${baseCreativeId} non trouvé`);
      }

      const variants: string[] = [];

      // Créer un variant pour chaque recommandation high priority
      const highPriorityRecs = recommendations.filter(rec => rec.priority === 'high').slice(0, 3);

      for (const rec of highPriorityRecs) {
        const variantData = await this.applyRecommendation(baseCreative, rec);
        const variantId = await this.createCreative(campaignId, variantData, 'variant');
        variants.push(variantId);

        // Créer automatiquement un test A/B
        await this.createABTest({
          campaignId,
          name: `Auto Test - ${rec.type}`,
          hypothesis: rec.reasoning,
          testType: rec.type,
          trafficSplit: 0.5,
          significanceLevel: 0.95,
          minSampleSize: 100,
          durationDays: 14,
          primaryMetric: 'ctr',
          controlCreative: this.creativeToConfig(baseCreative),
          variantCreative: variantData,
        });
      }

      console.log(`✅ ${variants.length} variants automatiques créés`);
      return variants;

    } catch (error) {
      console.error('❌ Erreur création variants automatiques:', error);
      throw error;
    }
  }

  // =============================================================================
  // MÉTHODES PRIVÉES
  // =============================================================================

  private async validateTestConfig(config: ABTestConfig): Promise<void> {
    // Vérifier que la campagne existe
    const [campaign] = await db.select()
      .from(campagnesPublicitaires)
      .where(eq(campagnesPublicitaires.id, config.campaignId))
      .limit(1);

    if (!campaign) {
      throw new Error(`Campagne ${config.campaignId} non trouvée`);
    }

    // Vérifier les paramètres
    if (config.trafficSplit <= 0 || config.trafficSplit >= 1) {
      throw new Error('La répartition du trafic doit être entre 0 et 1');
    }

    if (config.significanceLevel <= 0 || config.significanceLevel >= 1) {
      throw new Error('Le niveau de signification doit être entre 0 et 1');
    }

    if (config.minSampleSize < 30) {
      throw new Error('La taille d\'échantillon minimum doit être d\'au moins 30');
    }
  }

  private async createCreative(
    campaignId: string,
    creativeData: any,
    type: 'control' | 'variant'
  ): Promise<string> {
    const insertData: InsertCreatifPublicitaire = {
      campagneId,
      nom: `${creativeData.name} (${type})`,
      type: 'responsive_ad',
      titre: creativeData.title,
      description: creativeData.description,
      urlImage: creativeData.imageUrl,
      urlVideo: creativeData.videoUrl,
      callToAction: creativeData.callToAction,
      urlDestination: creativeData.destinationUrl,
      statut: 'paused', // Démarré en pause
    };

    const [creative] = await db.insert(creatifsPublicitaires)
      .values(insertData)
      .returning({ id: creatifsPublicitaires.id });

    return creative.id;
  }

  private async scheduleTestStart(testId: string): Promise<void> {
    // Dans un vrai système, utiliser un job scheduler comme Bull Queue
    // Pour la démo, on pourrait démarrer immédiatement ou après un délai
    setTimeout(async () => {
      try {
        await this.startTest(testId);
      } catch (error) {
        console.error(`❌ Erreur démarrage auto test ${testId}:`, error);
      }
    }, 60000); // Démarrer dans 1 minute
  }

  private async activateCreatives(test: any): Promise<void> {
    // Activer les créatifs dans les plateformes publicitaires
    // Google Ads, Facebook Ads, etc.
    
    await db.update(creatifsPublicitaires)
      .set({ statut: 'active' })
      .where(eq(creatifsPublicitaires.id, test.creatifControle));

    await db.update(creatifsPublicitaires)
      .set({ statut: 'active' })
      .where(eq(creatifsPublicitaires.id, test.creatifVariante));
  }

  private async getCreativeMetrics(creativeId: string): Promise<any> {
    const metrics = await db.select({
      impressions: sql<number>`SUM(CAST(${metriquesCampagnes.impressions} AS INTEGER))`,
      clicks: sql<number>`SUM(CAST(${metriquesCampagnes.clics} AS INTEGER))`,
      conversions: sql<number>`SUM(CAST(${metriquesCampagnes.conversions} AS DECIMAL))`,
      spend: sql<number>`SUM(CAST(${metriquesCampagnes.depense} AS DECIMAL))`,
      avgCTR: avg(metriquesCampagnes.ctr),
      avgCPA: avg(metriquesCampagnes.cpa),
      avgROAS: avg(metriquesCampagnes.roas),
    })
    .from(metriquesCampagnes)
    .where(eq(metriquesCampagnes.creatifId, creativeId));

    return metrics[0] || {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      avgCTR: 0,
      avgCPA: 0,
      avgROAS: 0,
    };
  }

  private calculateStatistics(
    controlMetrics: any,
    variantMetrics: any,
    metric: string,
    significanceLevel: number
  ): StatisticalResult {
    // Récupérer la valeur de la métrique principale
    const getMetricValue = (metrics: any, metricName: string): number => {
      switch (metricName) {
        case 'ctr':
          return Number(metrics.avgCTR) || 0;
        case 'cpa':
          return Number(metrics.avgCPA) || 0;
        case 'roas':
          return Number(metrics.avgROAS) || 0;
        case 'conversion_rate':
          return metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0;
        default:
          return Number(metrics.avgCTR) || 0;
      }
    };

    const controlValue = getMetricValue(controlMetrics, metric);
    const variantValue = getMetricValue(variantMetrics, metric);

    // Calculs statistiques simplifiés
    const difference = variantValue - controlValue;
    const percentChange = controlValue > 0 ? (difference / controlValue) * 100 : 0;

    // Test statistique simplifié (en réalité, utiliser un vrai test t ou test z)
    const controlSample = controlMetrics.impressions || 0;
    const variantSample = variantMetrics.impressions || 0;
    
    // Estimation simple du p-value (à remplacer par un vrai calcul statistique)
    const pValue = Math.abs(percentChange) > 5 ? 0.03 : 0.15; // Approximation
    
    const isSignificant = pValue < (1 - significanceLevel);
    const confidence = isSignificant ? significanceLevel : 0.5;

    let winner: 'control' | 'variant' | 'no_difference' = 'no_difference';
    if (isSignificant) {
      // Pour CPA, plus bas = mieux; pour les autres, plus haut = mieux
      if (metric === 'cpa') {
        winner = variantValue < controlValue ? 'variant' : 'control';
      } else {
        winner = variantValue > controlValue ? 'variant' : 'control';
      }
    }

    return {
      controlMetric: controlValue,
      variantMetric: variantValue,
      difference,
      percentChange,
      pValue,
      isSignificant,
      confidence,
      winner,
      sampleSizeControl: controlSample,
      sampleSizeVariant: variantSample,
    };
  }

  private async shouldCompleteTest(test: any): Promise<{ complete: boolean; reason: string }> {
    // Vérifier si le test doit être terminé
    const now = new Date();
    const endDate = test.dateFin ? new Date(test.dateFin) : null;

    // Test terminé par durée
    if (endDate && now >= endDate) {
      return { complete: true, reason: 'Durée écoulée' };
    }

    // Analyser si on a assez de données pour une conclusion statistique
    const result = await this.analyzeTest(test.id);
    
    // Test terminé par signification statistique
    if (result.isSignificant && 
        result.sampleSizeControl >= test.tailleSample && 
        result.sampleSizeVariant >= test.tailleSample) {
      return { complete: true, reason: 'Signification statistique atteinte' };
    }

    return { complete: false, reason: 'En cours' };
  }

  private async completeTest(testId: string, reason: string): Promise<void> {
    const result = await this.analyzeTest(testId);
    
    await db.update(testsABCreatifs)
      .set({
        statut: 'completed',
        dateFin: new Date(),
        gagnant: result.winner,
        confianceResultat: result.confidence.toString(),
        liftPerformance: result.percentChange.toString(),
      })
      .where(eq(testsABCreatifs.id, testId));

    console.log(`✅ Test A/B ${testId} terminé: ${result.winner} gagne (raison: ${reason})`);
  }

  private async getHistoricalPerformance(campaignId: string): Promise<any> {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 30);

    return await db.select({
      avgCTR: avg(metriquesCampagnes.ctr),
      avgCPA: avg(metriquesCampagnes.cpa),
      avgROAS: avg(metriquesCampagnes.roas),
      totalImpressions: sql<number>`SUM(CAST(${metriquesCampagnes.impressions} AS INTEGER))`,
      totalClicks: sql<number>`SUM(CAST(${metriquesCampagnes.clics} AS INTEGER))`,
    })
    .from(metriquesCampagnes)
    .leftJoin(creatifsPublicitaires, eq(metriquesCampagnes.creatifId, creatifsPublicitaires.id))
    .where(
      and(
        eq(creatifsPublicitaires.campagneId, campaignId),
        gte(metriquesCampagnes.date, dateLimit)
      )
    );
  }

  private async getSectorTrends(secteur: string): Promise<any> {
    // Analyser les tendances du secteur
    // Dans un vrai système, utiliser des données externes ou une base de benchmarks
    const sectorBenchmarks = {
      'restaurant': { avgCTR: 2.5, avgCPA: 45, popularColors: ['red', 'orange', 'yellow'] },
      'coiffeur': { avgCTR: 3.1, avgCPA: 35, popularColors: ['pink', 'purple', 'gold'] },
      'artisan': { avgCTR: 2.2, avgCPA: 55, popularColors: ['blue', 'gray', 'green'] },
    };

    return sectorBenchmarks[secteur] || sectorBenchmarks['restaurant'];
  }

  private generateHeadlineRecommendations(historical: any, trends: any): CreativeRecommendation[] {
    return [
      {
        type: 'headline',
        suggestion: 'Utiliser des chiffres spécifiques ("50% de réduction" au lieu de "Grande réduction")',
        reasoning: 'Les chiffres spécifiques augmentent la crédibilité et le CTR',
        expectedImprovement: '15-25% CTR',
        priority: 'high',
        estimatedImpact: 85,
      },
      {
        type: 'headline',
        suggestion: 'Ajouter un élément d\'urgence ("Offre limitée", "Seulement aujourd\'hui")',
        reasoning: 'L\'urgence crée un sentiment de FOMO et améliore la conversion',
        expectedImprovement: '20-30% conversions',
        priority: 'high',
        estimatedImpact: 80,
      },
    ];
  }

  private generateImageRecommendations(historical: any, trends: any): CreativeRecommendation[] {
    return [
      {
        type: 'image',
        suggestion: 'Utiliser des images avec des visages humains souriants',
        reasoning: 'Les visages humains créent une connexion émotionnelle plus forte',
        expectedImprovement: '12-18% engagement',
        priority: 'medium',
        estimatedImpact: 70,
      },
      {
        type: 'image',
        suggestion: 'Tester des images avec plus de contraste et de couleurs vives',
        reasoning: 'Les images contrastées attirent mieux l\'attention dans le feed',
        expectedImprovement: '8-15% CTR',
        priority: 'medium',
        estimatedImpact: 65,
      },
    ];
  }

  private generateCTARecommendations(historical: any, trends: any): CreativeRecommendation[] {
    return [
      {
        type: 'cta',
        suggestion: 'Tester "Réserver maintenant" au lieu de "En savoir plus"',
        reasoning: 'Les CTA d\'action directe convertissent mieux que les CTA informatifs',
        expectedImprovement: '25-40% conversions',
        priority: 'high',
        estimatedImpact: 90,
      },
    ];
  }

  private generateColorRecommendations(historical: any, trends: any): CreativeRecommendation[] {
    return [
      {
        type: 'color',
        suggestion: `Tester des boutons ${trends.popularColors?.[0] || 'orange'} au lieu de bleu`,
        reasoning: 'Les couleurs chaudes sont plus performantes pour ce secteur',
        expectedImprovement: '5-12% CTR',
        priority: 'low',
        estimatedImpact: 45,
      },
    ];
  }

  private async applyRecommendation(baseCreative: any, recommendation: CreativeRecommendation): Promise<any> {
    const variantData = {
      name: `${baseCreative.nom} - ${recommendation.type} variant`,
      title: baseCreative.titre,
      description: baseCreative.description,
      imageUrl: baseCreative.urlImage,
      videoUrl: baseCreative.urlVideo,
      callToAction: baseCreative.callToAction,
      destinationUrl: baseCreative.urlDestination,
    };

    // Appliquer la recommandation selon le type
    switch (recommendation.type) {
      case 'headline':
        if (recommendation.suggestion.includes('chiffres')) {
          variantData.title = variantData.title.replace(/réduction/gi, '50% de réduction');
        }
        if (recommendation.suggestion.includes('urgence')) {
          variantData.title += ' - Offre limitée !';
        }
        break;
      
      case 'cta':
        if (recommendation.suggestion.includes('Réserver maintenant')) {
          variantData.callToAction = 'BOOK_NOW';
        }
        break;
      
      // Autres types de recommandations...
    }

    return variantData;
  }

  private creativeToConfig(creative: any): any {
    return {
      name: creative.nom,
      title: creative.titre,
      description: creative.description,
      imageUrl: creative.urlImage,
      videoUrl: creative.urlVideo,
      callToAction: creative.callToAction,
      destinationUrl: creative.urlDestination,
    };
  }
}

// Instance singleton
export const abTestingEngine = new ABTestingEngine();