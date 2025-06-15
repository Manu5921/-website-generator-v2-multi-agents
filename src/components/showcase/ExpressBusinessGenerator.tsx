'use client';

import React, { useState } from 'react';
import { BusinessRequirements, SmartSelectionResult, smartTemplateSelector } from './SmartTemplateSelector';
import { generateLogo } from './LogoGeneratorSimple';
import { HeroImage } from './PhotoService';
import { getTemplateColors } from './ColorSystem';

export interface BusinessInfo {
  name: string;
  sector: 'restaurant' | 'beaute' | 'artisan' | 'medical';
  city: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
}

export interface ExpressGenerationResult {
  businessInfo: BusinessInfo;
  selectedTemplate: SmartSelectionResult;
  generatedAssets: {
    logo: React.ReactElement;
    heroImage: React.ReactElement;
    colorPalette: {
      primary: string;
      secondary: string;
      accent: string;
    };
    customizedContent: {
      heroTitle: string;
      heroSubtitle: string;
      ctaText: string;
      features: string[];
    };
  };
  previewUrl: string;
  estimatedCompletion: string;
  optimizations: string[];
}

interface ExpressBusinessGeneratorProps {
  onGenerate?: (result: ExpressGenerationResult) => void;
  className?: string;
}

export function ExpressBusinessGenerator({ onGenerate, className = '' }: ExpressBusinessGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<ExpressGenerationResult | null>(null);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: '',
    sector: 'restaurant',
    city: '',
    description: ''
  });

  const handleGenerate = async () => {
    if (!businessInfo.name || !businessInfo.city) return;

    setIsGenerating(true);

    try {
      // 1. Analyser le business et générer les requirements
      const requirements = await generateBusinessRequirements(businessInfo);

      // 2. Sélection intelligente du template
      const templateSelection = smartTemplateSelector.selectOptimalTemplate(requirements);

      // 3. Génération express des assets
      const result = await generateExpressAssets(businessInfo, templateSelection);

      setGenerationResult(result);
      onGenerate?.(result);

    } catch (error) {
      console.error('Erreur génération express:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ⚡ Générateur Express Business
            </h2>
            <p className="text-gray-600">
              Site web professionnel en 5-10 minutes avec IA
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">5-10min</div>
            <div className="text-sm text-gray-500">Délai moyen</div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {!generationResult ? (
          /* Formulaire Express */
          <div className="space-y-6">
            {/* Infos business essentielles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom de votre business *
                </label>
                <input
                  type="text"
                  value={businessInfo.name}
                  onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                  placeholder="Ex: Bistrot du Centre"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  value={businessInfo.city}
                  onChange={(e) => setBusinessInfo({...businessInfo, city: e.target.value})}
                  placeholder="Ex: Lyon"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Secteur d'activité *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'restaurant', icon: '🍽️', label: 'Restaurant' },
                  { value: 'beaute', icon: '💄', label: 'Beauté' },
                  { value: 'artisan', icon: '🔨', label: 'Artisan' },
                  { value: 'medical', icon: '⚕️', label: 'Médical' }
                ].map((sector) => (
                  <button
                    key={sector.value}
                    onClick={() => setBusinessInfo({...businessInfo, sector: sector.value as any})}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      businessInfo.sector === sector.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{sector.icon}</div>
                    <div className="font-semibold text-sm">{sector.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description courte de votre activité
              </label>
              <textarea
                value={businessInfo.description}
                onChange={(e) => setBusinessInfo({...businessInfo, description: e.target.value})}
                placeholder="Ex: Restaurant traditionnel français proposant une cuisine de terroir revisitée"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Infos contact optionnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="tel"
                value={businessInfo.phone || ''}
                onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                placeholder="Téléphone (optionnel)"
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                value={businessInfo.email || ''}
                onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                placeholder="Email (optionnel)"
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Bouton génération */}
            <div className="pt-6">
              <button
                onClick={handleGenerate}
                disabled={!businessInfo.name || !businessInfo.city || isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Génération magique en cours...</span>
                  </div>
                ) : (
                  '🚀 Générer mon site en 5 minutes'
                )}
              </button>
            </div>

            {/* Features preview */}
            <div className="bg-gray-50 rounded-xl p-6 mt-6">
              <h3 className="font-bold text-gray-900 mb-4">✨ Ce que vous obtiendrez :</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  '🎨 Design professionnel adapté à votre secteur',
                  '🏢 Logo généré automatiquement',
                  '📸 Photos optimisées pour votre activité',
                  '🎯 Couleurs de marque intelligentes',
                  '📱 Parfaitement responsive (mobile/tablet)',
                  '⚡ Performance optimisée (95+ Lighthouse)',
                  '🔍 SEO pré-configuré pour votre ville',
                  '📈 Optimisé pour la conversion client'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center text-gray-700">
                    <div className="mr-2">{feature.split(' ')[0]}</div>
                    <div>{feature.split(' ').slice(1).join(' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Résultat génération */
          <GenerationResult result={generationResult} />
        )}
      </div>
    </div>
  );
}

function GenerationResult({ result }: { result: ExpressGenerationResult }) {
  return (
    <div className="space-y-8">
      {/* Success header */}
      <div className="text-center bg-green-50 rounded-xl p-6">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">
          Site généré avec succès !
        </h3>
        <p className="text-green-600">
          Votre site web professionnel pour <strong>{result.businessInfo.name}</strong> est prêt
        </p>
      </div>

      {/* Generated assets preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Preview visuel */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 text-lg">🎨 Aperçu Design</h4>
          
          <div className="bg-gray-100 rounded-xl p-6">
            {/* Logo */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-600 mb-2">Logo généré:</div>
              <div className="bg-white rounded-lg p-4 inline-block">
                {result.generatedAssets.logo}
              </div>
            </div>

            {/* Hero image */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-600 mb-2">Image hero:</div>
              <div className="h-40 rounded-lg overflow-hidden">
                {result.generatedAssets.heroImage}
              </div>
            </div>

            {/* Color palette */}
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-2">Palette couleurs:</div>
              <div className="flex space-x-2">
                {Object.entries(result.generatedAssets.colorPalette).map(([name, color]) => (
                  <div key={name} className="text-center">
                    <div 
                      className="w-12 h-12 rounded-lg border border-gray-200"
                      style={{ backgroundColor: color }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-1">{name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contenu généré */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 text-lg">📝 Contenu Généré</h4>
          
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Titre principal:</div>
              <div className="text-lg font-bold text-gray-900">
                {result.generatedAssets.customizedContent.heroTitle}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Sous-titre:</div>
              <div className="text-gray-700">
                {result.generatedAssets.customizedContent.heroSubtitle}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Bouton d'action:</div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                {result.generatedAssets.customizedContent.ctaText}
              </button>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-600 mb-2">Fonctionnalités mises en avant:</div>
              <div className="space-y-1">
                {result.generatedAssets.customizedContent.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimisations */}
      <div>
        <h4 className="font-bold text-gray-900 text-lg mb-4">🚀 Optimisations Appliquées</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.optimizations.map((optimization, idx) => (
            <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">{optimization}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6">
        <button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold hover:from-green-700 hover:to-blue-700 transition-all duration-300">
          🌐 Publier maintenant
        </button>
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold transition-colors">
          ✏️ Personnaliser
        </button>
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold transition-colors">
          👁️ Prévisualiser
        </button>
      </div>

      {/* Info template */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h5 className="font-bold text-gray-900 mb-2">📋 Template Sélectionné</h5>
        <div className="text-sm text-gray-700">
          <div><strong>Template:</strong> {result.selectedTemplate.primaryTemplate.name}</div>
          <div><strong>Score de compatibilité:</strong> {result.selectedTemplate.matchScore}%</div>
          <div><strong>Temps estimé:</strong> {result.estimatedCompletion}</div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
async function generateBusinessRequirements(businessInfo: BusinessInfo): Promise<BusinessRequirements> {
  // Analyse intelligente du business pour générer les requirements
  const businessTypeMapping: Record<string, string> = {
    restaurant: detectRestaurantType(businessInfo.description),
    beaute: detectBeautyType(businessInfo.description),
    artisan: detectArtisanType(businessInfo.description),
    medical: detectMedicalType(businessInfo.description)
  };

  return {
    sector: businessInfo.sector,
    businessType: businessTypeMapping[businessInfo.sector] || 'généraliste',
    targetAudience: getTargetAudience(businessInfo.sector, businessInfo.city),
    businessGoals: getBusinessGoals(businessInfo.sector),
    preferredStyle: getPreferredStyle(businessInfo.sector, businessInfo.description),
    budget: 'premium',
    timeframe: 'express',
    specialRequirements: []
  };
}

async function generateExpressAssets(
  businessInfo: BusinessInfo, 
  templateSelection: SmartSelectionResult
): Promise<ExpressGenerationResult> {
  
  // Génération des assets
  const logo = generateLogo({
    businessName: businessInfo.name,
    sector: businessInfo.sector,
    style: templateSelection.primaryTemplate.designType,
    size: 80,
    colors: templateSelection.customizations.colors
  });

  const heroImage = React.createElement(HeroImage, {
    sector: businessInfo.sector,
    templateName: templateSelection.primaryTemplate.name,
    templateId: templateSelection.primaryTemplate.id,
    className: "w-full h-full object-cover"
  });

  const customizedContent = generateCustomContent(businessInfo, templateSelection);

  return {
    businessInfo,
    selectedTemplate: templateSelection,
    generatedAssets: {
      logo,
      heroImage,
      colorPalette: templateSelection.customizations.colors,
      customizedContent
    },
    previewUrl: `/preview/${templateSelection.primaryTemplate.id}?business=${encodeURIComponent(businessInfo.name)}`,
    estimatedCompletion: templateSelection.estimatedDelivery,
    optimizations: templateSelection.conversionOptimizations
  };
}

function generateCustomContent(businessInfo: BusinessInfo, templateSelection: SmartSelectionResult) {
  const sectorContent: Record<string, any> = {
    restaurant: {
      heroTitle: `${businessInfo.name} - ${businessInfo.city}`,
      heroSubtitle: `Découvrez notre cuisine ${businessInfo.description.includes('traditionnel') ? 'traditionnelle' : 'moderne'} au cœur de ${businessInfo.city}`,
      ctaText: "Réserver une table",
      features: ["Menu du chef", "Réservation en ligne", "Ambiance chaleureuse", "Produits locaux"]
    },
    beaute: {
      heroTitle: `${businessInfo.name} - Salon de beauté ${businessInfo.city}`,
      heroSubtitle: `Votre beauté entre les mains d'experts passionnés à ${businessInfo.city}`,
      ctaText: "Prendre rendez-vous",
      features: ["Équipe experte", "Produits premium", "Conseils personnalisés", "Ambiance relaxante"]
    },
    artisan: {
      heroTitle: `${businessInfo.name} - Artisan ${businessInfo.city}`,
      heroSubtitle: `Savoir-faire artisanal et créations sur mesure à ${businessInfo.city}`,
      ctaText: "Demander un devis",
      features: ["Travail sur mesure", "Matériaux nobles", "Expertise reconnue", "Garantie qualité"]
    },
    medical: {
      heroTitle: `${businessInfo.name} - Cabinet médical ${businessInfo.city}`,
      heroSubtitle: `Votre santé, notre priorité. Soins de qualité à ${businessInfo.city}`,
      ctaText: "Prendre rendez-vous",
      features: ["Équipe médicale", "Matériel moderne", "Suivi personnalisé", "Urgences acceptées"]
    }
  };

  return sectorContent[businessInfo.sector] || sectorContent.medical;
}

// Detection helpers
function detectRestaurantType(description: string): string {
  if (description.includes('pizza')) return 'pizzeria';
  if (description.includes('gastronomique') || description.includes('étoile')) return 'gastronomique';
  if (description.includes('café') || description.includes('brunch')) return 'café';
  return 'bistrot';
}

function detectBeautyType(description: string): string {
  if (description.includes('coiffure')) return 'salon coiffure';
  if (description.includes('institut')) return 'institut';
  if (description.includes('barbier')) return 'barbier';
  return 'salon coiffure';
}

function detectArtisanType(description: string): string {
  if (description.includes('bois') || description.includes('menuiserie')) return 'menuiserie';
  if (description.includes('métal') || description.includes('forge')) return 'ferronnerie';
  if (description.includes('céramique') || description.includes('poterie')) return 'céramique';
  return 'généraliste';
}

function detectMedicalType(description: string): string {
  if (description.includes('dentiste')) return 'dentiste';
  if (description.includes('kiné')) return 'kiné';
  if (description.includes('psy')) return 'psychologue';
  return 'généraliste';
}

function getTargetAudience(sector: string, city: string): string {
  return `Clients locaux ${city} et région environnante`;
}

function getBusinessGoals(sector: string): string[] {
  const goals: Record<string, string[]> = {
    restaurant: ['generer-leads', 'augmenter-visibilite', 'fideliser-clients'],
    beaute: ['generer-leads', 'augmenter-visibilite', 'fideliser-clients'],
    artisan: ['generer-leads', 'augmenter-visibilite'],
    medical: ['generer-leads', 'augmenter-visibilite']
  };
  
  return goals[sector] || ['generer-leads'];
}

function getPreferredStyle(sector: string, description: string): 'luxury' | 'premium' | 'modern' | 'elegant' | 'professional' {
  if (description.includes('luxe') || description.includes('haut de gamme')) return 'luxury';
  if (description.includes('moderne') || description.includes('contemporain')) return 'modern';
  if (description.includes('traditionnel') || description.includes('authentique')) return 'elegant';
  if (sector === 'medical') return 'professional';
  return 'premium';
}