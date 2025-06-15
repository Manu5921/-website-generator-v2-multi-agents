import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🌐 Website Generator Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Plateforme complète de génération automatique de sites web professionnels 
            avec paiement et maintenance intégrés.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Client Interface */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="text-center">
              <div className="text-4xl mb-4">👤</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Interface Client
              </h2>
              <p className="text-gray-600 mb-6">
                Formulaire simple pour que les clients puissent demander 
                leur site web professionnel.
              </p>
              <Link 
                href="/demande"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-block"
              >
                📝 Demander un site
              </Link>
            </div>
          </div>

          {/* Admin Dashboard */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="text-center">
              <div className="text-4xl mb-4">⚙️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Dashboard Admin
              </h2>
              <p className="text-gray-600 mb-6">
                Interface complète pour gérer les demandes, paiements 
                et génération des sites.
              </p>
              <Link 
                href="/dashboard"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
              >
                🔧 Accès admin
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ✨ Fonctionnalités
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-4">🔶</div>
              <h4 className="font-semibold text-gray-900 mb-2">Paiement Stripe</h4>
              <p className="text-gray-600">Solution de paiement sécurisée</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-4">🤖</div>
              <h4 className="font-semibold text-gray-900 mb-2">Génération Auto</h4>
              <p className="text-gray-600">Sites professionnels par secteur</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-4">📊</div>
              <h4 className="font-semibold text-gray-900 mb-2">Dashboard</h4>
              <p className="text-gray-600">Gestion complète des clients</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Système 100% opérationnel avec Stripe
          </div>
        </div>
      </div>
    </div>
  );
}
