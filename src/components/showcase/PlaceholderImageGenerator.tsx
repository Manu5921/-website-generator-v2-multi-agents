'use client';

// Générateur d'images placeholder professionnelles en SVG pour chaque secteur
export const generatePlaceholderImage = (
  sector: 'restaurant' | 'beaute' | 'artisan' | 'medical',
  width: number = 1200,
  height: number = 800,
  type: 'hero' | 'gallery' | 'team' | 'premium' | 'ar' | 'ai' = 'hero'
): string => {
  
  const sectorConfig = {
    restaurant: {
      colors: ['#DC2626', '#EA580C', '#D97706'],
      icon: '🍽️',
      patterns: [
        'M4 8a4 4 0 0 1 8 0v1h4V8a8 8 0 1 0-16 0v1h4V8z',
        'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
      ]
    },
    beaute: {
      colors: ['#EC4899', '#F472B6', '#FBBF24'],
      icon: '💄',
      patterns: [
        'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
        'M9 11H7v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9h-2m-7 0V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5'
      ]
    },
    artisan: {
      colors: ['#B45309', '#92400E', '#78350F'],
      icon: '🔨',
      patterns: [
        'M13.5 6L10 2.5 6.5 6 10 9.5z',
        'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z'
      ]
    },
    medical: {
      colors: ['#059669', '#10B981', '#34D399'],
      icon: '⚕️',
      patterns: [
        'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
        'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z'
      ]
    }
  };

  const config = sectorConfig[sector];
  const mainColor = config.colors[0];
  const secondColor = config.colors[1];
  const accentColor = config.colors[2];

  // Différents types d'images
  if (type === 'hero') {
    // IDs uniques pour éviter les conflits
    const gradientId = `heroGrad-${sector}-${Date.now()}`;
    const patternId = `dots-${sector}-${Date.now()}`;
    
    const svgContent = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${mainColor};stop-opacity:1" />
            <stop offset="50%" style="stop-color:${secondColor};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0.6" />
          </linearGradient>
          <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="40" height="40">
            <circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#${gradientId})"/>
        <rect width="100%" height="100%" fill="url(#${patternId})"/>
        
        <circle cx="50%" cy="45%" r="60" fill="white" opacity="0.2" />
        <circle cx="50%" cy="45%" r="40" fill="white" opacity="0.3" />
        <circle cx="50%" cy="45%" r="20" fill="white" opacity="0.5" />
        
        <text x="50%" y="65%" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="bold" fill="white" opacity="0.9">
          ${sector.charAt(0).toUpperCase() + sector.slice(1)} Professionnel
        </text>
        
        <circle cx="15%" cy="20%" r="60" fill="white" opacity="0.1" />
        <circle cx="85%" cy="80%" r="80" fill="white" opacity="0.1" />
        
        <rect x="${width - 150}" y="20" width="120" height="40" rx="20" fill="white" opacity="0.9"/>
        <text x="${width - 90}" y="44" text-anchor="middle" font-family="system-ui" font-size="14" font-weight="600" fill="${mainColor}">
          Design IA
        </text>
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
  }
  
  if (type === 'gallery') {
    const svgContent = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="galleryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${secondColor};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0.6" />
          </linearGradient>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" stroke-width="1" opacity="0.1"/>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#galleryGrad)"/>
        
        <circle cx="25%" cy="35%" r="40" fill="white" opacity="0.2" />
        <circle cx="75%" cy="35%" r="30" fill="white" opacity="0.15" />
        <circle cx="50%" cy="75%" r="35" fill="white" opacity="0.18" />
        
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
  }
  
  if (type === 'team') {
    const svgContent = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="teamGrad">
            <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.9" />
            <stop offset="100%" style="stop-color:${mainColor};stop-opacity:0.7" />
          </radialGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#teamGrad)"/>
        
        <circle cx="50%" cy="35%" r="60" fill="white" opacity="0.8"/>
        <rect x="40%" y="55%" width="20%" height="30%" rx="10" fill="white" opacity="0.8"/>
        
        <circle cx="75%" cy="25%" r="20" fill="white" opacity="0.6"/>
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
  }

  if (type === 'premium') {
    const premiumGradientId = `premiumGrad-${sector}-${Date.now()}`;
    const svgContent = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${premiumGradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${mainColor};stop-opacity:1" />
            <stop offset="30%" style="stop-color:${secondColor};stop-opacity:0.9" />
            <stop offset="70%" style="stop-color:${accentColor};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#${premiumGradientId})"/>
        
        <circle cx="50%" cy="40%" r="80" fill="white" opacity="0.15" />
        <circle cx="50%" cy="40%" r="60" fill="white" opacity="0.25" />
        <circle cx="50%" cy="40%" r="40" fill="white" opacity="0.35" />
        <circle cx="50%" cy="40%" r="20" fill="white" opacity="0.5" />
        
        <text x="50%" y="60%" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="bold" fill="white" opacity="0.95" filter="url(#glow)">
          ${sector.charAt(0).toUpperCase() + sector.slice(1)} Premium
        </text>
        
        <text x="50%" y="75%" text-anchor="middle" font-family="system-ui" font-size="16" font-weight="600" fill="white" opacity="0.8">
          Intelligence Artificielle • Réalité Augmentée
        </text>
        
        <rect x="${width - 180}" y="15" width="160" height="50" rx="25" fill="rgba(255,255,255,0.95)" filter="url(#glow)"/>
        <text x="${width - 100}" y="35" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="${mainColor}">
          PREMIUM
        </text>
        <text x="${width - 100}" y="50" text-anchor="middle" font-family="system-ui" font-size="10" font-weight="600" fill="${secondColor}">
          Design IA
        </text>
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
  }
  
  if (type === 'ar') {
    const arGradientId = `arGrad-${sector}-${Date.now()}`;
    const svgContent = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="${arGradientId}">
            <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.9" />
            <stop offset="50%" style="stop-color:${secondColor};stop-opacity:0.7" />
            <stop offset="100%" style="stop-color:${mainColor};stop-opacity:0.5" />
          </radialGradient>
          <pattern id="arPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <rect width="60" height="60" fill="transparent"/>
            <circle cx="30" cy="30" r="8" fill="white" opacity="0.1"/>
            <rect x="26" y="26" width="8" height="8" fill="white" opacity="0.2"/>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#${arGradientId})"/>
        <rect width="100%" height="100%" fill="url(#arPattern)"/>
        
        <polygon points="50,20 60,40 40,40" fill="white" opacity="0.3" transform="translate(${width/2 - 50}, ${height/2 - 50})"/>
        <polygon points="50,60 60,80 40,80" fill="white" opacity="0.2" transform="translate(${width/2 - 50}, ${height/2 - 30})"/>
        
        <text x="50%" y="65%" text-anchor="middle" font-family="system-ui" font-size="28" font-weight="bold" fill="white" opacity="0.9">
          Réalité Augmentée
        </text>
        
        <text x="50%" y="75%" text-anchor="middle" font-family="system-ui" font-size="14" font-weight="600" fill="white" opacity="0.7">
          Expérience immersive ${sector}
        </text>
        
        <rect x="${width - 120}" y="20" width="100" height="30" rx="15" fill="rgba(255,255,255,0.9)"/>
        <text x="${width - 70}" y="40" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="${mainColor}">
          AR Ready
        </text>
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
  }
  
  if (type === 'ai') {
    const aiGradientId = `aiGrad-${sector}-${Date.now()}`;
    const svgContent = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${aiGradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1E3A8A;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#3B82F6;stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:#60A5FA;stop-opacity:0.6" />
          </linearGradient>
          <pattern id="aiCircuits" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" fill="transparent"/>
            <circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/>
            <circle cx="60" cy="20" r="2" fill="white" opacity="0.1"/>
            <circle cx="20" cy="60" r="2" fill="white" opacity="0.1"/>
            <circle cx="60" cy="60" r="2" fill="white" opacity="0.1"/>
            <path d="M20 20 L60 20 M20 20 L20 60 M60 20 L60 60 M20 60 L60 60" stroke="white" stroke-width="1" opacity="0.1"/>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#${aiGradientId})"/>
        <rect width="100%" height="100%" fill="url(#aiCircuits)"/>
        
        <circle cx="50%" cy="45%" r="100" fill="none" stroke="white" stroke-width="2" opacity="0.2"/>
        <circle cx="50%" cy="45%" r="70" fill="none" stroke="white" stroke-width="2" opacity="0.3"/>
        <circle cx="50%" cy="45%" r="40" fill="white" opacity="0.1"/>
        
        <text x="50%" y="50%" text-anchor="middle" font-family="system-ui" font-size="40" font-weight="bold" fill="white" opacity="0.9">
          IA
        </text>
        
        <text x="50%" y="65%" text-anchor="middle" font-family="system-ui" font-size="24" font-weight="bold" fill="white" opacity="0.8">
          Intelligence Artificielle
        </text>
        
        <text x="50%" y="75%" text-anchor="middle" font-family="system-ui" font-size="14" font-weight="600" fill="white" opacity="0.7">
          Automatisation ${sector} nouvelle génération
        </text>
        
        <rect x="${width - 150}" y="15" width="130" height="40" rx="20" fill="rgba(255,255,255,0.95)"/>
        <text x="${width - 85}" y="30" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="#1E3A8A">
          IA POWERED
        </text>
        <text x="${width - 85}" y="45" text-anchor="middle" font-family="system-ui" font-size="10" font-weight="600" fill="#3B82F6">
          Next Gen
        </text>
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
  }

  return generatePlaceholderImage(sector, width, height, 'hero');
};

// URLs des images placeholder pour chaque secteur et type
export const getPlaceholderImageUrl = (
  sector: 'restaurant' | 'beaute' | 'artisan' | 'medical',
  type: 'hero' | 'gallery' | 'team' | 'premium' | 'ar' | 'ai' = 'hero',
  width: number = 1200,
  height: number = 800
): string => {
  return generatePlaceholderImage(sector, width, height, type);
};

// Images placeholder pré-générées pour les secteurs principaux
export const placeholderImages = {
  restaurant: {
    hero: generatePlaceholderImage('restaurant', 1200, 800, 'hero'),
    premium: generatePlaceholderImage('restaurant', 1200, 800, 'premium'),
    ar: generatePlaceholderImage('restaurant', 1200, 800, 'ar'),
    ai: generatePlaceholderImage('restaurant', 1200, 800, 'ai'),
    gallery: Array.from({ length: 8 }, (_, i) => 
      generatePlaceholderImage('restaurant', 600, 400, 'gallery')
    ),
    team: Array.from({ length: 4 }, (_, i) => 
      generatePlaceholderImage('restaurant', 400, 400, 'team')
    )
  },
  beaute: {
    hero: generatePlaceholderImage('beaute', 1200, 800, 'hero'),
    premium: generatePlaceholderImage('beaute', 1200, 800, 'premium'),
    ar: generatePlaceholderImage('beaute', 1200, 800, 'ar'),
    ai: generatePlaceholderImage('beaute', 1200, 800, 'ai'),
    gallery: Array.from({ length: 8 }, (_, i) => 
      generatePlaceholderImage('beaute', 600, 400, 'gallery')
    ),
    team: Array.from({ length: 4 }, (_, i) => 
      generatePlaceholderImage('beaute', 400, 400, 'team')
    )
  },
  artisan: {
    hero: generatePlaceholderImage('artisan', 1200, 800, 'hero'),
    premium: generatePlaceholderImage('artisan', 1200, 800, 'premium'),
    ar: generatePlaceholderImage('artisan', 1200, 800, 'ar'),
    ai: generatePlaceholderImage('artisan', 1200, 800, 'ai'),
    gallery: Array.from({ length: 8 }, (_, i) => 
      generatePlaceholderImage('artisan', 600, 400, 'gallery')
    ),
    team: Array.from({ length: 4 }, (_, i) => 
      generatePlaceholderImage('artisan', 400, 400, 'team')
    )
  },
  medical: {
    hero: generatePlaceholderImage('medical', 1200, 800, 'hero'),
    premium: generatePlaceholderImage('medical', 1200, 800, 'premium'),
    ar: generatePlaceholderImage('medical', 1200, 800, 'ar'),
    ai: generatePlaceholderImage('medical', 1200, 800, 'ai'),
    gallery: Array.from({ length: 8 }, (_, i) => 
      generatePlaceholderImage('medical', 600, 400, 'gallery')
    ),
    team: Array.from({ length: 4 }, (_, i) => 
      generatePlaceholderImage('medical', 400, 400, 'team')
    )
  }
};

// Générateur d'images spécialisées pour templates premium
export const generatePremiumTemplateImage = (
  templateId: string,
  sector: 'restaurant' | 'beaute' | 'artisan' | 'medical',
  designType: 'premium' | 'luxury' | 'modern' | 'elegant' | 'professional',
  width: number = 1200,
  height: number = 800
): string => {
  // Sélection du type d'image selon le template
  const premiumTemplateIds = [
    'restaurant-premium-livraison', 
    'coiffeur-premium-booking', 
    'institut-spa-wellness',
    'artisan-digital-portfolio',
    'maitre-artisan-luxe'
  ];
  
  if (premiumTemplateIds.includes(templateId)) {
    if (templateId.includes('premium') || templateId.includes('digital')) {
      return generatePlaceholderImage(sector, width, height, 'premium');
    }
    if (templateId.includes('ar') || templateId.includes('augmente')) {
      return generatePlaceholderImage(sector, width, height, 'ar');
    }
    if (templateId.includes('ai') || templateId.includes('intelligence')) {
      return generatePlaceholderImage(sector, width, height, 'ai');
    }
  }
  
  // Par défaut, utilise le type selon le design
  switch (designType) {
    case 'premium':
      return generatePlaceholderImage(sector, width, height, 'premium');
    case 'luxury':
      return generatePlaceholderImage(sector, width, height, 'premium');
    default:
      return generatePlaceholderImage(sector, width, height, 'hero');
  }
};