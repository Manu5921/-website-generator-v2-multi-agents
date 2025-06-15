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
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
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
        type: 'test',
        entreprise: data.entreprise,
        clientNom: data.clientNom,
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