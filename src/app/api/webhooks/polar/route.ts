import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { commandes, demandesClients, sitesGeneres, maintenances } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { emailClient } from '@/lib/email/client';

// Fonction de vérification de signature webhook Polar
function verifyPolarSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', Buffer.from(secret, 'base64'))
      .update(payload, 'utf8')
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('❌ Erreur vérification signature:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('polar-signature');

    console.log('🔔 Webhook Polar reçu:', {
      hasSignature: !!signature,
      bodyLength: body.length
    });

    // Vérifier la signature
    if (!signature || !process.env.POLAR_WEBHOOK_SECRET) {
      console.error('❌ Signature manquante ou secret non configuré');
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }

    if (!verifyPolarSignature(body, signature, process.env.POLAR_WEBHOOK_SECRET)) {
      console.error('❌ Signature webhook invalide');
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log('✅ Webhook Polar validé:', {
      type: event.type,
      data: event.data?.id
    });

    // Traiter selon le type d'événement
    switch (event.type) {
      case 'checkout.updated':
        await handleCheckoutUpdated(event.data);
        break;

      case 'order.created':
        await handleOrderCreated(event.data);
        break;

      case 'subscription.active':
        await handleSubscriptionActive(event.data);
        break;

      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data);
        break;

      case 'subscription.revoked':
        await handleSubscriptionRevoked(event.data);
        break;

      default:
        console.log('ℹ️ Type d\'événement non traité:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Erreur traitement webhook Polar:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}

/**
 * Gérer la mise à jour d'un checkout (paiement réussi)
 */
async function handleCheckoutUpdated(checkoutData: any) {
  try {
    console.log('💳 Checkout mis à jour:', {
      id: checkoutData.id,
      status: checkoutData.status
    });

    if (checkoutData.status !== 'succeeded') {
      console.log('ℹ️ Checkout non réussi, ignoré');
      return;
    }

    // Trouver la commande correspondante
    const [commande] = await db
      .select()
      .from(commandes)
      .where(eq(commandes.checkoutId, checkoutData.id))
      .limit(1);

    if (!commande) {
      console.error('❌ Commande non trouvée pour checkout:', checkoutData.id);
      return;
    }

    // Récupérer la demande client
    const [demande] = await db
      .select()
      .from(demandesClients)
      .where(eq(demandesClients.id, commande.demandeId))
      .limit(1);

    if (!demande) {
      console.error('❌ Demande non trouvée:', commande.demandeId);
      return;
    }

    console.log('✅ Paiement confirmé pour:', {
      entreprise: demande.entreprise,
      email: demande.email,
      montant: commande.montantTotal
    });

    // Mettre à jour la commande
    await db
      .update(commandes)
      .set({
        statutPaiement: 'paye',
        datePaiement: new Date(),
        metadata: {
          ...commande.metadata,
          polar_payment_confirmed: true,
          polar_checkout_data: checkoutData
        }
      })
      .where(eq(commandes.id, commande.id));

    // Mettre à jour la demande
    await db
      .update(demandesClients)
      .set({
        statut: 'site_genere',
        notes: 'Paiement confirmé - Génération du site en cours'
      })
      .where(eq(demandesClients.id, commande.demandeId));

    // TODO: Déclencher la génération automatique du site web
    // await triggerSiteGeneration(demande, commande);

    // Créer l'entrée maintenance
    await db
      .insert(maintenances)
      .values({
        commandeId: commande.id,
        demandeId: commande.demandeId,
        statutAbonnement: 'actif',
        prochainePaiement: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
        montantMensuel: commande.montantMaintenance || 29,
        dateDebut: new Date()
      });

    console.log('✅ Maintenance activée pour:', demande.entreprise);

    // Envoyer email de confirmation (optionnel car site pas encore généré)
    try {
      // On enverra l'email de livraison quand le site sera réellement généré
      console.log('ℹ️ Email de livraison sera envoyé après génération du site');
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email confirmation:', emailError);
    }

  } catch (error) {
    console.error('❌ Erreur traitement checkout updated:', error);
  }
}

/**
 * Gérer la création d'une commande (paiements récurrents)
 */
async function handleOrderCreated(orderData: any) {
  try {
    console.log('📦 Nouvelle commande créée:', {
      id: orderData.id,
      billing_reason: orderData.billing_reason
    });

    // Si c'est un paiement de renouvellement de subscription
    if (orderData.billing_reason === 'subscription_cycle') {
      console.log('🔄 Renouvellement maintenance détecté');
      
      // Mettre à jour la date de prochain paiement
      // TODO: Implémenter la logique de renouvellement
    }

  } catch (error) {
    console.error('❌ Erreur traitement order created:', error);
  }
}

/**
 * Gérer l'activation d'un abonnement
 */
async function handleSubscriptionActive(subscriptionData: any) {
  try {
    console.log('✅ Abonnement activé:', subscriptionData.id);
    // TODO: Logique d'activation d'abonnement si nécessaire
  } catch (error) {
    console.error('❌ Erreur traitement subscription active:', error);
  }
}

/**
 * Gérer l'annulation d'un abonnement
 */
async function handleSubscriptionCanceled(subscriptionData: any) {
  try {
    console.log('❌ Abonnement annulé:', subscriptionData.id);
    
    // TODO: Mettre à jour le statut maintenance en base
    // Possiblement envoyer un email d'information
    
  } catch (error) {
    console.error('❌ Erreur traitement subscription canceled:', error);
  }
}

/**
 * Gérer la révocation d'un abonnement (accès à supprimer)
 */
async function handleSubscriptionRevoked(subscriptionData: any) {
  try {
    console.log('🚫 Abonnement révoqué:', subscriptionData.id);
    
    // TODO: Supprimer l'accès, désactiver le site, etc.
    
  } catch (error) {
    console.error('❌ Erreur traitement subscription revoked:', error);
  }
}