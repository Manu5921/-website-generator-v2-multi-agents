'use client';
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

export default function SavoirFaireArtisanalDemo() {
  // URLs d'images optimisées Unsplash
  const heroImage = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&h=800&q=80&fit=crop&crop=center&auto=format";
  const teamImages = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&q=80&fit=crop&crop=center&auto=format",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&q=80&fit=crop&crop=center&auto=format",
    "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=400&h=500&q=80&fit=crop&crop=center&auto=format"
  ];
  const contentImages = [
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&q=80&fit=crop&crop=center&auto=format",
    "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&q=80&fit=crop&crop=center&auto=format",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&q=80&fit=crop&crop=center&auto=format"
  ];
  const ambianceImages = [
    "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&q=80&fit=crop&crop=center&auto=format",
    "https://images.unsplash.com/photo-1546074177-ffdda98d214f?w=800&h=600&q=80&fit=crop&crop=center&auto=format"
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background avec image hero */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-emerald-900/20 to-teal-900/30" />
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
              Aperçu Template "Savoir-Faire Artisanal" - Artisan Premium
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
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
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
                  className="glass-emerald inline-flex items-center rounded-full px-6 py-3 mb-8 backdrop-blur-md trust-badge golden-glow"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 bg-emerald-400 rounded-full mr-3"
                  />
                  <span className="text-white font-semibold text-sm flex items-center gap-2">
                    <HeartIcon className="w-4 h-4" />
                    Service artisan de confiance depuis 2019
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
                    Savoir-Faire Artisanal
                  </motion.span>
                  <br />
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-emerald-300 bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent"
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
                    <SparklesIcon className="w-6 h-6 text-emerald-300" />
                    <strong className="text-emerald-300">Qualité • Innovation • Excellence</strong>
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    Une équipe passionnée qui vous accompagne avec expertise et attention. 
                    <span className="font-bold text-emerald-300 text-2xl"> 399€ TTC</span> pour un service personnalisé et professionnel.
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
                      className="cta-button group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white rounded-xl border border-emerald-400/30 backdrop-blur-md"
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
                      alt="Équipe professionnelle artisan"
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
                        <UserGroupIcon className="w-16 h-16 mx-auto text-emerald-300" />
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
                              alt={`Membre équipe ${index + 1}`}
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
                Template "Savoir-Faire Artisanal" - Secteur Artisan
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
}