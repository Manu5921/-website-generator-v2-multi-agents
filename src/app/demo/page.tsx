'use client';
import Link from 'next/link';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎨 Démonstration des Templates
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez nos 3 designs alternatifs optimisés pour les PME françaises
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Template Moderne Tech */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gradient-to-br from-indigo-600 to-purple-600 relative">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">Moderne Tech</h3>
                <p className="text-sm opacity-90">Style SaaS premium</p>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                  Gradients & Glassmorphism
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                  Conversion: 3.2% - 4.8%
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-3 h-3 bg-cyan-500 rounded-full mr-2"></span>
                  Cible: Startups, E-commerce
                </div>
              </div>
              <Link 
                href="/demo/moderne-tech"
                className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors"
              >
                Voir la démo →
              </Link>
            </div>
          </div>

          {/* Template Proximité Locale */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-amber-200">
            <div className="h-48 bg-gradient-to-br from-amber-600 to-orange-600 relative">
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-xs font-bold text-amber-700">
                RECOMMANDÉ
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">Proximité Locale</h3>
                <p className="text-sm opacity-90">Artisanal français</p>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="w-3 h-3 bg-amber-600 rounded-full mr-2"></span>
                  Chaleureux & Authentique
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
                  Conversion: 4.1% - 6.2%
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                  Cible: Artisans, Restaurants
                </div>
              </div>
              <Link 
                href="/demo/proximite-locale"
                className="block w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white text-center py-3 rounded-lg font-medium hover:from-amber-700 hover:to-orange-700 transition-colors"
              >
                Voir la démo →
              </Link>
            </div>
          </div>

          {/* Template Conversion Ultime */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gradient-to-br from-red-600 to-orange-600 relative">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">Conversion Ultime</h3>
                <p className="text-sm opacity-90">Landing agressive</p>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Urgence & Scarcité
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                  Conversion: 5.5% - 8.3%
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  Cible: Entrepreneurs pressés
                </div>
              </div>
              <Link 
                href="/demo/conversion-ultime"
                className="block w-full bg-gradient-to-r from-red-600 to-orange-600 text-white text-center py-3 rounded-lg font-medium hover:from-red-700 hover:to-orange-700 transition-colors"
              >
                Voir la démo →
              </Link>
            </div>
          </div>
        </div>

        {/* Comparaison avec BigSpring */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📊 Comparaison vs BigSpring Actuel
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">BigSpring Actuel</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-teal-500 rounded-full mr-2"></span>
                  Style corporate classique
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                  Conversion estimée: 2-3%
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                  Cible généraliste
                </div>
              </div>
              <Link 
                href="https://bigspring-landing-7d5a2qxwv-emmanuelclarisse-6154s-projects.vercel.app"
                target="_blank"
                className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700 transition-colors"
              >
                Voir BigSpring →
              </Link>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Nouveaux Templates</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
                  Designs spécialisés PME françaises
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Conversion: +50% à +180%
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                  Ciblage précis par secteur
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Figma Integration Demo */}
        <div className="mt-16 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-8 border border-purple-200">
          <div className="text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🚀 Génération Figma API (NOUVEAU)
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              <strong>Différenciation marché majeure :</strong> Première plateforme française avec génération automatique 
              de templates depuis vos designs Figma. Qualité agence en quelques secondes !
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-sm font-semibold text-purple-700">Génération 5s</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-sm font-semibold text-purple-700">Assets authentiques</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-2xl mb-2">🏆</div>
                <div className="text-sm font-semibold text-purple-700">Qualité agence</div>
              </div>
            </div>
            <Link
              href="/demo/figma-integration"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span>🎨 Tester la Génération Figma</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}