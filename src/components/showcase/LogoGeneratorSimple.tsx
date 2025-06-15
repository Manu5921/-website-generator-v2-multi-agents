'use client';

import React from 'react';

export interface LogoProps {
  businessName: string;
  sector: 'restaurant' | 'beaute' | 'artisan' | 'medical';
  style: 'modern' | 'elegant' | 'luxury' | 'professional' | 'premium';
  size?: number;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Logos SVG simplifiés pour chaque secteur
const defaultColors = {
  restaurant: { primary: '#8B4513', secondary: '#D2691E', accent: '#F4A460' },
  beaute: { primary: '#FF69B4', secondary: '#FFB6C1', accent: '#C71585' },
  artisan: { primary: '#8B4513', secondary: '#D2691E', accent: '#228B22' },
  medical: { primary: '#008B8B', secondary: '#20B2AA', accent: '#00CED1' }
};

export const generateLogo = (props: LogoProps): JSX.Element => {
  const { businessName, sector, style, size = 120, colors } = props;
  const sectorColors = colors || defaultColors[sector];
  
  const getIcon = () => {
    switch (sector) {
      case 'restaurant': return '🍽️';
      case 'beaute': return '💄';
      case 'artisan': return '🔨';
      case 'medical': return '⚕️';
      default: return '🏢';
    }
  };

  return (
    <div 
      className="inline-flex items-center justify-center rounded-lg shadow-lg border border-gray-200 bg-white"
      style={{ width: size, height: size }}
    >
      <div className="text-center p-2">
        <div className="text-2xl mb-1">{getIcon()}</div>
        <div 
          className="font-bold text-xs leading-tight"
          style={{ color: sectorColors.primary }}
        >
          {businessName.split(' ').map(word => word.slice(0, 3)).join('').toUpperCase().slice(0, 6)}
        </div>
        <div 
          className="w-full h-1 rounded mt-1"
          style={{ backgroundColor: sectorColors.secondary }}
        />
      </div>
    </div>
  );
};