import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { demandeId } = await request.json();
    
    if (!demandeId) {
      return NextResponse.json(
        { error: 'ID de demande requis' },
        { status: 400 }
      );
    }

    // Simulation de génération de site avec les 4 agents
    console.log(`🚀 Lancement génération site pour demande: ${demandeId}`);
    
    // Simuler le processus des 4 agents
    const etapes = [
      { nom: 'Agent Design IA', status: 'En cours', temps: 5 },
      { nom: 'Agent Automation', status: 'En attente', temps: 8 },
      { nom: 'Agent Ads', status: 'En attente', temps: 7 },
      { nom: 'Agent Core', status: 'En attente', temps: 5 }
    ];

    // En production, ici on déclencherait vraiment les agents
    // await orchestrateur.lancerGeneration(demandeId);
    
    return NextResponse.json({
      success: true,
      message: 'Génération lancée avec succès',
      demandeId,
      etapes,
      tempsEstime: 25,
      statut: 'En génération'
    });

  } catch (error) {
    console.error('Erreur lors du lancement de la génération:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}