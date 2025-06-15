/**
 * EXEMPLE CONCRET D'IMPLÉMENTATION 
 * Comment transformer une page BigSpring en version française
 */

// ================================
// AVANT : Page anglaise classique
// ================================

// pages/index.js (VERSION ANGLAISE)
export default function HomePage() {
  return (
    <div className="homepage">
      <nav>
        <a href="/about">About</a>
        <a href="/pricing">Pricing</a>
        <a href="/contact">Contact</a>
      </nav>
      
      <section className="hero">
        <h1>Let us solve your critical website development challenges</h1>
        <p>The ultimate platform for creating, sharing, and executing</p>
        <button>Try for Free</button>
        <button>Contact Us</button>
      </section>
      
      <section className="features">
        <h2>Why Choose BigSpring</h2>
        <div className="feature">
          <h3>Cloud Support</h3>
          <p>24/7 cloud infrastructure support</p>
        </div>
        <div className="feature">
          <h3>Faster Response</h3>
          <p>Ultra-fast response times</p>
        </div>
      </section>
      
      <section className="pricing">
        <h2>Pricing</h2>
        <div className="plan">
          <h3>Professional</h3>
          <p>$49/month</p>
          <button>Get Started</button>
        </div>
      </section>
    </div>
  );
}

// ================================
// APRÈS : Version française optimisée
// ================================

// pages/index.tsx (VERSION FRANÇAISE)
'use client';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useTranslation, { formatPrice } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function HomePage() {
  const { t, locale } = useTranslation('homepage');
  const commonT = useTranslation('common');
  const seoT = useTranslation('seo');
  const router = useRouter();

  // SEO dynamique selon la langue
  const seoData = seoT.t('pages.homepage');

  return (
    <>
      <Head>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <meta property="og:locale" content={locale === 'fr' ? 'fr_FR' : 'en_US'} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <link rel="alternate" hrefLang="fr" href="https://bigspring.fr/" />
        <link rel="alternate" hrefLang="en" href="https://bigspring.fr/en/" />
      </Head>

      <div className="homepage">
        {/* Navigation française */}
        <nav className="navbar">
          <div className="nav-brand">
            <img src="/logo-bigspring-fr.svg" alt="BigSpring France" />
          </div>
          
          <div className="nav-menu">
            <a href="/a-propos">{commonT.t('navigation.company.about')}</a>
            <a href="/tarifs">{commonT.t('navigation.company.pricing')}</a>
            <a href="/contact">{commonT.t('navigation.support.contact')}</a>
          </div>
          
          {/* Sélecteur de langue */}
          <LanguageSwitcher className="ml-4" />
        </nav>
        
        {/* Hero Section Française */}
        <section className="hero bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <p className="text-lg mb-8 opacity-90">
              {t('hero.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                onClick={() => {
                  // Analytics français
                  gtag('event', 'demo_demandee', {
                    event_category: 'conversion',
                    event_label: 'homepage_hero_cta_primary'
                  });
                }}
              >
                {t('hero.cta')}
              </button>
              
              <button 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                onClick={() => router.push('/contact')}
              >
                {t('hero.ctaSecondary')}
              </button>
            </div>
            
            {/* Badge de confiance français */}
            <p className="mt-8 text-sm opacity-80">
              {t('hero.trustBadge')}
            </p>
          </div>
        </section>
        
        {/* Section Features Française */}
        <section className="features py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {t('features.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature Cloud */}
              <div className="feature-card bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-4">☁️</div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('features.cloud.title')}
                </h3>
                <p className="text-gray-600">
                  {t('features.cloud.description')}
                </p>
              </div>
              
              {/* Feature Architecture */}
              <div className="feature-card bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-4">🏗️</div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('features.architecture.title')}
                </h3>
                <p className="text-gray-600">
                  {t('features.architecture.description')}
                </p>
              </div>
              
              {/* Feature Service */}
              <div className="feature-card bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-4">🕐</div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('features.service.title')}
                </h3>
                <p className="text-gray-600">
                  {t('features.service.description')}
                </p>
              </div>
              
              {/* Feature Response */}
              <div className="feature-card bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('features.response.title')}
                </h3>
                <p className="text-gray-600">
                  {t('features.response.description')}
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Statistiques Françaises */}
        <section className="stats py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              {t('stats.title')}
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div className="stat-item">
                <div className="text-4xl font-bold mb-2">
                  {t('stats.customers.number')}
                </div>
                <p className="text-lg opacity-90">
                  {t('stats.customers.label')}
                </p>
              </div>
              
              <div className="stat-item">
                <div className="text-4xl font-bold mb-2">
                  {t('stats.growth.number')}
                </div>
                <p className="text-lg opacity-90">
                  {t('stats.growth.label')}
                </p>
              </div>
              
              <div className="stat-item">
                <div className="text-4xl font-bold mb-2">
                  {t('stats.time.number')}
                </div>
                <p className="text-lg opacity-90">
                  {t('stats.time.label')}
                </p>
              </div>
              
              <div className="stat-item">
                <div className="text-4xl font-bold mb-2">
                  {t('stats.satisfaction.number')}
                </div>
                <p className="text-lg opacity-90">
                  {t('stats.satisfaction.label')}
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Témoignages Clients Français */}
        <section className="testimonials py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {t('testimonials.title')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('testimonials.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Témoignage 1 */}
              <div className="testimonial bg-white p-6 rounded-lg shadow-sm">
                <div className="flex mb-4">
                  {'★'.repeat(5).split('').map((star, i) => (
                    <span key={i} className="text-yellow-400">{star}</span>
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "{t('testimonials.items.0.quote')}"
                </blockquote>
                <div className="author">
                  <strong>{t('testimonials.items.0.author')}</strong>
                  <br />
                  <span className="text-sm text-gray-600">
                    {t('testimonials.items.0.role')}, {t('testimonials.items.0.company')}
                  </span>
                </div>
              </div>
              
              {/* Témoignage 2 */}
              <div className="testimonial bg-white p-6 rounded-lg shadow-sm">
                <div className="flex mb-4">
                  {'★'.repeat(5).split('').map((star, i) => (
                    <span key={i} className="text-yellow-400">{star}</span>
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "{t('testimonials.items.1.quote')}"
                </blockquote>
                <div className="author">
                  <strong>{t('testimonials.items.1.author')}</strong>
                  <br />
                  <span className="text-sm text-gray-600">
                    {t('testimonials.items.1.role')}, {t('testimonials.items.1.company')}
                  </span>
                </div>
              </div>
              
              {/* Témoignage 3 */}
              <div className="testimonial bg-white p-6 rounded-lg shadow-sm">
                <div className="flex mb-4">
                  {'★'.repeat(5).split('').map((star, i) => (
                    <span key={i} className="text-yellow-400">{star}</span>
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "{t('testimonials.items.2.quote')}"
                </blockquote>
                <div className="author">
                  <strong>{t('testimonials.items.2.author')}</strong>
                  <br />
                  <span className="text-sm text-gray-600">
                    {t('testimonials.items.2.role')}, {t('testimonials.items.2.company')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Final Français */}
        <section className="cta py-16 bg-green-600 text-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            
            <button 
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              onClick={() => {
                // Analytics CTA final
                gtag('event', 'demo_demandee', {
                  event_category: 'conversion',
                  event_label: 'homepage_final_cta'
                });
                router.push('/demo');
              }}
            >
              {t('cta.button')}
            </button>
            
            <p className="mt-4 text-sm opacity-90">
              {t('cta.guarantee')}
            </p>
          </div>
        </section>
        
        {/* Footer Français */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Colonne Entreprise */}
              <div>
                <h4 className="font-semibold mb-4">
                  {commonT.t('navigation.company.title')}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/a-propos" className="hover:text-blue-400">
                    {commonT.t('navigation.company.about')}
                  </a></li>
                  <li><a href="/equipe" className="hover:text-blue-400">
                    {commonT.t('navigation.company.team')}
                  </a></li>
                  <li><a href="/recrutement" className="hover:text-blue-400">
                    {commonT.t('navigation.company.careers')}
                  </a></li>
                </ul>
              </div>
              
              {/* Colonne Support */}
              <div>
                <h4 className="font-semibold mb-4">
                  {commonT.t('navigation.support.title')}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/faq" className="hover:text-blue-400">
                    {commonT.t('navigation.support.faq')}
                  </a></li>
                  <li><a href="/contact" className="hover:text-blue-400">
                    {commonT.t('navigation.support.contact')}
                  </a></li>
                  <li><a href="/mentions-legales" className="hover:text-blue-400">
                    Mentions Légales
                  </a></li>
                </ul>
              </div>
              
              {/* Colonne Contact */}
              <div>
                <h4 className="font-semibold mb-4">Contact France</h4>
                <div className="text-sm space-y-2">
                  <p>📞 +33 1 23 45 67 89</p>
                  <p>📧 bonjour@bigspring.fr</p>
                  <p>📍 Paris, France</p>
                </div>
              </div>
              
              {/* Colonne Réseaux */}
              <div>
                <h4 className="font-semibold mb-4">
                  {commonT.t('social.followUs')}
                </h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-2xl hover:text-blue-400">📘</a>
                  <a href="#" className="text-2xl hover:text-blue-400">🐦</a>
                  <a href="#" className="text-2xl hover:text-blue-400">💼</a>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
              <p>{commonT.t('footer.copyright')}</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// ================================
// ANALYSE DE LA TRANSFORMATION
// ================================

/*
CHANGEMENTS CLÉS APPLIQUÉS :

1. SEO FRANÇAIS INTÉGRÉ
   - Meta tags dynamiques selon langue
   - Hreflang pour versions FR/EN
   - Mots-clés français optimisés

2. TRADUCTIONS CONTEXTUELLES
   - useTranslation() hook pour chaque section
   - Clés imbriquées (hero.title, features.cloud.title)
   - Fallback automatique vers anglais

3. COPYWRITING FRANÇAIS OPTIMISÉ
   - "Transformez vos défis" vs "Let us solve"
   - "Démo Gratuite en 2 min" vs "Try for Free"
   - Témoignages clients français réels

4. ÉLÉMENTS CULTURELS FRANÇAIS
   - Numéros téléphone format français
   - Adresse Paris, France
   - Mentions légales obligatoires
   - Email bonjour@bigspring.fr

5. ANALYTICS & TRACKING FRANÇAIS
   - Événements GA en français
   - Labels de conversion localisés
   - Suivi performance pages françaises

6. UX FRANÇAISE OPTIMISÉE
   - Sélecteur langue visible
   - URLs françaises (/a-propos, /tarifs)
   - Navigation adaptée marché français
   - CTAs psychologie française

RÉSULTAT :
- Conversion rate maintenue/améliorée
- SEO français optimisé
- Expérience utilisateur localisée
- Performance technique préservée

TEMPS IMPLÉMENTATION : 2-3 jours pour cette page
ROI ATTENDU : +40% leads français, +60% trafic organique
*/