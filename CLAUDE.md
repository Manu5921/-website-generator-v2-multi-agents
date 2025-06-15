# 🤖 CLAUDE.md - Configuration et Contexte de Développement

*Dernière mise à jour : 15 juin 2025 - 06:50*

---

## 🎯 CONTEXTE PROJET

### **Vision Principale**
Plateforme révolutionnaire de génération automatique de sites web avec écosystème IA complet - **La première AGENCE DIGITALE IA** qui transforme automatiquement toute PME en business digital ultra-performant.

### **Statut Actuel**
- ✅ **MVP 100% Opérationnel** : Next.js + PostgreSQL + Stripe + Polar
- ✅ **Architecture Multi-Agents Configurée** : 4 agents parallèles prêts
- 🚀 **Phase 2** : Développement des capacités IA avancées

---

## 🏗️ ARCHITECTURE MULTI-AGENTS

### **Repository Principal**
- **GitHub** : https://github.com/Manu5921/-website-generator-v2-multi-agents
- **Dossier** : `/Users/manu/Documents/DEV/website-generator-v2-multi-agents-clean/`
- **Branche** : `main`

### **4 Agents Spécialisés**

#### 🎨 **Agent 1 : Design IA Specialist**
- **Dossier** : `/Users/manu/Documents/DEV/website-generator-design-ai/`
- **Branche** : `agent/design-ai`
- **Port** : 3335
- **Mission** : Figma MCP + Claude créatif + Templates sectoriels
- **Technologies** : Claude MCP, Figma API, Midjourney/DALL-E
- **Priorité** : 🔥 CRITIQUE (différenciation marché majeure)

#### 🤖 **Agent 2 : Automation Specialist**
- **Dossier** : `/Users/manu/Documents/DEV/website-generator-automation/`
- **Branche** : `agent/automation`
- **Port** : 3336
- **Mission** : N8N workflows + Agents IA conversationnels
- **Technologies** : N8N, Claude/GPT-4, APIs tierces (CRM, booking)
- **Priorité** : 🔥 HAUTE (recurring revenue + valeur ajoutée)

#### 📊 **Agent 3 : Ads Management Specialist**
- **Dossier** : `/Users/manu/Documents/DEV/website-generator-ads/`
- **Branche** : `agent/ads-management`
- **Port** : 3337
- **Mission** : Google/Facebook Ads + ML + Analytics
- **Technologies** : Google Ads API, Facebook Ads API, ML algorithms
- **Priorité** : 🟡 MOYENNE (source revenue importante - 20% commission)

#### 💎 **Agent 4 : Core Platform Enhancement**
- **Dossier** : `/Users/manu/Documents/DEV/website-generator-core/`
- **Branche** : `agent/core-platform`
- **Port** : 3334 (existant)
- **Mission** : Optimisation architecture + Performance + UX
- **Technologies** : Next.js, PostgreSQL, optimisations
- **Priorité** : 🟡 MOYENNE (fondation solide)

---

## 📋 STACK TECHNIQUE ACTUEL

### **Frontend & Backend**
- **Framework** : Next.js 15.3.3 avec App Router
- **Language** : TypeScript strict
- **Styling** : Tailwind CSS v4
- **Base de données** : PostgreSQL (Neon) + Drizzle ORM
- **Authentification** : NextAuth.js

### **Paiements & APIs**
- **Principal** : Stripe (clés test configurées)
- **Backup** : Polar (clés test configurées)
- **Emails** : Nodemailer (SMTP Gmail)

### **Déploiement & Infrastructure**
- **Production** : Vercel (à configurer nouveau projet)
- **Database** : Neon PostgreSQL
- **Monitoring** : À implémenter

---

## 🔑 VARIABLES D'ENVIRONNEMENT CRITIQUES

### **Base de Données**
```bash
DATABASE_URL=postgresql://... # Neon PostgreSQL
```

### **Authentification**
```bash
NEXTAUTH_URL=http://localhost:3334
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### **Paiements**
```bash
# Stripe (Principal)
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE

# Polar (Backup)
POLAR_ACCESS_TOKEN=polar_oat_YOUR_POLAR_ACCESS_TOKEN_HERE
POLAR_ORGANIZATION_ID=your_org_id_here
```

### **Emails (Optionnel)**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### **APIs IA (À Configurer)**
```bash
# Figma (Design IA)
FIGMA_ACCESS_TOKEN=figd_your_token_here
FIGMA_TEAM_ID=your_team_id

# Claude MCP
CLAUDE_MCP_SERVER_URL=ws://localhost:3002
ANTHROPIC_MCP_API_KEY=your_key

# Image Generation
DALLE_API_KEY=your_openai_key
MIDJOURNEY_API_KEY=your_midjourney_key

# Google/Facebook Ads
GOOGLE_ADS_API_KEY=your_google_ads_key
FACEBOOK_ADS_ACCESS_TOKEN=your_facebook_token
```

---

## 🎯 OBJECTIFS PHASE 2 (3-4 Semaines)

### **Semaine 1 : Foundation**
- [ ] **Design IA** : Setup Figma MCP + première génération design
- [ ] **Automation** : Setup N8N + premier workflow restaurant
- [ ] **Ads** : Setup Google Ads API + première campagne test
- [ ] **Core** : Audit performance + optimisations critiques

### **Semaine 2-3 : Développement**
- [ ] **Design IA** : Templates sectoriels (restaurant, coiffeur, artisan)
- [ ] **Automation** : 3 agents IA (service client, marketing, BI)
- [ ] **Ads** : Algorithmes ML + attribution tracking
- [ ] **Core** : Dashboard v2 + monitoring avancé

### **Semaine 4 : Intégration**
- [ ] Tests inter-agents
- [ ] Déploiement Vercel
- [ ] Documentation finale
- [ ] Préparation commercialisation

---

## 💰 BUSINESS MODEL CIBLE

### **Offres Finales**
- **DIGITAL STARTER** : 899€ setup + 199€/mois
- **DIGITAL PROFESSIONAL** : 1499€ setup + 399€/mois
- **DIGITAL ENTERPRISE** : 2499€ setup + 699€/mois

### **Revenue Streams**
1. **Setup** : 899€ - 2499€ par client
2. **Recurring** : 199€ - 699€ par mois par client
3. **Ads Commission** : 20% des budgets publicitaires clients
4. **Premium Services** : Design custom, intégrations spéciales

### **Projection Année 1**
- **100 clients actifs** × **400€/mois moyenne** = **480k€ recurring**
- **Setup revenue** : **150k€**
- **Ads commission** : **120k€**
- **Total** : **750k€ CA**

---

## 📊 MÉTRIQUES DE SUCCÈS

### **Performance Technique**
- **Génération design** : < 5 secondes
- **Workflows N8N** : 99.5%+ uptime
- **Agents IA** : < 2s latence de réponse
- **Lighthouse Score** : 90+ sur toutes pages

### **Business KPIs**
- **Time-to-delivery** : 3-4 jours vs 2-3 semaines
- **Client satisfaction** : 95%+ sur interface collaboration
- **Revenue per client** : +300% vs MVP actuel
- **Market differentiation** : Seule plateforme IA complète France

---

## 🚨 POINTS D'ATTENTION CRITIQUES

### **Sécurité**
- ✅ **Secrets nettoyés** dans repository GitHub
- ⚠️ **RGPD** : Données clients dans Figma = conformité stricte
- ⚠️ **API Rate Limits** : Surveiller quotas Figma/OpenAI/Google

### **Performance**
- ⚠️ **4 agents simultanés** = ressources importantes
- ⚠️ **Scaling** : Architecture doit supporter 1000+ clients
- ⚠️ **Monitoring** : Alertes sur toutes APIs critiques

### **Business**
- 🔥 **Design IA** = différenciation majeure vs concurrence
- 🔥 **Speed** = avantage concurrentiel principal
- 🔥 **Quality consistency** = rétention client maximale

---

## 📝 WORKFLOW DE DÉVELOPPEMENT

### **Commandes Essentielles**
```bash
# Lancement développement multi-agents
cd /Users/manu/Documents/DEV/website-generator-v2-multi-agents-clean
npm run dev # Port 3334

cd /Users/manu/Documents/DEV/website-generator-design-ai
npm run dev # Port 3335

# Synchronisation branches
git worktree list
git push origin agent/design-ai
git merge agent/design-ai # depuis main
```

### **Tests Critiques**
```bash
# Tests existants
npm run test-db           # Base de données
npm run test-stripe       # Paiements Stripe
npm run test-polar        # Paiements Polar
npm run test-workflow     # Workflow complet

# Tests à ajouter
npm run test-figma        # Figma MCP
npm run test-n8n          # Workflows N8N
npm run test-agents       # Agents IA
npm run test-ads          # APIs publicitaires
```

---

## 🎪 VISION FINALE

### **Impact 6 Mois**
- **10x plus rapide** que concurrence traditionnelle
- **5x moins cher** que agences premium
- **100% cohérent** grâce à automatisation IA
- **Leader français** digitalisation PME

### **Exit Strategy 5 Ans**
- **10,000+ PME** transformées digitalement
- **100M€+ CA** généré pour clients
- **Potentiel IPO/acquisition** majeure

---

## 🤖 NOTES CLAUDE SPÉCIFIQUES

### **Contexte de Travail**
- **User** : Manu (entrepreneur français, expert business digital)
- **Collaboration** : Architecture multi-agents révolutionnaire
- **Style** : Direct, concis, focus résultats business

### **Priorités de Développement**
1. **Design IA** : Différenciation marché maximale
2. **Automation** : Recurring revenue + valeur client
3. **Core Performance** : Fondation solide scaling
4. **Ads Management** : Revenue stream additionnel

### **Mise à Jour Régulière**
Ce fichier CLAUDE.md doit être mis à jour à chaque:
- Milestone atteint
- Configuration API ajoutée
- Architecture modifiée
- Objectif business ajusté

---

*🚀 Mission : Transformer cette base technique solide en écosystème révolutionnaire qui domine le marché français de la digitalisation PME via l'IA !*