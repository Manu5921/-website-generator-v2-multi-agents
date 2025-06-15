// =============================================================================
// 🔄 ROUTE CALLBACK GOOGLE ADS OAUTH2
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { googleAdsOAuth } from '@/lib/ads-management/google-ads-oauth';
import { db } from '@/lib/db';
import { parametresSysteme } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Traiter le callback OAuth2 de Google Ads
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Traitement callback Google Ads OAuth2...');

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Vérifier s'il y a une erreur
    if (error) {
      console.error('❌ Erreur OAuth2:', error);
      return NextResponse.redirect(
        new URL(`/dashboard?error=oauth_error&details=${encodeURIComponent(error)}`, request.url)
      );
    }

    // Vérifier la présence du code
    if (!code) {
      console.error('❌ Code d\'autorisation manquant');
      return NextResponse.redirect(
        new URL('/dashboard?error=missing_code', request.url)
      );
    }

    // Vérifier le state pour la sécurité
    const storedState = request.cookies.get('google_ads_oauth_state')?.value;
    if (!state || !storedState || state !== storedState) {
      console.error('❌ State OAuth2 invalide');
      return NextResponse.redirect(
        new URL('/dashboard?error=invalid_state', request.url)
      );
    }

    // Échanger le code contre des tokens
    const tokens = await googleAdsOAuth.exchangeCodeForTokens(code);

    // Sauvegarder les tokens en base de données
    await saveTokensToDatabase(tokens);

    // Valider le Developer Token avec les nouveaux tokens
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';
    if (developerToken) {
      const isValid = await googleAdsOAuth.validateDeveloperToken(tokens.accessToken, developerToken);
      if (!isValid) {
        console.warn('⚠️ Developer Token semble invalide');
      }
    }

    // Récupérer les informations des comptes
    try {
      const accounts = await googleAdsOAuth.getAccountInfo(tokens.accessToken, developerToken);
      console.log(`✅ ${accounts.length} comptes Google Ads détectés`);
      
      // Sauvegarder les comptes en base de données
      await saveAccountsToDatabase(accounts);
    } catch (accountError) {
      console.warn('⚠️ Impossible de récupérer les comptes:', accountError);
    }

    // Supprimer le cookie de state
    const response = NextResponse.redirect(
      new URL('/dashboard?success=google_ads_connected', request.url)
    );
    response.cookies.delete('google_ads_oauth_state');

    console.log('✅ Authentification Google Ads réussie');
    return response;

  } catch (error) {
    console.error('❌ Erreur callback OAuth2:', error);

    return NextResponse.redirect(
      new URL(`/dashboard?error=oauth_callback_error&details=${encodeURIComponent(error instanceof Error ? error.message : 'Erreur inconnue')}`, request.url)
    );
  }
}

/**
 * Sauvegarder les tokens en base de données
 */
async function saveTokensToDatabase(tokens: any): Promise<void> {
  try {
    // Sauvegarder le refresh token
    await db.insert(parametresSysteme).values({
      cle: 'google_ads_refresh_token',
      valeur: tokens.refreshToken,
      description: 'Refresh token pour l\'API Google Ads',
      sensible: true,
    }).onConflictDoUpdate({
      target: parametresSysteme.cle,
      set: {
        valeur: tokens.refreshToken,
        dateModification: new Date(),
      },
    });

    // Sauvegarder l'access token avec expiration
    const expirationDate = new Date(Date.now() + (tokens.expiresIn * 1000));
    await db.insert(parametresSysteme).values({
      cle: 'google_ads_access_token',
      valeur: JSON.stringify({
        token: tokens.accessToken,
        expiresAt: expirationDate.toISOString(),
      }),
      description: 'Access token pour l\'API Google Ads (temporaire)',
      sensible: true,
    }).onConflictDoUpdate({
      target: parametresSysteme.cle,
      set: {
        valeur: JSON.stringify({
          token: tokens.accessToken,
          expiresAt: expirationDate.toISOString(),
        }),
        dateModification: new Date(),
      },
    });

    console.log('✅ Tokens sauvegardés en base de données');

  } catch (error) {
    console.error('❌ Erreur sauvegarde tokens:', error);
    throw error;
  }
}

/**
 * Sauvegarder les comptes Google Ads en base de données
 */
async function saveAccountsToDatabase(accounts: any[]): Promise<void> {
  try {
    const accountsData = {
      accounts: accounts.map(account => ({
        customerId: account.customerId,
        descriptiveName: account.descriptiveName,
        canManageClients: account.canManageClients,
        testAccount: account.testAccount,
      })),
      lastUpdated: new Date().toISOString(),
    };

    await db.insert(parametresSysteme).values({
      cle: 'google_ads_accounts',
      valeur: JSON.stringify(accountsData),
      description: 'Liste des comptes Google Ads accessibles',
      sensible: false,
    }).onConflictDoUpdate({
      target: parametresSysteme.cle,
      set: {
        valeur: JSON.stringify(accountsData),
        dateModification: new Date(),
      },
    });

    // Si on n'a pas encore de customer ID par défaut, utiliser le premier compte non-test
    const defaultAccount = accounts.find(acc => !acc.testAccount) || accounts[0];
    if (defaultAccount && !process.env.GOOGLE_ADS_CUSTOMER_ID) {
      await db.insert(parametresSysteme).values({
        cle: 'google_ads_default_customer_id',
        valeur: defaultAccount.customerId,
        description: 'Customer ID par défaut pour Google Ads',
        sensible: false,
      }).onConflictDoUpdate({
        target: parametresSysteme.cle,
        set: {
          valeur: defaultAccount.customerId,
          dateModification: new Date(),
        },
      });
    }

    console.log('✅ Comptes Google Ads sauvegardés en base de données');

  } catch (error) {
    console.error('❌ Erreur sauvegarde comptes:', error);
    throw error;
  }
}