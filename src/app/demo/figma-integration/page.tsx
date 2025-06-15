'use client';
import { useState } from 'react';
import Link from 'next/link';

interface TemplateCustomization {
  businessName: string;
  sector: 'restaurant' | 'artisan' | 'ecommerce' | 'saas' | 'service';
  content: {
    hero: {
      title: string;
      subtitle: string;
      cta: string;
    };
    about?: string;
    services?: Array<{
      name: string;
      description: string;
      icon?: string;
    }>;
    contact: {
      phone: string;
      email: string;
      address?: string;
    };
  };
}

export default function FigmaIntegrationDemo() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<TemplateCustomization>({
    businessName: 'Restaurant Le Gourmet',
    sector: 'restaurant',
    content: {
      hero: {
        title: 'Bienvenue au Restaurant Le Gourmet',
        subtitle: 'Une expérience culinaire exceptionnelle dans un cadre authentique',
        cta: 'Réserver une table'
      },
      about: 'Depuis 15 ans, notre restaurant vous propose une cuisine française raffinée préparée avec des ingrédients frais et locaux.',
      services: [
        {
          name: 'Menu Dégustation',
          description: 'Découvrez notre sélection de plats signature',
          icon: '🍽️'
        },
        {
          name: 'Événements Privés',
          description: 'Organisation de vos événements spéciaux',
          icon: '🎉'
        },
        {
          name: 'Traiteur',
          description: 'Service traiteur pour vos réceptions',
          icon: '🥂'
        }
      ],
      contact: {
        phone: '01 23 45 67 89',
        email: 'contact@legourmet.fr',
        address: '123 Rue de la Gastronomie, 75001 Paris'
      }
    }
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedTemplate(null);

    try {
      const response = await fetch('/api/figma/generate-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateType: formData.sector.toUpperCase(),
          customization: formData
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la génération');
      }

      if (result.success) {
        setGeneratedTemplate(result.template.code);
      } else {
        throw new Error(result.error || 'Génération échouée');
      }

    } catch (err) {
      console.error('Erreur génération:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">🎨 Figma Integration Demo</h1>
              <p className="text-purple-200 mt-2">
                Génération automatique de templates depuis Figma API
              </p>
            </div>
            <Link
              href="/demo"
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ← Retour aux démos
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Formulaire de Configuration */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Configuration du Template
            </h2>

            <div className="space-y-6">
              {/* Informations Business */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => updateFormData('businessName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Mon Restaurant"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Secteur d'activité
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => updateFormData('sector', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="artisan">Artisan</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="saas">SaaS</option>
                  <option value="service">Service</option>
                </select>
              </div>

              {/* Section Hero */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Section Hero</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre principal
                    </label>
                    <input
                      type="text"
                      value={formData.content.hero.title}
                      onChange={(e) => updateFormData('content.hero.title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Titre accrocheur"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sous-titre
                    </label>
                    <textarea
                      value={formData.content.hero.subtitle}
                      onChange={(e) => updateFormData('content.hero.subtitle', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Description de votre activité"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bouton d'action
                    </label>
                    <input
                      type="text"
                      value={formData.content.hero.cta}
                      onChange={(e) => updateFormData('content.hero.cta', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Contactez-nous"
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      value={formData.content.contact.phone}
                      onChange={(e) => updateFormData('content.contact.phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="01 23 45 67 89"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.content.contact.email}
                      onChange={(e) => updateFormData('content.contact.email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="contact@monentreprise.fr"
                    />
                  </div>
                </div>
              </div>

              {/* Bouton Génération */}
              <div className="border-t pt-6">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Génération en cours...
                    </div>
                  ) : (
                    '🚀 Générer le Template Figma'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Résultat */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Template Généré
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="text-red-600 mr-3">❌</div>
                  <div>
                    <h3 className="text-red-800 font-semibold">Erreur de génération</h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {generatedTemplate && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-green-600 mr-3">✅</div>
                    <div>
                      <h3 className="text-green-800 font-semibold">Template généré avec succès !</h3>
                      <p className="text-green-700 text-sm mt-1">
                        Code React généré depuis le design Figma
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                    {generatedTemplate}
                  </pre>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedTemplate)}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    📋 Copier le Code
                  </button>
                  
                  <button
                    onClick={() => {
                      const blob = new Blob([generatedTemplate], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${formData.businessName.replace(/\\s+/g, '')}-template.tsx`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    💾 Télécharger
                  </button>
                </div>
              </div>
            )}

            {!generatedTemplate && !error && !isGenerating && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Prêt à générer votre template
                </h3>
                <p className="text-gray-600">
                  Remplissez le formulaire et cliquez sur "Générer" pour créer votre template personnalisé depuis Figma
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🚀 Avantage Concurrentiel Figma API
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Génération Ultra-Rapide</h3>
              <p className="text-gray-600 text-sm">
                Templates générés en quelques secondes depuis vos designs Figma
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-semibold text-gray-900 mb-2">Design Professionnel</h3>
              <p className="text-gray-600 text-sm">
                Qualité agence avec assets, couleurs et typographies authentiques
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">🔥</div>
              <h3 className="font-semibold text-gray-900 mb-2">Différenciation Marché</h3>
              <p className="text-gray-600 text-sm">
                Seule plateforme française avec intégration Figma automatisée
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}