'use client';
import Link from 'next/link';

export default function ModerneTechDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 text-center border-b border-indigo-500">
        <div className="container mx-auto px-4">
          <p className="text-sm font-semibold">
            🚀 Aperçu Template "Moderne Tech" - Style SaaS Premium & Innovations
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Glassmorphism background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500/30 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/30 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/20 rounded-full filter blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M0 0h40v1H0zm0 39h40v1H0z'/%3E%3Cpath d='M0 0v40h1V0zm39 0v40h1V0z'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Innovation badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-indigo-400/30">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-ping"></div>
              <span className="text-cyan-300 font-semibold text-sm">⚡ Innovation Technologique 2025</span>
            </div>

            {/* Main title with tech gradient */}
            <h1 className="font-bold text-5xl md:text-7xl lg:text-8xl mb-8 bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent leading-tight">
              L'Avenir Digital
              <br />
              <span className="text-4xl md:text-6xl lg:text-7xl">Commence Ici</span>
            </h1>

            {/* Subtitle with glassmorphism */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-12 border border-white/20 shadow-2xl">
              <p className="text-xl md:text-2xl text-indigo-100 leading-relaxed font-medium">
                Solutions digitales <strong className="text-cyan-300">ultra-modernes</strong> pour startups et entreprises innovantes.
                <br />
                <span className="text-purple-300">Intelligence artificielle • Design premium • Performance extrême</span>
              </p>
            </div>

            {/* Tech stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              {[
                { metric: "99.9%", label: "Uptime Garanti", icon: "⚡" },
                { metric: "<100ms", label: "Temps de Réponse", icon: "🚀" },
                { metric: "AI-Powered", label: "Technologies IA", icon: "🤖" }
              ].map((stat, index) => (
                <div key={index} className="bg-gradient-to-br from-indigo-800/40 to-purple-800/40 backdrop-blur-sm rounded-xl p-6 border border-indigo-400/30 hover:border-cyan-400/50 transition-all duration-300">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-black text-cyan-300 mb-1">{stat.metric}</div>
                  <div className="text-indigo-200 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="space-y-6">
              <Link
                href="https://core-platform-staging-6q06uxlwl-emmanuelclarisse-6154s-projects.vercel.app/demande-publique"
                className="group inline-flex items-center px-10 py-5 text-lg font-bold text-indigo-900 bg-gradient-to-r from-cyan-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 rounded-full shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
              >
                <span>Lancer Mon Projet Tech</span>
                <svg className="w-5 h-5 ml-3 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <div className="text-indigo-300 text-sm font-medium">
                🎯 <strong className="text-cyan-300">399€ TTC</strong> • Livraison en 25 minutes • Technologie de pointe
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Technologies d'Avant-Garde
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Intelligence Artificielle",
                desc: "Chatbots IA conversationnels et recommandations personnalisées en temps réel",
                icon: "🤖",
                tech: "OpenAI GPT-4 • Claude • Machine Learning"
              },
              {
                title: "Performance Extrême",
                desc: "Architecture cloud-native avec CDN global et optimisations automatiques",
                icon: "⚡",
                tech: "Next.js 15 • Vercel Edge • Micro-frontends"
              },
              {
                title: "Design Système",
                desc: "Interface utilisateur cohérente avec composants modulaires et animations fluides",
                icon: "🎨",
                tech: "Design Tokens • Storybook • Framer Motion"
              },
              {
                title: "Sécurité Avancée",
                desc: "Chiffrement end-to-end, authentification multi-facteurs et conformité RGPD",
                icon: "🛡️",
                tech: "OAuth 2.0 • JWT • Encryption AES-256"
              },
              {
                title: "Analytics Prédictives",
                desc: "Tableaux de bord en temps réel avec IA prédictive et insights automatiques",
                icon: "📊",
                tech: "BigQuery • Tableau • Predictive ML"
              },
              {
                title: "Scalabilité Infinie",
                desc: "Architecture microservices auto-scalante supportant millions d'utilisateurs",
                icon: "🚀",
                tech: "Kubernetes • Docker • Serverless"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="bg-gradient-to-br from-indigo-800/30 to-purple-800/30 backdrop-blur-sm rounded-2xl p-8 border border-indigo-400/20 hover:border-cyan-400/40 transform hover:-translate-y-2 transition-all duration-500 h-full">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-purple-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    {/* Icon with glassmorphism */}
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-400/20 to-indigo-400/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl mb-6 border border-cyan-400/30 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-indigo-200 leading-relaxed mb-6">
                      {feature.desc}
                    </p>

                    {/* Tech stack badge */}
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="text-xs text-cyan-300 font-mono">
                        {feature.tech}
                      </div>
                    </div>
                  </div>

                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 border-t border-indigo-700/50">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-indigo-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-indigo-400/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              Prêt pour l'Innovation ?
            </h3>
            <p className="text-indigo-200 mb-6">
              Rejoignez les startups qui font confiance à notre technologie de pointe
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center text-cyan-300 hover:text-cyan-200 font-semibold transition-colors duration-300"
            >
              ← Comparer avec d'autres templates
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}