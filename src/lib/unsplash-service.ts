// Service Unsplash pour photos premium de restaurants français
export interface UnsplashImage {
  id: string;
  url: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  width: number;
  height: number;
}

// Collections d'images curatées pour restaurants français
const CURATED_RESTAURANT_IMAGES: UnsplashImage[] = [
  // Hero images - restaurants français authentiques
  {
    id: 'hero-1',
    url: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=1200&h=800&fit=crop&crop=center',
    alt: 'Restaurant français traditionnel avec terrasse parisienne',
    photographer: 'Unsplash',
    photographerUrl: 'https://unsplash.com',
    width: 1200,
    height: 800
  },
  {
    id: 'hero-2', 
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop&crop=center',
    alt: 'Intérieur chaleureux d\'un bistrot français',
    photographer: 'Unsplash',
    photographerUrl: 'https://unsplash.com',
    width: 1200,
    height: 800
  },
  {
    id: 'hero-3',
    url: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=1200&h=800&fit=crop&crop=center',
    alt: 'Chef français préparant des plats gastronomiques',
    photographer: 'Unsplash',
    photographerUrl: 'https://unsplash.com',
    width: 1200,
    height: 800
  },
  
  // Équipe - photos professionnelles de chefs français
  {
    id: 'team-1',
    url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=500&fit=crop&crop=face',
    alt: 'Chef de cuisine française souriant',
    photographer: 'Unsplash',
    photographerUrl: 'https://unsplash.com',
    width: 400,
    height: 500
  },
  {
    id: 'team-2',
    url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=500&fit=crop&crop=face',
    alt: 'Équipe de service restaurant français',
    photographer: 'Unsplash',
    photographerUrl: 'https://unsplash.com',
    width: 400,
    height: 500
  },
  {
    id: 'team-3',
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop&crop=face',
    alt: 'Sommelier français présentant sa sélection',
    photographer: 'Unsplash',
    photographerUrl: 'https://unsplash.com',
    width: 400,
    height: 500
  },
  
  // Plats - gastronomie française authentique
  {
    id: 'food-1',
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&crop=center',
    alt: 'Plat de cuisine française gastronomique',
    photographer: 'Unsplash',
    photographerUrl: 'https://unsplash.com',
    width: 600,
    height: 400
  },
  {
    id: 'food-2',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop&crop=center',
    alt: 'Spécialités françaises traditionnelles',
    photographer: 'Unsplash',
    photographerUrl: 'https://unsplash.com',
    width: 600,
    height: 400
  },
  {
    id: 'food-3',
    url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop&crop=center',
    alt: 'Dessert français artisanal',
    photographer: 'Unsplash',
    photographerUrl: 'https://unsplash.com',
    width: 600,
    height: 400
  },
  
  // Ambiance - atmosphère restaurant français
  {
    id: 'ambiance-1',
    url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop&crop=center',
    alt: 'Terrasse de restaurant français en soirée',
    photographer: 'Unsplash',
    photographerUrl: 'https://unsplash.com',
    width: 800,
    height: 600
  },
  {
    id: 'ambiance-2',
    url: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop&crop=center',
    alt: 'Cave à vin française traditionnelle',
    photographer: 'Unsplash',
    photographerUrl: 'https://unsplash.com',
    width: 800,
    height: 600
  }
];

export class UnsplashService {
  private static instance: UnsplashService;
  private images: Map<string, UnsplashImage> = new Map();

  private constructor() {
    // Initialiser le cache avec les images curatées
    CURATED_RESTAURANT_IMAGES.forEach(img => {
      this.images.set(img.id, img);
    });
  }

  public static getInstance(): UnsplashService {
    if (!UnsplashService.instance) {
      UnsplashService.instance = new UnsplashService();
    }
    return UnsplashService.instance;
  }

  // Récupérer une image par ID
  getImage(id: string): UnsplashImage | null {
    return this.images.get(id) || null;
  }

  // Récupérer des images par catégorie
  getImagesByCategory(category: 'hero' | 'team' | 'food' | 'ambiance'): UnsplashImage[] {
    return CURATED_RESTAURANT_IMAGES.filter(img => img.id.startsWith(category));
  }

  // Récupérer une image aléatoire d'une catégorie
  getRandomImage(category: 'hero' | 'team' | 'food' | 'ambiance'): UnsplashImage {
    const categoryImages = this.getImagesByCategory(category);
    const randomIndex = Math.floor(Math.random() * categoryImages.length);
    return categoryImages[randomIndex];
  }

  // Récupérer l'image hero principale
  getHeroImage(): UnsplashImage {
    return this.getImage('hero-1') || CURATED_RESTAURANT_IMAGES[0];
  }

  // Générer une URL d'image optimisée avec paramètres
  getOptimizedImageUrl(imageId: string, width: number, height: number, quality: number = 80): string {
    const image = this.getImage(imageId);
    if (!image) return '';
    
    // Ajouter les paramètres d'optimisation Unsplash
    const baseUrl = image.url.split('?')[0];
    return `${baseUrl}?w=${width}&h=${height}&q=${quality}&fit=crop&crop=center&auto=format`;
  }

  // Récupérer toutes les images
  getAllImages(): UnsplashImage[] {
    return CURATED_RESTAURANT_IMAGES;
  }
}

// Export de l'instance singleton
export const unsplashService = UnsplashService.getInstance();

// Fonction utilitaire pour composants React
export const useUnsplashImage = (imageId: string) => {
  return unsplashService.getImage(imageId);
};

// Types pour TypeScript
export type ImageCategory = 'hero' | 'team' | 'food' | 'ambiance';
export type ImageSize = 'sm' | 'md' | 'lg' | 'xl';

// Tailles prédéfinies pour responsive design
export const IMAGE_SIZES = {
  sm: { width: 400, height: 300 },
  md: { width: 600, height: 400 },
  lg: { width: 800, height: 600 },
  xl: { width: 1200, height: 800 }
} as const;