/**
 * 🎨 API Endpoint - Liste Templates Figma
 * GET /api/figma/templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { FIGMA_TEMPLATES } from '@/lib/figma-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get('sector');

    let templates = Object.entries(FIGMA_TEMPLATES).map(([key, template]) => ({
      id: key,
      ...template,
      previewUrl: `/api/figma/templates/${key}/preview`,
      available: true // En production, vérifier si le template Figma existe
    }));

    // Filtrer par secteur si demandé
    if (sector) {
      templates = templates.filter(template => 
        template.sector.toLowerCase() === sector.toLowerCase()
      );
    }

    return NextResponse.json({
      success: true,
      templates,
      total: templates.length,
      sectors: [...new Set(Object.values(FIGMA_TEMPLATES).map(t => t.sector))],
      message: sector 
        ? `${templates.length} templates trouvés pour le secteur "${sector}"`
        : `${templates.length} templates disponibles`
    });

  } catch (error) {
    console.error('❌ Erreur API templates:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des templates',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

/**
 * Ajouter/Modifier un template (pour l'admin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { name, sector, fileKey, components, description } = body;

    if (!name || !sector || !fileKey) {
      return NextResponse.json(
        { error: 'name, sector et fileKey sont requis' },
        { status: 400 }
      );
    }

    // En production, sauvegarder en base de données
    // Pour l'instant, retourner la configuration
    const newTemplate = {
      name,
      sector,
      fileKey,
      components: components || [],
      description: description || '',
      createdAt: new Date().toISOString(),
      id: `CUSTOM_${Date.now()}`
    };

    return NextResponse.json({
      success: true,
      template: newTemplate,
      message: `Template "${name}" créé avec succès`
    });

  } catch (error) {
    console.error('❌ Erreur création template:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création du template',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}