/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration i18n pour BigSpring France
  i18n: {
    // Locales supportées
    locales: ['fr', 'en'],
    // Locale par défaut (français)
    defaultLocale: 'fr',
    // Détection automatique de la langue basée sur l'en-tête Accept-Language
    localeDetection: true,
    // Domaines pour différentes langues (optionnel)
    domains: [
      {
        domain: 'bigspring.fr',
        defaultLocale: 'fr',
      },
      {
        domain: 'bigspring.com', 
        defaultLocale: 'en',
      },
    ],
  },
  
  experimental: {
    webpackBuildWorker: true,
  },
  
  webpack: (config, { isServer }) => {
    // Éviter les erreurs de module non trouvé sur Vercel
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  
  // Redirections pour SEO français
  async redirects() {
    return [
      // Redirect /en vers version française si visiteur français
      {
        source: '/en',
        destination: '/',
        permanent: false,
        locale: false,
      },
      // Redirections des anciennes URLs anglaises
      {
        source: '/about-us',
        destination: '/a-propos',
        permanent: true,
        locale: false,
      },
      {
        source: '/contact-us',
        destination: '/contact',
        permanent: true,
        locale: false,
      },
    ];
  },
  
  // Rewrites pour les URLs françaises SEO-friendly
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/a-propos',
          destination: '/about',
          locale: false,
        },
        {
          source: '/tarifs',
          destination: '/pricing',
          locale: false,
        },
        {
          source: '/blog-marketing-digital',
          destination: '/blog',
          locale: false,
        },
      ],
    };
  },
  
  // Headers pour SEO et performance
  async headers() {
    return [
      {
        // Appliquer ces headers à toutes les pages
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Headers pour la langue
          {
            key: 'Content-Language',
            value: 'fr-FR'
          },
        ],
      },
      // Headers spécifiques pour les pages françaises
      {
        source: '/fr/(.*)',
        headers: [
          {
            key: 'Content-Language',
            value: 'fr-FR'
          },
        ],
      },
      // Headers pour les pages anglaises
      {
        source: '/en/(.*)',
        headers: [
          {
            key: 'Content-Language',
            value: 'en-US'
          },
        ],
      },
    ];
  },
  
  // Désactiver certaines fonctionnalités pour réduire les erreurs de build
  poweredByHeader: false,
  reactStrictMode: true,  // Activer pour le développement
  eslint: {
    ignoreDuringBuilds: false,  // Vérifier les erreurs ESLint
  },
  typescript: {
    ignoreBuildErrors: false,  // Vérifier les erreurs TypeScript
  },
  
  // Configuration des images pour optimisation
  images: {
    domains: ['bigspring.fr', 'bigspring.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Augmenter la limite de timeout pour les builds complexes
  staticPageGenerationTimeout: 1000,
  
  // Variables d'environnement publiques
  env: {
    SITE_NAME: 'BigSpring France',
    SITE_URL: 'https://bigspring.fr',
    DEFAULT_LOCALE: 'fr',
  },
};

export default nextConfig;