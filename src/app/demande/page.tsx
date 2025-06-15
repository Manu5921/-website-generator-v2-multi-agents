'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DemandePage() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    entreprise: '',
    ville: '',
    telephone: '',
    slogan: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/demandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setIsSubmitted(true);
      } else {
        throw new Error(result.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi de votre demande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Demande envoyée !
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Merci pour votre demande. Nous vous contacterons sous 24h avec un lien de paiement sécurisé.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">📋 Prochaines étapes :</h3>
            <ul className="text-sm text-green-700 text-left space-y-1">
              <li>• Analyse de votre demande (24h)</li>
              <li>• Envoi du lien de paiement par email</li>
              <li>• Création de votre site (48h après paiement)</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Prix :</strong> 399€ (création) + 29€/mois (maintenance)
            </p>
          </div>
          
          <Link 
            href="https://site-2s3lynwjz-emmanuelclarisse-6154s-projects.vercel.app"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-block"
          >
            🏠 Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="https://site-2s3lynwjz-emmanuelclarisse-6154s-projects.vercel.app" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
            ← Retour à l'accueil
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📝 Demander votre site web
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Remplissez ce formulaire simple et nous créerons votre site web professionnel.
          </p>
        </div>

        {/* Prix */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
            <h3 className="text-center font-bold text-gray-900 mb-4">💰 Tarification</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">399€</div>
              <div className="text-sm text-gray-600 mb-4">Création du site (paiement unique)</div>
              <div className="text-xl font-semibold text-blue-600 mb-2">+ 29€/mois</div>
              <div className="text-sm text-gray-600">Maintenance et hébergement</div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  required
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Jean Dupont"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="jean@exemple.fr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  name="entreprise"
                  required
                  value={formData.entreprise}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Mon Restaurant"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville d'activité *
                </label>
                <input
                  type="text"
                  name="ville"
                  required
                  value={formData.ville}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Paris"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                name="telephone"
                required
                value={formData.telephone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="01 23 45 67 89"
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slogan de l'entreprise (optionnel)
              </label>
              <textarea
                name="slogan"
                rows={3}
                value={formData.slogan}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Décrivez votre entreprise en quelques mots..."
              />
            </div>

            {/* Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>📝 Note :</strong> Notre équipe analysera votre demande et choisira le secteur d'activité 
                et le style de design le plus adapté à votre entreprise.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Envoi en cours...
                </span>
              ) : (
                '📝 Envoyer ma demande'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}