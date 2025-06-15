# 🚨 CONSIGNES OBLIGATOIRES - SYSTÈME MULTI-AGENTS

*Dernière mise à jour : 15 juin 2025 - 21:10*

---

## ⚡ **RÈGLES CRITIQUES - JAMAIS D'EXCEPTION**

### **1. SYSTÈME MULTI-AGENTS OBLIGATOIRE**
- ✅ **TOUJOURS** lancer 4 Task en parallèle simultanément
- ✅ **RELANCER** immédiatement l'agent qui termine sa task
- ✅ **MAINTENIR** 4 agents actifs en permanence
- ❌ **JAMAIS** d'agent inactif ou de développement séquentiel

### **2. PORTS INTERDITS/AUTORISÉS**
- ❌ **JAMAIS** utiliser le port 3000 (toujours occupé)
- ✅ **TOUJOURS** utiliser port 3040+ ou celui spécifié par l'utilisateur
- ✅ **VÉRIFIER** que le port est libre avant démarrage

### **3. VALIDATION SYSTÉMATIQUE**
- ✅ **TOUJOURS** demander confirmation utilisateur avant étape suivante
- ✅ **TOUJOURS** tester build localement AVANT déploiement
- ✅ **TOUJOURS** vérifier URLs accessibles après déploiement
- ❌ **JAMAIS** supposer qu'une étape a fonctionné

---

## 🎨 **CONSIGNES DESIGN (Agent Design)**

### **Photos & Visuels OBLIGATOIRES**
- ✅ **VRAIES PHOTOS** Unsplash uniquement (jamais d'emojis/placeholders)
- ✅ **PHOTOS OPTIMISÉES** : Next.js Image, WebP/AVIF, lazy loading
- ✅ **COHÉRENCE SECTORIELLE** : photos matching le secteur (restaurant/coiffeur/artisan)
- ❌ **JAMAIS** de "fond uni" ou design basique

### **Effets Visuels OBLIGATOIRES**
- ✅ **GLASSMORPHISM** : transparence, blur, effets premium
- ✅ **ANIMATIONS** : Framer Motion fluides et professionnelles
- ✅ **MICRO-INTERACTIONS** : hover effects, transitions smooth
- ✅ **RESPONSIVE** : mobile-first, tous breakpoints

### **Standards Qualité**
- ✅ **NIVEAU AGENCE PREMIUM** : comparable à des sites pros
- ✅ **ICONS PROFESSIONNELS** : Heroicons ou SVG custom (pas d'emojis)
- ✅ **TYPOGRAPHIE** : hiérarchie claire, lisibilité parfaite
- ✅ **COULEURS** : palette cohérente, contrastes accessibles

---

## ⚙️ **CONSIGNES AUTOMATION (Agent Automation)**

### **N8N Setup OBLIGATOIRE**
- ✅ **DOCKER COMPOSE** : containerisation complète
- ✅ **WORKFLOWS TESTÉS** : validation manuelle de chaque workflow
- ✅ **VARIABLES ENV** : sécurisation des API keys
- ✅ **MONITORING** : health checks automatiques

### **Email Sequences**
- ✅ **TEMPLATES HTML** : design professionnel responsive
- ✅ **SEGMENTATION** : par secteur d'activité
- ✅ **TRACKING** : open rates, click rates, conversions
- ✅ **DÉSABONNEMENT** : conformité RGPD

### **Chatbot IA**
- ✅ **CLAUDE API** : intégration Claude Sonnet
- ✅ **CONTEXTE SECTORIEL** : réponses adaptées métier
- ✅ **ESCALADE AUTO** : vers humain si nécessaire
- ✅ **ANALYTICS** : satisfaction, résolution rate

---

## 📊 **CONSIGNES ADS (Agent Ads)**

### **Google Ads API**
- ✅ **AUTHENTIFICATION** : OAuth2 sécurisé
- ✅ **CAMPAGNES TEST** : budget limité pour validation
- ✅ **TRACKING CONVERSIONS** : GA4 + pixels
- ✅ **RAPPORTS AUTO** : daily/weekly/monthly

### **Attribution & Analytics**
- ✅ **UTM TRACKING** : source, medium, campaign, content
- ✅ **CROSS-PLATFORM** : Google + Facebook + LinkedIn
- ✅ **ROI TRACKING** : revenus vs dépenses pub
- ✅ **ML OPTIMIZATION** : bid adjustments automatiques

---

## 💎 **CONSIGNES CORE (Agent Core)**

### **Performance OBLIGATOIRE**
- ✅ **LIGHTHOUSE 95+** : Performance, Accessibility, Best Practices, SEO
- ✅ **CORE WEB VITALS** : FCP <1.2s, LCP <2.5s, FID <100ms, CLS <0.1
- ✅ **PWA COMPLETE** : manifest, service worker, offline support
- ✅ **MOBILE FIRST** : responsive parfait sur tous devices

### **Dashboard V3**
- ✅ **TEMPS RÉEL** : WebSocket ou polling optimisé
- ✅ **ANALYTICS INTÉGRÉES** : métriques business et techniques
- ✅ **NOTIFICATIONS** : push notifications pour événements critiques
- ✅ **UX MODERNE** : micro-interactions, feedback utilisateur

---

## 🔧 **WORKFLOW DE DÉPLOIEMENT BULLETPROOF**

### **ÉTAPES OBLIGATOIRES DANS L'ORDRE**
1. ✅ **BUILD LOCAL** : `npm run build` + vérification erreurs
2. ✅ **TEST PORT** : vérification accessibilité locale
3. ✅ **DEPENDENCIES CHECK** : package.json vs node_modules
4. ✅ **ICONS VALIDATION** : tous les imports Heroicons valides
5. ✅ **IMAGES VALIDATION** : toutes les URLs Unsplash accessibles
6. ✅ **RE-BUILD** : `npm run build` (confirmation)
7. ✅ **VERCEL DEPLOY** : `npx vercel --prod`
8. ✅ **URL TEST** : vérification accessibilité publique
9. ✅ **CONFIRMATION USER** : demander validation avant suite

### **CHECKLIST PRÉ-DÉPLOIEMENT**
```bash
□ Port ≠ 3000 (utiliser 3040+ ou spécifié)
□ Build réussi sans erreurs/warnings
□ Images Unsplash chargent correctement
□ Effets glassmorphism appliqués
□ Animations Framer Motion fonctionnelles
□ Responsive design validé
□ Performance Lighthouse >90
□ Aucune console error en browser
□ URL locale accessible et testée
```

---

## 🚨 **VALIDATION UTILISATEUR OBLIGATOIRE**

### **POINTS DE VALIDATION CRITIQUES**
- ✅ **APRÈS CHAQUE MILESTONE** : demander "OK pour continuer ?"
- ✅ **AVANT DÉPLOIEMENT** : "Build testé, puis-je déployer ?"
- ✅ **APRÈS DÉPLOIEMENT** : "URL accessible, validation du résultat ?"
- ✅ **FIN DE TASK** : "Task terminée, instructions pour la suite ?"

### **JAMAIS SUPPOSER**
- ❌ Que l'utilisateur est satisfait du résultat
- ❌ Que le déploiement a fonctionné
- ❌ Que les photos s'affichent correctement
- ❌ Que le port est disponible
- ❌ Que la task suivante est évidente

---

## 📝 **TEMPLATES DE COMMUNICATION**

### **DEMANDE DE VALIDATION**
```
✅ [ÉTAPE] terminée avec succès
🔍 Résultat : [URL/PORT/DESCRIPTION]
❓ Validation OK pour continuer vers [PROCHAINE ÉTAPE] ?
```

### **RAPPORT D'ERREUR**
```
🚨 Erreur détectée : [DESCRIPTION]
🔧 Cause identifiée : [CAUSE]
💡 Solution proposée : [SOLUTION]
⏳ ETA correction : [TEMPS]
```

### **FIN DE TASK AGENT**
```
✅ Task [AGENT] terminée
📋 Livrables : [LISTE]
🎯 Prochaine étape suggérée : [ÉTAPE]
❓ Instructions pour continuer ?
```

---

## 🎯 **OBJECTIF BUSINESS CRITIQUE**

### **PROMESSE CLIENT : 25 MINUTES**
- ⏱️ **Génération template** : <5 minutes
- ⚙️ **Setup automation** : <10 minutes  
- 📊 **Campagne ads** : <5 minutes
- 💎 **Optimisations** : <5 minutes
- **TOTAL** : <25 minutes

### **ZÉRO TOLÉRANCE**
- ❌ **Erreurs de déploiement** = service non fiable
- ❌ **Templates basiques** = pas de différenciation
- ❌ **Processus lent** = promesse non tenue
- ❌ **Agents inactifs** = inefficacité maximale

---

## 🚀 **ENGAGEMENT QUALITÉ**

**CHAQUE AGENT S'ENGAGE À :**
1. **RESPECTER** scrupuleusement toutes ces consignes
2. **DEMANDER** validation à chaque étape critique  
3. **LIVRER** un travail de niveau agence premium
4. **MAINTENIR** 4 agents actifs en permanence
5. **TENIR** la promesse des 25 minutes

**CES CONSIGNES SONT NON-NÉGOCIABLES.**

---

*🤖 Document de référence obligatoire pour tous les agents du système multi-agents*