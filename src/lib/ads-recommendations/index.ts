// Ads Recommendations Engine
// Ads Management Agent - Personalized Marketing Strategy & Budget Optimization

import { coreLogger } from '@/lib/monitoring';
import { CompetitorData, KeywordAnalysis, MarketAnalysis } from '@/lib/competitive-intelligence';

export interface BusinessProfile {
  name: string;
  industry: string;
  location: string;
  businessType: 'startup' | 'small_business' | 'medium_business' | 'enterprise';
  targetAudience: {
    ageRange: string;
    gender?: 'male' | 'female' | 'all';
    interests: string[];
    location: string;
    income?: 'low' | 'medium' | 'high';
    behavior: string[];
  };
  monthlyBudget: {
    min: number;
    max: number;
    currency: string;
  };
  goals: {
    primary: 'awareness' | 'traffic' | 'leads' | 'sales' | 'app_installs';
    secondary?: string[];
    kpis: string[];
  };
  currentMarketing: {
    hasWebsite: boolean;
    hasSocialMedia: boolean;
    currentAdSpend?: number;
    platforms: string[];
    contentStrategy?: string;
  };
}

export interface AdRecommendation {
  platform: 'google_ads' | 'facebook_ads' | 'instagram_ads' | 'linkedin_ads' | 'tiktok_ads';
  campaignType: string;
  budgetAllocation: {
    percentage: number;
    amount: number;
    currency: string;
  };
  targeting: {
    demographics: Record<string, any>;
    interests: string[];
    keywords?: string[];
    locations: string[];
    devices?: string[];
    timeSchedule?: string;
  };
  adFormats: string[];
  bidStrategy: string;
  expectedResults: {
    impressions: number;
    clicks: number;
    conversions: number;
    cost_per_click: number;
    cost_per_conversion: number;
    roas: number; // Return on Ad Spend
  };
  creativeRecommendations: CreativeRecommendation[];
  priority: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
}

export interface CreativeRecommendation {
  type: 'image' | 'video' | 'carousel' | 'text' | 'responsive';
  dimensions: string;
  headline: string;
  description: string;
  callToAction: string;
  visualElements: string[];
  copyTone: 'professional' | 'casual' | 'urgent' | 'friendly' | 'authoritative';
  designTips: string[];
}

export interface BudgetOptimization {
  totalBudget: number;
  currency: string;
  period: 'daily' | 'weekly' | 'monthly';
  platformDistribution: {
    platform: string;
    percentage: number;
    amount: number;
    justification: string;
  }[];
  campaignDistribution: {
    campaignType: string;
    percentage: number;
    amount: number;
    expectedROI: number;
  }[];
  scalingStrategy: {
    phase1: { duration: string; budget: number; focus: string };
    phase2: { duration: string; budget: number; focus: string };
    phase3: { duration: string; budget: number; focus: string };
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigation: string[];
  };
}

export interface MarketingStrategy {
  id: string;
  businessProfile: BusinessProfile;
  marketAnalysis: MarketAnalysis;
  recommendations: AdRecommendation[];
  budgetOptimization: BudgetOptimization;
  timeline: {
    setup: string;
    testing: string;
    optimization: string;
    scaling: string;
  };
  successMetrics: {
    metric: string;
    target: number;
    timeframe: string;
  }[];
  nextSteps: string[];
  generatedAt: Date;
  lastUpdated: Date;
}

class AdsRecommendationEngine {
  async generateStrategy(
    businessProfile: BusinessProfile,
    marketAnalysis: MarketAnalysis
  ): Promise<MarketingStrategy> {
    try {
      const strategyId = this.generateStrategyId();
      
      const recommendations = await this.generateRecommendations(businessProfile, marketAnalysis);
      const budgetOptimization = this.optimizeBudget(businessProfile, recommendations);
      const timeline = this.createTimeline(businessProfile, recommendations);
      const successMetrics = this.defineSuccessMetrics(businessProfile);

      const strategy: MarketingStrategy = {
        id: strategyId,
        businessProfile,
        marketAnalysis,
        recommendations,
        budgetOptimization,
        timeline,
        successMetrics,
        nextSteps: this.generateNextSteps(recommendations),
        generatedAt: new Date(),
        lastUpdated: new Date(),
      };

      coreLogger.info('Marketing strategy generated', { 
        strategyId, 
        business: businessProfile.name,
        recommendationsCount: recommendations.length 
      });

      return strategy;
    } catch (error) {
      coreLogger.error('Failed to generate marketing strategy', error as Error, { businessProfile });
      throw error;
    }
  }

  private async generateRecommendations(
    profile: BusinessProfile,
    market: MarketAnalysis
  ): Promise<AdRecommendation[]> {
    const recommendations: AdRecommendation[] = [];

    // Google Ads recommendations
    if (profile.goals.primary === 'leads' || profile.goals.primary === 'sales') {
      recommendations.push(await this.generateGoogleAdsRecommendation(profile, market));
    }

    // Facebook/Instagram recommendations
    if (profile.targetAudience.ageRange.includes('18-') || profile.targetAudience.ageRange.includes('25-')) {
      recommendations.push(await this.generateFacebookAdsRecommendation(profile, market));
      recommendations.push(await this.generateInstagramAdsRecommendation(profile, market));
    }

    // LinkedIn recommendations for B2B
    if (this.isB2BBusiness(profile.industry)) {
      recommendations.push(await this.generateLinkedInAdsRecommendation(profile, market));
    }

    // TikTok recommendations for younger demographics
    if (profile.targetAudience.ageRange.includes('18-24') || profile.targetAudience.ageRange.includes('25-34')) {
      recommendations.push(await this.generateTikTokAdsRecommendation(profile, market));
    }

    // Sort by priority and confidence
    return recommendations.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.confidence - a.confidence;
    });
  }

  private async generateGoogleAdsRecommendation(
    profile: BusinessProfile,
    market: MarketAnalysis
  ): Promise<AdRecommendation> {
    const budgetAllocation = this.calculateBudgetAllocation(profile, 'google_ads', market);
    const targeting = this.generateGoogleAdsTargeting(profile, market);
    const expectedResults = this.calculateExpectedResults(profile, market, 'google_ads', budgetAllocation.amount);

    return {
      platform: 'google_ads',
      campaignType: profile.goals.primary === 'awareness' ? 'Display' : 'Search',
      budgetAllocation,
      targeting,
      adFormats: this.getGoogleAdsFormats(profile.goals.primary),
      bidStrategy: this.selectBidStrategy(profile.goals.primary, profile.businessType),
      expectedResults,
      creativeRecommendations: this.generateGoogleCreatives(profile),
      priority: 'high',
      confidence: this.calculateConfidence(profile, market, 'google_ads'),
    };
  }

  private async generateFacebookAdsRecommendation(
    profile: BusinessProfile,
    market: MarketAnalysis
  ): Promise<AdRecommendation> {
    const budgetAllocation = this.calculateBudgetAllocation(profile, 'facebook_ads', market);
    const targeting = this.generateFacebookTargeting(profile, market);
    const expectedResults = this.calculateExpectedResults(profile, market, 'facebook_ads', budgetAllocation.amount);

    return {
      platform: 'facebook_ads',
      campaignType: this.selectFacebookCampaignType(profile.goals.primary),
      budgetAllocation,
      targeting,
      adFormats: this.getFacebookAdsFormats(profile.goals.primary),
      bidStrategy: 'Lowest cost with bid cap',
      expectedResults,
      creativeRecommendations: this.generateFacebookCreatives(profile),
      priority: 'high',
      confidence: this.calculateConfidence(profile, market, 'facebook_ads'),
    };
  }

  private async generateInstagramAdsRecommendation(
    profile: BusinessProfile,
    market: MarketAnalysis
  ): Promise<AdRecommendation> {
    const budgetAllocation = this.calculateBudgetAllocation(profile, 'instagram_ads', market);
    const targeting = this.generateInstagramTargeting(profile, market);
    const expectedResults = this.calculateExpectedResults(profile, market, 'instagram_ads', budgetAllocation.amount);

    return {
      platform: 'instagram_ads',
      campaignType: 'Photo/Video',
      budgetAllocation,
      targeting,
      adFormats: ['Single Image', 'Single Video', 'Carousel', 'Stories'],
      bidStrategy: 'Automatic bidding',
      expectedResults,
      creativeRecommendations: this.generateInstagramCreatives(profile),
      priority: this.assessInstagramPriority(profile),
      confidence: this.calculateConfidence(profile, market, 'instagram_ads'),
    };
  }

  private async generateLinkedInAdsRecommendation(
    profile: BusinessProfile,
    market: MarketAnalysis
  ): Promise<AdRecommendation> {
    const budgetAllocation = this.calculateBudgetAllocation(profile, 'linkedin_ads', market);
    const targeting = this.generateLinkedInTargeting(profile, market);
    const expectedResults = this.calculateExpectedResults(profile, market, 'linkedin_ads', budgetAllocation.amount);

    return {
      platform: 'linkedin_ads',
      campaignType: 'Sponsored Content',
      budgetAllocation,
      targeting,
      adFormats: ['Single Image Ad', 'Video Ad', 'Carousel Ad', 'Text Ad'],
      bidStrategy: 'Enhanced CPC',
      expectedResults,
      creativeRecommendations: this.generateLinkedInCreatives(profile),
      priority: this.isB2BBusiness(profile.industry) ? 'high' : 'low',
      confidence: this.calculateConfidence(profile, market, 'linkedin_ads'),
    };
  }

  private async generateTikTokAdsRecommendation(
    profile: BusinessProfile,
    market: MarketAnalysis
  ): Promise<AdRecommendation> {
    const budgetAllocation = this.calculateBudgetAllocation(profile, 'tiktok_ads', market);
    const targeting = this.generateTikTokTargeting(profile, market);
    const expectedResults = this.calculateExpectedResults(profile, market, 'tiktok_ads', budgetAllocation.amount);

    return {
      platform: 'tiktok_ads',
      campaignType: 'In-Feed Ads',
      budgetAllocation,
      targeting,
      adFormats: ['Video Ad', 'Image Ad', 'Spark Ads'],
      bidStrategy: 'Cost Cap',
      expectedResults,
      creativeRecommendations: this.generateTikTokCreatives(profile),
      priority: this.assessTikTokPriority(profile),
      confidence: this.calculateConfidence(profile, market, 'tiktok_ads'),
    };
  }

  private calculateBudgetAllocation(
    profile: BusinessProfile,
    platform: string,
    market: MarketAnalysis
  ): { percentage: number; amount: number; currency: string } {
    const totalBudget = (profile.monthlyBudget.min + profile.monthlyBudget.max) / 2;
    
    const platformWeights: Record<string, number> = {
      google_ads: 0.4,
      facebook_ads: 0.3,
      instagram_ads: 0.15,
      linkedin_ads: this.isB2BBusiness(profile.industry) ? 0.25 : 0.05,
      tiktok_ads: this.isYoungAudience(profile.targetAudience.ageRange) ? 0.15 : 0.05,
    };

    // Adjust weights based on market competition
    if (market.competitionLevel === 'high') {
      platformWeights.google_ads += 0.1;
      platformWeights.facebook_ads += 0.05;
    }

    const percentage = platformWeights[platform] || 0.1;
    const amount = totalBudget * percentage;

    return {
      percentage: Math.round(percentage * 100),
      amount: Math.round(amount),
      currency: profile.monthlyBudget.currency,
    };
  }

  private optimizeBudget(profile: BusinessProfile, recommendations: AdRecommendation[]): BudgetOptimization {
    const totalBudget = (profile.monthlyBudget.min + profile.monthlyBudget.max) / 2;

    const platformDistribution = recommendations.map(rec => ({
      platform: rec.platform,
      percentage: rec.budgetAllocation.percentage,
      amount: rec.budgetAllocation.amount,
      justification: this.generatePlatformJustification(rec.platform, profile),
    }));

    const campaignDistribution = recommendations.map(rec => ({
      campaignType: rec.campaignType,
      percentage: rec.budgetAllocation.percentage,
      amount: rec.budgetAllocation.amount,
      expectedROI: rec.expectedResults.roas,
    }));

    return {
      totalBudget,
      currency: profile.monthlyBudget.currency,
      period: 'monthly',
      platformDistribution,
      campaignDistribution,
      scalingStrategy: this.createScalingStrategy(totalBudget, profile),
      riskAssessment: this.assessRisk(profile, recommendations),
    };
  }

  private generateGoogleAdsTargeting(profile: BusinessProfile, market: MarketAnalysis) {
    return {
      demographics: {
        age: profile.targetAudience.ageRange,
        gender: profile.targetAudience.gender || 'all',
      },
      interests: profile.targetAudience.interests,
      keywords: market.opportunityKeywords.slice(0, 20).map(k => k.keyword),
      locations: [profile.location, profile.targetAudience.location],
      devices: ['desktop', 'mobile', 'tablet'],
      timeSchedule: this.getOptimalSchedule(profile.industry),
    };
  }

  private generateFacebookTargeting(profile: BusinessProfile, market: MarketAnalysis) {
    return {
      demographics: {
        age: profile.targetAudience.ageRange,
        gender: profile.targetAudience.gender,
        location: profile.targetAudience.location,
      },
      interests: profile.targetAudience.interests,
      locations: [profile.location],
      devices: ['mobile', 'desktop'],
    };
  }

  private generateInstagramTargeting(profile: BusinessProfile, market: MarketAnalysis) {
    return {
      demographics: {
        age: profile.targetAudience.ageRange,
        gender: profile.targetAudience.gender,
        location: profile.targetAudience.location,
      },
      interests: [...profile.targetAudience.interests, 'visual content', 'lifestyle'],
      locations: [profile.location],
      devices: ['mobile'],
    };
  }

  private generateLinkedInTargeting(profile: BusinessProfile, market: MarketAnalysis) {
    return {
      demographics: {
        age: '25-54', // Professional audience
        location: profile.targetAudience.location,
      },
      interests: ['business', 'professional development', ...profile.targetAudience.interests],
      locations: [profile.location],
      devices: ['desktop', 'mobile'],
    };
  }

  private generateTikTokTargeting(profile: BusinessProfile, market: MarketAnalysis) {
    return {
      demographics: {
        age: '18-34', // TikTok's primary audience
        gender: profile.targetAudience.gender,
        location: profile.targetAudience.location,
      },
      interests: [...profile.targetAudience.interests, 'entertainment', 'trends'],
      locations: [profile.location],
      devices: ['mobile'],
    };
  }

  private calculateExpectedResults(
    profile: BusinessProfile,
    market: MarketAnalysis,
    platform: string,
    budget: number
  ) {
    const averageCPC = market.averageCPC * this.getPlatformCPCMultiplier(platform);
    const estimatedClicks = Math.floor(budget / averageCPC);
    const conversionRate = this.getEstimatedConversionRate(platform, profile.industry);
    const estimatedConversions = Math.floor(estimatedClicks * conversionRate);
    const impressions = estimatedClicks * this.getClickThroughRate(platform);

    return {
      impressions: Math.round(impressions),
      clicks: estimatedClicks,
      conversions: estimatedConversions,
      cost_per_click: Math.round(averageCPC * 100) / 100,
      cost_per_conversion: estimatedConversions > 0 ? Math.round((budget / estimatedConversions) * 100) / 100 : 0,
      roas: this.calculateROAS(profile, estimatedConversions, budget),
    };
  }

  private generateGoogleCreatives(profile: BusinessProfile): CreativeRecommendation[] {
    return [
      {
        type: 'text',
        dimensions: 'Responsive',
        headline: `${profile.name} - Expert ${profile.industry} ${profile.location}`,
        description: `Solutions professionnelles ${profile.industry}. Devis gratuit et service de qualité.`,
        callToAction: 'Demander un devis',
        visualElements: [],
        copyTone: 'professional',
        designTips: ['Utiliser des mots-clés pertinents', 'Mettre en avant les avantages uniques'],
      },
      {
        type: 'responsive',
        dimensions: 'Multiple',
        headline: `Meilleur ${profile.industry} ${profile.location}`,
        description: `Faites confiance à ${profile.name} pour vos besoins en ${profile.industry}.`,
        callToAction: 'Contacter maintenant',
        visualElements: ['Logo professionnel', 'Images de qualité'],
        copyTone: 'authoritative',
        designTips: ['Images haute qualité', 'Design cohérent avec la marque'],
      },
    ];
  }

  private generateFacebookCreatives(profile: BusinessProfile): CreativeRecommendation[] {
    return [
      {
        type: 'image',
        dimensions: '1200x628',
        headline: `${profile.name} - Votre expert ${profile.industry}`,
        description: `Découvrez nos services ${profile.industry} à ${profile.location}. Qualité garantie !`,
        callToAction: 'En savoir plus',
        visualElements: ['Image accrocheuse', 'Logo visible', 'Couleurs de marque'],
        copyTone: 'friendly',
        designTips: ['Utilisez des couleurs vives', 'Texte minimal sur l\'image', 'Visuel accrocheur'],
      },
      {
        type: 'video',
        dimensions: '1200x628',
        headline: `Pourquoi choisir ${profile.name} ?`,
        description: `Témoignages clients et présentation de nos services ${profile.industry}.`,
        callToAction: 'Voir la vidéo',
        visualElements: ['Témoignages clients', 'Démonstration service', 'Équipe professionnelle'],
        copyTone: 'casual',
        designTips: ['Vidéo courte (15-30s)', 'Sous-titres inclus', 'Début accrocheur'],
      },
    ];
  }

  private generateInstagramCreatives(profile: BusinessProfile): CreativeRecommendation[] {
    return [
      {
        type: 'image',
        dimensions: '1080x1080',
        headline: `#${profile.industry}${profile.location.replace(/\s+/g, '')}`,
        description: `Excellence en ${profile.industry} 📍 ${profile.location}`,
        callToAction: 'Contacter',
        visualElements: ['Style Instagram', 'Hashtags pertinents', 'Design moderne'],
        copyTone: 'casual',
        designTips: ['Format carré', 'Style visuel cohérent', 'Utilisation de hashtags'],
      },
    ];
  }

  private generateLinkedInCreatives(profile: BusinessProfile): CreativeRecommendation[] {
    return [
      {
        type: 'image',
        dimensions: '1200x627',
        headline: `Solutions B2B ${profile.industry} - ${profile.name}`,
        description: `Accompagnement professionnel pour votre entreprise. Expertise reconnue.`,
        callToAction: 'Découvrir',
        visualElements: ['Design professionnel', 'Données/statistiques', 'Logo entreprise'],
        copyTone: 'professional',
        designTips: ['Style corporatif', 'Informations factuelles', 'Crédibilité'],
      },
    ];
  }

  private generateTikTokCreatives(profile: BusinessProfile): CreativeRecommendation[] {
    return [
      {
        type: 'video',
        dimensions: '1080x1920',
        headline: `${profile.industry} comme vous ne l'avez jamais vu !`,
        description: `Découvrez ${profile.name} sur TikTok 🔥`,
        callToAction: 'En savoir plus',
        visualElements: ['Format vertical', 'Musique tendance', 'Effets visuels'],
        copyTone: 'casual',
        designTips: ['Vidéo dynamique', 'Tendances actuelles', 'Authentique et divertissant'],
      },
    ];
  }

  // Utility methods
  private isB2BBusiness(industry: string): boolean {
    const b2bIndustries = ['consulting', 'software', 'finance', 'legal', 'accounting', 'marketing'];
    return b2bIndustries.some(b2b => industry.toLowerCase().includes(b2b));
  }

  private isYoungAudience(ageRange: string): boolean {
    return ageRange.includes('18-') || ageRange.includes('25-34');
  }

  private getPlatformCPCMultiplier(platform: string): number {
    const multipliers: Record<string, number> = {
      google_ads: 1.0,
      facebook_ads: 0.6,
      instagram_ads: 0.8,
      linkedin_ads: 2.5,
      tiktok_ads: 0.5,
    };
    return multipliers[platform] || 1.0;
  }

  private getEstimatedConversionRate(platform: string, industry: string): number {
    const baseRates: Record<string, number> = {
      google_ads: 0.03,
      facebook_ads: 0.02,
      instagram_ads: 0.015,
      linkedin_ads: 0.025,
      tiktok_ads: 0.01,
    };
    
    // Adjust based on industry
    const industryMultiplier = this.getIndustryConversionMultiplier(industry);
    return (baseRates[platform] || 0.02) * industryMultiplier;
  }

  private getIndustryConversionMultiplier(industry: string): number {
    const multipliers: Record<string, number> = {
      'legal': 1.5,
      'finance': 1.3,
      'healthcare': 1.2,
      'real_estate': 1.1,
      'retail': 0.9,
      'entertainment': 0.7,
    };
    
    return multipliers[industry.toLowerCase()] || 1.0;
  }

  private getClickThroughRate(platform: string): number {
    const ctrs: Record<string, number> = {
      google_ads: 50, // Impressions per click
      facebook_ads: 100,
      instagram_ads: 120,
      linkedin_ads: 80,
      tiktok_ads: 150,
    };
    return ctrs[platform] || 100;
  }

  private calculateROAS(profile: BusinessProfile, conversions: number, budget: number): number {
    // Estimate average order value based on business type
    const estimatedAOV = this.getEstimatedAOV(profile.industry, profile.businessType);
    const revenue = conversions * estimatedAOV;
    return budget > 0 ? Math.round((revenue / budget) * 100) / 100 : 0;
  }

  private getEstimatedAOV(industry: string, businessType: string): number {
    const baseAOVs: Record<string, number> = {
      'legal': 2000,
      'finance': 1500,
      'consulting': 3000,
      'healthcare': 500,
      'restaurant': 45,
      'retail': 75,
      'real_estate': 5000,
    };

    const businessMultipliers: Record<string, number> = {
      startup: 0.7,
      small_business: 0.9,
      medium_business: 1.2,
      enterprise: 1.5,
    };

    const baseAOV = baseAOVs[industry.toLowerCase()] || 500;
    const multiplier = businessMultipliers[businessType] || 1.0;
    
    return baseAOV * multiplier;
  }

  private calculateConfidence(profile: BusinessProfile, market: MarketAnalysis, platform: string): number {
    let confidence = 70; // Base confidence

    // Adjust based on market competition
    if (market.competitionLevel === 'low') confidence += 15;
    else if (market.competitionLevel === 'high') confidence -= 10;

    // Adjust based on budget adequacy
    const recommendedBudget = market.recommendedBudget.optimal;
    const actualBudget = (profile.monthlyBudget.min + profile.monthlyBudget.max) / 2;
    
    if (actualBudget >= recommendedBudget) confidence += 10;
    else if (actualBudget < recommendedBudget * 0.5) confidence -= 15;

    // Platform-specific adjustments
    if (platform === 'google_ads' && profile.goals.primary === 'leads') confidence += 10;
    if (platform === 'facebook_ads' && this.isYoungAudience(profile.targetAudience.ageRange)) confidence += 10;

    return Math.min(95, Math.max(30, confidence));
  }

  private selectBidStrategy(goal: string, businessType: string): string {
    if (goal === 'awareness') return 'Target CPM';
    if (goal === 'traffic') return 'Maximize clicks';
    if (goal === 'leads' || goal === 'sales') return 'Target CPA';
    return 'Enhanced CPC';
  }

  private selectFacebookCampaignType(goal: string): string {
    const mapping: Record<string, string> = {
      awareness: 'Brand awareness',
      traffic: 'Traffic',
      leads: 'Lead generation',
      sales: 'Conversions',
      app_installs: 'App installs',
    };
    return mapping[goal] || 'Traffic';
  }

  private getGoogleAdsFormats(goal: string): string[] {
    if (goal === 'awareness') return ['Display ads', 'YouTube ads', 'Discovery ads'];
    return ['Search ads', 'Responsive search ads'];
  }

  private getFacebookAdsFormats(goal: string): string[] {
    return ['Single image', 'Single video', 'Carousel', 'Collection'];
  }

  private assessInstagramPriority(profile: BusinessProfile): 'high' | 'medium' | 'low' {
    if (this.isYoungAudience(profile.targetAudience.ageRange)) return 'high';
    if (this.isVisualIndustry(profile.industry)) return 'high';
    return 'medium';
  }

  private assessTikTokPriority(profile: BusinessProfile): 'high' | 'medium' | 'low' {
    if (profile.targetAudience.ageRange.includes('18-24')) return 'high';
    if (this.isYoungAudience(profile.targetAudience.ageRange)) return 'medium';
    return 'low';
  }

  private isVisualIndustry(industry: string): boolean {
    const visualIndustries = ['restaurant', 'fashion', 'beauty', 'travel', 'real_estate', 'photography'];
    return visualIndustries.some(vi => industry.toLowerCase().includes(vi));
  }

  private getOptimalSchedule(industry: string): string {
    const schedules: Record<string, string> = {
      'restaurant': '11:00-14:00, 18:00-21:00',
      'legal': '09:00-18:00 weekdays',
      'retail': '10:00-22:00',
      'healthcare': '08:00-18:00',
    };
    return schedules[industry.toLowerCase()] || '09:00-18:00';
  }

  private generatePlatformJustification(platform: string, profile: BusinessProfile): string {
    const justifications: Record<string, string> = {
      google_ads: 'Capturer l\'intention d\'achat élevée avec les recherches Google',
      facebook_ads: 'Large audience et ciblage précis basé sur les intérêts',
      instagram_ads: 'Engagement visuel élevé avec une audience jeune',
      linkedin_ads: 'Ciblage professionnel idéal pour le B2B',
      tiktok_ads: 'Audience jeune et engagement viral potentiel',
    };
    return justifications[platform] || 'Diversification du mix marketing';
  }

  private createScalingStrategy(totalBudget: number, profile: BusinessProfile) {
    return {
      phase1: {
        duration: '2 semaines',
        budget: totalBudget * 0.3,
        focus: 'Test et apprentissage des audiences',
      },
      phase2: {
        duration: '4 semaines',
        budget: totalBudget * 0.7,
        focus: 'Optimisation et scaling des campagnes performantes',
      },
      phase3: {
        duration: '4+ semaines',
        budget: totalBudget * 1.2,
        focus: 'Expansion géographique et nouveaux formats',
      },
    };
  }

  private assessRisk(profile: BusinessProfile, recommendations: AdRecommendation[]) {
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    const factors: string[] = [];
    const mitigation: string[] = [];

    // Budget risk
    const totalBudget = (profile.monthlyBudget.min + profile.monthlyBudget.max) / 2;
    if (totalBudget < 1000) {
      factors.push('Budget limité pour tester efficacement');
      mitigation.push('Concentrer sur 1-2 plateformes prioritaires');
      riskLevel = 'high';
    }

    // Competition risk
    if (recommendations.some(r => r.expectedResults.cost_per_click > 3)) {
      factors.push('CPC élevé dans le secteur');
      mitigation.push('Optimiser le Quality Score et tester des mots-clés longue traîne');
    }

    // Experience risk
    if (!profile.currentMarketing.currentAdSpend) {
      factors.push('Manque d\'expérience en publicité digitale');
      mitigation.push('Formation recommandée ou accompagnement expert');
    }

    return { level: riskLevel, factors, mitigation };
  }

  private createTimeline(profile: BusinessProfile, recommendations: AdRecommendation[]) {
    return {
      setup: '1-2 semaines - Configuration comptes et création campagnes',
      testing: '2-4 semaines - Tests A/B et optimisation initiale',
      optimization: '4-8 semaines - Optimisation continue basée sur les données',
      scaling: '8+ semaines - Augmentation budgets et expansion',
    };
  }

  private defineSuccessMetrics(profile: BusinessProfile) {
    const metrics = [
      { metric: 'Cost per Acquisition (CPA)', target: this.getTargetCPA(profile), timeframe: '30 jours' },
      { metric: 'Return on Ad Spend (ROAS)', target: 3.0, timeframe: '60 jours' },
      { metric: 'Click-through Rate (CTR)', target: 2.0, timeframe: '14 jours' },
    ];

    if (profile.goals.primary === 'leads') {
      metrics.push({ metric: 'Leads générés', target: 20, timeframe: '30 jours' });
    }

    if (profile.goals.primary === 'sales') {
      metrics.push({ metric: 'Conversions', target: 10, timeframe: '30 jours' });
    }

    return metrics;
  }

  private getTargetCPA(profile: BusinessProfile): number {
    const estimatedAOV = this.getEstimatedAOV(profile.industry, profile.businessType);
    return Math.round(estimatedAOV * 0.3); // Target 30% of AOV for CPA
  }

  private generateNextSteps(recommendations: AdRecommendation[]): string[] {
    return [
      'Créer les comptes publicitaires nécessaires',
      'Installer les pixels de tracking sur le site web',
      'Préparer les créatifs selon les recommandations',
      'Lancer les campagnes avec les budgets recommandés',
      'Mettre en place le suivi des conversions',
      'Programmer des révisions hebdomadaires des performances',
    ];
  }

  private generateStrategyId(): string {
    return `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global instance
export const adsRecommendationEngine = new AdsRecommendationEngine();

// Export types
export type {
  BusinessProfile,
  AdRecommendation,
  CreativeRecommendation,
  BudgetOptimization,
  MarketingStrategy,
};

export { AdsRecommendationEngine };