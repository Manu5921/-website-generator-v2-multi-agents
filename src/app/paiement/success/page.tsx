'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Optionnel: récupérer les détails du checkout
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Animation de succès */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Paiement réussi !
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Merci pour votre confiance. Nous allons maintenant créer votre site web.
          </p>
        </div>

        {/* Détails du paiement */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-green-800 mb-4">✅ Votre commande</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-green-700">Création du site web</span>
              <span className="font-semibold text-green-800">399€</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700">Maintenance mensuelle</span>
              <span className="font-semibold text-green-800">29€/mois</span>
            </div>
            <hr className="border-green-200" />
            <div className="flex justify-between items-center font-semibold">
              <span className="text-green-800">Total payé aujourd'hui</span>
              <span className="text-green-800">399€</span>
            </div>
          </div>
        </div>

        {/* Prochaines étapes */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">📋 Prochaines étapes</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">1</div>
              <div>
                <p className="font-medium text-blue-800">Génération automatique</p>
                <p className="text-sm text-blue-600">Votre site est en cours de création (sous 2h)</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">2</div>
              <div>
                <p className="font-medium text-blue-800">Email de livraison</p>
                <p className="text-sm text-blue-600">Vous recevrez l'URL de votre site par email</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">3</div>
              <div>
                <p className="font-medium text-blue-800">Site en ligne</p>
                <p className="text-sm text-blue-600">Votre site sera accessible à tous vos clients</p>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance info */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">🔧 Maintenance incluse</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="flex items-center text-amber-700">
                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                Mises à jour sécurité
              </p>
              <p className="flex items-center text-amber-700">
                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                Sauvegarde automatique
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex items-center text-amber-700">
                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                Support technique
              </p>
              <p className="flex items-center text-amber-700">
                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                Modifications mineures
              </p>
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-4">
            Le premier prélèvement de maintenance (29€) aura lieu dans 30 jours.
          </p>
        </div>

        {/* Contact */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600 mb-4">
            Questions ? Contactez-nous à{' '}
            <a href="mailto:support@website-generator.com" className="text-green-600 hover:text-green-700">
              support@website-generator.com
            </a>
          </p>
          
          <Link 
            href="https://site-2s3lynwjz-emmanuelclarisse-6154s-projects.vercel.app"
            className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            🏠 Retour à l'accueil
          </Link>
        </div>

        {/* Debug info en développement */}
        {process.env.NODE_ENV === 'development' && sessionId && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-xs text-gray-600 mb-2">Debug (dev only):</p>
            <p className="text-xs font-mono text-gray-800">Session ID: {sessionId}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaiementSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Chargement...</p>
      </div>
    </div>}>
      <SuccessContent />
    </Suspense>
  );
}