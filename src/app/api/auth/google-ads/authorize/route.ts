// =============================================================================
// 🔐 ROUTE AUTORISATION GOOGLE ADS OAUTH2
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { googleAdsOAuth, validateGoogleAdsSetup } from '@/lib/ads-management/google-ads-oauth';

/**
 * Initier le processus d'autorisation Google Ads
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Initiation autorisation Google Ads OAuth2...');

    // Vérifier la configuration
    const setupValidation = validateGoogleAdsSetup();
    if (!setupValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Configuration Google Ads incomplète',
        missingVars: setupValidation.missingVars,
        errors: setupValidation.errors,
      }, { status: 400 });
    }

    // Générer l'URL d'autorisation
    const { url, state } = googleAdsOAuth.generateAuthUrl();

    // Stocker le state dans un cookie sécurisé pour validation
    const response = NextResponse.json({
      success: true,
      authUrl: url,
      message: 'URL d\'autorisation générée avec succès',
    });

    // Cookie sécurisé pour le state (expire dans 10 minutes)
    response.cookies.set('google_ads_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    console.log('✅ URL d\'autorisation générée avec succès');
    return response;

  } catch (error) {
    console.error('❌ Erreur génération URL autorisation:', error);

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération de l\'URL d\'autorisation',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 });
  }
}

/**
 * Obtenir le statut de la configuration Google Ads
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Vérification statut configuration Google Ads...');

    const setupValidation = validateGoogleAdsSetup();

    return NextResponse.json({
      success: true,
      setup: {
        isValid: setupValidation.isValid,
        missingVars: setupValidation.missingVars,
        errors: setupValidation.errors,
        hasRefreshToken: !!process.env.GOOGLE_ADS_REFRESH_TOKEN,
        hasCustomerId: !!process.env.GOOGLE_ADS_CUSTOMER_ID,
      },
      message: setupValidation.isValid ? 
        'Configuration Google Ads complète' : 
        'Configuration Google Ads incomplète',
    });

  } catch (error) {
    console.error('❌ Erreur vérification configuration:', error);

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la vérification de la configuration',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 });
  }
}