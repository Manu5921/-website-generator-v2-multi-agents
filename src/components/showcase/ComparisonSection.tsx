'use client';

import { useState } from 'react';

interface ComparisonData {
  category: string;
  generic: {
    score: number;
    description: string;
    issues: string[];
  };
  designAI: {
    score: number;
    description: string;
    benefits: string[];
  };
}

export function ComparisonSection() {
  const [activeComparison, setActiveComparison] = useState<'design' | 'performance' | 'conversion'>('design');

  const comparisonData: Record<string, ComparisonData> = {
    design: {
      category: 'Qualité Design',
      generic: {
        score: 3,
        description: 'Templates génériques basiques',
        issues: [
          'Design standardisé sans personnalité',
          'Couleurs et typographies limitées',
          'Layouts rigides et datés',
          'Aucune adaptation sectorielle',
          'Effet "déjà vu" garanti'
        ]
      },
      designAI: {
        score: 9,
        description: 'Design IA premium sur-mesure',
        benefits: [
          'Design unique adapté à votre secteur',
          'Palette de couleurs psychologiquement optimisée',
          'Layouts modernes et flexibles',
          'Personnalisation poussée par IA',
          'Effet "waouh" garanti'
        ]
      }
    },
    performance: {
      category: 'Performance Technique',
      generic: {
        score: 4,
        description: 'Performance moyenne du marché',
        issues: [
          'Temps de chargement lent (3-5s)',
          'Score Lighthouse faible (60-75)',
          'Code non optimisé et lourd',
          'Responsive approximatif',
          'SEO basique mal configuré'
        ]
      },
      designAI: {
        score: 10,
        description: 'Performance optimisée par IA',
        benefits: [
          'Chargement ultra-rapide (0.5-0.9s)',
          'Score Lighthouse excellent (95+)',
          'Code clean et optimisé automatiquement',
          'Responsive parfait tous écrans',
          'SEO technique avancé intégré'
        ]
      }
    },
    conversion: {
      category: 'Taux de Conversion',
      generic: {
        score: 2,
        description: 'Conversion standard décevante',
        issues: [
          'CTA mal positionnés et peu visibles',
          'Parcours utilisateur confus',
          'Formulaires longs et rebutants',
          'Absence de social proof',
          'Taux de conversion faible (1-2%)'
        ]
      },
      designAI: {
        score: 9,
        description: 'Conversion optimisée par IA',
        benefits: [
          'CTA optimisés par machine learning',
          'UX pensée pour la conversion',
          'Formulaires intelligents adaptatifs',
          'Social proof intégré stratégiquement',
          'Taux de conversion élevé (4-8%)'
        ]
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const currentData = comparisonData[activeComparison];

  return (
    <div className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ⚡ Notre Avantage Concurrentiel
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Découvrez pourquoi nos templates générés par IA surpassent largement 
            les solutions génériques du marché.
          </p>
        </div>

        {/* Onglets de comparaison */}
        <div className="flex justify-center mb-12">
          <div className="bg-white bg-opacity-10 rounded-2xl p-2 backdrop-blur-sm">
            <div className="flex gap-2">
              {Object.entries(comparisonData).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setActiveComparison(key as any)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeComparison === key
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  {data.category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comparaison visuelle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Côté Générique */}
          <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">😞</div>
              <h3 className="text-2xl font-bold text-red-400 mb-2">Solutions Génériques</h3>
              <p className="text-gray-300">{currentData.generic.description}</p>
            </div>

            {/* Score */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Score global</span>
                <span className={`text-2xl font-bold ${getScoreColor(currentData.generic.score)}`}>
                  {currentData.generic.score}/10
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${getScoreBarColor(currentData.generic.score)}`}
                  style={{ width: `${currentData.generic.score * 10}%` }}
                ></div>
              </div>
            </div>

            {/* Problèmes */}
            <div>
              <h4 className="font-semibold text-red-400 mb-4">❌ Principales limitations:</h4>
              <div className="space-y-3">
                {currentData.generic.issues.map((issue, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Côté Design IA */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            
            {/* Effet de brillance */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            
            <div className="text-center mb-8 relative">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-2">Design IA Premium</h3>
              <p className="text-blue-100">{currentData.designAI.description}</p>
            </div>

            {/* Score */}
            <div className="mb-8 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-white">Score global</span>
                <span className={`text-2xl font-bold ${getScoreColor(currentData.designAI.score)} text-white`}>
                  {currentData.designAI.score}/10
                </span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-white shadow-lg"
                  style={{ width: `${currentData.designAI.score * 10}%` }}
                ></div>
              </div>
            </div>

            {/* Avantages */}
            <div className="relative">
              <h4 className="font-semibold text-white mb-4">✨ Avantages exclusifs:</h4>
              <div className="space-y-3">
                {currentData.designAI.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-blue-100 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats de comparaison globales */}
        <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
          <h3 className="text-2xl font-bold text-center mb-8">📊 Résultats comparatifs mesurés</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">+287%</div>
              <div className="text-sm text-gray-300">Amélioration conversion</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">-73%</div>
              <div className="text-sm text-gray-300">Temps de chargement</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">+156%</div>
              <div className="text-sm text-gray-300">Engagement utilisateur</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">98%</div>
              <div className="text-sm text-gray-300">Satisfaction client</div>
            </div>
          </div>
        </div>

        {/* Témoignages */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-12">💬 Ce que disent nos clients</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Pierre Dubois",
                business: "Restaurant Le Délice",
                quote: "Après 3 mois avec le template IA, nos réservations en ligne ont augmenté de 340%. L'effet waouh est réel !",
                rating: 5
              },
              {
                name: "Sophie Martin",
                business: "Salon Élégance",
                quote: "Nos clientes adorent le design. On dirait qu'on a fait appel à une agence parisienne premium !",
                rating: 5
              },
              {
                name: "Marc Lefebvre",
                business: "Cabinet Médical",
                quote: "Le système de prise de RDV intelligent a révolutionné notre organisation. Gain de temps énorme.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">⭐</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.business}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-black">
            <h3 className="text-2xl font-bold mb-4">
              🎯 Prêt à dominer votre concurrence ?
            </h3>
            <p className="mb-6">
              Rejoignez les 500+ professionnels qui ont choisi l'excellence du Design IA
            </p>
            <button className="bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105">
              Démarrer maintenant - Garanti satisfait
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}