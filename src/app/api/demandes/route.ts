import { NextRequest, NextResponse } from 'next/server';

// Simulation d'une base de données en mémoire partagée
let demandes: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validation basique
    if (!data.nom || !data.email || !data.secteur || !data.telephone) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Créer nouvelle demande
    const nouvelleDemande = {
      id: `DEM_${Date.now()}`,
      nom: data.nom,
      secteur: data.secteur,
      email: data.email,
      telephone: data.telephone,
      description: data.description || '',
      statut: 'Nouvelle',
      dateCreation: new Date().toISOString(),
      dateGeneration: null,
      dateTermine: null,
      siteUrl: null
    };
    
    // Ajouter à la liste
    demandes.push(nouvelleDemande);
    
    console.log('Nouvelle demande reçue:', nouvelleDemande);
    
    // Réponse de succès
    return NextResponse.json({
      success: true,
      message: 'Demande reçue avec succès !',
      demandeId: nouvelleDemande.id,
      data: {
        nom: data.nom,
        secteur: data.secteur,
        email: data.email,
        statut: 'En cours de traitement',
        tempsEstime: '25 minutes'
      }
    });

  } catch (error) {
    console.error('Erreur lors du traitement de la demande:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Retourner toutes les demandes pour le dashboard
    return NextResponse.json({
      success: true,
      demandes: demandes.reverse(), // Plus récentes en premier
      total: demandes.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}