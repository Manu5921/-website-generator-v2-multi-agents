#!/usr/bin/env node

/**
 * 🏭 TEMPLATE FACTORY - Générateur de templates standardisés
 * Système bulletproof pour créer des templates de qualité agence
 */

const fs = require('fs');
const path = require('path');

// 🎨 Configuration templates sectoriels
const TEMPLATE_CONFIGS = {
  'restaurant': {
    id: 'proximite-locale',
    name: 'Proximité Locale',
    sector: 'restaurant',
    port: 3041,
    photos: {
      hero: 'photo-1537047902294-62a40c20a6ae', // Restaurant français traditionnel
      team: [
        'photo-1577219491135-ce391730fb2c', // Chef cuisine
        'photo-1583394838336-acd977736f90', // Équipe service
        'photo-1571019613454-1cb2f99b2d8b', // Sommelier
        'photo-1566554273541-37a9ca77b91f'  // Personnel restaurant
      ],
      food: [
        'photo-1414235077428-338989a2e8c0', // Plat gastronomique
        'photo-1504674900247-0877df9cc836', // Spécialités françaises
        'photo-1467003909585-2f8a72700288'  // Dessert artisanal
      ],
      ambiance: [
        'photo-1551218808-94e220e084d2', // Terrasse soirée
        'photo-1559329007-40df8a9345d8'  // Cave à vin
      ]
    },
    colors: {
      primary: 'amber',
      secondary: 'orange',
      accent: 'yellow'
    },
    features: [
      'glassmorphism',
      'framer-motion',
      'unsplash-integration',
      'responsive-design',
      'seo-optimized'
    ]
  },
  
  'coiffeur': {
    id: 'beaute-elegance',
    name: 'Beauté Élégance',
    sector: 'coiffeur',
    port: 3042,
    photos: {
      hero: 'photo-1560066984-138dadb4c035', // Salon moderne
      team: [
        'photo-1594736797933-d0eeaa9cbdfa', // Coiffeuse professionnelle
        'photo-1582095133179-bfd08e2fc6b3', // Équipe salon
        'photo-1596462502278-27bfdc403348'  // Styliste
      ],
      services: [
        'photo-1522337360788-8b13dee7a37e', // Coupe cheveux
        'photo-1492106087820-71f1a00d2b11', // Coloration
        'photo-1521590832167-7bcbfaa6381f'  // Soins capillaires
      ],
      ambiance: [
        'photo-1562322140-8198e5c23d1a', // Intérieur salon
        'photo-1633681926022-84c23e8cb2d6'  // Espace détente
      ]
    },
    colors: {
      primary: 'rose',
      secondary: 'pink',
      accent: 'purple'
    },
    features: [
      'glassmorphism',
      'framer-motion',
      'booking-system',
      'responsive-design',
      'seo-optimized'
    ]
  },
  
  'artisan': {
    id: 'savoir-faire',
    name: 'Savoir-Faire Artisanal',
    sector: 'artisan',
    port: 3043,
    photos: {
      hero: 'photo-1503387762-592deb58ef4e', // Atelier artisan
      team: [
        'photo-1507003211169-0a1dd7228f2d', // Artisan travaillant
        'photo-1556909114-f6e7ad7d3136', // Équipe atelier
        'photo-1517430816045-df4b7de11d1d'  // Maître artisan
      ],
      work: [
        'photo-1416879595882-3373a0480b5b', // Outils artisanaux
        'photo-1581833971358-2c8b550f87b3', // Création en cours
        'photo-1558618666-fcd25c85cd64'  // Produit fini
      ],
      ambiance: [
        'photo-1558618047-3c8c76ca7d13', // Atelier traditionnel
        'photo-1546074177-ffdda98d214f'  // Espace exposition
      ]
    },
    colors: {
      primary: 'emerald',
      secondary: 'teal',
      accent: 'green'
    },
    features: [
      'glassmorphism',
      'framer-motion',
      'portfolio-showcase',
      'responsive-design',
      'seo-optimized'
    ]
  }
};

// 🛠️ Fonction de génération d'URL Unsplash optimisée
function generateUnsplashUrl(photoId, width = 800, height = 600, quality = 80) {
  return `https://images.unsplash.com/${photoId}?w=${width}&h=${height}&q=${quality}&fit=crop&crop=center&auto=format`;
}

// 🎨 Générateur de template React/Next.js
function generateTemplateComponent(config) {
  const { id, name, sector, photos, colors } = config;
  
  return `'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  MapPinIcon,
  CheckBadgeIcon,
  PhoneIcon,
  HeartIcon,
  StarIcon,
  UserGroupIcon,
  SparklesIcon,
  ClockIcon,
  AcademicCapIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

// Import du CSS glassmorphism et effets
import '@/styles/glassmorphism.css';
import '@/styles/restaurant-effects.css';

export default function ${name.replace(/[^a-zA-Z0-9]/g, '')}Demo() {
  // URLs d'images optimisées Unsplash
  const heroImage = "${generateUnsplashUrl(photos.hero, 1200, 800)}";
  const teamImages = [
    ${photos.team.map(id => `"${generateUnsplashUrl(id, 400, 500)}"`).join(',\n    ')}
  ];
  const contentImages = [
    ${(photos.food || photos.services || photos.work).map(id => `"${generateUnsplashUrl(id, 600, 400)}"`).join(',\n    ')}
  ];
  const ambianceImages = [
    ${photos.ambiance.map(id => `"${generateUnsplashUrl(id, 800, 600)}"`).join(',\n    ')}
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background avec image hero */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: \`url(\${heroImage})\`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-${colors.primary}-900/20 to-${colors.secondary}-900/30" />
      </div>
      
      {/* Glassmorphism overlay pour contenu */}
      <div className="relative z-10">
        {/* Demo Header avec glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-nav text-white py-4 text-center border-b border-white/20"
        >
          <div className="container mx-auto px-4">
            <p className="text-sm font-semibold flex items-center justify-center gap-2">
              <SparklesIcon className="w-4 h-4" />
              Aperçu Template "${name}" - ${sector.charAt(0).toUpperCase() + sector.slice(1)} Premium
              <SparklesIcon className="w-4 h-4" />
            </p>
          </div>
        </motion.div>

        {/* Hero Section Premium */}
        <section className="py-20 lg:py-32 relative">
          {/* Floating particles animation */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.random() * 100 - 50, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 8
                }}
                style={{
                  left: \`\${Math.random() * 100}%\`,
                  top: \`\${Math.random() * 100}%\`
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                {/* Trust badge glassmorphism */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="glass-${colors.primary} inline-flex items-center rounded-full px-6 py-3 mb-8 backdrop-blur-md trust-badge golden-glow"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 bg-${colors.primary}-400 rounded-full mr-3"
                  />
                  <span className="text-white font-semibold text-sm flex items-center gap-2">
                    <HeartIcon className="w-4 h-4" />
                    Service ${sector} de confiance depuis 2019
                  </span>
                </motion.div>

                {/* Main headline avec animation */}
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight drop-shadow-2xl"
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    ${name}
                  </motion.span>
                  <br />
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-${colors.primary}-300 bg-gradient-to-r from-${colors.primary}-300 to-${colors.secondary}-300 bg-clip-text text-transparent"
                  >
                    Excellence & Proximité
                  </motion.span>
                </motion.h1>

                {/* Description premium avec glassmorphism */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="glass-card text-xl text-white leading-relaxed mb-8 max-w-xl p-6"
                >
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                    className="mb-4 flex items-center gap-2"
                  >
                    <SparklesIcon className="w-6 h-6 text-${colors.primary}-300" />
                    <strong className="text-${colors.primary}-300">Qualité • Innovation • Excellence</strong>
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    Une équipe passionnée qui vous accompagne avec expertise et attention. 
                    <span className="font-bold text-${colors.primary}-300 text-2xl"> 399€ TTC</span> pour un service personnalisé et professionnel.
                  </motion.p>
                </motion.div>

                {/* CTA Buttons Premium */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/demande-publique"
                      className="cta-button group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white rounded-xl border border-${colors.primary}-400/30 backdrop-blur-md"
                    >
                      <span>Découvrir nos services</span>
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      </motion.div>
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <button className="glass-button inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl transition-all duration-300 backdrop-blur-md">
                      <PhoneIcon className="w-5 h-5 mr-2" />
                      <span>Nous contacter</span>
                    </button>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-12 lg:mt-0"
              >
                {/* Team premium avec vraies photos */}
                <div className="relative">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="glass-card-xl relative overflow-hidden rounded-3xl h-96"
                  >
                    {/* Image d'équipe professionnelle */}
                    <Image
                      src={teamImages[0]}
                      alt="Équipe professionnelle ${sector}"
                      width={600}
                      height={400}
                      className="absolute inset-0 w-full h-full object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    <div className="relative z-10 p-8 text-center">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="text-6xl mb-4 text-white"
                      >
                        <UserGroupIcon className="w-16 h-16 mx-auto text-${colors.primary}-300" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Équipe Professionnelle</h3>
                      <p className="text-white/90 mb-6">Des experts passionnés à votre service</p>
                      
                      {/* Team avatars avec vraies photos optimisées */}
                      <div className="flex justify-center -space-x-3 mt-6">
                        {teamImages.slice(0, 4).map((imageUrl, index) => (
                          <motion.div
                            key={index}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 1 + index * 0.1 }}
                            whileHover={{ scale: 1.1, zIndex: 10 }}
                            className="relative team-avatar"
                          >
                            <Image
                              src={imageUrl}
                              alt={\`Membre équipe \${index + 1}\`}
                              width={56}
                              height={56}
                              className="w-14 h-14 rounded-full border-4 border-white/50 shadow-lg object-cover"
                            />
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-sm text-white/80 mt-3 font-medium">Marie, Sophie, Antoine & Lucas</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Retour vers démo */}
        <section className="py-12 relative">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="glass-card max-w-2xl mx-auto p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                Template "${name}" - Secteur ${sector.charAt(0).toUpperCase() + sector.slice(1)}
              </h3>
              <p className="text-white/90 mb-6">
                Design premium avec photos professionnelles et effets glassmorphism
              </p>
              <Link
                href="/demo"
                className="glass-button inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl transition-all duration-300 backdrop-blur-md"
              >
                ← Retour aux templates
              </Link>
            </motion.div>
          </div>
        </section>
        
      </div> {/* Closing glassmorphism overlay */}
    </div>
  );
}`;
}

// 🚀 Fonction principale de génération
function generateTemplate(sectorKey) {
  const config = TEMPLATE_CONFIGS[sectorKey];
  if (!config) {
    console.error(`❌ Secteur "${sectorKey}" non trouvé`);
    console.log(`✅ Secteurs disponibles: ${Object.keys(TEMPLATE_CONFIGS).join(', ')}`);
    return;
  }

  const componentCode = generateTemplateComponent(config);
  const outputPath = path.join(__dirname, '..', 'src', 'app', 'demo', config.id, 'page.tsx');
  
  // Créer le dossier si nécessaire
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Écrire le fichier
  fs.writeFileSync(outputPath, componentCode);
  
  console.log(`✅ Template "${config.name}" généré avec succès !`);
  console.log(`📁 Fichier: ${outputPath}`);
  console.log(`🌐 URL: http://localhost:${config.port}/demo/${config.id}`);
  console.log(`🎨 Photos: ${Object.values(config.photos).flat().length} images Unsplash intégrées`);
  
  return config;
}

// 🎯 Fonction de génération de tous les templates
function generateAllTemplates() {
  console.log('🏭 TEMPLATE FACTORY - Génération de tous les templates');
  console.log('================================================');
  
  Object.keys(TEMPLATE_CONFIGS).forEach(sectorKey => {
    console.log(`\n🎨 Génération template ${sectorKey}...`);
    generateTemplate(sectorKey);
  });
  
  console.log('\n🎉 Tous les templates ont été générés avec succès !');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. npm run build (vérifier compilation)');
  console.log('2. npm run dev (tester en local)');
  console.log('3. ./scripts/validation-pre-deploy.sh (validation)');
  console.log('4. npx vercel --prod (déploiement)');
}

// 🔧 CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🏭 Template Factory - Générateur de templates premium');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/template-factory.js [secteur]');
    console.log('  node scripts/template-factory.js all');
    console.log('');
    console.log('Secteurs disponibles:');
    Object.keys(TEMPLATE_CONFIGS).forEach(key => {
      const config = TEMPLATE_CONFIGS[key];
      console.log(`  ${key.padEnd(12)} - ${config.name} (port ${config.port})`);
    });
    console.log('');
    console.log('Exemples:');
    console.log('  node scripts/template-factory.js restaurant');
    console.log('  node scripts/template-factory.js all');
  } else if (args[0] === 'all') {
    generateAllTemplates();
  } else {
    generateTemplate(args[0]);
  }
}

module.exports = {
  TEMPLATE_CONFIGS,
  generateTemplate,
  generateAllTemplates,
  generateUnsplashUrl
};