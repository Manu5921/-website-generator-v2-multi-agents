import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { demandesClients, InsertDemandeClient } from '@/lib/db/schema';
import { emailClient } from '@/lib/email/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const { nom, email, entreprise, ville, telephone, slogan } = body;
    
    if (!nom || !email || !entreprise || !ville || !telephone) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // Insérer la demande en base
    const nouvelleDemande: InsertDemandeClient = {
      nom: nom.trim(),
      email: email.trim().toLowerCase(),
      entreprise: entreprise.trim(),
      ville: ville.trim(),
      telephone: telephone.trim(),
      slogan: slogan?.trim() || null,
      statut: 'nouvelle'
    };

    const [demandeCree] = await db
      .insert(demandesClients)
      .values(nouvelleDemande)
      .returning();

    console.log('✅ Nouvelle demande créée:', {
      id: demandeCree.id,
      entreprise: demandeCree.entreprise,
      email: demandeCree.email
    });

    // Envoyer email de confirmation au client
    try {
      await emailClient.sendDemandeConfirmation({
        clientEmail: demandeCree.email,
        clientNom: demandeCree.nom,
        entreprise: demandeCree.entreprise
      });
      console.log('✅ Email de confirmation envoyé');
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email (demande créée quand même):', emailError);
      // On ne fait pas échouer la demande si l'email échoue
    }

    // TODO: Notifier l'admin (webhook, email admin, etc.)
    
    return NextResponse.json({
      success: true,
      message: 'Demande créée avec succès',
      id: demandeCree.id
    });

  } catch (error) {
    console.error('❌ Erreur création demande:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // API pour lister les demandes (admin seulement)
    // TODO: Ajouter authentification admin
    
    const demandes = await db
      .select()
      .from(demandesClients)
      .orderBy(demandesClients.dateCreation);

    return NextResponse.json({
      success: true,
      demandes
    });

  } catch (error) {
    console.error('❌ Erreur récupération demandes:', error);
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}