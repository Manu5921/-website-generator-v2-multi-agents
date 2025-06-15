'use client';

import React, { useState } from 'react';
import { Template } from './templatesData';
import { generateLogo } from './LogoGeneratorSimple';
import { HeroImage, PhotoGallery, TeamPhotos } from './PhotoService';
import { getTemplateColors } from './ColorSystem';

interface EnhancedTemplatePreviewProps {
  template: Template;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  showStats?: boolean;
}

export function EnhancedTemplatePreview({ 
  template, 
  viewMode, 
  showStats = true 
}: EnhancedTemplatePreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'colors' | 'photos' | 'logo'>('preview');
  const [isLoading, setIsLoading] = useState(false);
  
  const colors = getTemplateColors(template.sector, template.designType);
  
  const getDeviceFrame = () => {
    switch (viewMode) {
      case 'desktop':
        return {
          width: 'w-full max-w-5xl',
          height: 'h-[500px]',
          frame: 'rounded-lg border-4 border-gray-300 shadow-2xl',
          icon: '🖥️'
        };
      case 'tablet':
        return {
          width: 'w-96',
          height: 'h-[500px]',
          frame: 'rounded-2xl border-8 border-gray-800 shadow-2xl',
          icon: '📱'
        };
      case 'mobile':
        return {
          width: 'w-72',
          height: 'h-[500px]',
          frame: 'rounded-3xl border-8 border-gray-900 shadow-2xl',
          icon: '📱'
        };
    }
  };

  const deviceFrame = getDeviceFrame();

  // Générer le contenu de la preview selon l'onglet actif
  const renderPreviewContent = () => {
    switch (activeTab) {
      case 'preview':
        return (
          <div className="w-full h-full overflow-hidden">
            {/* Hero Section avec photo réelle */}
            <div className="relative h-2/5" style={{ backgroundColor: colors.background }}>
              <HeroImage
                sector={template.sector}
                templateName={template.name}
                className="absolute inset-0"
              />
              
              {/* Logo overlay */}
              <div className="absolute top-4 left-4 z-10">
                {generateLogo({
                  businessName: template.businessExample.name,
                  sector: template.sector,
                  style: template.designType,
                  size: viewMode === 'mobile' ? 80 : 100,
                  colors
                })}
              </div>
              
              {/* Hero text */}
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-4 bg-black/30">
                <h1 className={`font-bold mb-2 ${viewMode === 'mobile' ? 'text-lg' : 'text-2xl'}`}>
                  {template.businessExample.name}
                </h1>
                <p className={`${viewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                  {template.businessExample.city} - {template.businessExample.description}
                </p>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="h-3/5 p-4 space-y-4" style={{ backgroundColor: colors.background }}>
              {/* Services/Features */}
              <div>
                <h2 className={`font-bold mb-2 ${viewMode === 'mobile' ? 'text-sm' : 'text-lg'}`} 
                    style={{ color: colors.primary }}>
                  Nos Services
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {template.features.slice(0, 4).map((feature, idx) => (
                    <div key={idx} 
                         className={`p-2 rounded text-white ${viewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}
                         style={{ backgroundColor: colors.secondary }}>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* CTA Button */}
              <div className="text-center">
                <button 
                  className={`px-6 py-2 rounded-lg text-white font-semibold ${viewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}
                  style={{ backgroundColor: colors.accent }}
                >
                  Contactez-nous
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'colors':
        return (
          <div className="w-full h-full p-6 bg-white">
            <h3 className="font-bold text-lg mb-4">Palette de couleurs</h3>
            <div className="space-y-4">
              {Object.entries(colors).filter(([key]) => 
                ['primary', 'secondary', 'accent', 'background'].includes(key)
              ).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-lg shadow-md border border-gray-200"
                    style={{ backgroundColor: value }}
                  />
                  <div>
                    <div className="font-medium capitalize">{key}</div>
                    <div className="text-sm text-gray-500 font-mono">{value}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Gradient preview */}
            <div className="mt-6">
              <div className="font-medium mb-2">Gradient</div>
              <div className={`w-full h-16 rounded-lg bg-gradient-to-r ${colors.gradient}`} />
            </div>
          </div>
        );
        
      case 'photos':
        return (
          <div className="w-full h-full p-4 bg-white overflow-auto">
            <h3 className="font-bold text-lg mb-4">Photos du secteur</h3>
            <PhotoGallery
              sector={template.sector}
              type="gallery"
              className="grid grid-cols-2 gap-4"
              imageClassName="h-24 object-cover"
              count={6}
            />
          </div>
        );
        
      case 'logo':
        return (
          <div className="w-full h-full p-6 bg-white flex flex-col items-center justify-center">
            <h3 className="font-bold text-lg mb-6">Logo généré</h3>
            <div className="mb-6">
              {generateLogo({
                businessName: template.businessExample.name,
                sector: template.sector,
                style: template.designType,
                size: 200,
                colors
              })}
            </div>
            
            {/* Variations */}
            <div className="text-center">
              <h4 className="font-medium mb-4">Variations</h4>
              <div className="flex gap-4">
                {(['modern', 'elegant', 'luxury'] as const).map((style) => (
                  <div key={style} className="text-center">
                    {generateLogo({
                      businessName: template.businessExample.name,
                      sector: template.sector,
                      style: style,
                      size: 80,
                      colors
                    })}
                    <div className="text-xs mt-1 capitalize">{style}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Onglets de navigation */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'preview', label: '🖥️ Aperçu', icon: '🖥️' },
            { key: 'colors', label: '🎨 Couleurs', icon: '🎨' },
            { key: 'photos', label: '📸 Photos', icon: '📸' },
            { key: 'logo', label: '🏷️ Logo', icon: '🏷️' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {viewMode === 'mobile' ? '' : tab.label.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Device Frame avec contenu */}
      <div className={`${deviceFrame.width} ${deviceFrame.height} ${deviceFrame.frame} bg-white mx-auto relative overflow-hidden group`}>
        
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center z-10">
            <div className="text-gray-400">
              <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        {renderPreviewContent()}

        {/* Device indicator */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 z-20">
          <span>{deviceFrame.icon}</span>
          <span className="capitalize">{viewMode}</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>

        {/* Quality badge */}
        <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold z-20">
          ✨ Design IA Premium
        </div>
      </div>

      {/* Stats détaillées */}
      {showStats && (
        <div className="mt-8 bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {template.stats.loadTime}
              </div>
              <div className="text-sm text-gray-600 mb-3">Temps de chargement</div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full w-5/6 animate-pulse"></div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {template.stats.lighthouse}/100
              </div>
              <div className="text-sm text-gray-600 mb-3">Score Lighthouse</div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full animate-pulse"
                  style={{ width: `${template.stats.lighthouse}%` }}
                ></div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {template.stats.conversionRate}
              </div>
              <div className="text-sm text-gray-600 mb-3">Taux conversion</div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full w-4/5 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Wow Factors avec style amélioré */}
          <div className="border-t border-gray-100 pt-8">
            <h4 className="font-bold text-xl text-gray-800 mb-6 text-center">
              ✨ Facteurs "Waouh" - Ce qui rend ce template exceptionnel
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {template.wowFactors.map((factor, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">{factor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Example */}
          <div className="border-t border-gray-100 pt-8 mt-8">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
              <h4 className="font-bold text-lg text-gray-800 mb-4 text-center">
                🏢 Exemple concret d'utilisation
              </h4>
              <div className="text-center">
                <h5 className="font-bold text-xl text-gray-900">{template.businessExample.name}</h5>
                <p className="text-blue-600 font-medium text-lg">{template.businessExample.city}</p>
                <p className="text-gray-600 mt-2 max-w-2xl mx-auto">{template.businessExample.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}