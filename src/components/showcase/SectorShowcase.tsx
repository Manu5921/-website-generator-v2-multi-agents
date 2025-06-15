'use client';

import { sectorInfo, getTemplatesBySector } from './templatesData';
import { PhotoGallery, HeroImage } from './PhotoService';
import { generateLogo } from './LogoGeneratorSimple';
import { getTemplateColors, SectorColorShowcase } from './ColorSystem';

interface SectorShowcaseProps {
  selectedSector: string;
}

export function SectorShowcase({ selectedSector }: SectorShowcaseProps) {
  const sectors = Object.entries(sectorInfo);

  if (selectedSector !== 'all') {
    return null; // On n'affiche pas cette section si un secteur spécifique est sélectionné
  }

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            🎯 Nos Secteurs d'Excellence
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chaque secteur bénéficie de templates spécialement conçus pour maximiser 
            l'impact et les conversions dans votre domaine d'activité.
          </p>
        </div>

        {/* Grille des secteurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {sectors.map(([sectorKey, sector]) => {
            const templates = getTemplatesBySector(sectorKey);
            
            return (
              <div
                key={sectorKey}
                className="group cursor-pointer"
                onClick={() => {
                  // Scroll to gallery and update filter
                  document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
                  // This would trigger the parent's filter update
                }}
              >
                <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2">
                  
                  {/* Background Hero Image */}
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                    <HeroImage
                      sector={sectorKey as 'restaurant' | 'beaute' | 'artisan' | 'medical'}
                      templateName={sector.name}
                      className="w-full h-full"
                    />
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${sector.color} opacity-60 group-hover:opacity-40 transition-opacity duration-300`}></div>
                  
                  {/* Content */}
                  <div className="relative p-8">
                    
                    {/* Logo + Icon */}
                    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-4xl">{sector.icon}</div>
                        <div className="opacity-80">
                          {generateLogo({
                            businessName: sector.name,
                            sector: sectorKey as 'restaurant' | 'beaute' | 'artisan' | 'medical',
                            style: 'modern',
                            size: 60,
                            colors: getTemplateColors(sectorKey as 'restaurant' | 'beaute' | 'artisan' | 'medical', 'modern')
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {sector.name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {sector.description}
                    </p>
                    
                    {/* Stats */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Templates</span>
                        <span className="font-bold text-gray-800">{sector.templates}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Conversion moy.</span>
                        <span className="font-bold text-green-600">{sector.avgConversion}</span>
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        🌟 Fonctionnalités clés:
                      </h4>
                      {sector.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    {/* Action Button */}
                    <div className="mt-8">
                      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform group-hover:scale-105">
                        Voir les {sector.templates} templates
                      </button>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-300 rounded-2xl transition-all duration-300"></div>
                </div>

                {/* Template previews enhanced */}
                <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-100 scale-75">
                  <div className="flex gap-1">
                    {templates.slice(0, 3).map((template, index) => (
                      <div
                        key={template.id}
                        className="w-16 h-12 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden relative"
                        style={{ 
                          transform: `translateY(${index * -3}px) translateX(${index * -2}px)`,
                          zIndex: 10 - index 
                        }}
                      >
                        {/* Mini hero image */}
                        <div className="absolute inset-0">
                          <HeroImage
                            sector={template.sector}
                            templateName={template.name}
                            className="w-full h-full opacity-60"
                          />
                        </div>
                        
                        {/* Mini logo */}
                        <div className="absolute top-0.5 left-0.5">
                          {generateLogo({
                            businessName: template.businessExample.name.slice(0, 8),
                            sector: template.sector,
                            style: template.designType,
                            size: 16,
                            colors: getTemplateColors(template.sector, template.designType)
                          })}
                        </div>
                        
                        {/* Template indicator */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[6px] px-1 py-0.5 text-center">
                          {template.designType.slice(0, 3).toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🚀 Votre secteur n'est pas listé ?
            </h3>
            <p className="text-gray-600 mb-6">
              Notre IA s'adapte à tous les secteurs d'activité. Contactez-nous pour 
              découvrir comment nous pouvons créer le template parfait pour votre métier.
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
              Demander un template personnalisé
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}