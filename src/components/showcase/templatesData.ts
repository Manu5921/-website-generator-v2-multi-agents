export interface Template {
  id: string;
  name: string;
  sector: 'restaurant' | 'beaute' | 'artisan' | 'medical';
  description: string;
  features: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  preview: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  stats: {
    loadTime: string;
    lighthouse: number;
    conversionRate: string;
  };
  businessExample: {
    name: string;
    city: string;
    description: string;
  };
  wowFactors: string[];
  designType: 'premium' | 'luxury' | 'modern' | 'elegant' | 'professional';
}

export const templatesData: Template[] = [
  // SECTEUR RESTAURANT (5 templates)
  {
    id: 'bistrot-excellence',
    name: 'Bistrot Excellence',
    sector: 'restaurant',
    description: 'Design français authentique avec élégance moderne et ambiance chaleureuse',
    features: [
      'Menu interactif avec photos HD',
      'Système de réservation intégré',
      'Galerie photo immersive',
      'Carte des vins avec descriptions',
      'Avis clients en temps réel',
      'Géolocalisation et horaires'
    ],
    colors: {
      primary: '#8B4513',
      secondary: '#D2691E',
      accent: '#F4A460'
    },
    preview: {
      desktop: '/previews/bistrot-excellence-desktop.jpg',
      tablet: '/previews/bistrot-excellence-tablet.jpg',
      mobile: '/previews/bistrot-excellence-mobile.jpg'
    },
    stats: {
      loadTime: '0.7s',
      lighthouse: 98,
      conversionRate: '+45%'
    },
    businessExample: {
      name: 'Le Bistrot Excellence',
      city: 'Lyon',
      description: 'Restaurant traditionnel français proposant une cuisine de terroir revisitée'
    },
    wowFactors: [
      'Animation parallaxe sur le hero',
      'Menu flottant avec effets visuels',
      'Galerie photo avec zoom cinématique',
      'Réservation en 1 clic'
    ],
    designType: 'elegant'
  },
  {
    id: 'brasserie-parisienne',
    name: 'Brasserie Parisienne',
    sector: 'restaurant',
    description: 'Style Art Déco moderne avec sophistication urbaine parisienne',
    features: [
      'Design Art Déco responsive',
      'Menu PDF téléchargeable',
      'Événements et spectacles',
      'Programme de fidélité',
      'Blog gastronomique',
      'Boutique en ligne'
    ],
    colors: {
      primary: '#2C3E50',
      secondary: '#E74C3C',
      accent: '#F39C12'
    },
    preview: {
      desktop: '/previews/brasserie-parisienne-desktop.jpg',
      tablet: '/previews/brasserie-parisienne-tablet.jpg',
      mobile: '/previews/brasserie-parisienne-mobile.jpg'
    },
    stats: {
      loadTime: '0.8s',
      lighthouse: 96,
      conversionRate: '+38%'
    },
    businessExample: {
      name: 'Brasserie Montmartre',
      city: 'Paris',
      description: 'Brasserie authentique au cœur de Montmartre, cuisine traditionnelle et ambiance conviviale'
    },
    wowFactors: [
      'Typographie Art Déco custom',
      'Animations de transition fluides',
      'Slider événements dynamique',
      'Intégration réseaux sociaux'
    ],
    designType: 'luxury'
  },
  {
    id: 'pizzeria-authentique',
    name: 'Pizzeria Authentique',
    sector: 'restaurant',
    description: 'Ambiance italienne chaleureuse avec design moderne et convivial',
    features: [
      'Commande en ligne intégrée',
      'Configurateur de pizzas',
      'Livraison tracking',
      'Programme de parrainage',
      'Avis Google intégrés',
      'Menu enfant interactif'
    ],
    colors: {
      primary: '#C0392B',
      secondary: '#27AE60',
      accent: '#F1C40F'
    },
    preview: {
      desktop: '/previews/pizzeria-authentique-desktop.jpg',
      tablet: '/previews/pizzeria-authentique-tablet.jpg',
      mobile: '/previews/pizzeria-authentique-mobile.jpg'
    },
    stats: {
      loadTime: '0.6s',
      lighthouse: 99,
      conversionRate: '+52%'
    },
    businessExample: {
      name: 'Pizzeria Bella Vista',
      city: 'Nice',
      description: 'Pizzeria familiale servant des pizzas authentiques dans un cadre méditerranéen'
    },
    wowFactors: [
      'Configurateur pizza en 3D',
      'Tracking livraison en temps réel',
      'Animation flammes four à bois',
      'Sound design ambiance'
    ],
    designType: 'modern'
  },
  {
    id: 'restaurant-gastronomique',
    name: 'Restaurant Gastronomique',
    sector: 'restaurant',
    description: 'Élégance premium pour haute gastronomie avec présentation raffinée',
    features: [
      'Présentation chef étoilé',
      'Menu dégustation animé',
      'Réservation VIP',
      'Galerie plats haute définition',
      'Critiques presse',
      'Événements privés'
    ],
    colors: {
      primary: '#1A1A1A',
      secondary: '#D4AF37',
      accent: '#8B0000'
    },
    preview: {
      desktop: '/previews/restaurant-gastronomique-desktop.jpg',
      tablet: '/previews/restaurant-gastronomique-tablet.jpg',
      mobile: '/previews/restaurant-gastronomique-mobile.jpg'
    },
    stats: {
      loadTime: '0.9s',
      lighthouse: 97,
      conversionRate: '+63%'
    },
    businessExample: {
      name: 'Le Grand Palais',
      city: 'Cannes',
      description: 'Restaurant gastronomique 2 étoiles Michelin, cuisine créative et raffinée'
    },
    wowFactors: [
      'Vidéo background cuisine',
      'Menu interactif avec descriptions audio',
      'Réalité augmentée pour les plats',
      'Concierge virtuel'
    ],
    designType: 'luxury'
  },
  {
    id: 'cafe-moderne',
    name: 'Café Moderne',
    sector: 'restaurant',
    description: 'Design minimaliste et tendance pour café urbain et brunch',
    features: [
      'Menu brunch interactif',
      'Commande mobile',
      'Programme de fidélité digital',
      'Playlist Spotify intégrée',
      'Espace coworking',
      'Événements culturels'
    ],
    colors: {
      primary: '#6C7B7F',
      secondary: '#E8DCC6',
      accent: '#A0522D'
    },
    preview: {
      desktop: '/previews/cafe-moderne-desktop.jpg',
      tablet: '/previews/cafe-moderne-tablet.jpg',
      mobile: '/previews/cafe-moderne-mobile.jpg'
    },
    stats: {
      loadTime: '0.5s',
      lighthouse: 100,
      conversionRate: '+41%'
    },
    businessExample: {
      name: 'Urban Coffee',
      city: 'Bordeaux',
      description: 'Café moderne proposant brunchs créatifs et espace coworking'
    },
    wowFactors: [
      'Interface mobile first',
      'Intégration Apple/Google Pay',
      'Menu QR code dynamique',
      'Ambiance sonore personnalisable'
    ],
    designType: 'modern'
  },
  {
    id: 'restaurant-premium-livraison',
    name: 'Restaurant Premium Livraison',
    sector: 'restaurant',
    description: 'Solution complète avec menu interactif, commandes et livraisons trackées en temps réel',
    features: [
      'Menu digital interactif avec allergènes',
      'Commande en ligne ultra-rapide',
      'Tracking livraison temps réel GPS',
      'Programme de fidélité digital',
      'Notifications push personnalisées',
      'IA recommandation plats',
      'Paiement sans contact intégré',
      'Analytics ROI avancées'
    ],
    colors: {
      primary: '#1E40AF',
      secondary: '#3B82F6',
      accent: '#60A5FA'
    },
    preview: {
      desktop: '/previews/restaurant-premium-livraison-desktop.jpg',
      tablet: '/previews/restaurant-premium-livraison-tablet.jpg',
      mobile: '/previews/restaurant-premium-livraison-mobile.jpg'
    },
    stats: {
      loadTime: '0.4s',
      lighthouse: 100,
      conversionRate: '+73%'
    },
    businessExample: {
      name: 'Délices Express Premium',
      city: 'Lyon',
      description: 'Restaurant gastronomique avec service de livraison haut de gamme et expérience client digitale'
    },
    wowFactors: [
      'Menu IA adaptatif selon préférences client',
      'Réalité augmentée pour visualiser les plats',
      'Assistant vocal pour commandes mains libres',
      'Géofencing pour livraisons ultra-précises',
      'Chatbot culinaire avec chef virtuel',
      'Intégration complete écosystème digital'
    ],
    designType: 'premium'
  },

  // SECTEUR BEAUTÉ (4 templates)
  {
    id: 'salon-beaute-moderne',
    name: 'Salon Beauté Moderne',
    sector: 'beaute',
    description: 'Design épuré et sophistiqué pour salon de coiffure premium',
    features: [
      'Prise de rendez-vous en ligne',
      'Galerie avant/après',
      'Équipe stylistes',
      'Produits recommandés',
      'Conseils beauté blog',
      'Fidélité client'
    ],
    colors: {
      primary: '#FF69B4',
      secondary: '#FFB6C1',
      accent: '#C71585'
    },
    preview: {
      desktop: '/previews/salon-beaute-moderne-desktop.jpg',
      tablet: '/previews/salon-beaute-moderne-tablet.jpg',
      mobile: '/previews/salon-beaute-moderne-mobile.jpg'
    },
    stats: {
      loadTime: '0.7s',
      lighthouse: 98,
      conversionRate: '+47%'
    },
    businessExample: {
      name: 'Beauté Moderne Studio',
      city: 'Marseille',
      description: 'Salon de coiffure tendance proposant coupes modernes et soins capillaires'
    },
    wowFactors: [
      'Simulateur de coiffure AR',
      'Booking intelligent par IA',
      'Galerie transformations 360°',
      'Conseils personnalisés'
    ],
    designType: 'modern'
  },
  {
    id: 'institut-luxe',
    name: 'Institut de Luxe',
    sector: 'beaute',
    description: 'Raffinement absolu pour institut de beauté haut de gamme',
    features: [
      'Spa et soins premium',
      'Réservation suite VIP',
      'Produits exclusifs',
      'Programmes wellness',
      'Consultation beauté',
      'Espace détente virtuel'
    ],
    colors: {
      primary: '#E6E6FA',
      secondary: '#DDA0DD',
      accent: '#9370DB'
    },
    preview: {
      desktop: '/previews/institut-luxe-desktop.jpg',
      tablet: '/previews/institut-luxe-tablet.jpg',
      mobile: '/previews/institut-luxe-mobile.jpg'
    },
    stats: {
      loadTime: '0.8s',
      lighthouse: 96,
      conversionRate: '+58%'
    },
    businessExample: {
      name: 'Institut Royal Spa',
      city: 'Monaco',
      description: 'Institut de beauté luxueux offrant soins exclusifs et expérience wellness'
    },
    wowFactors: [
      'Visite virtuelle 3D de l\'institut',
      'Consultation IA personnalisée',
      'Réalité virtuelle relaxation',
      'Assistant personnel dédié'
    ],
    designType: 'luxury'
  },
  {
    id: 'barbier-vintage',
    name: 'Barbier Vintage',
    sector: 'beaute',
    description: 'Style rétro masculin avec authenticité et caractère',
    features: [
      'Réservation barbier',
      'Services traditionnels',
      'Produits artisanaux',
      'Histoire du salon',
      'Techniques anciennes',
      'Club gentleman'
    ],
    colors: {
      primary: '#8B4513',
      secondary: '#CD853F',
      accent: '#A0522D'
    },
    preview: {
      desktop: '/previews/barbier-vintage-desktop.jpg',
      tablet: '/previews/barbier-vintage-tablet.jpg',
      mobile: '/previews/barbier-vintage-mobile.jpg'
    },
    stats: {
      loadTime: '0.6s',
      lighthouse: 99,
      conversionRate: '+43%'
    },
    businessExample: {
      name: 'Barbier du Faubourg',
      city: 'Toulouse',
      description: 'Salon de barbier traditionnel proposant coupes classiques et soins à l\'ancienne'
    },
    wowFactors: [
      'Animations vintage authentiques',
      'Son d\'époque immersif',
      'Galerie historique interactive',
      'Membership gentleman club'
    ],
    designType: 'elegant'
  },
  {
    id: 'nail-art-studio',
    name: 'Nail Art Studio',
    sector: 'beaute',
    description: 'Créativité et modernité pour studio nail art tendance',
    features: [
      'Galerie nail art',
      'Réservation express',
      'Tendances saison',
      'Tutoriels vidéo',
      'Produits nail art',
      'Concours créatifs'
    ],
    colors: {
      primary: '#FF1493',
      secondary: '#FFB6C1',
      accent: '#DC143C'
    },
    preview: {
      desktop: '/previews/nail-art-studio-desktop.jpg',
      tablet: '/previews/nail-art-studio-tablet.jpg',
      mobile: '/previews/nail-art-studio-mobile.jpg'
    },
    stats: {
      loadTime: '0.5s',
      lighthouse: 100,
      conversionRate: '+39%'
    },
    businessExample: {
      name: 'Nail Art Paradise',
      city: 'Lille',
      description: 'Studio spécialisé en nail art créatif et manucures tendances'
    },
    wowFactors: [
      'Visualisateur nail art en temps réel',
      'Galerie filtrable par style',
      'Tutoriels interactifs',
      'Partage réseaux sociaux intégré'
    ],
    designType: 'modern'
  },
  {
    id: 'coiffeur-premium-booking',
    name: 'Coiffeur Premium Booking',
    sector: 'beaute',
    description: 'Salon de coiffure ultra-moderne avec booking IA, transformations AR et suivi client personnalisé',
    features: [
      'Booking intelligent avec IA de recommandation',
      'Simulateur coiffure réalité augmentée',
      'Galerie transformations avant/après HD',
      'Profil client personnalisé avec historique',
      'Notifications automatiques de rendez-vous',
      'Système de fidélité gamifié',
      'Consultation virtuelle préalable',
      'E-commerce produits capillaires intégré'
    ],
    colors: {
      primary: '#7C3AED',
      secondary: '#A855F7',
      accent: '#C084FC'
    },
    preview: {
      desktop: '/previews/coiffeur-premium-booking-desktop.jpg',
      tablet: '/previews/coiffeur-premium-booking-tablet.jpg',
      mobile: '/previews/coiffeur-premium-booking-mobile.jpg'
    },
    stats: {
      loadTime: '0.5s',
      lighthouse: 99,
      conversionRate: '+68%'
    },
    businessExample: {
      name: 'Atelier Coiffure Premium',
      city: 'Paris',
      description: 'Salon de coiffure haut de gamme proposant services premium et expérience client digitale innovante'
    },
    wowFactors: [
      'IA prédictive pour recommandations coiffures',
      'Réalité augmentée pour essayage virtuel',
      'Assistant digital personnel pour chaque client',
      'Galerie sociale avec partage Instagram intégré',
      'Consultation nutrition capillaire personnalisée',
      'Système de réservation ultra-intuitif'
    ],
    designType: 'premium'
  },
  {
    id: 'institut-spa-wellness',
    name: 'Institut Spa & Wellness',
    sector: 'beaute',
    description: 'Spa premium avec réservation holistique, programmes wellness et suivi bien-être personnalisé',
    features: [
      'Planning holistique spa et bien-être',
      'Programmes wellness personnalisés',
      'Suivi bien-être avec métriques',
      'Réalité virtuelle relaxation',
      'Boutique produits bio premium',
      'Coaching bien-être digital',
      'Méditation guidée intégrée',
      'Communauté wellness privée'
    ],
    colors: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#34D399'
    },
    preview: {
      desktop: '/previews/institut-spa-wellness-desktop.jpg',
      tablet: '/previews/institut-spa-wellness-tablet.jpg',
      mobile: '/previews/institut-spa-wellness-mobile.jpg'
    },
    stats: {
      loadTime: '0.6s',
      lighthouse: 98,
      conversionRate: '+71%'
    },
    businessExample: {
      name: 'Zen Wellness Institute',
      city: 'Cannes',
      description: 'Institut de bien-être premium offrant expérience holistique et transformation digitale du wellness'
    },
    wowFactors: [
      'Diagnostic bien-être IA personnalisé',
      'Parcours wellness interactif gamifié',
      'Réalité virtuelle pour relaxation immersive',
      'Coach bien-être IA disponible 24/7',
      'Intégration wearables pour suivi santé',
      'Communauté wellness exclusive'
    ],
    designType: 'luxury'
  },

  // SECTEUR ARTISAN (4 templates)
  {
    id: 'artisan-authentique',
    name: 'Artisan Authentique',
    sector: 'artisan',
    description: 'Savoir-faire traditionnel avec présentation moderne du métier',
    features: [
      'Portfolio réalisations',
      'Devis en ligne',
      'Processus fabrication',
      'Matériaux nobles',
      'Certifications qualité',
      'Témoignages clients'
    ],
    colors: {
      primary: '#8B4513',
      secondary: '#D2691E',
      accent: '#228B22'
    },
    preview: {
      desktop: '/previews/artisan-authentique-desktop.jpg',
      tablet: '/previews/artisan-authentique-tablet.jpg',
      mobile: '/previews/artisan-authentique-mobile.jpg'
    },
    stats: {
      loadTime: '0.7s',
      lighthouse: 98,
      conversionRate: '+51%'
    },
    businessExample: {
      name: 'Bois & Création SARL',
      city: 'Annecy',
      description: 'Menuiserie artisanale spécialisée en mobilier sur mesure et agencement'
    },
    wowFactors: [
      'Visite atelier virtuelle 360°',
      'Configurateur mobilier 3D',
      'Timeline projet en temps réel',
      'Certificats authenticité digitaux'
    ],
    designType: 'professional'
  },
  {
    id: 'maitre-ferronnier',
    name: 'Maître Ferronnier',
    sector: 'artisan',
    description: 'Art du métal avec élégance industrielle moderne',
    features: [
      'Créations sur mesure',
      'Galerie forge artistique',
      'Techniques ancestrales',
      'Projet architectural',
      'Formation métier',
      'Exposition permanente'
    ],
    colors: {
      primary: '#2F4F4F',
      secondary: '#708090',
      accent: '#B22222'
    },
    preview: {
      desktop: '/previews/maitre-ferronnier-desktop.jpg',
      tablet: '/previews/maitre-ferronnier-tablet.jpg',
      mobile: '/previews/maitre-ferronnier-mobile.jpg'
    },
    stats: {
      loadTime: '0.8s',
      lighthouse: 97,
      conversionRate: '+44%'
    },
    businessExample: {
      name: 'Forge Moderne Métallerie',
      city: 'Strasbourg',
      description: 'Ferronnerie d\'art et métallerie moderne pour particuliers et architectes'
    },
    wowFactors: [
      'Animation forge en temps réel',
      'Galerie interactive haute résolution',
      'Simulation patine et finitions',
      'Process création documenté'
    ],
    designType: 'professional'
  },
  {
    id: 'ceramiste-contemporain',
    name: 'Céramiste Contemporain',
    sector: 'artisan',
    description: 'Art céramique moderne avec créativité et innovation',
    features: [
      'Oeuvres uniques',
      'Ateliers créatifs',
      'Vente en ligne',
      'Expositions virtuelles',
      'Techniques modernes',
      'Commandes personnalisées'
    ],
    colors: {
      primary: '#8FBC8F',
      secondary: '#F5DEB3',
      accent: '#CD853F'
    },
    preview: {
      desktop: '/previews/ceramiste-contemporain-desktop.jpg',
      tablet: '/previews/ceramiste-contemporain-tablet.jpg',
      mobile: '/previews/ceramiste-contemporain-mobile.jpg'
    },
    stats: {
      loadTime: '0.6s',
      lighthouse: 99,
      conversionRate: '+37%'
    },
    businessExample: {
      name: 'Atelier Terre & Forme',
      city: 'Aix-en-Provence',
      description: 'Céramiste contemporain créant pièces uniques et proposant ateliers créatifs'
    },
    wowFactors: [
      'Tour de potier virtuel interactif',
      'Galerie œuvres avec zoom extrême',
      'Création personnalisée en ligne',
      'Exposition 3D immersive'
    ],
    designType: 'modern'
  },
  {
    id: 'tapissier-decorateur',
    name: 'Tapissier Décorateur',
    sector: 'artisan',
    description: 'Décoration intérieure haut de gamme avec expertise textile',
    features: [
      'Portfolio décoration',
      'Conseils aménagement',
      'Tissus exclusifs',
      'Rénovation mobilier',
      'Projets résidentiels',
      'Showroom virtuel'
    ],
    colors: {
      primary: '#8B008B',
      secondary: '#DDA0DD',
      accent: '#FFD700'
    },
    preview: {
      desktop: '/previews/tapissier-decorateur-desktop.jpg',
      tablet: '/previews/tapissier-decorateur-tablet.jpg',
      mobile: '/previews/tapissier-decorateur-mobile.jpg'
    },
    stats: {
      loadTime: '0.7s',
      lighthouse: 98,
      conversionRate: '+49%'
    },
    businessExample: {
      name: 'Décor & Tradition',
      city: 'Versailles',
      description: 'Tapissier décorateur spécialisé en ameublement de luxe et décoration d\'intérieur'
    },
    wowFactors: [
      'Showroom virtuel 3D navigable',
      'Simulateur tissus et couleurs',
      'Avant/après transformations',
      'Conseil décoration personnalisé'
    ],
    designType: 'elegant'
  },
  {
    id: 'artisan-digital-portfolio',
    name: 'Artisan Digital Portfolio',
    sector: 'artisan',
    description: 'Portfolio 3D interactif avec devis automatisé, réalité augmentée et suivi projet en temps réel',
    features: [
      'Portfolio 3D interactif haute définition',
      'Générateur de devis automatique IA',
      'Visualisation projets en réalité augmentée',
      'Suivi projet temps réel avec timeline',
      'Certification qualité blockchain',
      'Marketplace matériaux intégrée',
      'Assistant virtuel expertise métier',
      'Plateforme collaboration client-artisan'
    ],
    colors: {
      primary: '#D97706',
      secondary: '#F59E0B',
      accent: '#FCD34D'
    },
    preview: {
      desktop: '/previews/artisan-digital-portfolio-desktop.jpg',
      tablet: '/previews/artisan-digital-portfolio-tablet.jpg',
      mobile: '/previews/artisan-digital-portfolio-mobile.jpg'
    },
    stats: {
      loadTime: '0.5s',
      lighthouse: 98,
      conversionRate: '+79%'
    },
    businessExample: {
      name: 'Atelier Digital Création',
      city: 'Toulouse',
      description: 'Artisan menuisier utilisant technologies digitales pour révolutionner l\\\'expérience client'
    },
    wowFactors: [
      'Réalité augmentée pour visualiser créations in-situ',
      'IA prédictive pour estimation coûts et délais',
      'Blockchain pour authentification œuvres',
      'Assistant virtuel expert métier disponible 24/7',
      'Collaboration temps réel avec clients via plateforme',
      'Marketplace intelligente matériaux durables'
    ],
    designType: 'premium'
  },
  {
    id: 'maitre-artisan-luxe',
    name: 'Maître Artisan Luxe',
    sector: 'artisan',
    description: 'Plateforme premium pour artisans d\\\'exception avec certification maître artisan et clientèle luxe',
    features: [
      'Galerie œuvres d\\\'exception ultra-HD',
      'Certification maître artisan digitale',
      'Carnet de commandes exclusif',
      'Réseau partenaires artisans d\\\'art',
      'Exposition virtuelle permanente',
      'Service concierge clientèle VIP',
      'Formation maître-apprenti digitale',
      'Marketplace art de vivre française'
    ],
    colors: {
      primary: '#7C2D12',
      secondary: '#92400E',
      accent: '#B45309'
    },
    preview: {
      desktop: '/previews/maitre-artisan-luxe-desktop.jpg',
      tablet: '/previews/maitre-artisan-luxe-tablet.jpg',
      mobile: '/previews/maitre-artisan-luxe-mobile.jpg'
    },
    stats: {
      loadTime: '0.7s',
      lighthouse: 97,
      conversionRate: '+85%'
    },
    businessExample: {
      name: 'Maison d\\\'Art Française',
      city: 'Versailles',
      description: 'Maître artisan d\\\'exception spécialisé en créations luxe et patrimoine français'
    },
    wowFactors: [
      'Exposition virtuelle immersive des créations',
      'Certification blockchain maître artisan',
      'Concierge VIP pour clientèle internationale',
      'Réseau exclusif artisans d\\\'art français',
      'Formation digitale des savoir-faire ancestraux',
      'Marketplace art de vivre \\\"Made in France\\\"'
    ],
    designType: 'luxury'
  },
  {
    id: 'espace-coworking-artisan',
    name: 'Espace Coworking Artisan',
    sector: 'artisan',
    description: 'Hub collaboratif d\\\'artisans avec marketplace, formations et réseau professionnel',
    features: [
      'Réseau d\\\'artisans collaboratif',
      'Marketplace outils et matériaux',
      'Formations métiers en ligne',
      'Espace coworking virtuel',
      'Projets collectifs et partenariats',
      'Financement participatif projets',
      'Certification compétences digitales',
      'Mentorat maître-apprenti'
    ],
    colors: {
      primary: '#0F766E',
      secondary: '#14B8A6',
      accent: '#5EEAD4'
    },
    preview: {
      desktop: '/previews/espace-coworking-artisan-desktop.jpg',
      tablet: '/previews/espace-coworking-artisan-tablet.jpg',
      mobile: '/previews/espace-coworking-artisan-mobile.jpg'
    },
    stats: {
      loadTime: '0.6s',
      lighthouse: 96,
      conversionRate: '+62%'
    },
    businessExample: {
      name: 'Hub Artisans Collaboratif',
      city: 'Nantes',
      description: 'Espace collaboratif regroupant artisans pour projets innovants et formation continue'
    },
    wowFactors: [
      'Réseau social professionnel artisans',
      'Marketplace intelligente avec IA matching',
      'Formation VR pour techniques artisanales',
      'Financement participatif intégré',
      'Gestion projets collaboratifs temps réel',
      'Certification blockchain compétences'
    ],
    designType: 'modern'
  },

  // SECTEUR BEAUTE - Templates additionnels
  {
    id: 'beauty-tech-lab',
    name: 'Beauty Tech Lab',
    sector: 'beaute',
    description: 'Institut beauty-tech avec diagnostics IA, soins personnalisés et innovation cosmétique',
    features: [
      'Diagnostic beauté IA haute précision',
      'Soins personnalisés basés données',
      'Laboratoire cosmétique virtuel',
      'Suivi évolution peau temps réel',
      'Réalité augmentée essayage produits',
      'Consultation dermatologue à distance',
      'Programmes beauté préventifs',
      'Research & development participatif'
    ],
    colors: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#C4B5FD'
    },
    preview: {
      desktop: '/previews/beauty-tech-lab-desktop.jpg',
      tablet: '/previews/beauty-tech-lab-tablet.jpg',
      mobile: '/previews/beauty-tech-lab-mobile.jpg'
    },
    stats: {
      loadTime: '0.5s',
      lighthouse: 99,
      conversionRate: '+74%'
    },
    businessExample: {
      name: 'TechBeauty Innovation Lab',
      city: 'Sophia Antipolis',
      description: 'Laboratoire de recherche beauté alliant IA, biotechnologie et soins personnalisés'
    },
    wowFactors: [
      'IA diagnostique précision dermatologique',
      'Laboratoire virtuel création produits',
      'Tracking évolution peau avec IoT',
      'Réalité augmentée pour essais produits',
      'Téléconsultation expert dermatologue',
      'Algorithmes prédictifs vieillissement'
    ],
    designType: 'premium'
  },

  // SECTEUR RESTAURANT - Template additionnel
  {
    id: 'ghost-kitchen-network',
    name: 'Ghost Kitchen Network',
    sector: 'restaurant',
    description: 'Réseau de cuisines virtuelles avec multi-marques, analytics avancées et optimisation IA',
    features: [
      'Gestion multi-marques centralisée',
      'Optimisation menus IA prédictive',
      'Analytics comportement client',
      'Réseau livraison intelligent',
      'Test A/B automatique recettes',
      'Gestion stocks prédictive',
      'Marketing automation ciblé',
      'Expansion géographique assistée IA'
    ],
    colors: {
      primary: '#1F2937',
      secondary: '#4B5563',
      accent: '#F59E0B'
    },
    preview: {
      desktop: '/previews/ghost-kitchen-network-desktop.jpg',
      tablet: '/previews/ghost-kitchen-network-tablet.jpg',
      mobile: '/previews/ghost-kitchen-network-mobile.jpg'
    },
    stats: {
      loadTime: '0.4s',
      lighthouse: 100,
      conversionRate: '+81%'
    },
    businessExample: {
      name: 'CloudKitchen Pro Network',
      city: 'Paris La Défense',
      description: 'Réseau de cuisines virtuelles optimisé IA pour maximiser rentabilité et expansion'
    },
    wowFactors: [
      'IA prédictive optimisation menus temps réel',
      'Dashboard analytics multi-marques unifié',
      'Automatisation complète gestion stocks',
      'Expansion géographique assistée IA',
      'Test automatique nouvelles recettes',
      'Marketing hyper-personnalisé par zone'
    ],
    designType: 'professional'
  },

  // SECTEUR MÉDICAL (4 templates)
  {
    id: 'medical-confiance',
    name: 'Médical Confiance',
    sector: 'medical',
    description: 'Professionnalisme médical avec design rassurant et moderne',
    features: [
      'Prise de rendez-vous médicaux',
      'Dossier patient sécurisé',
      'Téléconsultation',
      'Équipe médicale',
      'Spécialités pratiquées',
      'Urgences contact'
    ],
    colors: {
      primary: '#008B8B',
      secondary: '#20B2AA',
      accent: '#00CED1'
    },
    preview: {
      desktop: '/previews/medical-confiance-desktop.jpg',
      tablet: '/previews/medical-confiance-tablet.jpg',
      mobile: '/previews/medical-confiance-mobile.jpg'
    },
    stats: {
      loadTime: '0.6s',
      lighthouse: 100,
      conversionRate: '+55%'
    },
    businessExample: {
      name: 'Cabinet Médical Confiance',
      city: 'Nantes',
      description: 'Cabinet médical moderne proposant consultations et téléconsultations'
    },
    wowFactors: [
      'Booking médical intelligent',
      'Téléconsultation intégrée',
      'Rappels automatiques patients',
      'Interface sécurisée RGPD'
    ],
    designType: 'professional'
  },
  {
    id: 'dentiste-premium',
    name: 'Dentiste Premium',
    sector: 'medical',
    description: 'Excellence dentaire avec technologie de pointe',
    features: [
      'Soins dentaires avancés',
      'Imagerie 3D',
      'Orthodontie moderne',
      'Implantologie',
      'Esthétique dentaire',
      'Prévention personnalisée'
    ],
    colors: {
      primary: '#4169E1',
      secondary: '#87CEEB',
      accent: '#00BFFF'
    },
    preview: {
      desktop: '/previews/dentiste-premium-desktop.jpg',
      tablet: '/previews/dentiste-premium-tablet.jpg',
      mobile: '/previews/dentiste-premium-mobile.jpg'
    },
    stats: {
      loadTime: '0.7s',
      lighthouse: 98,
      conversionRate: '+61%'
    },
    businessExample: {
      name: 'Dental Excellence Center',
      city: 'Montpellier',
      description: 'Cabinet dentaire high-tech spécialisé en soins esthétiques et implantologie'
    },
    wowFactors: [
      'Simulation sourire 3D temps réel',
      'Visite cabinet virtuelle',
      'Planification traitement interactive',
      'Suivi post-soins personnalisé'
    ],
    designType: 'premium'
  },
  {
    id: 'kinesitherapeute',
    name: 'Kinésithérapeute Expert',
    sector: 'medical',
    description: 'Rééducation moderne avec approche personnalisée',
    features: [
      'Thérapies manuelles',
      'Rééducation sportive',
      'Exercices personnalisés',
      'Suivi évolution',
      'Matériel moderne',
      'Domicile possible'
    ],
    colors: {
      primary: '#32CD32',
      secondary: '#90EE90',
      accent: '#228B22'
    },
    preview: {
      desktop: '/previews/kinesitherapeute-desktop.jpg',
      tablet: '/previews/kinesitherapeute-tablet.jpg',
      mobile: '/previews/kinesitherapeute-mobile.jpg'
    },
    stats: {
      loadTime: '0.5s',
      lighthouse: 100,
      conversionRate: '+42%'
    },
    businessExample: {
      name: 'Kiné Mouvement Santé',
      city: 'Rennes',
      description: 'Cabinet de kinésithérapie moderne spécialisé en rééducation et sport'
    },
    wowFactors: [
      'Programme exercices interactif',
      'Suivi progression temps réel',
      'Anatomie 3D éducative',
      'Conseils prévention personnalisés'
    ],
    designType: 'professional'
  },
  {
    id: 'psychologue-bien-etre',
    name: 'Psychologue Bien-être',
    sector: 'medical',
    description: 'Accompagnement psychologique avec design apaisant',
    features: [
      'Thérapies individuelles',
      'Consultations couples',
      'Thérapie familiale',
      'Gestion stress',
      'Développement personnel',
      'Ressources bien-être'
    ],
    colors: {
      primary: '#9370DB',
      secondary: '#DDA0DD',
      accent: '#BA55D3'
    },
    preview: {
      desktop: '/previews/psychologue-bien-etre-desktop.jpg',
      tablet: '/previews/psychologue-bien-etre-tablet.jpg',
      mobile: '/previews/psychologue-bien-etre-mobile.jpg'
    },
    stats: {
      loadTime: '0.6s',
      lighthouse: 99,
      conversionRate: '+48%'
    },
    businessExample: {
      name: 'Cabinet Bien-être Mental',
      city: 'Grenoble',
      description: 'Psychologue clinicienne proposant thérapies et accompagnement bien-être'
    },
    wowFactors: [
      'Interface apaisante et rassurante',
      'Auto-évaluation bien-être',
      'Ressources mindfulness',
      'Prise de rendez-vous discrète'
    ],
    designType: 'elegant'
  }
];

export const sectorInfo = {
  restaurant: {
    name: 'Restaurants & Gastronomie',
    icon: '🍽️',
    description: 'Designs savoureux qui mettent l\'eau à la bouche',
    templates: 7,
    avgConversion: '+61%',
    features: ['Menu IA prédictive', 'Ghost Kitchen', 'Livraison smart', 'Analytics avancées'],
    color: 'from-orange-500 to-red-500'
  },
  beaute: {
    name: 'Beauté & Bien-être',
    icon: '💄',
    description: 'Élégance et raffinement pour valoriser votre expertise',
    templates: 7,
    avgConversion: '+66%',
    features: ['Diagnostic IA', 'Beauty Tech Lab', 'Coaching wellness', 'AR/VR intégré'],
    color: 'from-pink-500 to-rose-500'
  },
  artisan: {
    name: 'Artisans & Créateurs',
    icon: '🔨',
    description: 'Savoir-faire authentique avec modernité digitale',
    templates: 7,
    avgConversion: '+69%',
    features: ['Portfolio 3D AR', 'Hub collaboratif', 'Blockchain certif', 'Financement participatif'],
    color: 'from-amber-500 to-orange-500'
  },
  medical: {
    name: 'Médical & Santé',
    icon: '⚕️',
    description: 'Confiance et professionnalisme pour vos patients',
    templates: 4,
    avgConversion: '+52%',
    features: ['RDV médicaux', 'Téléconsultation', 'Dossier sécurisé', 'Équipe soignante'],
    color: 'from-blue-500 to-cyan-500'
  }
};

export const getTemplatesBySector = (sector: string) => {
  if (sector === 'all') return templatesData;
  return templatesData.filter(template => template.sector === sector);
};