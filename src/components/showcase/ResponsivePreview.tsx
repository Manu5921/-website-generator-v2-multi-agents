'use client';

import { useState } from 'react';
import { Template } from './templatesData';

interface ResponsivePreviewProps {
  template: Template;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  showStats?: boolean;
}

export function ResponsivePreview({ template, viewMode, showStats = true }: ResponsivePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const getDeviceFrame = () => {
    switch (viewMode) {
      case 'desktop':
        return {
          width: 'w-full max-w-4xl',
          height: 'h-96',
          frame: 'rounded-lg border-4 border-gray-300',
          icon: '🖥️'
        };
      case 'tablet':
        return {
          width: 'w-80',
          height: 'h-96',
          frame: 'rounded-2xl border-8 border-gray-800',
          icon: '📱'
        };
      case 'mobile':
        return {
          width: 'w-64',
          height: 'h-96',
          frame: 'rounded-3xl border-8 border-gray-900',
          icon: '📱'
        };
    }
  };

  const deviceFrame = getDeviceFrame();

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative">
      {/* Device Frame */}
      <div className={`${deviceFrame.width} ${deviceFrame.height} ${deviceFrame.frame} bg-white shadow-2xl mx-auto relative overflow-hidden group`}>
        
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">
              <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Preview Image */}
        <img
          src={`/api/placeholder/template-preview?template=${template.id}&device=${viewMode}&w=800&h=600`}
          alt={`${template.name} - Aperçu ${viewMode}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleImageLoad}
          onError={handleImageLoad}
        />

        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-3">
            <button
              onClick={() => setShowFullscreen(true)}
              className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-gray-100 transition-colors"
            >
              🔍 Agrandir
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-blue-700 transition-colors"
            >
              🎯 Voir en live
            </button>
          </div>
        </div>

        {/* Device indicator */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <span>{deviceFrame.icon}</span>
          <span className="capitalize">{viewMode}</span>
        </div>
      </div>

      {/* Stats sous l'aperçu */}
      {showStats && (
        <div className="mt-6 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Performance */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {template.stats.loadTime}
              </div>
              <div className="text-sm text-gray-600">Temps de chargement</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-500 h-2 rounded-full w-5/6"></div>
              </div>
            </div>

            {/* Lighthouse Score */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {template.stats.lighthouse}/100
              </div>
              <div className="text-sm text-gray-600">Score Lighthouse</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${template.stats.lighthouse}%` }}
                ></div>
              </div>
            </div>

            {/* Conversion */}
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {template.stats.conversionRate}
              </div>
              <div className="text-sm text-gray-600">Taux conversion</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-purple-500 h-2 rounded-full w-4/5"></div>
              </div>
            </div>
          </div>

          {/* Wow Factors */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-3 text-center">
              ✨ Facteurs "Waouh"
            </h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {template.wowFactors.map((factor, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl w-full">
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl"
            >
              ✕ Fermer
            </button>
            
            <div className="bg-white rounded-lg p-4">
              <img
                src={`/api/placeholder/template-preview?template=${template.id}&device=${viewMode}&w=1200&h=800`}
                alt={`${template.name} - Aperçu plein écran`}
                className="w-full h-auto rounded"
              />
              
              <div className="mt-4 text-center">
                <h3 className="text-xl font-bold text-gray-800">{template.name}</h3>
                <p className="text-gray-600">{template.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}