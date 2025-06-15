import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { demandesClients, commandes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createCompleteCheckout } from '@/lib/polar/client';
import { emailClient } from '@/lib/email/client';

export async function POST(request: NextRequest) {
  try {
    // TODO: Vérifier l'authentification admin (temporairement désactivé pour tests)
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json(
    //     { error: 'Non authentifié' },
    //     { status: 401 }
    //   );
    // }

    const body = await request.json();
    const { demandeId, isTest = false } = body;

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

    // Vérifier qu'il n'y a pas déjà une commande en cours
    const [existingCommande] = await db
      .select()
      .from(commandes)
      .where(eq(commandes.demandeId, demandeId))
      .limit(1);

    if (existingCommande && existingCommande.statut !== 'echoue') {
      return NextResponse.json(
        { error: 'Une commande existe déjà pour cette demande' },
        { status: 400 }
      );
    }

    console.log('🚀 Création checkout Polar pour:', {
      demandeId,
      entreprise: demande.entreprise,
      email: demande.email
    });

    // Créer le checkout Polar (399€ + 29€/mois ou 0,5€ pour test)
    const checkout = await createCompleteCheckout({
      clientEmail: demande.email,
      clientNom: demande.nom,
      entreprise: demande.entreprise,
      demandeId: demandeId,
      type: isTest ? 'test' : 'site_creation'
    });

    // Créer la commande en base
    const [nouvelleCommande] = await db
      .insert(commandes)
      .values({
        demandeId: demandeId,
        montant: isTest ? '0.50' : '399.00', // Prix test ou création
        devise: 'EUR',
        statut: 'attente',
        polarPaymentId: checkout.id, // ID du checkout pour le moment
        dateCreation: new Date()
      })
      .returning();

    console.log('✅ Commande créée:', {
      id: nouvelleCommande.id,
      checkoutId: checkout.id,
      url: checkout.url
    });

    // Mettre à jour le statut de la demande
    await db
      .update(demandesClients)
      .set({ 
        statut: 'en_cours',
        notes: 'Lien de paiement généré et envoyé'
      })
      .where(eq(demandesClients.id, demandeId));

    // Envoyer l'email avec le lien de paiement
    try {
      await emailClient.sendLienPaiement({
        clientEmail: demande.email,
        clientNom: demande.nom,
        entreprise: demande.entreprise,
        montant: 399,
        lienPaiement: checkout.url
      });
      console.log('✅ Email lien de paiement envoyé');
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email (commande créée quand même):', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Lien de paiement créé avec succès',
      commande: {
        id: nouvelleCommande.id,
        checkoutId: checkout.id,
        lienPaiement: checkout.url,
        montant: nouvelleCommande.montant,
        devise: nouvelleCommande.devise
      }
    });

  } catch (error) {
    console.error('❌ Erreur création checkout:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création du lien de paiement',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}