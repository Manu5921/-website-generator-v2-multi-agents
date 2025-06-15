/**
 * 💳 STRIPE CLIENT - Alternative pour tests
 */

import Stripe from 'stripe';

export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export interface CreateStripeCheckoutRequest {
  clientEmail: string;
  clientNom: string;
  entreprise: string;
  demandeId: string;
  amount: number; // En centimes (ex: 50 pour 0.5€)
  currency?: string;
  secteur?: string; // Secteur business pour déclenchement automatique du workflow
  ville?: string;
  telephone?: string;
  slogan?: string;
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
}

/**
 * Créer une session de checkout Stripe de production (399€)
 */
export async function createStripeProductionCheckout(data: CreateStripeCheckoutRequest): Promise<StripeCheckoutSession> {
  try {
    console.log(`💳 Création checkout PRODUCTION pour ${data.entreprise} - ${data.amount / 100}€`);

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: data.currency || 'eur',
            product_data: {
              name: `Site Web Professionnel - ${data.entreprise}`,
              description: `Création de site web ${data.secteur || 'professionnel'} avec workflow automatisé de 25 minutes`,
              images: ['https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Site+Web+Pro'],
            },
            unit_amount: data.amount, // Montant en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: data.clientEmail,
      payment_intent_data: {
        metadata: {
          demandeId: data.demandeId,
          type: 'production',
          entreprise: data.entreprise,
          clientNom: data.clientNom,
          secteur: data.secteur || 'auto-detect',
          ville: data.ville || '',
          telephone: data.telephone || '',
          slogan: data.slogan || '',
          source: 'website-generator-v2',
          version: '2.0',
          timestamp: new Date().toISOString()
        }
      },
      metadata: {
        demandeId: data.demandeId,
        type: 'production',
        entreprise: data.entreprise,
        clientNom: data.clientNom,
        secteur: data.secteur || 'auto-detect',
        ville: data.ville || '',
        telephone: data.telephone || '',
        slogan: data.slogan || '',
        source: 'website-generator-v2',
        version: '2.0',
        timestamp: new Date().toISOString()
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3334'}/paiement/success?session_id={CHECKOUT_SESSION_ID}&provider=stripe`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3334'}/demande?cancelled=true`,
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    });

    console.log(`✅ Checkout PRODUCTION créé: ${session.id}`);
    
    return {
      id: session.id,
      url: session.url!,
    };
  } catch (error) {
    console.error('❌ Erreur création checkout PRODUCTION:', error);
    throw new Error('Erreur lors de la création du lien de paiement de production');
  }
}

/**
 * Créer une session de checkout Stripe pour test
 */
export async function createStripeTestCheckout(data: CreateStripeCheckoutRequest): Promise<StripeCheckoutSession> {
  try {
    // Récupérer les prix du produit
    const prices = await stripeClient.prices.list({
      product: 'prod_SUxELTBpnYo1gn',
      active: true,
      limit: 1
    });

    if (prices.data.length === 0) {
      throw new Error('Aucun prix trouvé pour le produit de test');
    }

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: prices.data[0].id, // Utiliser le prix du produit existant
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: data.clientEmail,
      metadata: {
        demandeId: data.demandeId,
        type: 'production', // Changé pour production
        entreprise: data.entreprise,
        clientNom: data.clientNom,
        secteur: data.secteur || 'auto-detect', // Secteur pour workflow automatique
        ville: data.ville || '',
        telephone: data.telephone || '',
        slogan: data.slogan || '',
        // Métadonnées pour traçabilité
        source: 'website-generator-v2',
        version: '2.0',
        timestamp: new Date().toISOString()
      },
      success_url: `http://localhost:3334/paiement/success?session_id={CHECKOUT_SESSION_ID}&provider=stripe`,
      cancel_url: `http://localhost:3334/demande?cancelled=true`,
    });

    return {
      id: session.id,
      url: session.url!,
    };
  } catch (error) {
    console.error('❌ Erreur création checkout Stripe:', error);
    throw new Error('Erreur lors de la création du lien de paiement Stripe');
  }
}