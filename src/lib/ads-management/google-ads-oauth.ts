// =============================================================================
// 🔐 GOOGLE ADS OAUTH2 SETUP - AUTHENTIFICATION SÉCURISÉE
// =============================================================================

import crypto from 'crypto';

/**
 * Interface pour la configuration OAuth2
 */
export interface GoogleAdsOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

/**
 * Interface pour les tokens OAuth2
 */
export interface GoogleAdsTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Interface pour les informations du compte développeur
 */
export interface GoogleAdsAccountInfo {
  customerId: string;
  descriptiveName: string;
  canManageClients: boolean;
  testAccount: boolean;
}

class GoogleAdsOAuth {
  private config: GoogleAdsOAuthConfig;

  constructor() {
    this.config = {
      clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_ADS_REDIRECT_URI || 'http://localhost:3334/api/auth/google-ads/callback',
      scopes: ['https://www.googleapis.com/auth/adwords'],
    };

    this.validateConfig();
  }

  /**
   * Valider la configuration OAuth2
   */
  private validateConfig(): void {
    if (!this.config.clientId) {
      throw new Error('❌ GOOGLE_ADS_CLIENT_ID manquant dans les variables d\'environnement');
    }
    if (!this.config.clientSecret) {
      throw new Error('❌ GOOGLE_ADS_CLIENT_SECRET manquant dans les variables d\'environnement');
    }
    console.log('✅ Configuration Google Ads OAuth2 valide');
  }

  /**
   * Générer l'URL d'autorisation OAuth2
   */
  generateAuthUrl(): { url: string; state: string } {
    try {
      // Générer un state unique pour la sécurité
      const state = crypto.randomBytes(32).toString('hex');
      
      const params = new URLSearchParams({
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri,
        scope: this.config.scopes.join(' '),
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
        state: state,
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      console.log('🔗 URL d\'autorisation générée');
      return { url: authUrl, state };

    } catch (error) {
      console.error('❌ Erreur génération URL auth:', error);
      throw error;
    }
  }

  /**
   * Échanger le code d'autorisation contre des tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleAdsTokens> {
    try {
      console.log('🔄 Échange du code d\'autorisation...');

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`❌ Erreur OAuth2: ${response.status} - ${errorData}`);
        throw new Error(`Erreur échange token: ${response.status}`);
      }

      const data = await response.json();

      const tokens: GoogleAdsTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
      };

      console.log('✅ Tokens OAuth2 obtenus avec succès');
      return tokens;

    } catch (error) {
      console.error('❌ Erreur échange tokens:', error);
      throw error;
    }
  }

  /**
   * Rafraîchir un access token avec le refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      console.log('🔄 Rafraîchissement du token d\'accès...');

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`❌ Erreur refresh token: ${response.status} - ${errorData}`);
        throw new Error(`Erreur refresh token: ${response.status}`);
      }

      const data = await response.json();

      console.log('✅ Token d\'accès rafraîchi');
      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      };

    } catch (error) {
      console.error('❌ Erreur refresh token:', error);
      throw error;
    }
  }

  /**
   * Obtenir les informations du compte Google Ads
   */
  async getAccountInfo(accessToken: string, developerToken: string): Promise<GoogleAdsAccountInfo[]> {
    try {
      console.log('📊 Récupération des comptes Google Ads...');

      const response = await fetch('https://googleads.googleapis.com/v16/customers:listAccessibleCustomers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`❌ Erreur récupération comptes: ${response.status} - ${errorData}`);
        throw new Error(`Erreur récupération comptes: ${response.status}`);
      }

      const data = await response.json();
      const customerResourceNames = data.resourceNames || [];

      // Récupérer les détails de chaque compte
      const accounts: GoogleAdsAccountInfo[] = [];
      for (const resourceName of customerResourceNames) {
        const customerId = resourceName.split('/').pop();
        
        try {
          const accountResponse = await fetch(
            `https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:search`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'developer-token': developerToken,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: `
                  SELECT 
                    customer.id,
                    customer.descriptive_name,
                    customer.can_manage_clients,
                    customer.test_account
                  FROM customer
                  WHERE customer.id = ${customerId}
                `
              }),
            }
          );

          if (accountResponse.ok) {
            const accountData = await accountResponse.json();
            if (accountData.results && accountData.results.length > 0) {
              const customer = accountData.results[0].customer;
              accounts.push({
                customerId: customer.id,
                descriptiveName: customer.descriptive_name || `Compte ${customer.id}`,
                canManageClients: customer.can_manage_clients || false,
                testAccount: customer.test_account || false,
              });
            }
          }
        } catch (accountError) {
          console.warn(`⚠️ Impossible de récupérer les détails du compte ${customerId}:`, accountError);
        }
      }

      console.log(`✅ ${accounts.length} comptes Google Ads récupérés`);
      return accounts;

    } catch (error) {
      console.error('❌ Erreur récupération comptes:', error);
      throw error;
    }
  }

  /**
   * Valider le Developer Token
   */
  async validateDeveloperToken(accessToken: string, developerToken: string): Promise<boolean> {
    try {
      console.log('🔍 Validation du Developer Token...');

      const response = await fetch('https://googleads.googleapis.com/v16/customers:listAccessibleCustomers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'Content-Type': 'application/json',
        },
      });

      const isValid = response.ok;
      
      if (isValid) {
        console.log('✅ Developer Token valide');
      } else {
        console.error('❌ Developer Token invalide');
      }

      return isValid;

    } catch (error) {
      console.error('❌ Erreur validation Developer Token:', error);
      return false;
    }
  }

  /**
   * Créer un compte de test Google Ads
   */
  async createTestAccount(accessToken: string, developerToken: string, managerCustomerId: string): Promise<string> {
    try {
      console.log('🧪 Création d\'un compte de test Google Ads...');

      const response = await fetch(
        `https://googleads.googleapis.com/v16/customers/${managerCustomerId}/customers:mutate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': developerToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operations: [{
              create: {
                descriptive_name: 'Compte Test Website Generator',
                currency_code: 'EUR',
                time_zone: 'Europe/Paris',
                test_account: true,
              },
            }],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`❌ Erreur création compte test: ${response.status} - ${errorData}`);
        throw new Error(`Erreur création compte test: ${response.status}`);
      }

      const data = await response.json();
      const testAccountResourceName = data.results[0].resource_name;
      const testAccountId = testAccountResourceName.split('/').pop();

      console.log(`✅ Compte de test créé: ${testAccountId}`);
      return testAccountId;

    } catch (error) {
      console.error('❌ Erreur création compte test:', error);
      throw error;
    }
  }
}

// Instance singleton pour l'OAuth
export const googleAdsOAuth = new GoogleAdsOAuth();

// =============================================================================
// UTILITAIRES POUR L'ENVIRONNEMENT DE DÉVELOPPEMENT
// =============================================================================

/**
 * Guide de setup pour développeurs
 */
export const GOOGLE_ADS_SETUP_GUIDE = {
  steps: [
    {
      step: 1,
      title: 'Créer un projet Google Cloud',
      description: 'Allez sur https://console.cloud.google.com et créez un nouveau projet',
      required: true,
    },
    {
      step: 2,
      title: 'Activer l\'API Google Ads',
      description: 'Dans le projet, activez l\'API Google Ads API',
      required: true,
    },
    {
      step: 3,
      title: 'Créer des identifiants OAuth2',
      description: 'Créez des identifiants OAuth 2.0 pour application web',
      required: true,
    },
    {
      step: 4,
      title: 'Demander un Developer Token',
      description: 'Demandez un Developer Token sur https://developers.google.com/google-ads/api/docs/first-call/dev-token',
      required: true,
    },
    {
      step: 5,
      title: 'Configurer les variables d\'environnement',
      description: 'Ajoutez les variables GOOGLE_ADS_* à votre .env',
      required: true,
    },
  ],
  envVariables: [
    'GOOGLE_ADS_CLIENT_ID=your_client_id',
    'GOOGLE_ADS_CLIENT_SECRET=your_client_secret',
    'GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token',
    'GOOGLE_ADS_REDIRECT_URI=http://localhost:3334/api/auth/google-ads/callback',
    'GOOGLE_ADS_CUSTOMER_ID=your_customer_id (optional)',
    'GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token (will be set after auth)',
  ],
};

/**
 * Fonction de validation de la configuration
 */
export function validateGoogleAdsSetup(): { isValid: boolean; missingVars: string[]; errors: string[] } {
  const requiredVars = [
    'GOOGLE_ADS_CLIENT_ID',
    'GOOGLE_ADS_CLIENT_SECRET', 
    'GOOGLE_ADS_DEVELOPER_TOKEN',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  const errors: string[] = [];

  if (missingVars.length > 0) {
    errors.push(`Variables d'environnement manquantes: ${missingVars.join(', ')}`);
  }

  const isValid = missingVars.length === 0;

  return { isValid, missingVars, errors };
}