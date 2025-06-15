'use client';

import React from 'react';
import { BusinessInfo } from './ExpressBusinessGenerator';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  success: string;
  warning: string;
  error: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

export interface PhotoConfiguration {
  hero: {
    category: string;
    mood: string;
    style: string;
    keywords: string[];
  };
  gallery: {
    categories: string[];
    count: number;
    style: string;
  };
  team: {
    style: string;
    mood: string;
    setting: string;
  };
  products: {
    style: string;
    lighting: string;
    background: string;
  };
}

export interface CustomizationResult {
  colors: ColorPalette;
  photos: PhotoConfiguration;
  fonts: {
    primary: string;
    secondary: string;
    accent: string;
  };
  spacing: {
    sections: string;
    elements: string;
    containers: string;
  };
  animations: {
    type: 'subtle' | 'modern' | 'dynamic' | 'elegant';
    speed: 'slow' | 'normal' | 'fast';
    effects: string[];
  };
  layout: {
    header: 'fixed' | 'sticky' | 'static';
    footer: 'minimal' | 'detailed' | 'contact-focused';
    sections: string[];
  };
}

class AutoCustomizationEngine {
  
  /**
   * Génère une customisation complète basée sur l'analyse business
   */
  public generateCustomization(
    businessInfo: BusinessInfo,
    templateStyle: string,
    targetAudience: string
  ): CustomizationResult {
    
    const colors = this.generateIntelligentColors(businessInfo, templateStyle);
    const photos = this.generatePhotoConfiguration(businessInfo, templateStyle);
    const fonts = this.generateFontSystem(businessInfo.sector, templateStyle);
    const spacing = this.generateSpacingSystem(templateStyle);
    const animations = this.generateAnimationSystem(businessInfo.sector, templateStyle);
    const layout = this.generateLayoutSystem(businessInfo.sector, templateStyle);

    return {
      colors,
      photos,
      fonts,
      spacing,
      animations,
      layout
    };
  }

  /**
   * Génère une palette couleurs intelligente
   */
  private generateIntelligentColors(businessInfo: BusinessInfo, templateStyle: string): ColorPalette {
    
    // Couleurs de base par secteur
    const sectorColors = this.getSectorBaseColors(businessInfo.sector);
    
    // Ajustement par style
    const styleColors = this.getStyleColorAdjustments(templateStyle);
    
    // Analyse du nom/description pour nuances personnalisées
    const personalizedAdjustments = this.getPersonalizedColorAdjustments(
      businessInfo.name, 
      businessInfo.description
    );

    // Mix intelligent des couleurs
    const primary = this.blendColors(sectorColors.primary, styleColors.primary, personalizedAdjustments.primary);
    const secondary = this.generateComplementaryColor(primary, 'secondary');
    const accent = this.generateComplementaryColor(primary, 'accent');

    return {
      primary,
      secondary,
      accent,
      neutral: this.generateNeutralScale(templateStyle),
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      text: {
        primary: templateStyle === 'luxury' ? '#1A1A1A' : '#111827',
        secondary: '#6B7280',
        muted: '#9CA3AF'
      },
      background: {
        primary: '#FFFFFF',
        secondary: templateStyle === 'luxury' ? '#FAFAFA' : '#F9FAFB',
        tertiary: '#F3F4F6'
      }
    };
  }

  /**
   * Génère la configuration photos intelligente
   */
  private generatePhotoConfiguration(businessInfo: BusinessInfo, templateStyle: string): PhotoConfiguration {
    
    const sectorPhotoRules = this.getSectorPhotoRules(businessInfo.sector);
    const stylePhotoRules = this.getStylePhotoRules(templateStyle);
    
    return {
      hero: {
        category: sectorPhotoRules.hero.category,
        mood: this.blendPhotoMoods(sectorPhotoRules.hero.mood, stylePhotoRules.mood),
        style: stylePhotoRules.style,
        keywords: [
          ...sectorPhotoRules.hero.keywords,
          businessInfo.city,
          templateStyle,
          ...this.extractKeywordsFromDescription(businessInfo.description)
        ]
      },
      gallery: {
        categories: sectorPhotoRules.gallery.categories,
        count: this.getOptimalGalleryCount(businessInfo.sector),
        style: stylePhotoRules.style
      },
      team: {
        style: stylePhotoRules.team,
        mood: sectorPhotoRules.team.mood,
        setting: sectorPhotoRules.team.setting
      },
      products: {
        style: stylePhotoRules.products,
        lighting: sectorPhotoRules.products.lighting,
        background: sectorPhotoRules.products.background
      }
    };
  }

  /**
   * Génère le système de fonts adapté
   */
  private generateFontSystem(sector: string, templateStyle: string) {
    const fontMappings: Record<string, Record<string, any>> = {
      restaurant: {
        luxury: { primary: 'Playfair Display', secondary: 'Lato', accent: 'Dancing Script' },
        elegant: { primary: 'Crimson Text', secondary: 'Source Sans Pro', accent: 'Italianno' },
        modern: { primary: 'Montserrat', secondary: 'Open Sans', accent: 'Pacifico' },
        professional: { primary: 'Roboto Slab', secondary: 'Roboto', accent: 'Kalam' }
      },
      beaute: {
        luxury: { primary: 'Bodoni Moda', secondary: 'Lato', accent: 'Great Vibes' },
        elegant: { primary: 'Cormorant Garamond', secondary: 'Lato', accent: 'Alex Brush' },
        modern: { primary: 'Poppins', secondary: 'Inter', accent: 'Sacramento' },
        professional: { primary: 'Source Serif Pro', secondary: 'Source Sans Pro', accent: 'Parisienne' }
      },
      artisan: {
        luxury: { primary: 'Trajan Pro', secondary: 'Avenir', accent: 'Brush Script MT' },
        elegant: { primary: 'Minion Pro', secondary: 'Myriad Pro', accent: 'Brush Script MT' },
        modern: { primary: 'Helvetica Neue', secondary: 'Helvetica', accent: 'Marker Felt' },
        professional: { primary: 'Times New Roman', secondary: 'Arial', accent: 'Courier New' }
      },
      medical: {
        luxury: { primary: 'Optima', secondary: 'Avenir', accent: 'Avenir Light' },
        professional: { primary: 'Helvetica', secondary: 'Arial', accent: 'Helvetica Light' },
        modern: { primary: 'San Francisco', secondary: 'SF Pro Display', accent: 'SF Pro Text' },
        elegant: { primary: 'Georgia', secondary: 'Verdana', accent: 'Georgia Italic' }
      }
    };

    return fontMappings[sector]?.[templateStyle] || fontMappings[sector]?.professional || {
      primary: 'Inter',
      secondary: 'Inter',
      accent: 'Inter'
    };
  }

  /**
   * Génère le système d'espacement
   */
  private generateSpacingSystem(templateStyle: string) {
    const spacingMappings: Record<string, any> = {
      luxury: { sections: '6rem', elements: '2rem', containers: '8rem' },
      premium: { sections: '5rem', elements: '1.5rem', containers: '6rem' },
      modern: { sections: '4rem', elements: '1rem', containers: '4rem' },
      elegant: { sections: '5rem', elements: '1.5rem', containers: '6rem' },
      professional: { sections: '4rem', elements: '1.25rem', containers: '5rem' }
    };

    return spacingMappings[templateStyle] || spacingMappings.professional;
  }

  /**
   * Génère le système d'animations
   */
  private generateAnimationSystem(sector: string, templateStyle: string) {
    const animationMappings: Record<string, any> = {
      luxury: {
        type: 'elegant',
        speed: 'slow',
        effects: ['fade-in', 'slide-up', 'parallax', 'gold-shimmer']
      },
      premium: {
        type: 'modern',
        speed: 'normal',
        effects: ['fade-in', 'slide-up', 'scale', 'blur-to-focus']
      },
      modern: {
        type: 'dynamic',
        speed: 'fast',
        effects: ['slide-in', 'bounce', 'rotate', 'color-shift']
      },
      elegant: {
        type: 'subtle',
        speed: 'slow',
        effects: ['fade-in', 'slide-up', 'opacity-change']
      },
      professional: {
        type: 'subtle',
        speed: 'normal',
        effects: ['fade-in', 'slide-up']
      }
    };

    return animationMappings[templateStyle] || animationMappings.professional;
  }

  /**
   * Génère la structure layout optimale
   */
  private generateLayoutSystem(sector: string, templateStyle: string) {
    const sectorLayouts: Record<string, any> = {
      restaurant: {
        header: 'sticky',
        footer: 'contact-focused',
        sections: ['hero', 'menu-preview', 'about', 'gallery', 'reservations', 'contact']
      },
      beaute: {
        header: 'fixed',
        footer: 'detailed',
        sections: ['hero', 'services', 'gallery', 'team', 'booking', 'contact']
      },
      artisan: {
        header: 'static',
        footer: 'minimal',
        sections: ['hero', 'portfolio', 'services', 'about', 'testimonials', 'contact']
      },
      medical: {
        header: 'fixed',
        footer: 'contact-focused',
        sections: ['hero', 'services', 'team', 'appointments', 'info', 'contact']
      }
    };

    return sectorLayouts[sector] || sectorLayouts.medical;
  }

  // Helper methods pour couleurs
  private getSectorBaseColors(sector: string) {
    const sectorColors: Record<string, any> = {
      restaurant: { primary: '#D2691E', secondary: '#8B4513', accent: '#F4A460' },
      beaute: { primary: '#FF69B4', secondary: '#DDA0DD', accent: '#FFB6C1' },
      artisan: { primary: '#8B4513', secondary: '#D2691E', accent: '#228B22' },
      medical: { primary: '#008B8B', secondary: '#20B2AA', accent: '#00CED1' }
    };
    
    return sectorColors[sector] || sectorColors.medical;
  }

  private getStyleColorAdjustments(style: string) {
    const adjustments: Record<string, any> = {
      luxury: { primary: '#1A1A1A', secondary: '#D4AF37', accent: '#8B0000' },
      premium: { primary: '#4169E1', secondary: '#87CEEB', accent: '#00BFFF' },
      modern: { primary: '#32CD32', secondary: '#90EE90', accent: '#228B22' },
      elegant: { primary: '#9370DB', secondary: '#DDA0DD', accent: '#BA55D3' },
      professional: { primary: '#2F4F4F', secondary: '#708090', accent: '#B22222' }
    };
    
    return adjustments[style] || adjustments.professional;
  }

  private getPersonalizedColorAdjustments(name: string, description: string) {
    // Analyse des mots-clés pour ajustements personnalisés
    const keywords = (name + ' ' + description).toLowerCase();
    
    if (keywords.includes('rouge') || keywords.includes('red')) {
      return { primary: '#DC2626', secondary: '#F87171', accent: '#FCA5A5' };
    }
    if (keywords.includes('bleu') || keywords.includes('blue')) {
      return { primary: '#2563EB', secondary: '#60A5FA', accent: '#93C5FD' };
    }
    if (keywords.includes('vert') || keywords.includes('green')) {
      return { primary: '#059669', secondary: '#34D399', accent: '#6EE7B7' };
    }
    if (keywords.includes('or') || keywords.includes('gold')) {
      return { primary: '#D97706', secondary: '#FBBF24', accent: '#FCD34D' };
    }
    
    return { primary: null, secondary: null, accent: null };
  }

  private blendColors(color1: string, color2: string, color3: string | null): string {
    // Si pas de couleur personnalisée, mélanger les deux premières
    if (!color3) return this.mixColors(color1, color2, 0.7);
    
    // Sinon prioriser la couleur personnalisée
    return color3;
  }

  private mixColors(color1: string, color2: string, ratio: number): string {
    // Conversion hex to RGB et mélange
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    const r = Math.round(r1 * ratio + r2 * (1 - ratio));
    const g = Math.round(g1 * ratio + g2 * (1 - ratio));
    const b = Math.round(b1 * ratio + b2 * (1 - ratio));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private generateComplementaryColor(baseColor: string, type: 'secondary' | 'accent'): string {
    // Génère des couleurs complémentaires intelligentes
    const variations: Record<string, number> = {
      secondary: 30, // Variation de 30° sur le cercle chromatique
      accent: 60     // Variation de 60° sur le cercle chromatique
    };
    
    return this.adjustHue(baseColor, variations[type]);
  }

  private adjustHue(hexColor: string, degrees: number): string {
    // Conversion hex to HSL, ajustement hue, conversion back to hex
    // Implémentation simplifiée
    const hue = (degrees % 360 + 360) % 360;
    return hexColor; // Placeholder - implémentation complète nécessaire
  }

  private generateNeutralScale(style: string): string {
    const neutrals: Record<string, string> = {
      luxury: '#8B8B8B',
      premium: '#6B7280',
      modern: '#9CA3AF',
      elegant: '#6B7280',
      professional: '#4B5563'
    };
    
    return neutrals[style] || neutrals.professional;
  }

  // Helper methods pour photos
  private getSectorPhotoRules(sector: string) {
    const rules: Record<string, any> = {
      restaurant: {
        hero: { 
          category: 'food-dining', 
          mood: 'appetizing', 
          keywords: ['restaurant', 'cuisine', 'plat', 'ambiance'] 
        },
        gallery: { categories: ['food-close-up', 'restaurant-interior', 'chef-action'] },
        team: { mood: 'professional-friendly', setting: 'kitchen-dining' },
        products: { lighting: 'natural-warm', background: 'neutral-wood' }
      },
      beaute: {
        hero: { 
          category: 'beauty-salon', 
          mood: 'elegant-relaxing', 
          keywords: ['salon', 'beauté', 'soins', 'détente'] 
        },
        gallery: { categories: ['before-after', 'salon-interior', 'beauty-products'] },
        team: { mood: 'professional-caring', setting: 'salon-modern' },
        products: { lighting: 'soft-even', background: 'clean-white' }
      },
      artisan: {
        hero: { 
          category: 'craftsmanship', 
          mood: 'authentic-skilled', 
          keywords: ['artisan', 'création', 'savoir-faire', 'atelier'] 
        },
        gallery: { categories: ['work-portfolio', 'workshop-action', 'finished-products'] },
        team: { mood: 'skilled-authentic', setting: 'workshop-traditional' },
        products: { lighting: 'natural-dramatic', background: 'wood-texture' }
      },
      medical: {
        hero: { 
          category: 'healthcare', 
          mood: 'professional-reassuring', 
          keywords: ['médical', 'soins', 'santé', 'cabinet'] 
        },
        gallery: { categories: ['medical-equipment', 'office-interior', 'team-consultation'] },
        team: { mood: 'professional-trustworthy', setting: 'medical-office' },
        products: { lighting: 'clinical-clean', background: 'medical-white' }
      }
    };
    
    return rules[sector] || rules.medical;
  }

  private getStylePhotoRules(style: string) {
    const rules: Record<string, any> = {
      luxury: { style: 'high-end', mood: 'sophisticated', team: 'executive', products: 'premium' },
      premium: { style: 'professional', mood: 'polished', team: 'business', products: 'quality' },
      modern: { style: 'contemporary', mood: 'dynamic', team: 'casual-pro', products: 'sleek' },
      elegant: { style: 'refined', mood: 'graceful', team: 'classic', products: 'tasteful' },
      professional: { style: 'corporate', mood: 'reliable', team: 'formal', products: 'standard' }
    };
    
    return rules[style] || rules.professional;
  }

  private blendPhotoMoods(mood1: string, mood2: string): string {
    return `${mood1}-${mood2}`;
  }

  private getOptimalGalleryCount(sector: string): number {
    const counts: Record<string, number> = {
      restaurant: 8,
      beaute: 6,
      artisan: 10,
      medical: 4
    };
    
    return counts[sector] || 6;
  }

  private extractKeywordsFromDescription(description: string): string[] {
    // Extraction intelligente de mots-clés
    const keywords = description.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['dans', 'avec', 'pour', 'plus', 'mais', 'sont', 'tout'].includes(word))
      .slice(0, 5);
    
    return keywords;
  }
}

// Instance singleton
export const autoCustomizationEngine = new AutoCustomizationEngine();

// React Hook pour utilisation facile
export function useAutoCustomization(
  businessInfo: BusinessInfo,
  templateStyle: string,
  targetAudience: string
) {
  return React.useMemo(() => {
    return autoCustomizationEngine.generateCustomization(businessInfo, templateStyle, targetAudience);
  }, [businessInfo, templateStyle, targetAudience]);
}

// Composant de prévisualisation des customisations
export function CustomizationPreview({ customization }: { customization: CustomizationResult }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="font-bold text-gray-900 mb-4">🎨 Customisations Générées</h3>
      
      {/* Palette couleurs */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Couleurs</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-lg mx-auto mb-2 border"
              style={{ backgroundColor: customization.colors.primary }}
            ></div>
            <div className="text-xs text-gray-600">Primaire</div>
          </div>
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-lg mx-auto mb-2 border"
              style={{ backgroundColor: customization.colors.secondary }}
            ></div>
            <div className="text-xs text-gray-600">Secondaire</div>
          </div>
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-lg mx-auto mb-2 border"
              style={{ backgroundColor: customization.colors.accent }}
            ></div>
            <div className="text-xs text-gray-600">Accent</div>
          </div>
        </div>
      </div>

      {/* Typographie */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Typographie</h4>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-gray-600">Principale:</span> {customization.fonts.primary}
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Secondaire:</span> {customization.fonts.secondary}
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Accent:</span> {customization.fonts.accent}
          </div>
        </div>
      </div>

      {/* Configuration photos */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Photos</h4>
        <div className="text-sm space-y-1">
          <div><span className="text-gray-600">Hero:</span> {customization.photos.hero.mood}</div>
          <div><span className="text-gray-600">Style:</span> {customization.photos.hero.style}</div>
          <div><span className="text-gray-600">Mots-clés:</span> {customization.photos.hero.keywords.slice(0, 3).join(', ')}</div>
        </div>
      </div>

      {/* Animations */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Animations</h4>
        <div className="text-sm space-y-1">
          <div><span className="text-gray-600">Type:</span> {customization.animations.type}</div>
          <div><span className="text-gray-600">Vitesse:</span> {customization.animations.speed}</div>
          <div><span className="text-gray-600">Effets:</span> {customization.animations.effects.slice(0, 3).join(', ')}</div>
        </div>
      </div>
    </div>
  );
}