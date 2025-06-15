'use client';
import Link from 'next/link';
import Image from 'next/image';
import { unsplashService } from '@/lib/unsplash-service';
import { motion } from 'framer-motion';
import { 
  MapPinIcon,
  CheckBadgeIcon,
  PhoneIcon,
  HeartIcon,
  StarIcon,
  CakeIcon,
  UserGroupIcon,
  SparklesIcon,
  ClockIcon,
  AcademicCapIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

// Import du CSS glassmorphism et effets restaurant
import '@/styles/glassmorphism.css';
import '@/styles/restaurant-effects.css';

export default function ProximiteLocaleDemo() {
  const heroImage = unsplashService.getHeroImage();
  const teamImages = unsplashService.getImagesByCategory('team');
  const foodImages = unsplashService.getImagesByCategory('food');
  const ambianceImages = unsplashService.getImagesByCategory('ambiance');

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with restaurant hero image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-amber-900/20 to-orange-900/30" />
      </div>
      
      {/* Glassmorphism overlay for content */}
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
            Aperçu Template "Proximité Locale" - Service Humain & Convivial
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
                className="glass-amber inline-flex items-center rounded-full px-6 py-3 mb-8 backdrop-blur-md trust-badge golden-glow"
              >
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 bg-amber-400 rounded-full mr-3"
                />
                <span className="text-white font-semibold text-sm flex items-center gap-2">
                  <HeartIcon className="w-4 h-4" />
                  Partenaire de confiance depuis 2019
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
                  Votre Partenaire Web
                </motion.span>
                <br />
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-amber-300 bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent"
                >
                  Local de Confiance
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
                  <CakeIcon className="w-6 h-6 text-amber-300" />
                  <strong className="text-amber-300">Proximité • Convivialité • Excellence</strong>
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  Une équipe locale qui comprend vos besoins et vous accompagne avec le sourire. 
                  <span className="font-bold text-amber-300 text-2xl"> 399€ TTC</span> pour un service personnalisé et humain.
                </motion.p>
              </motion.div>

              {/* Stats premium avec glassmorphism */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 }}
                className="flex flex-wrap items-center gap-4 mb-8"
              >
                {[
                  { icon: MapPinIcon, text: "Équipe basée en France", color: "text-amber-300" },
                  { icon: CheckBadgeIcon, text: "847 entreprises satisfaites", color: "text-green-300" },
                  { icon: PhoneIcon, text: "Support téléphonique direct", color: "text-blue-300" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.8 + index * 0.1 }}
                    className="glass-subtle flex items-center px-4 py-2 rounded-full backdrop-blur-sm"
                  >
                    <item.icon className={`w-5 h-5 ${item.color} mr-2`} />
                    <span className="text-white text-sm font-medium">{item.text}</span>
                  </motion.div>
                ))}
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
                    href="https://core-platform-staging-6q06uxlwl-emmanuelclarisse-6154s-projects.vercel.app/demande-publique"
                    className="glass-button group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-amber-500/80 to-orange-500/80 hover:from-amber-600/90 hover:to-orange-600/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-md border border-amber-400/30"
                  >
                    <span>Discutons de votre projet</span>
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
                    <span>Appelez-nous maintenant</span>
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
                  {/* Image d'équipe de restaurant professionnel */}
                  <Image
                    src={teamImages[0]?.url || "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=400&fit=crop&crop=center"}
                    alt="Équipe professionnelle restaurant français"
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
                      <UserGroupIcon className="w-16 h-16 mx-auto text-amber-300" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Équipe Locale Dédiée</h3>
                    <p className="text-white/90 mb-6">Rencontrez l'équipe qui s'occupera de votre projet</p>
                    
                    {/* Team avatars avec vraies photos optimisées */}
                    <div className="flex justify-center -space-x-3 mt-6">
                      {[
                        "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=80&h=80&fit=crop&crop=face",
                        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=80&h=80&fit=crop&crop=face", 
                        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=80&fit=crop&crop=face",
                        "https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=80&h=80&fit=crop&crop=face"
                      ].map((imageUrl, index) => (
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

                {/* Floating testimonial glassmorphism */}
                <motion.div 
                  initial={{ opacity: 0, y: 20, x: -20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ delay: 1.5 }}
                  whileHover={{ scale: 1.05 }}
                  className="absolute -bottom-6 -left-6 glass-testimonial p-4 shadow-lg max-w-xs backdrop-blur-md"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      JM
                    </div>
                    <div>
                      <div className="flex text-yellow-300 text-xs mb-1">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.7 + i * 0.1 }}
                          >
                            <StarIcon className="w-3 h-3 fill-current" />
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-sm text-white font-medium mb-1">"Un accompagnement exceptionnel !"</p>
                      <p className="text-xs text-white/80 font-medium">- Jean-Marc, Restaurant</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section Premium */}
      <section className="py-20 relative">
        {/* Background avec image d'ambiance restaurant */}
        <Image
          src={ambianceImages[0]?.url || "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200&h=800&fit=crop&crop=center"}
          alt="Ambiance chaleureuse restaurant français"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Des Services Pensés Pour Vous
            </h2>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '6rem' }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto rounded-full"
            />
            <p className="mt-6 text-white/90 max-w-2xl mx-auto text-lg">
              Nous privilégions les relations humaines et la proximité avec chaque client
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: HeartIcon,
                title: "Accompagnement Personnel",
                desc: "Une relation de proximité avec une équipe locale disponible et à l'écoute de vos besoins spécifiques",
                color: "text-amber-300"
              },
              {
                icon: MapPinIcon,
                title: "Expertise Locale", 
                desc: "Connaissance approfondie du marché local et des spécificités de votre région pour un service adapté",
                color: "text-orange-300"
              },
              {
                icon: SparklesIcon,
                title: "Sites Web Sur Mesure",
                desc: "Création de sites web personnalisés qui reflètent l'identité de votre entreprise locale",
                color: "text-yellow-300"
              },
              {
                icon: CheckBadgeIcon,
                title: "Référencement Local",
                desc: "Optimisation SEO spécialisée pour être visible auprès de votre clientèle de proximité",
                color: "text-green-300"
              },
              {
                icon: AcademicCapIcon,
                title: "Formation Incluse",
                desc: "Nous vous formons à l'utilisation de votre site avec patience et pédagogie, en personne si besoin",
                color: "text-blue-300"
              },
              {
                icon: BoltIcon,
                title: "Maintenance Réactive",
                desc: "Support technique rapide et efficace avec possibilité de rendez-vous en face à face",
                color: "text-purple-300"
              }
            ].map((service, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <div className="glass-card h-full p-8 hover:glass-strong transition-all duration-300 relative overflow-hidden">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="text-4xl mb-6 relative z-10"
                  >
                    <service.icon className={`w-12 h-12 ${service.color}`} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-amber-300 transition-colors duration-300 relative z-10">
                    {service.title}
                  </h3>
                  <p className="text-white/90 leading-relaxed relative z-10">
                    {service.desc}
                  </p>
                  
                  {/* Decoration hover effect */}
                  <motion.div
                    className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-400/20 to-transparent rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section Premium */}
      <section className="py-20 relative">
        {/* Background avec image gastronomie française */}
        <Image
          src={foodImages[0]?.url || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop&crop=center"}
          alt="Gastronomie française raffinée"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 via-orange-900/40 to-amber-900/60" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Ils Nous Font Confiance
            </h2>
            <p className="text-white/90 text-lg">Des entrepreneurs locaux qui témoignent</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Marie Dubois",
                business: "Boulangerie Marie",
                location: "Lyon 7ème",
                quote: "Une équipe formidable ! Ils ont su comprendre l'âme artisanale de ma boulangerie et l'ont magnifiquement retranscrite sur mon site.",
                rating: 5,
                avatar: "MD"
              },
              {
                name: "Pierre Martin",
                business: "Garage Martin & Fils",
                location: "Grenoble",
                quote: "Enfin des professionnels qui parlent notre langue ! Terminé les prestataires parisiens qui ne comprennent rien à notre métier.",
                rating: 5,
                avatar: "PM"
              },
              {
                name: "Sophie Rousseau",
                business: "Coiffure Sophie",
                location: "Annecy",
                quote: "Service irréprochable et équipe adorable. Ils ont pris le temps de m'expliquer chaque étape. Je recommande les yeux fermés !",
                rating: 5,
                avatar: "SR"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="glass-testimonial p-6 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center mb-4">
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: index * 0.2 + 0.3 }}
                    className="w-14 h-14 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg"
                  >
                    {testimonial.avatar}
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-white/80">{testimonial.business}</p>
                    <p className="text-xs text-amber-300 flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      {testimonial.location}
                    </p>
                  </div>
                </div>
                
                <div className="flex text-yellow-300 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.2 + 0.5 + i * 0.1 }}
                    >
                      <StarIcon className="w-5 h-5 fill-current" />
                    </motion.div>
                  ))}
                </div>
                
                <blockquote className="text-white/90 italic text-lg leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                
                {/* Decoration */}
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Premium */}
      <section className="py-20 relative">
        {/* Background hero restaurant authentique */}
        <Image
          src={heroImage.url || "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=1200&h=800&fit=crop&crop=center"}
          alt="Restaurant français traditionnel authentique"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="glass-card-xl max-w-4xl mx-auto p-12 relative overflow-hidden"
          >
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-amber-300/30 rounded-full"
                  animate={{
                    y: [0, -50, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 4 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 4
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                />
              ))}
            </div>
            
            <motion.h3 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="text-3xl md:text-4xl font-bold text-white mb-4 relative z-10"
            >
              <span className="flex items-center justify-center gap-3">
                <ClockIcon className="w-8 h-8 text-amber-300" />
                Parlons-en Ensemble
                <span className="text-amber-300">• 399€ TTC</span>
              </span>
            </motion.h3>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed relative z-10"
            >
              Un café, une rencontre, un projet. Votre site web professionnel créé avec attention et livré avec le sourire. 
              <strong className="text-amber-300">L'expertise digitale à taille humaine.</strong>
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center relative z-10"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="https://core-platform-staging-6q06uxlwl-emmanuelclarisse-6154s-projects.vercel.app/demande-publique"
                  className="glass-button inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-amber-500/80 to-orange-500/80 hover:from-amber-600/90 hover:to-orange-600/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-md border border-amber-400/30"
                >
                  <ClockIcon className="w-5 h-5 mr-2" />
                  Prendre rendez-vous
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/demo"
                  className="glass-button inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl transition-all duration-300 backdrop-blur-md"
                >
                  ← Comparer les templates
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      </div> {/* Closing glassmorphism overlay */}
    </div>
  );
}