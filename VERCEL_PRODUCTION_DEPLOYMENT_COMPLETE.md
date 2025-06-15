# 🚀 GUIDE COMPLET DÉPLOIEMENT VERCEL PRODUCTION
## Agent Core Platform - Multi-Agents Website Generator V2

---

## 🎯 OBJECTIF : TEST WORKFLOW BUSINESS COMPLET
**Client paie 399€ → Site livré automatiquement en 25min**

---

## 📋 PRÉ-REQUIS ESSENTIELS

### 1. Comptes & Services
- ✅ **Vercel Account** : Pro plan recommandé pour production
- ✅ **Neon Database** : Instance production PostgreSQL
- ✅ **Stripe Account** : Clés production configurées
- ✅ **Domain** : Nom de domaine personnalisé (optionnel)

### 2. CLI Tools Installés
```bash
npm install -g vercel@latest
npm install -g @vercel/cli
```

---

## 🔧 CONFIGURATION VARIABLES D'ENVIRONNEMENT

### Variables Production Critiques

#### 🔑 AUTHENTIFICATION & SÉCURITÉ
```env
NEXTAUTH_SECRET=5u61zO6lWjihY0Rb3LNefHEJLApoPdwjLwjkwrx6CFM=
NEXTAUTH_URL=https://your-production-domain.vercel.app
INTER_AGENT_TOKEN=secure-random-token-for-inter-agent-communication
```

#### 🗄️ BASE DE DONNÉES (NEON)
```env
DATABASE_URL=postgresql://website-generator-platform_owner:npg_qWuJ32CHtVjs@ep-snowy-snowflake-a9a4wiek-pooler.gwc.azure.neon.tech/website-generator-platform?sslmode=require
```

#### 💳 STRIPE (PRODUCTION)
```env
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_LIVE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_STRIPE_WEBHOOK_SECRET

# Produits Stripe Production (à configurer)
STRIPE_PRICE_ID_WEBSITE_CREATION=price_YOUR_WEBSITE_CREATION_PRICE_ID
STRIPE_PRICE_ID_MAINTENANCE=price_YOUR_MAINTENANCE_PRICE_ID
```

#### 🔄 POLAR (BACKUP PAYMENT SYSTEM)
```env
POLAR_ACCESS_TOKEN=polar_oat_8W2MdX23gFcZDDjNdfYT0QRwh4MVcyMUbF6n03yJCVJ
POLAR_ORGANIZATION_ID=8eaa364c-9b45-4b44-a3c9-eb0412b55820
POLAR_MODE=production
POLAR_SITE_CREATION_PRODUCT_ID=cb38ebe0-c9a2-4db8-936e-be7285461670
POLAR_MAINTENANCE_PRODUCT_ID=3ddebe61-5143-4dc8-887d-33189c5842ca
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret_base64
```

#### 🌐 APPLICATION SETTINGS
```env
APP_URL=https://your-production-domain.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-production-domain.vercel.app
NODE_ENV=production
```

#### 🤖 MULTI-AGENTS CONFIGURATION
```env
ORCHESTRATOR_PORT=3334
CORE_PLATFORM_PORT=3338
DESIGN_IA_PORT=3335
AUTOMATION_PORT=3336
ADS_MANAGEMENT_PORT=3337

AGENT_RESPONSE_TIMEOUT=30000
AGENT_HEARTBEAT_INTERVAL=5000
AGENT_MAX_RETRIES=3
```

#### 📧 EMAIL (OPTIONNEL)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### 📊 MONITORING & PERFORMANCE
```env
LOG_LEVEL=info
ENABLE_PERFORMANCE_MONITORING=true
METRICS_COLLECTION_INTERVAL=60000
ALERT_THRESHOLD_RESPONSE_TIME=200
ALERT_THRESHOLD_ERROR_RATE=5
```

---

## 🛠️ OPTIMISATIONS VERCEL CONFIGURATION

### Vercel.json Production Optimisé

```json
{
  "functions": {
    "src/app/api/stripe/checkout/route.ts": { "maxDuration": 30 },
    "src/app/api/system/metrics/route.ts": { "maxDuration": 10 },
    "src/app/api/health/route.ts": { "maxDuration": 5 },
    "src/app/api/demandes/route.ts": { "maxDuration": 15 },
    "src/app/api/orchestration/route.ts": { "maxDuration": 60 },
    "src/app/api/orchestration/webhooks/route.ts": { "maxDuration": 30 },
    "src/app/api/orchestration/workflow/route.ts": { "maxDuration": 120 },
    "src/app/api/workflows/execute/route.ts": { "maxDuration": 300 },
    "src/app/api/webhooks/polar/route.ts": { "maxDuration": 30 }
  },
  "regions": ["iad1"],
  "crons": [
    { "path": "/api/system/metrics", "schedule": "*/5 * * * *" },
    { "path": "/api/orchestration/workflow", "schedule": "*/2 * * * *" }
  ]
}
```

### Next.js Configuration Production

- ✅ **Compression** : Activée
- ✅ **Security headers** : CSRF, XSS, etc.
- ✅ **Image optimization** : WebP/AVIF formats
- ✅ **Bundle splitting** : Optimisation webpack
- ✅ **Cache optimization** : Headers configurés

---

## 🚀 PROCÉDURE DE DÉPLOIEMENT

### Étape 1 : Préparation Environnement
```bash
# 1. Cloner le projet si nécessaire
git clone [repository-url]
cd website-generator-v2-multi-agents-clean

# 2. Installer les dépendances
npm ci

# 3. Configurer Vercel
vercel login
vercel link
```

### Étape 2 : Configuration Variables Vercel
```bash
# Utiliser le script automatisé
chmod +x scripts/setup-vercel-env.sh
./scripts/setup-vercel-env.sh

# OU configurer manuellement
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add DATABASE_URL production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PUBLISHABLE_KEY production
# ... etc pour toutes les variables
```

### Étape 3 : Test Build Local
```bash
# Test build production
NODE_ENV=production npm run build

# Test base de données
npm run db:generate
npm run db:push
```

### Étape 4 : Déploiement Production
```bash
# Déploiement automatisé
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh

# OU déploiement manuel
vercel --prod --confirm
```

---

## 🔍 VÉRIFICATIONS POST-DÉPLOIEMENT

### Tests de Fonctionnalités Critiques

#### 1. Health Check Général
```bash
curl https://your-domain.vercel.app/api/health
# Réponse attendue: {"status": "ok", "timestamp": "..."}
```

#### 2. Test Base de Données
```bash
curl https://your-domain.vercel.app/api/system/metrics
# Vérifier : latence DB < 100ms
```

#### 3. Test Orchestration Multi-Agents
```bash
curl https://your-domain.vercel.app/dashboard-v2
# Vérifier : Tous agents "online", response time < 35ms
```

#### 4. Test Workflow Complet (CRITIQUE)
```bash
# 1. Créer une demande test via l'interface
# 2. Déclencher paiement Stripe test
# 3. Vérifier webhook Stripe reçu
# 4. Vérifier déclenchement orchestration
# 5. Vérifier génération site (25min max)
```

---

## 🎯 WORKFLOW BUSINESS TEST

### Scénario Complet : Client → Site Livré

1. **Client remplit formulaire** `/demande`
   - Informations entreprise
   - Secteur d'activité
   - Besoins spécifiques

2. **Paiement 399€** (Stripe Production)
   - Redirection checkout Stripe
   - Webhook confirmation paiement
   - Création commande en base

3. **Orchestration Automatique** (25min max)
   - Agent Design IA : Génération maquettes
   - Agent Core Platform : Structure technique
   - Agent Automation : Workflows
   - Agent Ads Management : Optimisations

4. **Livraison Site**
   - Déploiement automatique
   - Email confirmation avec URLs
   - Activation maintenance

### Points de Contrôle Critiques

- ✅ **Paiement confirmé** : < 30 secondes
- ✅ **Orchestration démarrée** : < 1 minute
- ✅ **Premier agent actif** : < 2 minutes
- ✅ **Site généré** : < 25 minutes
- ✅ **Email envoyé** : < 30 minutes

---

## 📊 MONITORING PRODUCTION

### Dashboard Temps Réel
- **URL** : `https://your-domain.vercel.app/dashboard-v2`
- **Métriques** : Agents uptime, response times, error rates
- **Alertes** : Performance dégradée, erreurs système

### Endpoints Surveillance
```bash
# Santé système
GET /api/health

# Métriques performance
GET /api/system/metrics

# Statut orchestration
GET /api/orchestration

# Queue workflows
GET /api/workflows
```

### Vercel Analytics
- **Functions performance** : Durée exécution
- **Database latency** : Temps de réponse DB
- **Error tracking** : Taux d'erreur par endpoint
- **Resource usage** : CPU, Memory, Network

---

## 🔒 SÉCURITÉ PRODUCTION

### Headers Sécurité Configurés
```javascript
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-DNS-Prefetch-Control: on
```

### Protection API
- **NextAuth** : Authentication middleware
- **CORS** : Origins contrôlés
- **Rate limiting** : Protection DDoS
- **Webhook signatures** : Stripe et Polar validés

### Variables Sensibles
- ✅ Clés Stripe en variables Vercel sécurisées
- ✅ Database URL chiffrée
- ✅ Tokens inter-agents sécurisés
- ✅ Secrets webhooks protégés

---

## 🚨 TROUBLESHOOTING

### Problèmes Courants

#### 1. Build Fails
```bash
# Vérifier dépendances
npm ci
npm audit fix

# Clean build
rm -rf .next node_modules
npm install
npm run build
```

#### 2. Database Connection Issues
```bash
# Test connexion locale
npm run db:studio

# Vérifier variables d'environnement
vercel env ls
```

#### 3. Agents Non Responsifs
```bash
# Vérifier Dashboard V2
curl https://your-domain.vercel.app/dashboard-v2

# Check orchestration
curl https://your-domain.vercel.app/api/orchestration
```

#### 4. Webhooks Non Reçus
```bash
# Vérifier signatures
# Stripe Dashboard → Webhooks → Test events
# Polar Dashboard → Webhooks → Logs
```

---

## 📈 SCALING & PERFORMANCE

### Optimisations Vercel
- **Edge Functions** : APIs critiques
- **ISR** : Génération incrémentale
- **CDN** : Assets statiques
- **Regional deployment** : Latence minimale

### Database Scaling
- **Connection pooling** : Neon configuré
- **Query optimization** : Index optimisés
- **Read replicas** : Si volume élevé

### Monitoring Alerts
```javascript
// Seuils critiques
responseTime > 200ms → Warning
errorRate > 5% → Critical
agentDowntime > 30s → Alert
paymentFailure → Immediate
```

---

## ✅ CHECKLIST FINAL DÉPLOIEMENT

### Pré-déploiement
- [ ] Variables environnement configurées
- [ ] Build local réussi
- [ ] Tests base de données OK
- [ ] Configuration Stripe vérifiée
- [ ] Webhooks endpoints configurés

### Post-déploiement
- [ ] Health check API OK
- [ ] Dashboard V2 accessible
- [ ] Tous agents online
- [ ] Métriques collectées
- [ ] Test paiement effectué
- [ ] Workflow complet testé

### Business Validation
- [ ] Demande test créée
- [ ] Paiement 399€ test réussi
- [ ] Site généré en < 25min
- [ ] Email livraison reçu
- [ ] Client peut accéder au site

---

## 🎉 RÉSULTAT ATTENDU

**SUCCÈS = Client paie 399€ → Site professionnel livré automatiquement en 25 minutes maximum**

- ✅ **Orchestration multi-agents** opérationnelle
- ✅ **Paiements Stripe** production fonctionnels
- ✅ **Génération automatique** sans intervention
- ✅ **Monitoring temps réel** actif
- ✅ **Performance optimale** maintenue

---

*Agent Core Platform V2 - Production Ready* ✅

**Contact Support** : Pour assistance technique during deployment
**Dashboard Monitoring** : https://your-domain.vercel.app/dashboard-v2
**Status Page** : https://your-domain.vercel.app/api/health