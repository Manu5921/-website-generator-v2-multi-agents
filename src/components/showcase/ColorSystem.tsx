'use client';

import React from 'react';

// Palettes de couleurs par secteur et style
export const colorPalettes = {
  restaurant: {
    modern: {
      primary: '#8B4513',
      secondary: '#D2691E', 
      accent: '#F4A460',
      background: '#FFF8F0',
      text: '#2D1810',
      gradient: 'from-orange-500 to-amber-600',
      bgGradient: 'from-orange-50 to-amber-50'
    },
    elegant: {
      primary: '#2C3E50',
      secondary: '#E74C3C',
      accent: '#F39C12',
      background: '#F8F9FA',
      text: '#2C3E50',
      gradient: 'from-slate-700 to-red-600',
      bgGradient: 'from-slate-50 to-red-50'
    },
    luxury: {
      primary: '#1A1A1A',
      secondary: '#D4AF37',
      accent: '#8B0000',
      background: '#FAF9F6',
      text: '#1A1A1A',
      gradient: 'from-black to-yellow-600',
      bgGradient: 'from-yellow-50 to-red-50'
    },
    premium: {
      primary: '#6C7B7F',
      secondary: '#E8DCC6',
      accent: '#A0522D',
      background: '#F5F5F0',
      text: '#4A4A4A',
      gradient: 'from-slate-500 to-amber-700',
      bgGradient: 'from-slate-50 to-amber-50'
    }
  },
  beaute: {
    modern: {
      primary: '#FF69B4',
      secondary: '#FFB6C1',
      accent: '#C71585',
      background: '#FFF0F8',
      text: '#8B0040',
      gradient: 'from-pink-500 to-rose-400',
      bgGradient: 'from-pink-50 to-rose-50'
    },
    luxury: {
      primary: '#E6E6FA',
      secondary: '#DDA0DD',
      accent: '#9370DB',
      background: '#F8F6FF',
      text: '#4B0082',
      gradient: 'from-purple-300 to-violet-500',
      bgGradient: 'from-purple-50 to-violet-50'
    },
    elegant: {
      primary: '#8B4513',
      secondary: '#CD853F',
      accent: '#A0522D',
      background: '#FFF8F0',
      text: '#654321',
      gradient: 'from-amber-700 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50'
    },
    premium: {
      primary: '#FF1493',
      secondary: '#FFB6C1', 
      accent: '#DC143C',
      background: '#FFF0F5',
      text: '#8B0038',
      gradient: 'from-pink-600 to-rose-500',
      bgGradient: 'from-pink-50 to-rose-50'
    }
  },
  artisan: {
    professional: {
      primary: '#8B4513',
      secondary: '#D2691E',
      accent: '#228B22',
      background: '#FFF8F0',
      text: '#654321',
      gradient: 'from-amber-700 to-green-600',
      bgGradient: 'from-amber-50 to-green-50'
    },
    modern: {
      primary: '#2F4F4F',
      secondary: '#708090',
      accent: '#B22222',
      background: '#F8F8FF',
      text: '#2F4F4F',
      gradient: 'from-slate-600 to-red-600',
      bgGradient: 'from-slate-50 to-red-50'
    },
    elegant: {
      primary: '#8B008B',
      secondary: '#DDA0DD',
      accent: '#FFD700',
      background: '#FFF8FF',
      text: '#4B0082',
      gradient: 'from-purple-600 to-yellow-500',
      bgGradient: 'from-purple-50 to-yellow-50'
    },
    premium: {
      primary: '#8FBC8F',
      secondary: '#F5DEB3',
      accent: '#CD853F',
      background: '#F0FFF0',
      text: '#556B2F',
      gradient: 'from-green-400 to-amber-600',
      bgGradient: 'from-green-50 to-amber-50'
    }
  },
  medical: {
    professional: {
      primary: '#008B8B',
      secondary: '#20B2AA',
      accent: '#00CED1',
      background: '#F0FFFF',
      text: '#006666',
      gradient: 'from-teal-600 to-cyan-500',
      bgGradient: 'from-teal-50 to-cyan-50'
    },
    premium: {
      primary: '#4169E1',
      secondary: '#87CEEB',
      accent: '#00BFFF',
      background: '#F0F8FF',
      text: '#1E3A8A',
      gradient: 'from-blue-600 to-sky-400',
      bgGradient: 'from-blue-50 to-sky-50'
    },
    elegant: {
      primary: '#9370DB',
      secondary: '#DDA0DD',
      accent: '#BA55D3',
      background: '#F8F0FF',
      text: '#4B0082',
      gradient: 'from-purple-500 to-violet-400',
      bgGradient: 'from-purple-50 to-violet-50'
    },
    modern: {
      primary: '#32CD32',
      secondary: '#90EE90',
      accent: '#228B22',
      background: '#F0FFF0',
      text: '#228B22',
      gradient: 'from-green-500 to-lime-400',
      bgGradient: 'from-green-50 to-lime-50'
    }
  }
};

// Fonction pour obtenir les couleurs d'un template
export const getTemplateColors = (
  sector: 'restaurant' | 'beaute' | 'artisan' | 'medical',
  designType: 'modern' | 'elegant' | 'luxury' | 'professional' | 'premium'
): typeof colorPalettes.restaurant.modern => {
  return colorPalettes[sector]?.[designType] || colorPalettes.restaurant.modern;
};

// Composant pour afficher une palette de couleurs
interface ColorPaletteProps {
  colors: typeof colorPalettes.restaurant.modern;
  name: string;
  className?: string;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  colors,
  name,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h3 className="font-bold text-lg mb-4 text-gray-900">{name}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Couleur primaire */}
        <div className="space-y-2">
          <div 
            className="w-full h-16 rounded-lg shadow-md"
            style={{ backgroundColor: colors.primary }}
          />
          <div className="text-sm">
            <div className="font-medium">Primaire</div>
            <div className="text-gray-500 font-mono text-xs">{colors.primary}</div>
          </div>
        </div>

        {/* Couleur secondaire */}
        <div className="space-y-2">
          <div 
            className="w-full h-16 rounded-lg shadow-md"
            style={{ backgroundColor: colors.secondary }}
          />
          <div className="text-sm">
            <div className="font-medium">Secondaire</div>
            <div className="text-gray-500 font-mono text-xs">{colors.secondary}</div>
          </div>
        </div>

        {/* Couleur accent */}
        <div className="space-y-2">
          <div 
            className="w-full h-16 rounded-lg shadow-md"
            style={{ backgroundColor: colors.accent }}
          />
          <div className="text-sm">
            <div className="font-medium">Accent</div>
            <div className="text-gray-500 font-mono text-xs">{colors.accent}</div>
          </div>
        </div>

        {/* Couleur de fond */}
        <div className="space-y-2">
          <div 
            className="w-full h-16 rounded-lg shadow-md border border-gray-200"
            style={{ backgroundColor: colors.background }}
          />
          <div className="text-sm">
            <div className="font-medium">Background</div>
            <div className="text-gray-500 font-mono text-xs">{colors.background}</div>
          </div>
        </div>
      </div>

      {/* Gradient exemple */}
      <div className="mt-4">
        <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${colors.gradient}`} />
        <div className="text-xs text-gray-500 mt-1">Gradient: {colors.gradient}</div>
      </div>
    </div>
  );
};

// Générateur de variations de couleurs
export const generateColorVariations = (baseColor: string, count: number = 5): string[] => {
  // Fonction simplifiée pour générer des variations
  // En production, on utiliserait une librairie comme chroma.js
  const variations = [];
  
  // Convertir hex en RGB pour manipuler
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  for (let i = 0; i < count; i++) {
    const factor = 0.7 + (i * 0.3 / count); // De 70% à 100%
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);
    
    const newHex = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    variations.push(newHex);
  }
  
  return variations;
};

// Composant d'aperçu de couleurs pour un secteur
interface SectorColorShowcaseProps {
  sector: 'restaurant' | 'beaute' | 'artisan' | 'medical';
  className?: string;
}

export const SectorColorShowcase: React.FC<SectorColorShowcaseProps> = ({
  sector,
  className = ''
}) => {
  const sectorColors = colorPalettes[sector];
  
  const sectorInfo = {
    restaurant: { icon: '🍽️', name: 'Restaurant' },
    beaute: { icon: '💄', name: 'Beauté' },
    artisan: { icon: '🔨', name: 'Artisan' },
    medical: { icon: '⚕️', name: 'Médical' }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {sectorInfo[sector].icon} Palettes {sectorInfo[sector].name}
        </h2>
        <p className="text-gray-600">Couleurs professionnelles adaptées au secteur</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(sectorColors).map(([style, colors]) => (
          <ColorPalette
            key={style}
            colors={colors}
            name={`Style ${style.charAt(0).toUpperCase() + style.slice(1)}`}
          />
        ))}
      </div>
    </div>
  );
};

// Composant de personnalisation de couleurs
interface ColorCustomizerProps {
  initialColors: typeof colorPalettes.restaurant.modern;
  onChange: (colors: typeof colorPalettes.restaurant.modern) => void;
  className?: string;
}

export const ColorCustomizer: React.FC<ColorCustomizerProps> = ({
  initialColors,
  onChange,
  className = ''
}) => {
  const [colors, setColors] = React.useState(initialColors);

  const updateColor = (key: keyof typeof colors, value: string) => {
    const newColors = { ...colors, [key]: value };
    setColors(newColors);
    onChange(newColors);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h3 className="font-bold text-lg mb-4 text-gray-900">
        🎨 Personnaliser les couleurs
      </h3>
      
      <div className="space-y-4">
        {Object.entries(colors).filter(([key]) => 
          ['primary', 'secondary', 'accent', 'background'].includes(key)
        ).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-4">
            <div className="w-20 text-sm font-medium capitalize">
              {key}:
            </div>
            <input
              type="color"
              value={value}
              onChange={(e) => updateColor(key as keyof typeof colors, e.target.value)}
              className="w-12 h-8 rounded border border-gray-300"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => updateColor(key as keyof typeof colors, e.target.value)}
              className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm font-mono"
            />
          </div>
        ))}
      </div>
      
      {/* Aperçu */}
      <div className="mt-6">
        <div className="text-sm font-medium mb-2">Aperçu:</div>
        <div className="grid grid-cols-4 gap-2">
          <div 
            className="h-12 rounded"
            style={{ backgroundColor: colors.primary }}
          />
          <div 
            className="h-12 rounded"
            style={{ backgroundColor: colors.secondary }}
          />
          <div 
            className="h-12 rounded"
            style={{ backgroundColor: colors.accent }}
          />
          <div 
            className="h-12 rounded border border-gray-200"
            style={{ backgroundColor: colors.background }}
          />
        </div>
      </div>
    </div>
  );
};

// CSS utilities pour générer dynamiquement les styles
export const generateCSSVariables = (colors: typeof colorPalettes.restaurant.modern): string => {
  return `
    :root {
      --color-primary: ${colors.primary};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
      --color-background: ${colors.background};
      --color-text: ${colors.text};
    }
    
    .bg-primary { background-color: var(--color-primary); }
    .bg-secondary { background-color: var(--color-secondary); }
    .bg-accent { background-color: var(--color-accent); }
    .text-primary { color: var(--color-primary); }
    .text-secondary { color: var(--color-secondary); }
    .text-accent { color: var(--color-accent); }
    .border-primary { border-color: var(--color-primary); }
  `;
};