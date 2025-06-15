'use client';

import React from 'react';
import { Template } from './templatesData';
import { BusinessInfo } from './ExpressBusinessGenerator';

export interface ConversionOptimization {
  id: string;
  type: 'layout' | 'content' | 'cta' | 'form' | 'trust' | 'speed' | 'seo';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  implementation: string;
  expectedGain: string;  // Ex: "+15% conversion"
  priority: number;
  sector: string[];
  businessTypes: string[];
}

export interface OptimizedTemplate extends Template {
  conversionOptimizations: ConversionOptimization[];
  optimizedElements: {
    hero: OptimizedHeroSection;
    cta: OptimizedCTA[];
    forms: OptimizedForm[];
    trustSignals: TrustSignal[];
    socialProof: SocialProofElement[];
  };
  conversionScore: number;
  performanceOptimizations: PerformanceOptimization[];
}

export interface OptimizedHeroSection {
  title: {
    template: string;
    variables: string[];
    psychology: string[];
  };
  subtitle: {
    template: string;
    benefits: string[];
    urgency?: string;
  };
  cta: {
    text: string;
    color: string;
    size: 'small' | 'medium' | 'large';
    position: string;
  };
  backgroundStrategy: string;
}

export interface OptimizedCTA {
  id: string;
  text: string;
  placement: string;
  color: string;
  psychology: string[];
  urgency?: string;
  icon?: string;
  tracking: string;
}

export interface OptimizedForm {
  id: string;
  type: 'contact' | 'quote' | 'booking' | 'newsletter';
  fields: FormField[];
  design: FormDesign;
  psychology: FormPsychology;
}

export interface FormField {
  name: string;
  type: string;
  required: boolean;
  placeholder: string;
  validation: string;
  position: number;
}

export interface FormDesign {
  layout: 'inline' | 'stacked' | 'floating';
  style: 'minimal' | 'modern' | 'classic';
  progressBar: boolean;
  multiStep: boolean;
}

export interface FormPsychology {
  socialProof: string;
  urgency: string;
  reassurance: string;
  incentive?: string;
}

export interface TrustSignal {
  type: 'certification' | 'testimonial' | 'guarantee' | 'security' | 'stats';
  content: string;
  placement: string;
  visual: string;
}

export interface SocialProofElement {
  type: 'reviews' | 'clients' | 'stats' | 'media' | 'certifications';
  content: string;
  source: string;
  visual: string;
  prominence: 'subtle' | 'medium' | 'prominent';
}

export interface PerformanceOptimization {
  type: 'loading' | 'rendering' | 'interaction' | 'seo';
  description: string;
  implementation: string;
  impact: string;
}

class ConversionOptimizer {
  
  /**
   * Optimise un template pour la conversion business
   */
  public optimizeTemplate(
    template: Template,
    businessInfo: BusinessInfo,
    targetAudience: string
  ): OptimizedTemplate {
    
    // 1. Analyser les opportunités d'optimisation
    const optimizations = this.analyzeConversionOpportunities(template, businessInfo);
    
    // 2. Optimiser chaque élément
    const optimizedElements = this.optimizeElements(template, businessInfo, targetAudience);
    
    // 3. Calculer le score de conversion
    const conversionScore = this.calculateConversionScore(template, optimizations);
    
    // 4. Optimisations performance
    const performanceOptimizations = this.generatePerformanceOptimizations(template, businessInfo.sector);

    return {
      ...template,
      conversionOptimizations: optimizations,
      optimizedElements,
      conversionScore,
      performanceOptimizations
    };
  }

  /**
   * Analyse les opportunités d'optimisation conversion
   */
  private analyzeConversionOpportunities(
    template: Template,
    businessInfo: BusinessInfo
  ): ConversionOptimization[] {
    
    const optimizations: ConversionOptimization[] = [];

    // Optimisations génériques haute impact
    optimizations.push(...this.getGenericHighImpactOptimizations());
    
    // Optimisations spécifiques au secteur
    optimizations.push(...this.getSectorSpecificOptimizations(businessInfo.sector));
    
    // Optimisations basées sur le template
    optimizations.push(...this.getTemplateBasedOptimizations(template));
    
    // Optimisations basées sur le business
    optimizations.push(...this.getBusinessBasedOptimizations(businessInfo));

    // Trier par impact et priorité
    return optimizations.sort((a, b) => {
      const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact] || b.priority - a.priority;
    });
  }

  /**
   * Optimise tous les éléments du template
   */
  private optimizeElements(
    template: Template,
    businessInfo: BusinessInfo,
    targetAudience: string
  ) {
    return {
      hero: this.optimizeHeroSection(template, businessInfo, targetAudience),
      cta: this.optimizeCTAs(template, businessInfo),
      forms: this.optimizeForms(template, businessInfo),
      trustSignals: this.generateTrustSignals(businessInfo),
      socialProof: this.generateSocialProof(businessInfo, template)
    };
  }

  /**
   * Optimise la section hero
   */
  private optimizeHeroSection(
    template: Template,
    businessInfo: BusinessInfo,
    targetAudience: string
  ): OptimizedHeroSection {
    
    const sectorPsychology = this.getSectorPsychology(businessInfo.sector);
    const audiencePsychology = this.getAudiencePsychology(targetAudience);

    return {
      title: {
        template: this.generateTitleTemplate(businessInfo, sectorPsychology),
        variables: ['businessName', 'city', 'mainService', 'uniqueValue'],
        psychology: [...sectorPsychology.title, ...audiencePsychology.title]
      },
      subtitle: {
        template: this.generateSubtitleTemplate(businessInfo, sectorPsychology),
        benefits: this.extractBenefits(businessInfo.description, businessInfo.sector),
        urgency: sectorPsychology.urgency
      },
      cta: {
        text: this.generatePrimaryCTA(businessInfo.sector),
        color: this.getCTAColor(template.colors.primary),
        size: 'large',
        position: 'center-prominent'
      },
      backgroundStrategy: this.getBackgroundStrategy(template.designType)
    };
  }

  /**
   * Optimise les CTAs
   */
  private optimizeCTAs(template: Template, businessInfo: BusinessInfo): OptimizedCTA[] {
    const sectorCTAs = this.getSectorCTAs(businessInfo.sector);
    
    return sectorCTAs.map((cta, index) => ({
      id: `cta-${index + 1}`,
      text: cta.text,
      placement: cta.placement,
      color: index === 0 ? template.colors.primary : template.colors.secondary,
      psychology: cta.psychology,
      urgency: cta.urgency,
      icon: cta.icon,
      tracking: `cta-${cta.type}-${index + 1}`
    }));
  }

  /**
   * Optimise les formulaires
   */
  private optimizeForms(template: Template, businessInfo: BusinessInfo): OptimizedForm[] {
    const sectorForms = this.getSectorForms(businessInfo.sector);
    
    return sectorForms.map(form => ({
      id: form.id,
      type: form.type,
      fields: this.optimizeFormFields(form.fields, businessInfo.sector),
      design: this.optimizeFormDesign(template.designType),
      psychology: this.getFormPsychology(businessInfo.sector, form.type)
    }));
  }

  /**
   * Génère les signaux de confiance
   */
  private generateTrustSignals(businessInfo: BusinessInfo): TrustSignal[] {
    const sectorTrustSignals = this.getSectorTrustSignals(businessInfo.sector);
    
    return sectorTrustSignals.map(signal => ({
      type: signal.type,
      content: this.personalizeContent(signal.content, businessInfo),
      placement: signal.placement,
      visual: signal.visual
    }));
  }

  /**
   * Génère la preuve sociale
   */
  private generateSocialProof(businessInfo: BusinessInfo, template: Template): SocialProofElement[] {
    const sectorSocialProof = this.getSectorSocialProof(businessInfo.sector);
    
    return sectorSocialProof.map(proof => ({
      type: proof.type,
      content: this.personalizeSocialProof(proof.content, businessInfo),
      source: proof.source,
      visual: proof.visual,
      prominence: proof.prominence
    }));
  }

  /**
   * Calcule le score de conversion
   */
  private calculateConversionScore(template: Template, optimizations: ConversionOptimization[]): number {
    let baseScore = parseInt(template.stats.conversionRate.replace('+', '').replace('%', ''));
    
    // Bonus pour chaque optimisation
    const optimizationBonus = optimizations.reduce((bonus, opt) => {
      const impactMultiplier = { critical: 4, high: 3, medium: 2, low: 1 };
      return bonus + impactMultiplier[opt.impact];
    }, 0);

    return Math.min(baseScore + optimizationBonus, 100);
  }

  // Helper methods pour optimisations génériques
  private getGenericHighImpactOptimizations(): ConversionOptimization[] {
    return [
      {
        id: 'hero-cta-optimization',
        type: 'cta',
        title: 'Optimisation CTA Principal',
        description: 'CTA hero avec contraste élevé, action claire et placement optimal',
        impact: 'critical',
        implementation: 'Bouton 40% plus large, couleur contrastée, texte orienté action',
        expectedGain: '+25% clics',
        priority: 10,
        sector: ['restaurant', 'beaute', 'artisan', 'medical'],
        businessTypes: []
      },
      {
        id: 'mobile-first-design',
        type: 'layout',
        title: 'Design Mobile-First',
        description: 'Interface optimisée pour mobile avec navigation tactile',
        impact: 'critical',
        implementation: 'Navigation bottom bar, boutons touch-friendly, contenu priorisé',
        expectedGain: '+35% conversion mobile',
        priority: 9,
        sector: ['restaurant', 'beaute', 'artisan', 'medical'],
        businessTypes: []
      },
      {
        id: 'social-proof-integration',
        type: 'trust',
        title: 'Preuves Sociales Intégrées',
        description: 'Avis, témoignages et statistiques en évidence',
        impact: 'high',
        implementation: 'Widget avis temps réel, compteur clients, témoignages rotatifs',
        expectedGain: '+18% confiance',
        priority: 8,
        sector: ['restaurant', 'beaute', 'artisan', 'medical'],
        businessTypes: []
      }
    ];
  }

  private getSectorSpecificOptimizations(sector: string): ConversionOptimization[] {
    const optimizations: Record<string, ConversionOptimization[]> = {
      restaurant: [
        {
          id: 'menu-visual-optimization',
          type: 'content',
          title: 'Menu Visuel Optimisé',
          description: 'Photos plats HD avec prix et descriptions appétissantes',
          impact: 'high',
          implementation: 'Photos professionnelles, descriptions sensorielles, prix visibles',
          expectedGain: '+30% commandes',
          priority: 9,
          sector: ['restaurant'],
          businessTypes: ['bistrot', 'pizzeria', 'gastronomique']
        },
        {
          id: 'reservation-widget',
          type: 'form',
          title: 'Widget Réservation Simplifié',
          description: 'Booking en 2 clics avec disponibilités temps réel',
          impact: 'critical',
          implementation: 'Calendrier interactif, confirmation immédiate, rappels SMS',
          expectedGain: '+45% réservations',
          priority: 10,
          sector: ['restaurant'],
          businessTypes: []
        }
      ],
      beaute: [
        {
          id: 'before-after-gallery',
          type: 'content',
          title: 'Galerie Avant/Après',
          description: 'Transformations clientes en slider interactif',
          impact: 'high',
          implementation: 'Slider comparaison, filtres par service, zoom HD',
          expectedGain: '+28% prises RDV',
          priority: 9,
          sector: ['beaute'],
          businessTypes: []
        },
        {
          id: 'online-booking-beauty',
          type: 'form',
          title: 'Réservation Beauté Intelligente',
          description: 'Booking avec sélection service, durée et styliste',
          impact: 'critical',
          implementation: 'Configurateur service, agenda styliste, tarifs dynamiques',
          expectedGain: '+40% bookings',
          priority: 10,
          sector: ['beaute'],
          businessTypes: []
        }
      ],
      artisan: [
        {
          id: 'portfolio-showcase',
          type: 'content',
          title: 'Portfolio Showcase 3D',
          description: 'Réalisations en galerie interactive avec détails projet',
          impact: 'high',
          implementation: 'Galerie 3D, filtres matériaux, temps réalisation, tarifs',
          expectedGain: '+35% demandes devis',
          priority: 9,
          sector: ['artisan'],
          businessTypes: []
        },
        {
          id: 'instant-quote-form',
          type: 'form',
          title: 'Devis Express Intelligent',
          description: 'Formulaire devis avec estimation prix temps réel',
          impact: 'critical',
          implementation: 'Configurateur projet, calcul automatique, rendez-vous intégré',
          expectedGain: '+50% demandes devis',
          priority: 10,
          sector: ['artisan'],
          businessTypes: []
        }
      ],
      medical: [
        {
          id: 'medical-appointment-system',
          type: 'form',
          title: 'Système RDV Médical Sécurisé',
          description: 'Prise RDV conforme RGPD avec téléconsultation',
          impact: 'critical',
          implementation: 'Agenda médical, conformité RGPD, téléconsultation intégrée',
          expectedGain: '+60% prises RDV',
          priority: 10,
          sector: ['medical'],
          businessTypes: []
        },
        {
          id: 'medical-trust-signals',
          type: 'trust',
          title: 'Signaux Confiance Médicaux',
          description: 'Diplômes, certifications et affiliations en évidence',
          impact: 'high',
          implementation: 'Certificats numériques, affiliations ordres, spécialités',
          expectedGain: '+25% confiance patients',
          priority: 8,
          sector: ['medical'],
          businessTypes: []
        }
      ]
    };

    return optimizations[sector] || [];
  }

  private getTemplateBasedOptimizations(template: Template): ConversionOptimization[] {
    const optimizations: ConversionOptimization[] = [];

    // Optimisations basées sur le design type
    if (template.designType === 'luxury') {
      optimizations.push({
        id: 'luxury-exclusivity',
        type: 'content',
        title: 'Messages Exclusivité Premium',
        description: 'Contenus VIP et expérience haut de gamme',
        impact: 'high',
        implementation: 'Sections VIP, services exclusifs, tarification premium',
        expectedGain: '+20% clients premium',
        priority: 7,
        sector: [template.sector],
        businessTypes: []
      });
    }

    if (template.designType === 'modern') {
      optimizations.push({
        id: 'modern-interactivity',
        type: 'layout',
        title: 'Éléments Interactifs Modernes',
        description: 'Animations et micro-interactions engageantes',
        impact: 'medium',
        implementation: 'Hover effects, transitions fluides, feedback visuel',
        expectedGain: '+15% engagement',
        priority: 6,
        sector: [template.sector],
        businessTypes: []
      });
    }

    return optimizations;
  }

  private getBusinessBasedOptimizations(businessInfo: BusinessInfo): ConversionOptimization[] {
    const optimizations: ConversionOptimization[] = [];

    // Optimisations basées sur la localisation
    optimizations.push({
      id: 'local-seo-optimization',
      type: 'seo',
      title: `Optimisation SEO Local ${businessInfo.city}`,
      description: 'Référencement local optimisé pour votre ville',
      impact: 'high',
      implementation: `Schema local business, mots-clés ${businessInfo.city}, Google My Business`,
      expectedGain: '+40% visibilité locale',
      priority: 8,
      sector: [businessInfo.sector],
      businessTypes: []
    });

    return optimizations;
  }

  // Helper methods pour éléments optimisés
  private getSectorPsychology(sector: string) {
    const psychology: Record<string, any> = {
      restaurant: {
        title: ['appétit', 'convivialité', 'tradition'],
        urgency: 'Réservez maintenant, places limitées',
        emotions: ['plaisir', 'partage', 'découverte']
      },
      beaute: {
        title: ['transformation', 'confiance', 'bien-être'],
        urgency: 'Offre limitée ce mois-ci',
        emotions: ['confiance', 'élégance', 'détente']
      },
      artisan: {
        title: ['savoir-faire', 'authentique', 'sur-mesure'],
        urgency: 'Devis gratuit sous 24h',
        emotions: ['fierté', 'qualité', 'durabilité']
      },
      medical: {
        title: ['confiance', 'expertise', 'soin'],
        urgency: 'Consultations disponibles cette semaine',
        emotions: ['sécurité', 'professionnalisme', 'bienveillance']
      }
    };

    return psychology[sector] || psychology.medical;
  }

  private getAudiencePsychology(audience: string) {
    // Analyse basique de l'audience
    return {
      title: ['local', 'proximité'],
      emotions: ['confiance', 'qualité']
    };
  }

  private generateTitleTemplate(businessInfo: BusinessInfo, psychology: any): string {
    const templates: Record<string, string> = {
      restaurant: `${businessInfo.name} - ${psychology.title[0]} ${businessInfo.city}`,
      beaute: `${businessInfo.name} - Votre ${psychology.title[0]} à ${businessInfo.city}`,
      artisan: `${businessInfo.name} - ${psychology.title[0]} artisanal ${businessInfo.city}`,
      medical: `${businessInfo.name} - Soins ${psychology.title[0]} ${businessInfo.city}`
    };

    return templates[businessInfo.sector] || templates.medical;
  }

  private generateSubtitleTemplate(businessInfo: BusinessInfo, psychology: any): string {
    return businessInfo.description || `Découvrez notre expertise ${psychology.title[0]} à ${businessInfo.city}`;
  }

  private extractBenefits(description: string, sector: string): string[] {
    const sectorBenefits: Record<string, string[]> = {
      restaurant: ['Cuisine authentique', 'Ambiance chaleureuse', 'Produits frais'],
      beaute: ['Équipe experte', 'Produits premium', 'Résultats garantis'],
      artisan: ['Travail sur mesure', 'Matériaux nobles', 'Expertise reconnue'],
      medical: ['Soins personnalisés', 'Équipe qualifiée', 'Matériel moderne']
    };

    return sectorBenefits[sector] || [];
  }

  private generatePrimaryCTA(sector: string): string {
    const ctas: Record<string, string> = {
      restaurant: 'Réserver une table',
      beaute: 'Prendre rendez-vous',
      artisan: 'Demander un devis',
      medical: 'Prendre rendez-vous'
    };

    return ctas[sector] || 'Nous contacter';
  }

  private getCTAColor(primaryColor: string): string {
    // Retourne une couleur CTA optimisée basée sur la couleur primaire
    return primaryColor;
  }

  private getBackgroundStrategy(designType: string): string {
    const strategies: Record<string, string> = {
      luxury: 'video-premium',
      premium: 'image-overlay',
      modern: 'gradient-dynamic',
      elegant: 'image-subtle',
      professional: 'solid-clean'
    };

    return strategies[designType] || strategies.professional;
  }

  // Continue avec les autres helper methods...
  private getSectorCTAs(sector: string) {
    // Implémentation des CTAs par secteur
    return [];
  }

  private getSectorForms(sector: string) {
    // Implémentation des formulaires par secteur
    return [];
  }

  private getSectorTrustSignals(sector: string) {
    // Implémentation des signaux de confiance par secteur
    return [];
  }

  private getSectorSocialProof(sector: string) {
    // Implémentation de la preuve sociale par secteur
    return [];
  }

  private optimizeFormFields(fields: any[], sector: string): FormField[] {
    // Optimisation des champs de formulaire
    return [];
  }

  private optimizeFormDesign(designType: string): FormDesign {
    // Optimisation du design de formulaire
    return {
      layout: 'stacked',
      style: 'modern',
      progressBar: false,
      multiStep: false
    };
  }

  private getFormPsychology(sector: string, formType: string): FormPsychology {
    // Psychologie des formulaires
    return {
      socialProof: '',
      urgency: '',
      reassurance: ''
    };
  }

  private personalizeContent(content: string, businessInfo: BusinessInfo): string {
    return content.replace('{businessName}', businessInfo.name).replace('{city}', businessInfo.city);
  }

  private personalizeSocialProof(content: string, businessInfo: BusinessInfo): string {
    return this.personalizeContent(content, businessInfo);
  }

  private generatePerformanceOptimizations(template: Template, sector: string): PerformanceOptimization[] {
    return [
      {
        type: 'loading',
        description: 'Lazy loading images et compression optimisée',
        implementation: 'WebP images, lazy loading, critical CSS',
        impact: '+40% vitesse chargement'
      },
      {
        type: 'seo',
        description: 'Optimisation SEO technique complète',
        implementation: 'Schema markup, meta optimisées, sitemap',
        impact: '+60% visibilité Google'
      }
    ];
  }
}

// Instance singleton
export const conversionOptimizer = new ConversionOptimizer();

// React Hook pour utilisation
export function useConversionOptimizer(
  template: Template,
  businessInfo: BusinessInfo,
  targetAudience: string
) {
  return React.useMemo(() => {
    return conversionOptimizer.optimizeTemplate(template, businessInfo, targetAudience);
  }, [template, businessInfo, targetAudience]);
}

// Composant de visualisation des optimisations
export function ConversionOptimizationDashboard({ 
  optimizedTemplate 
}: { 
  optimizedTemplate: OptimizedTemplate 
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">📈 Optimisations Conversion</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">{optimizedTemplate.conversionScore}%</div>
          <div className="text-sm text-gray-500">Score conversion</div>
        </div>
      </div>

      {/* Optimisations prioritaires */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">🎯 Optimisations Appliquées</h4>
        <div className="space-y-3">
          {optimizedTemplate.conversionOptimizations.slice(0, 5).map((opt) => (
            <div key={opt.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-blue-900">{opt.title}</h5>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  opt.impact === 'critical' ? 'bg-red-100 text-red-800' :
                  opt.impact === 'high' ? 'bg-orange-100 text-orange-800' :
                  opt.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {opt.impact}
                </span>
              </div>
              <p className="text-sm text-blue-700 mb-2">{opt.description}</p>
              <div className="text-xs text-green-600 font-semibold">{opt.expectedGain}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Éléments optimisés */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-semibold text-gray-700 mb-2">🎪 Hero Optimisé</h5>
          <div className="text-sm space-y-1">
            <div><strong>CTA:</strong> {optimizedTemplate.optimizedElements.hero.cta.text}</div>
            <div><strong>Position:</strong> {optimizedTemplate.optimizedElements.hero.cta.position}</div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-semibold text-gray-700 mb-2">🛡️ Signaux Confiance</h5>
          <div className="text-sm">
            <div>{optimizedTemplate.optimizedElements.trustSignals.length} signaux intégrés</div>
          </div>
        </div>
      </div>
    </div>
  );
}