# 🚀 COMMANDES RAPIDES - DÉPLOIEMENT VERCEL PRODUCTION

## Quick Start Guide - Agent Core Platform

---

## 📋 PRÉREQUIS
```bash
# Installer Vercel CLI
npm install -g vercel@latest

# Se connecter à Vercel
vercel login
```

---

## ⚡ DÉPLOIEMENT RAPIDE (3 ÉTAPES)

### 1️⃣ Configuration Automatique
```bash
# Rendre le script exécutable et lancer
chmod +x scripts/configure-vercel-production.sh
./scripts/configure-vercel-production.sh
```

### 2️⃣ Déploiement Production
```bash
# Lancer le déploiement optimisé
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

### 3️⃣ Test Workflow Complet
```bash
# Tester le workflow business
chmod +x scripts/test-production-workflow.sh
./scripts/test-production-workflow.sh https://your-domain.vercel.app
```

---

## 🔧 CONFIGURATION MANUELLE (SI NÉCESSAIRE)

### Variables Critiques Vercel
```bash
# Configuration minimale pour démarrer
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production  
vercel env add DATABASE_URL production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PUBLISHABLE_KEY production
```

### Déploiement Manuel
```bash
# Build local pour vérification
npm run build

# Déploiement production
vercel --prod --confirm
```

---

## 📊 SURVEILLANCE POST-DÉPLOIEMENT

### Endpoints de Monitoring
```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Métriques système
curl https://your-domain.vercel.app/api/system/metrics

# Dashboard temps réel
open https://your-domain.vercel.app/dashboard-v2
```

### Logs en Temps Réel
```bash
# Suivre les logs Vercel
vercel logs --follow

# Logs par fonction
vercel logs --follow --filter="api/orchestration"
```

---

## 🎯 OBJECTIF BUSINESS

**Client paie 399€ → Site livré automatiquement en 25 minutes**

### Test du Workflow Complet
1. **Créer demande** : `/demande`
2. **Paiement Stripe** : 399€
3. **Webhook reçu** : Confirmation paiement
4. **Orchestration** : 4 agents démarrés
5. **Site généré** : < 25 minutes
6. **Email livraison** : Client notifié

---

## 📁 FICHIERS CRÉÉS

```
/VERCEL_PRODUCTION_DEPLOYMENT_COMPLETE.md    # Guide complet
/VERCEL_ORCHESTRATION_COMPATIBILITY.md       # Analyse technique
/scripts/configure-vercel-production.sh       # Config automatique
/scripts/test-production-workflow.sh          # Tests workflow
/vercel.json                                  # Config optimisée
```

---

## 🚨 EN CAS DE PROBLÈME

### Debug Build
```bash
# Nettoyer et rebuild
rm -rf .next node_modules
npm ci
npm run build
```

### Debug Database
```bash
# Tester connexion DB
npm run db:studio
npm run db:push
```

### Debug Vercel
```bash
# Vérifier config
vercel env ls
vercel --debug
```

---

## ✅ CHECKLIST FINAL

- [ ] Scripts configurés et exécutables
- [ ] Variables Vercel configurées
- [ ] Build local réussi
- [ ] Déploiement Vercel OK
- [ ] Health check répond
- [ ] Dashboard V2 accessible
- [ ] Test workflow effectué
- [ ] Monitoring actif

---

## 🎉 SUCCÈS !

Si tous les checks passent :
✅ **Production Ready**
✅ **Multi-agents opérationnels** 
✅ **Workflow business fonctionnel**
✅ **Monitoring en place**

**URL Production** : https://your-domain.vercel.app
**Dashboard** : https://your-domain.vercel.app/dashboard-v2

---

*Agent Core Platform V2 - Ready for Business* 🚀