import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { demandesClients, commandes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createStripeTestCheckout } from '@/lib/stripe/client';

export async function POST(request: NextRequest) {
  try {
    // Authentification désactivée pour tests Stripe
    const body = await request.json();
    const { demandeId, amount = 50 } = body; // 50 centimes = 0.5€

    if (!demandeId) {
      return NextResponse.json(
        { error: 'ID de demande requis' },
        { status: 400 }
      );
    }

    // Récupérer la demande client
    const [demande] = await db
      .select()
      .from(demandesClients)
      .where(eq(demandesClients.id, demandeId))
      .limit(1);

    if (!demande) {
      return NextResponse.json(
        { error: 'Demande non trouvée' },
        { status: 404 }
      );
    }

    console.log('🚀 Création checkout Stripe TEST pour:', {
      demandeId: demandeId,
      entreprise: demande.entreprise,
      email: demande.email,
      amount: `${amount/100}€`
    });

    // Créer le checkout Stripe
    const checkout = await createStripeTestCheckout({
      clientEmail: demande.email,
      clientNom: demande.nom,
      entreprise: demande.entreprise,
      demandeId: demandeId,
      amount: amount // En centimes
    });

    // Créer la commande en base
    const [nouvelleCommande] = await db
      .insert(commandes)
      .values({
        demandeId: demandeId,
        montant: (amount / 100).toFixed(2), // Convertir centimes en euros
        devise: 'EUR',
        statut: 'attente',
        polarPaymentId: checkout.id, // Utiliser le champ existant pour l'ID Stripe
        dateCreation: new Date()
      })
      .returning();

    console.log('✅ Commande Stripe créée:', {
      id: nouvelleCommande.id,
      checkoutId: checkout.id,
      url: checkout.url
    });

    return NextResponse.json({
      success: true,
      commande: {
        id: nouvelleCommande.id,
        lienPaiement: checkout.url,
        montant: nouvelleCommande.montant,
        statut: nouvelleCommande.statut
      }
    });

  } catch (error) {
    console.error('❌ Erreur création checkout Stripe:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création du lien de paiement Stripe',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}