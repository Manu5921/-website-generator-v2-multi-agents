import { NextRequest, NextResponse } from 'next/server';

// Simulation d'une base de données en mémoire
let demandes: any[] = [];

export async function GET() {
  try {
    // Retourner toutes les demandes
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

export async function POST(request: NextRequest) {
  try {
    const { action, demandeId } = await request.json();
    
    if (action === 'generer-site') {
      // Trouver la demande
      const demandeIndex = demandes.findIndex(d => d.id === demandeId);
      if (demandeIndex === -1) {
        return NextResponse.json(
          { error: 'Demande non trouvée' },
          { status: 404 }
        );
      }

      // Mettre à jour le statut
      demandes[demandeIndex].statut = 'En génération';
      demandes[demandeIndex].dateGeneration = new Date().toISOString();
      
      // Simuler la génération (en vrai, lancer les agents)
      setTimeout(() => {
        if (demandes[demandeIndex]) {
          demandes[demandeIndex].statut = 'Terminé';
          demandes[demandeIndex].siteUrl = `https://site-${demandeId.toLowerCase()}.vercel.app`;
          demandes[demandeIndex].dateTermine = new Date().toISOString();
        }
      }, 5000); // 5 secondes pour la démo

      return NextResponse.json({
        success: true,
        message: 'Génération lancée',
        demande: demandes[demandeIndex]
      });
    }

    return NextResponse.json(
      { error: 'Action non reconnue' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erreur lors du traitement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Fonction pour ajouter une demande (appelée depuis l'API demandes)
export function ajouterDemande(data: any) {
  const nouvelleDemande = {
    id: `DEM_${Date.now()}`,
    nom: data.nom,
    secteur: data.secteur,
    email: data.email,
    telephone: data.telephone,
    description: data.description,
    statut: 'Nouvelle',
    dateCreation: new Date().toISOString(),
    dateGeneration: null,
    dateTermine: null,
    siteUrl: null
  };
  
  demandes.push(nouvelleDemande);
  return nouvelleDemande;
}