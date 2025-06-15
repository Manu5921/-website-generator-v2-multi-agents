# 🌐 Configuration Domaine Vercel - Guide Complet

## 📋 Étapes de Configuration

### 1. Dans Vercel Dashboard

1. **Accéder au projet** : https://vercel.com/dashboard
2. **Sélectionner** `website-generator-platform`
3. **Settings** → **Domains**

### 2. Options de domaine

#### Option A : Domaine Vercel personnalisé (Gratuit)
```
# Suggestions de noms :
website-generator-pro.vercel.app
creation-sites-auto.vercel.app
generator-web-platform.vercel.app
sites-professionnels.vercel.app
```

#### Option B : Domaine personnalisé
```
# Si vous avez un domaine existant :
generator.votre-domaine.com
sites.votre-domaine.com
creation.votre-domaine.com
```

### 3. Configuration DNS (pour domaine personnalisé)

```dns
# Type A record
@ → 76.76.19.61

# Type CNAME record  
www → cname.vercel-dns.com
```

### 4. Variables d'environnement Vercel

Après avoir configuré le domaine, ajouter dans Vercel → **Settings** → **Environment Variables** :

```bash
# Production
NEXTAUTH_URL=https://votre-nouveau-domaine.com
APP_URL=https://votre-nouveau-domaine.com

# Base de données (copier depuis .env.local)
DATABASE_URL=postgresql://...

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# NextAuth Secret
NEXTAUTH_SECRET=5u61zO6lWjihY0Rb3LNefHEJLApoPdwjLwjkwrx6CFM=
```

### 5. Mise à jour URLs dans le code

Une fois le domaine configuré, mettre à jour :

#### CTAWidget.tsx
```typescript
// Remplacer :
targetUrl = 'https://website-generator-platform-9swnuoxxa.vercel.app/demande'

// Par :
targetUrl = 'https://votre-nouveau-domaine.com/demande'
```

#### INTEGRATION_GUIDE.md
```markdown
# Remplacer toutes les occurrences :
https://website-generator-platform-9swnuoxxa.vercel.app

# Par :
https://votre-nouveau-domaine.com
```

### 6. Test et vérification

1. **Déploiement** : Vercel redéploie automatiquement
2. **Test formulaire** : https://votre-nouveau-domaine.com/demande
3. **Test dashboard** : https://votre-nouveau-domaine.com/dashboard
4. **Test paiement** : Workflow complet Stripe

## 🔧 Script de mise à jour automatique

```bash
#!/bin/bash
# update-domain.sh

NEW_DOMAIN="$1"

if [ -z "$NEW_DOMAIN" ]; then
  echo "Usage: ./update-domain.sh votre-nouveau-domaine.com"
  exit 1
fi

echo "🔄 Mise à jour du domaine vers: $NEW_DOMAIN"

# Mettre à jour CTAWidget
sed -i "s|website-generator-platform-9swnuoxxa.vercel.app|$NEW_DOMAIN|g" src/components/CTAWidget.tsx

# Mettre à jour INTEGRATION_GUIDE
sed -i "s|website-generator-platform-9swnuoxxa.vercel.app|$NEW_DOMAIN|g" INTEGRATION_GUIDE.md

# Mettre à jour DEVBOOK
sed -i "s|website-generator-platform-9swnuoxxa.vercel.app|$NEW_DOMAIN|g" DEVBOOK.md

echo "✅ Domaine mis à jour dans tous les fichiers"
echo "⚠️  N'oubliez pas de configurer les variables d'environnement Vercel !"
```

## 📝 Recommandations

### Noms de domaine suggérés

#### Vercel gratuit (.vercel.app)
- `creation-sites-pro.vercel.app`
- `website-generator-auto.vercel.app`
- `sites-professionnels.vercel.app`
- `generator-web-platform.vercel.app`

#### Domaine personnalisé
- `sites-auto.fr` / `.com`
- `creation-web.fr` / `.com`
- `generator-pro.fr` / `.com`
- `sites-express.fr` / `.com`

### Avantages domaine fixe

✅ **URLs stables** - Plus de changement d'URL à chaque déploiement  
✅ **Branding** - Nom professionnel et mémorable  
✅ **SEO** - Meilleur référencement avec domaine fixe  
✅ **Intégration** - Links permanents pour le site professionnel  
✅ **Confiance** - URLs professionnelles pour les clients  

## 🚨 Points d'attention

- **SSL automatique** : Vercel configure HTTPS automatiquement
- **Redirection** : L'ancienne URL sera toujours accessible
- **Variables env** : Bien configurer NEXTAUTH_URL en production
- **Cache** : Vider le cache navigateur après changement
- **Tests** : Tester tous les workflows après migration

---

**Une fois configuré, votre plateforme aura une URL permanente et professionnelle !**