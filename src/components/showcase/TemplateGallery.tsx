'use client';

import { useState } from 'react';
import { getTemplatesBySector, Template } from './templatesData';
import { ResponsivePreview } from './ResponsivePreview';
import { EnhancedTemplatePreview } from './EnhancedTemplatePreview';
import { generateLogo } from './LogoGeneratorSimple';
import { HeroImage } from './PhotoService';
import { getTemplateColors } from './ColorSystem';
import { FigmaMCPInterface } from './FigmaMCPIntegration';

interface TemplateGalleryProps {
  selectedSector: string;
  viewMode: 'desktop' | 'tablet' | 'mobile';
}

export function TemplateGallery({ selectedSector, viewMode }: TemplateGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFigmaIntegration, setShowFigmaIntegration] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'conversion' | 'designType'>('name');
  const [filterBy, setFilterBy] = useState<'all' | 'premium' | 'luxury' | 'modern' | 'elegant' | 'professional'>('all');
  
  const allTemplates = getTemplatesBySector(selectedSector);
  
  // Filtrage et tri des templates
  const templates = allTemplates
    .filter(template => {
      if (filterBy === 'all') return true;
      return template.designType === filterBy;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'conversion':
          const aConv = parseInt(a.stats.conversionRate.replace(/[^\d]/g, ''));
          const bConv = parseInt(b.stats.conversionRate.replace(/[^\d]/g, ''));
          return bConv - aConv; // Décroissant
        case 'designType':
          return a.designType.localeCompare(b.designType);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const getDesignTypeColor = (type: string) => {
    switch (type) {
      case 'luxury': return 'from-purple-600 to-pink-600';
      case 'premium': return 'from-blue-600 to-indigo-600';
      case 'modern': return 'from-green-600 to-teal-600';
      case 'elegant': return 'from-gray-600 to-slate-600';
      case 'professional': return 'from-blue-600 to-cyan-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getSectorIcon = (sector: string) => {
    switch (sector) {
      case 'restaurant': return '🍽️';
      case 'beaute': return '💄';
      case 'artisan': return '🔨';
      case 'medical': return '⚕️';
      default: return '🎯';
    }
  };

  return (
    <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            🎨 Galerie des Templates Premium
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {selectedSector === 'all' 
              ? `Découvrez nos ${templates.length} templates professionnels conçus par IA`
              : `${templates.length} templates spécialisés pour votre secteur d'activité`
            }
          </p>
          
          {/* Counter avec animation */}
          <div className="mt-8 inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
              <div className="text-gray-600">templates disponibles</div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Contrôles de filtrage et tri */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔍 Filtrer par type
                </label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">Tous les types</option>
                  <option value="premium">Premium</option>
                  <option value="luxury">Luxury</option>
                  <option value="modern">Modern</option>
                  <option value="elegant">Elegant</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📊 Trier par
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="name">Nom</option>
                  <option value="conversion">Taux de conversion</option>
                  <option value="designType">Type de design</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => setShowFigmaIntegration(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2"
              >
                <span>🎨</span>
                <span>Figma MCP</span>
              </button>
              
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                <span>📤</span>
                <span>Exporter sélection</span>
              </button>
            </div>
          </div>
          
          {/* Statistiques rapides */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{templates.filter(t => t.designType === 'premium').length}</div>
              <div className="text-sm text-gray-600">Premium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{templates.filter(t => t.designType === 'luxury').length}</div>
              <div className="text-sm text-gray-600">Luxury</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(templates.reduce((acc, t) => acc + parseInt(t.stats.conversionRate.replace(/[^\d]/g, '')), 0) / templates.length)}%
              </div>
              <div className="text-sm text-gray-600">Conv. moyenne</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(templates.reduce((acc, t) => acc + t.stats.lighthouse, 0) / templates.length)}
              </div>
              <div className="text-sm text-gray-600">Score Lighthouse</div>
            </div>
          </div>
        </div>

        {/* Galerie */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-12">
          {templates.map((template, index) => (
            <div
              key={template.id}
              className="group cursor-pointer"
              onClick={() => {
                setSelectedTemplate(template);
                setShowDetails(true);
              }}
            >
              {/* Card Template */}
              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-3 border border-gray-100 overflow-hidden">
                
                {/* Header avec badges */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getSectorIcon(template.sector)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getDesignTypeColor(template.designType)}`}>
                        {template.designType}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">#{index + 1}</div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {template.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Preview enhanced avec visuels réels */}
                <div className="px-6">
                  <div className="relative">
                    {/* Hero image avec logo */}
                    <div className="h-48 relative overflow-hidden rounded-lg">
                      <HeroImage
                        sector={template.sector}
                        templateName={template.name}
                        templateId={template.id}
                        className="absolute inset-0"
                      />
                      
                      {/* Logo overlay */}
                      <div className="absolute top-3 left-3">
                        {generateLogo({
                          businessName: template.businessExample.name,
                          sector: template.sector,
                          style: template.designType,
                          size: 60,
                          colors: getTemplateColors(template.sector, template.designType)
                        })}
                      </div>
                      
                      {/* Preview badge */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-800">
                        🎨 Design IA
                      </div>
                      
                      {/* Quick info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <div className="text-white">
                          <div className="font-bold text-sm">{template.businessExample.name}</div>
                          <div className="text-xs opacity-90">{template.businessExample.city}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Device preview indicator */}
                    <div className="mt-3 flex justify-center space-x-2">
                      {['desktop', 'tablet', 'mobile'].map((device) => (
                        <div
                          key={device}
                          className={`w-2 h-2 rounded-full ${
                            device === viewMode ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats rapides */}
                <div className="p-6 pt-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{template.stats.loadTime}</div>
                      <div className="text-xs text-gray-500">Load</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{template.stats.lighthouse}</div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{template.stats.conversionRate}</div>
                      <div className="text-xs text-gray-500">Conv.</div>
                    </div>
                  </div>

                  {/* Features preview */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Fonctionnalités clés:</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                        >
                          {feature}
                        </span>
                      ))}
                      {template.features.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          +{template.features.length - 3} autres
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Exemple business */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="text-sm">
                      <div className="font-semibold text-gray-800">{template.businessExample.name}</div>
                      <div className="text-gray-600">{template.businessExample.city}</div>
                      <div className="text-xs text-gray-500 mt-1">{template.businessExample.description}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplate(template);
                        setShowDetails(true);
                      }}
                    >
                      Voir en détail
                    </button>
                    <button 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-colors text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Ouvrir démo live
                      }}
                    >
                      🔗 Demo
                    </button>
                  </div>
                </div>

                {/* Effet hover */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-300 rounded-2xl transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de détails */}
        {showDetails && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
              
              {/* Header modal */}
              <div className="p-8 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedTemplate.name}
                    </h2>
                    <p className="text-gray-600">{selectedTemplate.description}</p>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Contenu modal */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  
                  {/* Enhanced Preview */}
                  <div>
                    <EnhancedTemplatePreview 
                      template={selectedTemplate} 
                      viewMode={viewMode}
                      showStats={true}
                    />
                  </div>

                  {/* Détails */}
                  <div>
                    
                    {/* Toutes les fonctionnalités */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">🌟 Fonctionnalités</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedTemplate.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-gray-700">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Wow factors */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">✨ Facteurs "Waouh"</h3>
                      <div className="space-y-3">
                        {selectedTemplate.wowFactors.map((factor, idx) => (
                          <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                            <div className="font-medium text-gray-800">{factor}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Example business */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">🏢 Exemple d'utilisation</h3>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-bold text-lg text-gray-800">{selectedTemplate.businessExample.name}</h4>
                        <p className="text-blue-600 font-medium">{selectedTemplate.businessExample.city}</p>
                        <p className="text-gray-600 mt-2">{selectedTemplate.businessExample.description}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                      <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                        🚀 Utiliser ce template
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold transition-colors">
                        🎬 Voir la démo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Si aucun template trouvé */}
        {templates.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Aucun template trouvé</h3>
            <p className="text-gray-600 mb-8">Essayez de changer les filtres ou contactez-nous pour un template personnalisé.</p>
            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              Demander un template sur mesure
            </button>
          </div>
        )}

        {/* Modal Figma MCP */}
        {showFigmaIntegration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
              
              {/* Header modal */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      🎨 Intégration Figma MCP
                    </h2>
                    <p className="text-gray-600">Connectez vos designs Figma pour une synchronisation automatique</p>
                  </div>
                  <button
                    onClick={() => setShowFigmaIntegration(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Contenu modal */}
              <div className="p-6">
                <FigmaMCPInterface />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}