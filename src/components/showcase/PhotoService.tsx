'use client';

import React, { useState, useEffect } from 'react';
import { placeholderImages, getPlaceholderImageUrl, generatePremiumTemplateImage } from './PlaceholderImageGenerator';

// Photos générées localement en SVG - Plus besoin d'API externe

// Mots-clés de recherche par secteur
export const sectorKeywords = {
  restaurant: [
    'restaurant interior design',
    'fine dining',
    'french cuisine',
    'bistro atmosphere',
    'chef cooking',
    'elegant dining room',
    'food presentation',
    'wine cellar',
    'kitchen professional',
    'restaurant staff'
  ],
  beaute: [
    'beauty salon interior',
    'hairdressing salon',
    'spa wellness',
    'makeup artist',
    'hair styling',
    'beauty treatment',
    'modern salon',
    'manicure pedicure',
    'beauty products',
    'relaxation spa'
  ],
  artisan: [
    'craftsman workshop',
    'woodworking',
    'metalworking',
    'pottery studio',
    'handmade crafts',
    'artisan tools',
    'traditional craft',
    'workshop interior',
    'artisan hands',
    'craft creation'
  ],
  medical: [
    'medical office',
    'doctor consultation',
    'healthcare facility',
    'medical equipment',
    'clean clinic',
    'medical team',
    'healthcare professionals',
    'modern medical',
    'patient care',
    'medical technology'
  ]
};

// Photos haute qualité par secteur - utilise maintenant des placeholders générés localement
export const sectorPhotos = {
  restaurant: {
    hero: Array.from({ length: 7 }, () => getPlaceholderImageUrl('restaurant', 'hero', 1200, 800)),
    gallery: Array.from({ length: 8 }, () => getPlaceholderImageUrl('restaurant', 'gallery', 600, 400)),
    team: Array.from({ length: 4 }, () => getPlaceholderImageUrl('restaurant', 'team', 400, 400))
  },
  beaute: {
    hero: Array.from({ length: 7 }, () => getPlaceholderImageUrl('beaute', 'hero', 1200, 800)),
    gallery: Array.from({ length: 8 }, () => getPlaceholderImageUrl('beaute', 'gallery', 600, 400)),
    team: Array.from({ length: 4 }, () => getPlaceholderImageUrl('beaute', 'team', 400, 400))
  },
  artisan: {
    hero: Array.from({ length: 7 }, () => getPlaceholderImageUrl('artisan', 'hero', 1200, 800)),
    gallery: Array.from({ length: 8 }, () => getPlaceholderImageUrl('artisan', 'gallery', 600, 400)),
    team: Array.from({ length: 4 }, () => getPlaceholderImageUrl('artisan', 'team', 400, 400))
  },
  medical: {
    hero: Array.from({ length: 7 }, () => getPlaceholderImageUrl('medical', 'hero', 1200, 800)),
    gallery: Array.from({ length: 8 }, () => getPlaceholderImageUrl('medical', 'gallery', 600, 400)),
    team: Array.from({ length: 4 }, () => getPlaceholderImageUrl('medical', 'team', 400, 400))
  }
};

// Photos spécifiques par template - utilise maintenant des placeholders générés localement
export const templateSpecificPhotos = {
  // RESTAURANT
  'bistrot-excellence': {
    hero: getPlaceholderImageUrl('restaurant', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('restaurant', 'hero', 1200, 800)
  },
  'brasserie-parisienne': {
    hero: getPlaceholderImageUrl('restaurant', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('restaurant', 'hero', 1200, 800)
  },
  'pizzeria-authentique': {
    hero: getPlaceholderImageUrl('restaurant', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('restaurant', 'hero', 1200, 800)
  },
  'restaurant-gastronomique': {
    hero: getPlaceholderImageUrl('restaurant', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('restaurant', 'hero', 1200, 800)
  },
  'cafe-moderne': {
    hero: getPlaceholderImageUrl('restaurant', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('restaurant', 'hero', 1200, 800)
  },
  
  // BEAUTÉ
  'salon-beaute-moderne': {
    hero: getPlaceholderImageUrl('beaute', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('beaute', 'hero', 1200, 800)
  },
  'institut-luxe': {
    hero: getPlaceholderImageUrl('beaute', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('beaute', 'hero', 1200, 800)
  },
  'barbier-vintage': {
    hero: getPlaceholderImageUrl('beaute', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('beaute', 'hero', 1200, 800)
  },
  'nail-art-studio': {
    hero: getPlaceholderImageUrl('beaute', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('beaute', 'hero', 1200, 800)
  },
  
  // ARTISAN
  'artisan-authentique': {
    hero: getPlaceholderImageUrl('artisan', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('artisan', 'hero', 1200, 800)
  },
  'maitre-ferronnier': {
    hero: getPlaceholderImageUrl('artisan', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('artisan', 'hero', 1200, 800)
  },
  'ceramiste-contemporain': {
    hero: getPlaceholderImageUrl('artisan', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('artisan', 'hero', 1200, 800)
  },
  'tapissier-decorateur': {
    hero: getPlaceholderImageUrl('artisan', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('artisan', 'hero', 1200, 800)
  },
  
  // MÉDICAL
  'medical-confiance': {
    hero: getPlaceholderImageUrl('medical', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('medical', 'hero', 1200, 800)
  },
  'dentiste-premium': {
    hero: getPlaceholderImageUrl('medical', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('medical', 'hero', 1200, 800)
  },
  'kinesitherapeute': {
    hero: getPlaceholderImageUrl('medical', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('medical', 'hero', 1200, 800)
  },
  'psychologue-bien-etre': {
    hero: getPlaceholderImageUrl('medical', 'hero', 1200, 800),
    fallback: getPlaceholderImageUrl('medical', 'hero', 1200, 800)
  },
  
  // NOUVEAUX TEMPLATES PREMIUM
  'restaurant-premium-livraison': {
    hero: generatePremiumTemplateImage('restaurant-premium-livraison', 'restaurant', 'premium', 1200, 800),
    fallback: getPlaceholderImageUrl('restaurant', 'premium', 1200, 800)
  },
  'coiffeur-premium-booking': {
    hero: generatePremiumTemplateImage('coiffeur-premium-booking', 'beaute', 'premium', 1200, 800),
    fallback: getPlaceholderImageUrl('beaute', 'premium', 1200, 800)
  },
  'institut-spa-wellness': {
    hero: generatePremiumTemplateImage('institut-spa-wellness', 'beaute', 'luxury', 1200, 800),
    fallback: getPlaceholderImageUrl('beaute', 'premium', 1200, 800)
  },
  'artisan-digital-portfolio': {
    hero: generatePremiumTemplateImage('artisan-digital-portfolio', 'artisan', 'premium', 1200, 800),
    fallback: getPlaceholderImageUrl('artisan', 'premium', 1200, 800)
  },
  'maitre-artisan-luxe': {
    hero: generatePremiumTemplateImage('maitre-artisan-luxe', 'artisan', 'luxury', 1200, 800),
    fallback: getPlaceholderImageUrl('artisan', 'premium', 1200, 800)
  },
  'beauty-tech-lab': {
    hero: generatePremiumTemplateImage('beauty-tech-lab', 'beaute', 'premium', 1200, 800),
    fallback: getPlaceholderImageUrl('beaute', 'ai', 1200, 800)
  },
  'ghost-kitchen-network': {
    hero: generatePremiumTemplateImage('ghost-kitchen-network', 'restaurant', 'professional', 1200, 800),
    fallback: getPlaceholderImageUrl('restaurant', 'ai', 1200, 800)
  },
  'espace-coworking-artisan': {
    hero: generatePremiumTemplateImage('espace-coworking-artisan', 'artisan', 'modern', 1200, 800),
    fallback: getPlaceholderImageUrl('artisan', 'hero', 1200, 800)
  }
};

// Composant pour afficher une image avec fallback
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  
  // Détection des images SVG data-URI (elles se chargent instantanément)
  const isSvgDataUri = src.startsWith('data:image/svg+xml');
  
  useEffect(() => {
    if (isSvgDataUri) {
      // Les images SVG en data-URI sont déjà "chargées"
      setImageLoaded(true);
    }
  }, [isSvgDataUri]);
  
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc('/placeholder-image.jpg');
    }
  };
  
  const imageSrc = currentSrc || '/placeholder-image.jpg';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} w-full h-full object-cover`}
        onLoad={() => setImageLoaded(true)}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
};

// Galerie d'images pour un secteur
interface PhotoGalleryProps {
  sector: 'restaurant' | 'beaute' | 'artisan' | 'medical';
  type: 'hero' | 'gallery' | 'team';
  className?: string;
  imageClassName?: string;
  count?: number;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  sector,
  type,
  className = '',
  imageClassName = '',
  count
}) => {
  const photos = sectorPhotos[sector]?.[type] || [];
  const displayPhotos = count ? photos.slice(0, count) : photos;

  if (displayPhotos.length === 0) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`}>
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-400 text-4xl">📸</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {displayPhotos.map((photo, index) => (
        <OptimizedImage
          key={index}
          src={photo}
          alt={`${sector} ${type} ${index + 1}`}
          className={`rounded-lg ${imageClassName}`}
          priority={index === 0 && type === 'hero'}
        />
      ))}
    </div>
  );
};

// Image de hero pour un template avec sélection intelligente
interface HeroImageProps {
  sector: 'restaurant' | 'beaute' | 'artisan' | 'medical';
  templateName: string;
  templateId?: string;
  className?: string;
}

export const HeroImage: React.FC<HeroImageProps> = ({
  sector,
  templateName,
  templateId,
  className = ''
}) => {
  // Priorité 1: Photo spécifique au template
  const specificPhoto = templateId ? templateSpecificPhotos[templateId as keyof typeof templateSpecificPhotos] : null;
  
  // Priorité 2: Photos du secteur
  const heroPhotos = sectorPhotos[sector]?.hero || [];
  const photoIndex = templateName.length % heroPhotos.length;
  const sectorPhoto = heroPhotos[photoIndex];
  
  // Priorité 3: Photo par défaut
  const defaultPhoto = '/placeholder-image.jpg';
  
  // Sélection intelligente de la photo
  const primaryPhoto = specificPhoto?.hero || sectorPhoto || defaultPhoto;
  const fallbackPhoto = specificPhoto?.fallback || heroPhotos[0] || defaultPhoto;

  return (
    <div className={`relative ${className}`}>
      <EnhancedOptimizedImage
        src={primaryPhoto}
        fallback={fallbackPhoto}
        alt={`${templateName} - Image professionnelle ${sector}`}
        className="w-full h-full object-cover"
        priority={true}
      />
      
      {/* Overlay pour le texte */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      
      {/* Badge de qualité */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800">
        📸 Photo HD
      </div>
      
      {/* Indicateur de chargement personnalisé */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse opacity-0 pointer-events-none transition-opacity duration-300" id={`loader-${templateId}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-4xl">📸</div>
        </div>
      </div>
    </div>
  );
};

// Composant d'image optimisé avec fallback multiple
interface EnhancedOptimizedImageProps {
  src: string;
  fallback: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const EnhancedOptimizedImage: React.FC<EnhancedOptimizedImageProps> = ({
  src,
  fallback,
  alt,
  className = '',
  width,
  height,
  priority = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  
  // Détection des images SVG data-URI (elles se chargent instantanément)
  const isSvgDataUri = src.startsWith('data:image/svg+xml');
  
  useEffect(() => {
    if (isSvgDataUri) {
      // Les images SVG en data-URI sont déjà "chargées"
      setImageLoaded(true);
    }
  }, [isSvgDataUri]);
  
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallback !== src ? fallback : '/placeholder-image.jpg');
    } else {
      setCurrentSrc('/placeholder-image.jpg');
    }
  };
  
  const imageSrc = currentSrc;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} w-full h-full object-cover`}
        onLoad={() => setImageLoaded(true)}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
};

// Composant pour afficher l'équipe
interface TeamPhotosProps {
  sector: 'restaurant' | 'beaute' | 'artisan' | 'medical';
  teamMembers?: Array<{
    name: string;
    role: string;
  }>;
  className?: string;
}

export const TeamPhotos: React.FC<TeamPhotosProps> = ({
  sector,
  teamMembers,
  className = ''
}) => {
  const teamPhotos = sectorPhotos[sector]?.team || [];
  
  const defaultTeamMembers = {
    restaurant: [
      { name: 'Chef Alexandre', role: 'Chef Éxecutif' },
      { name: 'Marie Dubois', role: 'Sommelier' },
      { name: 'Pierre Martin', role: 'Maître d\'hôtel' }
    ],
    beaute: [
      { name: 'Sophie Laurent', role: 'Directrice Artistique' },
      { name: 'Emma Rousseau', role: 'Coiffeuse Senior' },
      { name: 'Julie Moreau', role: 'Esthéticienne' }
    ],
    artisan: [
      { name: 'Jean-Paul Bois', role: 'Maître Artisan' },
      { name: 'Antoine Fer', role: 'Forgeron' },
      { name: 'Claire Argile', role: 'Céramiste' }
    ],
    medical: [
      { name: 'Dr. Martin Santé', role: 'Médecin Généraliste' },
      { name: 'Dr. Claire Soins', role: 'Spécialiste' },
      { name: 'Infirmière Anna', role: 'Infirmière Diplômée' }
    ]
  };

  const members = teamMembers || defaultTeamMembers[sector];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {members.map((member, index) => (
        <div key={index} className="text-center">
          <div className="relative mb-4">
            <OptimizedImage
              src={teamPhotos[index] || teamPhotos[0]}
              alt={member.name}
              className="w-32 h-32 mx-auto rounded-full object-cover shadow-lg"
            />
          </div>
          <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
          <p className="text-gray-600">{member.role}</p>
        </div>
      ))}
    </div>
  );
};

// Hook pour récupérer des photos dynamiquement avec cache et optimisations
export const usePhotoService = (sector: string, type: string) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [cache] = useState(new Map<string, string[]>());

  useEffect(() => {
    const loadPhotos = async () => {
      const cacheKey = `${sector}-${type}`;
      
      // Vérifier le cache d'abord
      if (cache.has(cacheKey)) {
        setPhotos(cache.get(cacheKey)!);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Simulation de chargement d'API avec cache
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const sectorData = sectorPhotos[sector as keyof typeof sectorPhotos];
      const photosData = sectorData?.[type as keyof typeof sectorData] || [];
      
      // Mettre en cache
      cache.set(cacheKey, photosData);
      setPhotos(photosData);
      setLoading(false);
    };

    loadPhotos();
  }, [sector, type, cache]);

  return { photos, loading };
};

// Utilitaire pour précharger les images critiques générées en SVG
export const preloadCriticalImages = () => {
  // Précharger les images hero des premiers templates de chaque secteur (SVG)
  const criticalImages = [
    getPlaceholderImageUrl('restaurant', 'hero', 1200, 800),
    getPlaceholderImageUrl('beaute', 'hero', 1200, 800),
    getPlaceholderImageUrl('artisan', 'hero', 1200, 800),
    getPlaceholderImageUrl('medical', 'hero', 1200, 800)
  ];

  // Préchargement optimisé pour les images SVG en data-uri
  criticalImages.forEach((dataUri, index) => {
    const img = new Image();
    img.src = dataUri;
    // Les images SVG se chargent instantanément car elles sont en data-uri
  });
};

// Utilitaire pour obtenir la meilleure image pour un template
export const getBestImageForTemplate = (templateId: string, sector: string) => {
  const specificPhoto = templateSpecificPhotos[templateId as keyof typeof templateSpecificPhotos];
  if (specificPhoto) {
    return {
      primary: specificPhoto.hero,
      fallback: specificPhoto.fallback
    };
  }

  const sectorHeroPhotos = sectorPhotos[sector as keyof typeof sectorPhotos]?.hero;
  if (sectorHeroPhotos && sectorHeroPhotos.length > 0) {
    const index = templateId.length % sectorHeroPhotos.length;
    return {
      primary: sectorHeroPhotos[index],
      fallback: sectorHeroPhotos[0]
    };
  }

  return {
    primary: '/placeholder-image.jpg',
    fallback: '/placeholder-image.jpg'
  };
};