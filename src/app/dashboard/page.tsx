'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Demande {
  id: string;
  nom: string;
  email: string;
  entreprise: string;
  ville: string;
  telephone: string;
  slogan: string;
  dateCreation: string;
  statut: 'nouvelle' | 'en_cours' | 'site_genere' | 'livree' | 'annulee';
  notes: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingStripe, setTestingStripe] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchDemandes();
    }
  }, [session]);

  const fetchDemandes = async () => {
    try {
      const response = await fetch('/api/demandes');
      const data = await response.json();
      
      if (data.success) {
        setDemandes(data.demandes);
      }
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'nouvelle': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800';
      case 'site_genere': return 'bg-green-100 text-green-800';
      case 'livree': return 'bg-emerald-100 text-emerald-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutText = (statut: string) => {
    switch (statut) {
      case 'nouvelle': return '🆕 Nouvelle';
      case 'en_cours': return '⏳ En cours';
      case 'site_genere': return '✅ Site généré';
      case 'livree': return '🚀 Livrée';
      case 'annulee': return '❌ Annulée';
      default: return statut;
    }
  };

  const createStripePayment = async (demandeId: string) => {
    setTestingStripe(demandeId);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ demandeId, amount: 50 }), // 0.5€ de test
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Lien de paiement STRIPE créé!\n\nURL: ${result.commande.lienPaiement}\n\nUtilisez la carte test : 4242 4242 4242 4242`);
        fetchDemandes();
      } else {
        alert(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur création paiement Stripe:', error);
      alert('❌ Erreur lors de la création du lien de paiement');
    } finally {
      setTestingStripe(null);
    }
  };

  const openStripeDirectLink = async (demandeId: string) => {
    setTestingStripe(demandeId);
    
    try {
      // Redirection directe vers le lien Stripe fonctionnel
      const stripeUrl = 'https://buy.stripe.com/test_9B6dRbc1v44Xg6j2V46kg00';
      
      // Ouvrir dans un nouvel onglet
      window.open(stripeUrl, '_blank');
      
      // Afficher un message informatif
      alert(`🔶 Test STRIPE ouvert dans un nouvel onglet !\n\n💳 Utilisez la carte test : 4242 4242 4242 4242\n📅 Date : 12/25\n🔒 CVC : 123\n\nMontant : 1€ (test)`);
      
    } catch (error) {
      console.error('Erreur test Stripe:', error);
      alert('❌ Erreur lors de l\'ouverture du test Stripe');
    } finally {
      setTestingStripe(null);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📊 Dashboard Admin
              </h1>
              <p className="text-gray-600">
                Bienvenue, {session.user?.name}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="https://site-2s3lynwjz-emmanuelclarisse-6154s-projects.vercel.app"
                className="text-gray-600 hover:text-gray-900"
              >
                🏠 Accueil
              </Link>
              <button 
                onClick={() => router.push('/api/auth/signout')}
                className="text-red-600 hover:text-red-700"
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {demandes.length}
            </div>
            <div className="text-gray-600">Total demandes</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {demandes.filter(d => d.statut === 'nouvelle').length}
            </div>
            <div className="text-gray-600">Nouvelles</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {demandes.filter(d => d.statut === 'site_genere').length}
            </div>
            <div className="text-gray-600">Sites générés</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-emerald-600 mb-2">
              {demandes.filter(d => d.statut === 'livree').length}
            </div>
            <div className="text-gray-600">Livrées</div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">⚡ Actions rapides</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors">
                🔶 Paiement Stripe
              </button>
              <button className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors">
                🌐 Générer site web
              </button>
              <button className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                📧 Envoyer email
              </button>
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">📋 Demandes clients</h2>
          </div>
          
          {demandes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">📭</div>
              <p>Aucune demande pour le moment.</p>
              <Link 
                href="/demande"
                className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
              >
                Tester le formulaire client →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Client</th>
                    <th className="text-left p-4 font-medium text-gray-700">Entreprise</th>
                    <th className="text-left p-4 font-medium text-gray-700">Contact</th>
                    <th className="text-left p-4 font-medium text-gray-700">Date</th>
                    <th className="text-left p-4 font-medium text-gray-700">Statut</th>
                    <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {demandes.map((demande) => (
                    <tr key={demande.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">{demande.nom}</div>
                          <div className="text-sm text-gray-500">{demande.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">{demande.entreprise}</div>
                          <div className="text-sm text-gray-500">{demande.ville}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900">{demande.telephone}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900">
                          {new Date(demande.dateCreation).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(demande.statut)}`}>
                          {getStatutText(demande.statut)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            👁️ Voir
                          </button>
                          <button 
                            onClick={() => createStripePayment(demande.id)}
                            disabled={testingStripe === demande.id || demande.statut !== 'nouvelle'}
                            className="text-orange-600 hover:text-orange-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {testingStripe === demande.id ? '⏳' : '💳'} Payer
                          </button>
                          <button 
                            onClick={() => openStripeDirectLink(demande.id)}
                            disabled={testingStripe === demande.id || demande.statut !== 'nouvelle'}
                            className="text-orange-600 hover:text-orange-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {testingStripe === demande.id ? '⏳' : '🔶'} Test
                          </button>
                          <button className="text-purple-600 hover:text-purple-700 text-sm">
                            🌐 Générer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}