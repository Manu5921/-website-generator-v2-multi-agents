/**
 * 🎨 API Endpoint - Génération Template Figma
 * POST /api/figma/generate-template
 */

import { NextRequest, NextResponse } from 'next/server';
import { figmaTemplateGenerator, TemplateCustomization } from '@/lib/figma-template-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { templateType, customization } = body as {
      templateType: 'RESTAURANT' | 'ARTISAN' | 'ECOMMERCE' | 'SAAS';
      customization: TemplateCustomization;
    };

    if (!templateType || !customization) {
      return NextResponse.json(
        { error: 'templateType et customization sont requis' },
        { status: 400 }
      );
    }

    // Validation des champs obligatoires
    if (!customization.businessName || !customization.content?.hero?.title) {
      return NextResponse.json(
        { error: 'businessName et hero.title sont obligatoires' },
        { status: 400 }
      );
    }

    console.log(`🎨 Génération template Figma: ${templateType} pour ${customization.businessName}`);

    // Génération du template via Figma API
    const result = await figmaTemplateGenerator.generateTemplate(templateType, customization);

    if (!result.success) {
      console.error('❌ Erreur génération Figma:', result.error);
      return NextResponse.json(
        { error: `Erreur génération template: ${result.error}` },
        { status: 500 }
      );
    }

    console.log(`✅ Template généré avec succès: ${result.metadata.components.length} composants`);

    return NextResponse.json({
      success: true,
      template: {
        code: result.templateCode,
        assets: result.assets,
        metadata: result.metadata
      },
      message: `Template ${templateType} généré avec succès pour ${customization.businessName}`
    });

  } catch (error) {
    console.error('❌ Erreur API Figma template:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur lors de la génération du template',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API Figma Template Generator',
    endpoints: {
      'POST /api/figma/generate-template': 'Génère un template depuis Figma',
      'GET /api/figma/templates': 'Liste les templates disponibles',
      'GET /api/figma/assets': 'Liste les assets disponibles'
    },
    templateTypes: ['RESTAURANT', 'ARTISAN', 'ECOMMERCE', 'SAAS'],
    version: '1.0.0'
  });
}