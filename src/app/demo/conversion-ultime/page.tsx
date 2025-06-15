'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ConversionUltimeDemo() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 47,
    minutes: 23,
    seconds: 15
  });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 overflow-hidden">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 text-center border-b border-red-500">
        <div className="container mx-auto px-4">
          <p className="text-sm font-semibold animate-pulse">
            ⚡ Aperçu Template "Conversion Ultime" - Landing Agressive & Performante
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Money-themed background effects */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-16 left-16 w-72 h-72 bg-green-400 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-16 right-16 w-96 h-96 bg-emerald-400 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-yellow-400 rounded-full filter blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Dollar sign pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ctext x='20' y='40' font-size='24' font-weight='bold'%3E€%3C/text%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Urgency badge */}
            <div className="inline-flex items-center bg-red-600/90 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg animate-pulse">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3 animate-ping"></div>
              <span className="text-white font-bold text-sm">⚡ OFFRE LIMITÉE - Plus que {timeLeft.hours}h {timeLeft.minutes}min !</span>
            </div>

            {/* Main headline with conversion focus */}
            <h1 className="font-black text-4xl md:text-6xl lg:text-8xl mb-6 bg-gradient-to-r from-yellow-300 via-green-300 to-emerald-300 bg-clip-text text-transparent leading-tight">
              L'AVENIR DIGITAL
              <br />
              COMMENCE ICI
            </h1>
            
            {/* Value proposition */}
            <div className="mt-8 mb-10 text-xl md:text-2xl text-green-100 max-w-4xl mx-auto leading-relaxed font-semibold">
              <p className="mb-4">
                <strong className="text-yellow-300">Transformation Digitale Ultra-Rapide</strong> pour Entrepreneurs Ambitieux
              </p>
              <p>
                Solutions web <strong className="text-green-300">RÉVOLUTIONNAIRES</strong> qui 
                <strong className="text-yellow-300"> MULTIPLIENT</strong> vos ventes par 3 en 30 jours !
              </p>
            </div>

            {/* Social proof */}
            <div className="flex justify-center items-center mb-8 space-x-6 text-green-200">
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium">+2,847 sites créés ce mois</span>
              </div>
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-medium">4.9/5 étoiles • 1,247 avis</span>
              </div>
            </div>

            {/* Price comparison */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 mb-10 max-w-2xl mx-auto border border-green-400/30">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-red-400 line-through text-2xl font-bold mb-2">1,999€</div>
                  <div className="text-gray-400 text-sm">Prix agence traditionnelle</div>
                </div>
                <div>
                  <div className="text-green-400 text-4xl font-black mb-2">399€</div>
                  <div className="text-green-300 text-sm font-bold">NOTRE PRIX IA</div>
                </div>
              </div>
              <div className="text-center mt-4">
                <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                  ÉCONOMISEZ 1,600€ !
                </span>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="mt-10 mb-16">
              <Link
                href="https://core-platform-staging-6q06uxlwl-emmanuelclarisse-6154s-projects.vercel.app/demande-publique"
                className="group inline-flex items-center px-12 py-6 text-xl font-black text-green-900 bg-gradient-to-r from-yellow-400 to-green-400 hover:from-yellow-300 hover:to-green-300 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 animate-pulse"
              >
                <span>💰 MULTIPLIER MES VENTES MAINTENANT</span>
                <svg className="w-6 h-6 ml-3 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              {/* Secondary CTA */}
              <div className="mt-4">
                <button className="text-green-300 underline text-lg font-semibold hover:text-green-200 transition-colors duration-300">
                  🎬 Voir la démonstration vidéo (2 min)
                </button>
              </div>
            </div>

            {/* Hero Image placeholder with money effects */}
            <div className="relative mt-16">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-yellow-400/30 rounded-3xl filter blur-2xl transform scale-110"></div>
              <div className="relative bg-gradient-to-br from-green-800 to-emerald-800 rounded-2xl p-8 shadow-2xl border-4 border-yellow-400/50">
                <div className="text-center">
                  <div className="text-6xl mb-4">📈</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Résultats Clients Réels</h3>
                  <p className="text-green-300">+847% de ROI en moyenne</p>
                </div>
              </div>
              
              {/* Money floating elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-green-900 font-black text-xl animate-bounce shadow-lg">
                €
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-full flex items-center justify-center text-green-900 font-black text-2xl animate-bounce delay-500 shadow-lg">
                $
              </div>
            </div>

            {/* Guarantees */}
            <div className="flex justify-center items-center mt-12 space-x-8 text-sm text-green-300">
              <div className="flex items-center bg-green-800/50 rounded-full px-4 py-2 shadow-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span>✅ Garantie 30 jours</span>
              </div>
              <div className="flex items-center bg-green-800/50 rounded-full px-4 py-2 shadow-sm">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse delay-300"></div>
                <span>⚡ Livraison 25 minutes</span>
              </div>
              <div className="flex items-center bg-green-800/50 rounded-full px-4 py-2 shadow-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse delay-600"></div>
                <span>🔒 Support 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof Section */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-green-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-yellow-400/90 text-green-900 rounded-full px-6 py-2 mb-6 font-bold text-sm">
              <div className="w-3 h-3 bg-green-600 rounded-full mr-2 animate-pulse"></div>
              SYSTÈME PROUVÉ POUR GÉNÉRER DES VENTES
            </div>
            <h2 className="font-black text-4xl md:text-5xl text-white mb-6">
              📈 RÉSULTATS CLIENTS RÉELS
            </h2>
            <div className="w-32 h-2 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { company: "Boulangerie Martin", before: "2", after: "47", metric: "clients/jour", increase: "+2,250%" },
              { company: "Garage Dupont", before: "850€", after: "3,200€", metric: "CA mensuel", increase: "+276%" },
              { company: "Coiffure Sophie", before: "12%", after: "68%", metric: "taux conversion", increase: "+467%" }
            ].map((result, index) => (
              <div key={index} className="bg-gradient-to-br from-green-800 to-emerald-800 rounded-3xl p-8 shadow-2xl border-2 border-yellow-400/30 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
                <div className="text-center">
                  <div className="text-green-300 font-semibold text-sm mb-4">{result.company}</div>
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <div className="text-red-400 line-through text-2xl font-bold">{result.before}</div>
                    <div className="text-yellow-400 text-3xl">→</div>
                    <div className="text-green-400 text-3xl font-black">{result.after}</div>
                  </div>
                  <div className="text-gray-400 text-sm mb-3">{result.metric}</div>
                  <div className="bg-black/40 rounded-xl p-3">
                    <div className="text-yellow-400 font-bold text-xl">{result.increase}</div>
                    <div className="text-green-300 text-xs">d'augmentation</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-16 bg-yellow-400/10 rounded-2xl p-8 border border-yellow-400/20 max-w-4xl mx-auto">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-yellow-400 mx-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <blockquote className="text-xl text-white mb-6 italic font-semibold text-center">
              "J'ai récupéré mon investissement en 11 jours ! Mon chiffre d'affaires a explosé grâce au nouveau site. 
              C'est du jamais vu dans notre secteur !"
            </blockquote>
            <cite className="text-yellow-400 font-bold text-center block">Thomas Durand, Restaurant La Table d'Or</cite>
          </div>
        </div>
      </section>

      {/* Final Urgency CTA */}
      <section className="py-16 bg-gradient-to-r from-red-900 to-orange-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-black text-white mb-4">
              ⏰ DERNIÈRE CHANCE !
            </h3>
            <p className="text-xl text-red-200 mb-8">
              Ne laissez pas vos concurrents prendre votre place. Agissez MAINTENANT !
            </p>
            
            {/* Timer countdown */}
            <div className="bg-black/50 rounded-2xl p-6 mb-8 inline-block">
              <div className="flex items-center space-x-4 text-white">
                <svg className="w-6 h-6 text-red-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-2xl font-bold">
                  {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                </div>
                <span className="text-red-300">avant expiration</span>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="https://core-platform-staging-6q06uxlwl-emmanuelclarisse-6154s-projects.vercel.app/demande-publique"
                className="group inline-flex items-center px-12 py-6 text-xl font-black text-green-900 bg-gradient-to-r from-yellow-400 to-green-400 hover:from-yellow-300 hover:to-green-300 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 animate-pulse"
              >
                <span>🚀 RÉSERVER MA PLACE MAINTENANT</span>
                <svg className="w-6 h-6 ml-3 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <div className="text-sm text-red-200">
                ⚠️ <strong>Plus que 3 places disponibles</strong> à ce prix exceptionnel
              </div>
              
              <Link
                href="/demo"
                className="block text-yellow-300 underline hover:text-yellow-200 transition-colors duration-300 mt-4"
              >
                ← Comparer avec d'autres templates
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}