'use client';

import { Template, templatesData, sectorInfo } from './templatesData';

export interface BusinessRequirements {
  sector: 'restaurant' | 'beaute' | 'artisan' | 'medical';
  businessType: string;
  targetAudience: string;
  businessGoals: string[];
  preferredStyle: 'luxury' | 'premium' | 'modern' | 'elegant' | 'professional';
  budget: 'standard' | 'premium' | 'luxury';
  timeframe: 'express' | 'standard' | 'custom';
  specialRequirements?: string[];
}

export interface SmartSelectionResult {
  primaryTemplate: Template;
  alternativeTemplates: Template[];
  matchScore: number;
  customizations: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      reasoning: string;
    };
    logo: {
      style: string;
      elements: string[];
      reasoning: string;
    };
    photos: {
      categories: string[];
      mood: string;
      reasoning: string;
    };
  };
  conversionOptimizations: string[];
  estimatedDelivery: string;
  reasoning: string;
}

class SmartTemplateSelector {
  
  /**
   * Sélection intelligente du template optimal basée sur l'analyse business
   */
  public selectOptimalTemplate(requirements: BusinessRequirements): SmartSelectionResult {
    
    // 1. Filtrer par secteur
    const sectorTemplates = templatesData.filter(t => t.sector === requirements.sector);
    
    // 2. Analyser et scorer chaque template
    const scoredTemplates = sectorTemplates.map(template => ({
      template,
      score: this.calculateTemplateScore(template, requirements)
    })).sort((a, b) => b.score - a.score);

    const primaryTemplate = scoredTemplates[0].template;
    const alternativeTemplates = scoredTemplates.slice(1, 4).map(st => st.template);

    // 3. Générer les customisations intelligentes
    const customizations = this.generateSmartCustomizations(primaryTemplate, requirements);

    // 4. Optimisations conversion
    const conversionOptimizations = this.generateConversionOptimizations(requirements);

    // 5. Estimation délai
    const estimatedDelivery = this.calculateDeliveryTime(requirements);

    // 6. Reasoning de la sélection
    const reasoning = this.generateSelectionReasoning(primaryTemplate, requirements, scoredTemplates[0].score);

    return {
      primaryTemplate,
      alternativeTemplates,
      matchScore: scoredTemplates[0].score,
      customizations,
      conversionOptimizations,
      estimatedDelivery,
      reasoning
    };
  }

  /**
   * Calcule le score de compatibilité template/requirements
   */
  private calculateTemplateScore(template: Template, requirements: BusinessRequirements): number {
    let score = 0;

    // Style match (30% du score)
    if (template.designType === requirements.preferredStyle) {
      score += 30;
    } else {
      // Compatibilité partielle
      const styleCompatibility = this.getStyleCompatibility(template.designType, requirements.preferredStyle);
      score += styleCompatibility * 30;
    }

    // Budget compatibility (25% du score)
    const budgetScore = this.getBudgetCompatibility(template.designType, requirements.budget);
    score += budgetScore * 25;

    // Features alignment (25% du score)
    const featureScore = this.getFeatureAlignment(template, requirements);
    score += featureScore * 25;

    // Performance & conversion (20% du score)
    const perfScore = this.getPerformanceScore(template);
    score += perfScore * 20;

    return Math.round(score);
  }

  /**
   * Compatibilité entre styles
   */
  private getStyleCompatibility(templateStyle: string, preferredStyle: string): number {
    const compatibilityMatrix: Record<string, Record<string, number>> = {
      luxury: { premium: 0.8, elegant: 0.7, professional: 0.5, modern: 0.3 },
      premium: { luxury: 0.8, professional: 0.9, elegant: 0.6, modern: 0.4 },
      modern: { professional: 0.7, elegant: 0.5, premium: 0.4, luxury: 0.3 },
      elegant: { luxury: 0.7, premium: 0.6, professional: 0.5, modern: 0.5 },
      professional: { premium: 0.9, modern: 0.7, elegant: 0.5, luxury: 0.5 }
    };

    return compatibilityMatrix[templateStyle]?.[preferredStyle] || 0;
  }

  /**
   * Compatibilité budget
   */
  private getBudgetCompatibility(templateStyle: string, budget: string): number {
    const budgetMapping: Record<string, string[]> = {
      standard: ['modern', 'professional'],
      premium: ['premium', 'elegant', 'professional'],
      luxury: ['luxury', 'premium', 'elegant']
    };

    return budgetMapping[budget]?.includes(templateStyle) ? 1 : 0.5;
  }

  /**
   * Alignement des fonctionnalités
   */
  private getFeatureAlignment(template: Template, requirements: BusinessRequirements): number {
    const businessTypeFeatures = this.getRequiredFeaturesByBusinessType(requirements.businessType, requirements.sector);
    const goalFeatures = this.getFeaturesByGoals(requirements.businessGoals);
    
    const requiredFeatures = [...businessTypeFeatures, ...goalFeatures];
    const templateFeatures = template.features.map(f => f.toLowerCase());
    
    let matchingFeatures = 0;
    requiredFeatures.forEach(required => {
      if (templateFeatures.some(tf => tf.includes(required.toLowerCase()))) {
        matchingFeatures++;
      }
    });

    return requiredFeatures.length > 0 ? matchingFeatures / requiredFeatures.length : 0.5;
  }

  /**
   * Score de performance
   */
  private getPerformanceScore(template: Template): number {
    const lighthouseScore = template.stats.lighthouse / 100;
    const loadTimeScore = this.getLoadTimeScore(template.stats.loadTime);
    const conversionScore = this.getConversionScore(template.stats.conversionRate);
    
    return (lighthouseScore + loadTimeScore + conversionScore) / 3;
  }

  private getLoadTimeScore(loadTime: string): number {
    const time = parseFloat(loadTime.replace('s', ''));
    if (time <= 0.5) return 1;
    if (time <= 0.7) return 0.8;
    if (time <= 1.0) return 0.6;
    return 0.4;
  }

  private getConversionScore(conversionRate: string): number {
    const rate = parseInt(conversionRate.replace('+', '').replace('%', ''));
    if (rate >= 60) return 1;
    if (rate >= 50) return 0.9;
    if (rate >= 40) return 0.8;
    if (rate >= 30) return 0.6;
    return 0.4;
  }

  /**
   * Génère les customisations intelligentes
   */
  private generateSmartCustomizations(template: Template, requirements: BusinessRequirements) {
    return {
      colors: this.generateSmartColors(template, requirements),
      logo: this.generateSmartLogo(template, requirements),
      photos: this.generateSmartPhotos(template, requirements)
    };
  }

  private generateSmartColors(template: Template, requirements: BusinessRequirements) {
    const sectorColors = this.getSectorOptimalColors(requirements.sector);
    const styleColors = this.getStyleColors(requirements.preferredStyle);
    
    // Mix intelligent des couleurs secteur + style + template
    return {
      primary: sectorColors.primary,
      secondary: styleColors.secondary,
      accent: template.colors.accent,
      reasoning: `Couleurs optimisées pour ${requirements.sector} avec style ${requirements.preferredStyle}, 
                 conservant l'accent du template pour la cohérence`
    };
  }

  private generateSmartLogo(template: Template, requirements: BusinessRequirements) {
    const logoElements = this.getLogoElementsBySector(requirements.sector);
    const styleApproach = this.getLogoStyleBySector(requirements.sector, requirements.preferredStyle);
    
    return {
      style: styleApproach,
      elements: logoElements,
      reasoning: `Logo ${styleApproach} avec éléments ${logoElements.join(', ')} 
                 pour maximiser la reconnaissance secteur ${requirements.sector}`
    };
  }

  private generateSmartPhotos(template: Template, requirements: BusinessRequirements) {
    const photoCategories = this.getPhotoCategories(requirements.sector, requirements.businessType);
    const mood = this.getPhotoMood(requirements.preferredStyle, requirements.targetAudience);
    
    return {
      categories: photoCategories,
      mood,
      reasoning: `Photos ${mood} catégories ${photoCategories.join(', ')} 
                 pour connecter avec ${requirements.targetAudience}`
    };
  }

  /**
   * Optimisations conversion par secteur
   */
  private generateConversionOptimizations(requirements: BusinessRequirements): string[] {
    const baseOptimizations = [
      "Boutons d'action optimisés couleur et placement",
      "Formulaires simplifiés 3 champs max",
      "Témoignages clients en évidence",
      "Garanties et certifications visibles"
    ];

    const sectorOptimizations: Record<string, string[]> = {
      restaurant: [
        "Menu avec prix et photos appétissantes",
        "Bouton réservation fixe en mobile",
        "Avis Google intégrés temps réel",
        "Click-to-call pour commandes"
      ],
      beaute: [
        "Galerie avant/après prominente",
        "Booking en ligne simplifié",
        "Tarifs transparents affichés",
        "Équipe avec photos et spécialités"
      ],
      artisan: [
        "Portfolio réalisations en hero",
        "Devis gratuit en 1 clic",
        "Certifications et labels qualité",
        "Zone d'intervention claire"
      ],
      medical: [
        "Prise RDV ultra-simplifiée",
        "Informations rassurantes RGPD",
        "Urgences contact évident",
        "Spécialités et équipe médicale"
      ]
    };

    return [...baseOptimizations, ...sectorOptimizations[requirements.sector]];
  }

  /**
   * Calcul du délai de livraison
   */
  private calculateDeliveryTime(requirements: BusinessRequirements): string {
    const baseTime = {
      express: 8, // 8 heures
      standard: 24, // 1 jour
      custom: 72 // 3 jours
    };

    const complexityMultiplier = {
      luxury: 1.5,
      premium: 1.3,
      modern: 1.0,
      elegant: 1.2,
      professional: 1.1
    };

    const finalHours = baseTime[requirements.timeframe] * complexityMultiplier[requirements.preferredStyle];

    if (finalHours <= 12) return `${Math.round(finalHours)}h`;
    if (finalHours <= 48) return `${Math.round(finalHours / 24)} jour${finalHours > 24 ? 's' : ''}`;
    return `${Math.round(finalHours / 24)} jours`;
  }

  /**
   * Génère le raisonnement de sélection
   */
  private generateSelectionReasoning(template: Template, requirements: BusinessRequirements, score: number): string {
    return `Template "${template.name}" sélectionné avec ${score}% de compatibilité.
    
    ✅ Parfait pour ${requirements.sector} style ${requirements.preferredStyle}
    ✅ Performance optimale (${template.stats.lighthouse}/100 Lighthouse)
    ✅ Conversion prouvée (${template.stats.conversionRate} vs concurrence)
    ✅ Fonctionnalités alignées business ${requirements.businessType}
    
    🎯 Délai de livraison: ${this.calculateDeliveryTime(requirements)}
    🚀 Prêt pour génération express avec customisations automatiques`;
  }

  // Helper methods pour les données sectorielles
  private getRequiredFeaturesByBusinessType(businessType: string, sector: string): string[] {
    const mapping: Record<string, Record<string, string[]>> = {
      restaurant: {
        'bistrot': ['menu', 'réservation', 'galerie'],
        'pizzeria': ['commande', 'livraison', 'configurateur'],
        'gastronomique': ['dégustation', 'chef', 'événements']
      },
      beaute: {
        'salon coiffure': ['booking', 'galerie', 'équipe'],
        'institut': ['spa', 'soins', 'wellness'],
        'barbier': ['réservation', 'produits', 'techniques']
      },
      artisan: {
        'menuiserie': ['portfolio', 'devis', 'matériaux'],
        'ferronnerie': ['créations', 'forge', 'architectural'],
        'céramique': ['oeuvres', 'ateliers', 'expositions']
      },
      medical: {
        'généraliste': ['rdv', 'téléconsultation', 'équipe'],
        'dentiste': ['soins', 'imagerie', 'esthétique'],
        'kiné': ['thérapies', 'rééducation', 'suivi']
      }
    };

    return mapping[sector]?.[businessType] || [];
  }

  private getFeaturesByGoals(goals: string[]): string[] {
    const goalMapping: Record<string, string[]> = {
      'augmenter-visibilite': ['seo', 'réseaux', 'blog'],
      'generer-leads': ['contact', 'devis', 'formulaire'],
      'vendre-en-ligne': ['boutique', 'paiement', 'commande'],
      'fideliser-clients': ['fidélité', 'newsletter', 'avis']
    };

    return goals.flatMap(goal => goalMapping[goal] || []);
  }

  private getSectorOptimalColors(sector: string) {
    const colors: Record<string, {primary: string, secondary: string}> = {
      restaurant: { primary: '#D2691E', secondary: '#8B4513' },
      beaute: { primary: '#FF69B4', secondary: '#DDA0DD' },
      artisan: { primary: '#8B4513', secondary: '#D2691E' },
      medical: { primary: '#008B8B', secondary: '#20B2AA' }
    };
    
    return colors[sector];
  }

  private getStyleColors(style: string) {
    const colors: Record<string, {secondary: string}> = {
      luxury: { secondary: '#D4AF37' },
      premium: { secondary: '#4169E1' },
      modern: { secondary: '#32CD32' },
      elegant: { secondary: '#9370DB' },
      professional: { secondary: '#2F4F4F' }
    };
    
    return colors[style];
  }

  private getLogoElementsBySector(sector: string): string[] {
    const elements: Record<string, string[]> = {
      restaurant: ['fourchette', 'assiette', 'chef hat', 'étoile'],
      beaute: ['ciseaux', 'miroir', 'fleur', 'papillon'],
      artisan: ['outils', 'mains', 'engrenage', 'marteau'],
      medical: ['croix', 'stéthoscope', 'caducée', 'coeur']
    };
    
    return elements[sector] || [];
  }

  private getLogoStyleBySector(sector: string, style: string): string {
    if (style === 'luxury') return 'emblème doré';
    if (style === 'modern') return 'minimaliste géométrique';
    if (style === 'elegant') return 'calligraphie raffinée';
    return 'professionnel équilibré';
  }

  private getPhotoCategories(sector: string, businessType: string): string[] {
    const categories: Record<string, string[]> = {
      restaurant: ['plats signature', 'ambiance restaurant', 'équipe cuisine'],
      beaute: ['transformations avant/après', 'salon moderne', 'équipe stylistes'],
      artisan: ['réalisations portfolio', 'atelier travail', 'artisan action'],
      medical: ['cabinet moderne', 'équipe médicale', 'équipements']
    };
    
    return categories[sector] || [];
  }

  private getPhotoMood(style: string, audience: string): string {
    if (style === 'luxury') return 'sophistiqué premium';
    if (style === 'modern') return 'contemporain dynamique';
    if (style === 'elegant') return 'raffiné chaleureux';
    return 'professionnel rassurant';
  }
}

// Instance singleton
export const smartTemplateSelector = new SmartTemplateSelector();

// API React Hook pour utilisation facile
export function useSmartTemplateSelection(requirements: BusinessRequirements | null) {
  if (!requirements) return null;
  
  return smartTemplateSelector.selectOptimalTemplate(requirements);
}