/**
 * 💳 POLAR CLIENT - API de paiement
 * Configuration Polar.sh pour paiements 399€ + 29€/mois
 */

import { Polar } from "@polar-sh/sdk";

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: process.env.POLAR_MODE === "production" ? "production" : "sandbox"
});

// Types pour notre business model
export interface CreateCheckoutRequest {
  clientEmail: string;
  clientNom: string;
  entreprise: string;
  demandeId: string;
  type: 'site_creation' | 'maintenance' | 'test';
}

export interface CheckoutSession {
  id: string;
  url: string;
  clientSecret: string;
}

/**
 * Créer une session de checkout pour création de site (399€)
 */
export async function createSiteCreationCheckout(data: CreateCheckoutRequest): Promise<CheckoutSession> {
  try {
    const checkout = await polarClient.checkouts.create({
      productPriceId: process.env.POLAR_SITE_CREATION_PRICE_ID!, // À configurer
      customerEmail: data.clientEmail,
      metadata: {
        demandeId: data.demandeId,
        type: 'site_creation',
        entreprise: data.entreprise,
        clientNom: data.clientNom
      },
      successUrl: `${process.env.APP_URL}/paiement/success?session_id={CHECKOUT_SESSION_ID}`,
      customFields: [
        {
          key: 'entreprise',
          value: data.entreprise
        },
        {
          key: 'demande_id',
          value: data.demandeId
        }
      ]
    });

    return {
      id: checkout.id,
      url: checkout.url,
      clientSecret: checkout.clientSecret || ''
    };
  } catch (error) {
    console.error('❌ Erreur création checkout Polar:', error);
    throw new Error('Erreur lors de la création du lien de paiement');
  }
}

/**
 * Créer une session pour abonnement maintenance (29€/mois)
 */
export async function createMaintenanceSubscription(data: CreateCheckoutRequest): Promise<CheckoutSession> {
  try {
    const checkout = await polarClient.checkouts.create({
      productPriceId: process.env.POLAR_MAINTENANCE_PRICE_ID!, // À configurer  
      customerEmail: data.clientEmail,
      metadata: {
        demandeId: data.demandeId,
        type: 'maintenance',
        entreprise: data.entreprise,
        clientNom: data.clientNom
      },
      successUrl: `${process.env.APP_URL}/paiement/success?session_id={CHECKOUT_SESSION_ID}`,
      customFields: [
        {
          key: 'entreprise',
          value: data.entreprise
        },
        {
          key: 'demande_id', 
          value: data.demandeId
        }
      ]
    });

    return {
      id: checkout.id,
      url: checkout.url,
      clientSecret: checkout.clientSecret || ''
    };
  } catch (error) {
    console.error('❌ Erreur création subscription Polar:', error);
    throw new Error('Erreur lors de la création de l\'abonnement');
  }
}

/**
 * Créer checkout combiné (399€ + abonnement 29€/mois)
 */
export async function createCompleteCheckout(data: CreateCheckoutRequest): Promise<CheckoutSession> {
  try {
    // Choisir le bon produit selon le type
    let productId: string;
    let checkoutType: string;
    
    if (data.type === 'test') {
      productId = process.env.POLAR_TEST_PRODUCT_ID!;
      checkoutType = 'test';
    } else if (data.type === 'maintenance') {
      productId = process.env.POLAR_MAINTENANCE_PRODUCT_ID!;
      checkoutType = 'maintenance';
    } else {
      productId = process.env.POLAR_SITE_CREATION_PRODUCT_ID!;
      checkoutType = 'site_creation';
    }

    const checkout = await polarClient.checkouts.create({
      products: [productId], // Product ID selon le type
      customerEmail: data.clientEmail,
      metadata: {
        demandeId: data.demandeId,
        type: checkoutType,
        entreprise: data.entreprise,
        clientNom: data.clientNom
      },
      successUrl: `${process.env.APP_URL}/paiement/success?session_id={CHECKOUT_SESSION_ID}`
    });

    return {
      id: checkout.id,
      url: checkout.url,
      clientSecret: checkout.clientSecret || ''
    };
  } catch (error) {
    console.error('❌ Erreur création checkout Polar:', error);
    throw new Error('Erreur lors de la création du lien de paiement');
  }
}

/**
 * Récupérer les détails d'un checkout
 */
export async function getCheckoutDetails(checkoutId: string) {
  try {
    return await polarClient.checkouts.get({
      id: checkoutId
    });
  } catch (error) {
    console.error('❌ Erreur récupération checkout:', error);
    throw new Error('Impossible de récupérer les détails du paiement');
  }
}