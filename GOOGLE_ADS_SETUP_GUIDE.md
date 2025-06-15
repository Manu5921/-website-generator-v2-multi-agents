# 📊 GUIDE DE SETUP GOOGLE ADS API - CONFIGURATION COMPLÈTE

## 🚀 ÉTAPES OBLIGATOIRES DE CONFIGURATION

### **1. Création du compte développeur Google Cloud**

1. **Aller sur Google Cloud Console**
   ```
   https://console.cloud.google.com
   ```

2. **Créer un nouveau projet**
   - Nom: `Website Generator Ads Management`
   - ID projet: `website-generator-ads-[random]`

3. **Activer l'API Google Ads**
   ```
   https://console.cloud.google.com/apis/library/googleads.googleapis.com
   ```

### **2. Configuration OAuth2**

1. **Créer des identifiants OAuth 2.0**
   - Aller dans `APIs & Services > Credentials`
   - Cliquer sur `Create Credentials > OAuth 2.0 Client IDs`
   - Type d'application: `Web application`
   - Nom: `Website Generator OAuth`

2. **Configurer les URIs autorisées**
   ```
   Authorized JavaScript origins:
   - http://localhost:3334
   - https://[votre-domaine].vercel.app

   Authorized redirect URIs:
   - http://localhost:3334/api/auth/google-ads/callback
   - https://[votre-domaine].vercel.app/api/auth/google-ads/callback
   ```

3. **Télécharger le fichier JSON**
   - Sauvegarder le `client_id` et `client_secret`

### **3. Demande de Developer Token**

1. **Aller sur Google Ads API Center**
   ```
   https://developers.google.com/google-ads/api/docs/first-call/dev-token
   ```

2. **Remplir le formulaire de demande**
   - Nom de l'application: `Website Generator Multi-Agents`
   - Description: `Plateforme automatisée de génération de sites web avec gestion publicitaire intégrée`
   - URL du site: `https://[votre-domaine].com`
   - Type d'accès: `Basic` (pour commencer)

3. **Attendre l'approbation** (peut prendre 1-2 jours ouvrables)

### **4. Configuration des variables d'environnement**

Créer un fichier `.env.local` avec les variables suivantes:

```bash
# =============================================================================
# 📊 GOOGLE ADS API - CONFIGURATION OBLIGATOIRE
# =============================================================================

# OAuth2 Configuration
GOOGLE_ADS_CLIENT_ID=your_oauth_client_id_here
GOOGLE_ADS_CLIENT_SECRET=your_oauth_client_secret_here
GOOGLE_ADS_REDIRECT_URI=http://localhost:3334/api/auth/google-ads/callback

# Developer Token (obtenu après approbation)
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token_here

# Customer ID (sera configuré après authentification)
GOOGLE_ADS_CUSTOMER_ID=your_customer_id_here

# Refresh Token (généré automatiquement après auth)
GOOGLE_ADS_REFRESH_TOKEN=auto_generated_after_auth

# =============================================================================
# 🎯 TRACKING CROSS-PLATFORM - CONFIGURATION
# =============================================================================

# Google Analytics 4
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_facebook_pixel_id
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token

# LinkedIn Insight Tag
NEXT_PUBLIC_LINKEDIN_PARTNER_ID=your_linkedin_partner_id

# =============================================================================
# 💰 REVENUE STREAMS - CONFIGURATION
# =============================================================================

# Stripe pour les paiements (si applicable)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Taux de commission (20% selon les consignes)
ADS_COMMISSION_RATE=20

# Prix des services
SETUP_FEE_AMOUNT=299
MONTHLY_MANAGEMENT_FEE=199
```

## 🔧 INSTALLATION ET DÉMARRAGE

### **1. Installation des dépendances**

```bash
# Installer les dépendances existantes
npm install

# Vérifier que toutes les dépendances sont présentes
npm audit
```

### **2. Configuration de la base de données**

```bash
# Générer les migrations
npm run db:generate

# Appliquer les migrations
npm run db:push

# Vérifier la connexion
npm run db:studio
```

### **3. Premier lancement**

```bash
# Démarrer en mode développement (port 3334 selon les consignes)
npm run dev

# Ouvrir dans le navigateur
# http://localhost:3334
```

## 🚨 PROCESSUS D'AUTHENTIFICATION

### **1. Initier l'authentification**

1. Aller sur le Dashboard: `http://localhost:3334/dashboard`
2. Cliquer sur "Configurer Google Ads" dans le widget Google Ads Management
3. Autoriser l'accès à votre compte Google Ads
4. Revenir sur le Dashboard après la redirection

### **2. Vérification de la configuration**

```bash
# Test de la configuration via l'API
curl -X POST http://localhost:3334/api/auth/google-ads/authorize
```

**Réponse attendue:**
```json
{
  "success": true,
  "setup": {
    "isValid": true,
    "hasRefreshToken": true,
    "hasCustomerId": true
  }
}
```

## 🎯 CRÉATION DE LA PREMIÈRE CAMPAGNE TEST

### **1. Lancement automatique**

Une fois l'authentification réussie, vous pouvez créer la campagne test:

```bash
curl -X POST http://localhost:3334/api/ads/campaigns/create-test \
  -H "Content-Type: application/json" \
  -d '{"siteId": "demo-site-001"}'
```

### **2. Configuration de la campagne test**

La campagne sera créée avec les paramètres suivants (selon les consignes):

- **Budget**: 50€ (budget limité pour validation)
- **Type**: Search Campaign
- **Mots-clés ciblés**:
  - "génération site web IA"
  - "création site automatique"
  - "site web automatique IA"
  - "générateur site web"
  - "création site internet IA"
  - "site web PME automatique"

- **Ciblage géographique**: France
- **Audiences**: PME secteurs restaurant/coiffeur/artisan
- **Stratégie d'enchères**: Target CPA (25€)

### **3. Validation requise**

⚠️ **IMPORTANT**: La campagne est créée en statut "PAUSED" pour validation manuelle avant activation.

## 📈 MÉTRIQUES ET REPORTING EN TEMPS RÉEL

### **1. Dashboard intégré**

Le Dashboard V3 affiche en temps réel:
- Métriques de performance (impressions, clics, conversions)
- Utilisation du budget (50€ maximum)
- Projection des coûts
- ROI et ROAS

### **2. Attribution cross-platform**

Le système track automatiquement:
- **Google Ads**: via Google Ads API
- **Facebook Ads**: via Facebook Pixel (si configuré)
- **LinkedIn Ads**: via LinkedIn Insight Tag (si configuré)
- **Attribution ML**: algorithme proprietaire

### **3. Synchronisation automatique**

```bash
# Les métriques sont synchronisées toutes les heures
# Via le système d'attribution automatique
```

## 💰 REVENUE STREAMS - CONFIGURATION MONÉTISATION

### **1. Structure tarifaire (selon les consignes)**

- **Setup Fee**: 299€ par client
- **Gestion mensuelle**: 199€/mois par plateforme
- **Commission**: 20% sur les budgets publicitaires
- **Objectif année 1**: 120k€ CA

### **2. Calcul automatique des revenus**

Le système calcule automatiquement:
- Revenus récurrents mensuels
- Commissions sur budgets publicitaires
- Projections de croissance
- KPIs de performance business

### **3. Reporting financier**

Accessible via le Dashboard V3:
- Vue d'ensemble des revenus
- Breakdown par stream
- Projections de croissance
- Actions recommandées

## 🔍 TROUBLESHOOTING

### **Erreurs courantes**

1. **"Developer Token invalide"**
   ```
   Solution: Vérifier le statut d'approbation sur Google Ads
   ```

2. **"Customer ID introuvable"**
   ```
   Solution: Réautoriser l'accès ou utiliser un compte Google Ads valide
   ```

3. **"OAuth2 callback error"**
   ```
   Solution: Vérifier les URIs de redirection dans Google Cloud Console
   ```

### **Logs de débogage**

```bash
# Vérifier les logs du serveur
tail -f logs/agent-📊-ads-management.log

# Vérifier les erreurs de l'orchestrator
tail -f logs/orchestrator.log
```

### **Tests de validation**

```bash
# Test de la connexion Google Ads API
node -e "
const { googleAdsClient } = require('./src/lib/ads-management/google-ads-client.ts');
googleAdsClient.getCampaigns().then(console.log).catch(console.error);
"

# Test du tracking cross-platform
curl -X GET http://localhost:3334/api/ads/campaigns/create-test
```

## ✅ CHECKLIST DE VALIDATION

Avant de marquer la configuration comme terminée:

- [ ] Google Cloud Project créé et APIs activées
- [ ] OAuth2 configuré avec les bonnes URIs
- [ ] Developer Token approuvé et configuré
- [ ] Variables d'environnement toutes renseignées
- [ ] Authentification réussie (refresh token généré)
- [ ] Campagne test créée avec budget 50€
- [ ] Dashboard affiche les métriques en temps réel
- [ ] Tracking cross-platform fonctionnel
- [ ] Revenue streams configurés et calculés

## 🎯 PROCHAINES ÉTAPES

Une fois la configuration terminée:

1. **Activer la campagne test** après validation
2. **Surveiller les performances** via le Dashboard
3. **Optimiser selon les données ML** du système d'attribution
4. **Scaler progressivement** les budgets publicitaires
5. **Déployer pour les premiers clients** selon les revenue streams

---

**📞 Support**: En cas de problème, vérifier les logs et consulter la documentation Google Ads API officielle.

**🔄 Mise à jour**: Ce guide sera mis à jour selon l'évolution des APIs et des consignes.