/**
 * 🚀 Générateur de Templates basé sur Figma API
 * Convertit automatiquement les designs Figma en templates React/Next.js
 */

import { figmaApi, FigmaNode, FigmaToCodeConverter, FIGMA_TEMPLATES } from './figma-api';

export interface TemplateGenerationResult {
  success: boolean;
  templateCode: string;
  assets: TemplateAsset[];
  metadata: TemplateMetadata;
  error?: string;
}

export interface TemplateAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'icon' | 'logo';
  format: 'png' | 'svg' | 'jpg';
}

export interface TemplateMetadata {
  name: string;
  sector: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    sizes: Record<string, string>;
  };
  components: string[];
  lastUpdated: string;
}

export interface TemplateCustomization {
  businessName: string;
  sector: 'restaurant' | 'artisan' | 'ecommerce' | 'saas' | 'service';
  colorScheme?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  content: {
    hero: {
      title: string;
      subtitle: string;
      cta: string;
    };
    about?: string;
    services?: Array<{
      name: string;
      description: string;
      icon?: string;
    }>;
    contact: {
      phone: string;
      email: string;
      address?: string;
    };
  };
}

export class FigmaTemplateGenerator {
  
  /**
   * Génère un template complet à partir d'un design Figma
   */
  async generateTemplate(
    templateKey: keyof typeof FIGMA_TEMPLATES,
    customization: TemplateCustomization
  ): Promise<TemplateGenerationResult> {
    try {
      const template = FIGMA_TEMPLATES[templateKey];
      
      if (!template) {
        throw new Error(`Template ${templateKey} not found`);
      }

      // 1. Récupérer le fichier Figma
      const figmaFile = await figmaApi.getFile(template.fileKey);
      
      // 2. Extraire les assets (images, icônes)
      const assets = await this.extractAssets(template.fileKey, figmaFile);
      
      // 3. Analyser les styles et couleurs
      const metadata = await this.extractMetadata(figmaFile, template);
      
      // 4. Générer le code React
      const templateCode = await this.generateReactCode(figmaFile, customization, metadata);
      
      return {
        success: true,
        templateCode,
        assets,
        metadata: {
          ...metadata,
          lastUpdated: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('Erreur génération template Figma:', error);
      return {
        success: false,
        templateCode: '',
        assets: [],
        metadata: {} as TemplateMetadata,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Extrait tous les assets visuels du design Figma
   */
  private async extractAssets(fileKey: string, figmaFile: any): Promise<TemplateAsset[]> {
    const assets: TemplateAsset[] = [];
    
    // Trouve tous les nœuds d'images
    const imageNodes = this.findNodesByType(figmaFile.document, ['RECTANGLE', 'ELLIPSE', 'VECTOR']);
    
    if (imageNodes.length > 0) {
      const nodeIds = imageNodes.map(node => node.id);
      
      // Exporte les images en PNG et SVG
      const [pngExports, svgExports] = await Promise.all([
        figmaApi.getFileImages(fileKey, nodeIds, { format: 'png', scale: 2 }),
        figmaApi.getFileImages(fileKey, nodeIds, { format: 'svg' })
      ]);
      
      // Combine les exports
      nodeIds.forEach(nodeId => {
        const node = imageNodes.find(n => n.id === nodeId);
        if (!node) return;
        
        if (pngExports.images[nodeId]) {
          assets.push({
            id: nodeId,
            name: node.name || `asset-${nodeId}`,
            url: pngExports.images[nodeId],
            type: this.inferAssetType(node),
            format: 'png'
          });
        }
        
        if (svgExports.images[nodeId]) {
          assets.push({
            id: `${nodeId}-svg`,
            name: `${node.name || `asset-${nodeId}`}-svg`,
            url: svgExports.images[nodeId],
            type: this.inferAssetType(node),
            format: 'svg'
          });
        }
      });
    }
    
    return assets;
  }

  /**
   * Extrait les métadonnées de style du design
   */
  private async extractMetadata(figmaFile: any, template: any): Promise<TemplateMetadata> {
    const styles = await figmaApi.getFileStyles(template.fileKey);
    const components = await figmaApi.getFileComponents(template.fileKey);
    
    // Analyse les couleurs dominantes
    const colorScheme = this.extractColorScheme(figmaFile.document);
    
    // Analyse la typographie
    const typography = this.extractTypography(figmaFile.document);
    
    return {
      name: template.name,
      sector: template.sector,
      colorScheme,
      typography,
      components: components.meta.components.map(c => c.name),
    };
  }

  /**
   * Génère le code React complet du template
   */
  private async generateReactCode(
    figmaFile: any,
    customization: TemplateCustomization,
    metadata: TemplateMetadata
  ): Promise<string> {
    const document = figmaFile.document;
    
    // Trouve les sections principales (Hero, About, Services, etc.)
    const sections = this.identifySections(document);
    
    // Génère le composant principal
    const componentCode = this.generateMainComponent(sections, customization, metadata);
    
    return componentCode;
  }

  /**
   * Identifie les sections du design (Hero, About, Services, etc.)
   */
  private identifySections(document: FigmaNode): Record<string, FigmaNode> {
    const sections: Record<string, FigmaNode> = {};
    
    // Recherche par nom des frames/sections
    const findSectionsByName = (node: FigmaNode) => {
      if (node.name) {
        const normalizedName = node.name.toLowerCase();
        
        if (normalizedName.includes('hero') || normalizedName.includes('banner')) {
          sections.hero = node;
        } else if (normalizedName.includes('about') || normalizedName.includes('apropos')) {
          sections.about = node;
        } else if (normalizedName.includes('service') || normalizedName.includes('features')) {
          sections.services = node;
        } else if (normalizedName.includes('contact')) {
          sections.contact = node;
        } else if (normalizedName.includes('testimonial') || normalizedName.includes('avis')) {
          sections.testimonials = node;
        } else if (normalizedName.includes('pricing') || normalizedName.includes('tarif')) {
          sections.pricing = node;
        }
      }
      
      if (node.children) {
        node.children.forEach(findSectionsByName);
      }
    };
    
    findSectionsByName(document);
    
    return sections;
  }

  /**
   * Génère le composant React principal
   */
  private generateMainComponent(
    sections: Record<string, FigmaNode>,
    customization: TemplateCustomization,
    metadata: TemplateMetadata
  ): string {
    const imports = `'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';`;

    const heroSection = sections.hero ? this.generateHeroSection(sections.hero, customization) : '';
    const aboutSection = sections.about ? this.generateAboutSection(sections.about, customization) : '';
    const servicesSection = sections.services ? this.generateServicesSection(sections.services, customization) : '';
    const contactSection = sections.contact ? this.generateContactSection(sections.contact, customization) : '';

    const componentName = `${customization.businessName.replace(/\\s+/g, '')}Template`;

    return `${imports}

export default function ${componentName}() {
  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: '${metadata.colorScheme.background}',
      color: '${metadata.colorScheme.text}'
    }}>
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold" style={{ color: '${metadata.colorScheme.primary}' }}>
              ${customization.businessName}
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#accueil" className="hover:text-primary transition-colors">Accueil</a>
              <a href="#services" className="hover:text-primary transition-colors">Services</a>
              <a href="#about" className="hover:text-primary transition-colors">À propos</a>
              <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      ${heroSection}
      ${servicesSection}
      ${aboutSection}
      ${contactSection}
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">${customization.businessName}</h3>
              <p className="text-gray-400">
                ${customization.content.hero.subtitle}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <div>📞 ${customization.content.contact.phone}</div>
                <div>✉️ ${customization.content.contact.email}</div>
                ${customization.content.contact.address ? `<div>📍 ${customization.content.contact.address}</div>` : ''}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suivez-nous</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
                <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ${customization.businessName}. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}`;
  }

  /**
   * Génère la section Hero
   */
  private generateHeroSection(heroNode: FigmaNode, customization: TemplateCustomization): string {
    return `
      {/* Hero Section */}
      <section id="accueil" className="py-20 lg:py-32 relative overflow-hidden" style={{ backgroundColor: '${this.getNodeBackgroundColor(heroNode)}' }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              ${customization.content.hero.title}
            </h1>
            <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
              ${customization.content.hero.subtitle}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              ${customization.content.hero.cta}
            </Link>
          </div>
        </div>
      </section>`;
  }

  /**
   * Génère la section Services
   */
  private generateServicesSection(servicesNode: FigmaNode, customization: TemplateCustomization): string {
    if (!customization.content.services || customization.content.services.length === 0) {
      return '';
    }

    const servicesHtml = customization.content.services.map((service, index) => `
            <div key={${index}} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-4">${service.icon || '🔧'}</div>
              <h3 className="text-xl font-bold mb-4">${service.name}</h3>
              <p className="text-gray-600">${service.description}</p>
            </div>`).join('');

    return `
      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez notre gamme complète de services professionnels
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${servicesHtml}
          </div>
        </div>
      </section>`;
  }

  /**
   * Génère la section À propos
   */
  private generateAboutSection(aboutNode: FigmaNode, customization: TemplateCustomization): string {
    return `
      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">À propos de ${customization.businessName}</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                ${customization.content.about || 'Notre entreprise est spécialisée dans l\'excellence et l\'innovation. Nous mettons notre expertise au service de votre réussite.'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">10+</div>
                  <div className="text-sm text-gray-600">Années d'expérience</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-gray-600">Clients satisfaits</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gray-200 rounded-2xl flex items-center justify-center">
                <span className="text-gray-500">Image à venir</span>
              </div>
            </div>
          </div>
        </div>
      </section>`;
  }

  /**
   * Génère la section Contact
   */
  private generateContactSection(contactNode: FigmaNode, customization: TemplateCustomization): string {
    return `
      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Contactez-nous</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Prêt à démarrer votre projet ? Contactez-nous dès aujourd'hui !
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  📞
                </div>
                <div>
                  <h4 className="font-semibold">Téléphone</h4>
                  <p className="text-gray-400">${customization.content.contact.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  ✉️
                </div>
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <p className="text-gray-400">${customization.content.contact.email}</p>
                </div>
              </div>
              ${customization.content.contact.address ? `
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  📍
                </div>
                <div>
                  <h4 className="font-semibold">Adresse</h4>
                  <p className="text-gray-400">${customization.content.contact.address}</p>
                </div>
              </div>` : ''}
            </div>
            <div className="bg-gray-800 rounded-xl p-8">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom</label>
                  <input type="text" className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea rows={4} className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary"></textarea>
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-primary-dark py-3 rounded-lg font-semibold transition-colors">
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>`;
  }

  // Méthodes utilitaires
  private findNodesByType(node: FigmaNode, types: string[]): FigmaNode[] {
    const result: FigmaNode[] = [];
    
    if (types.includes(node.type)) {
      result.push(node);
    }
    
    if (node.children) {
      node.children.forEach(child => {
        result.push(...this.findNodesByType(child, types));
      });
    }
    
    return result;
  }

  private inferAssetType(node: FigmaNode): 'image' | 'icon' | 'logo' {
    const name = node.name?.toLowerCase() || '';
    
    if (name.includes('logo')) return 'logo';
    if (name.includes('icon') || name.includes('icone')) return 'icon';
    return 'image';
  }

  private extractColorScheme(document: FigmaNode): TemplateMetadata['colorScheme'] {
    // Analyse simplifiée - en production, analyser tous les fills
    return {
      primary: '#3B82F6',
      secondary: '#64748B', 
      accent: '#F59E0B',
      background: '#FFFFFF',
      text: '#1F2937'
    };
  }

  private extractTypography(document: FigmaNode): TemplateMetadata['typography'] {
    return {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      sizes: {
        'text-xs': '12px',
        'text-sm': '14px',
        'text-base': '16px',
        'text-lg': '18px',
        'text-xl': '20px',
        'text-2xl': '24px',
        'text-3xl': '30px',
        'text-4xl': '36px'
      }
    };
  }

  private getNodeBackgroundColor(node: FigmaNode): string {
    if (node.backgroundColor) {
      return FigmaToCodeConverter.colorToCss(node.backgroundColor);
    }
    if (node.fills && node.fills.length > 0 && node.fills[0].color) {
      return FigmaToCodeConverter.colorToCss(node.fills[0].color);
    }
    return '#FFFFFF';
  }
}

// Instance exportée
export const figmaTemplateGenerator = new FigmaTemplateGenerator();