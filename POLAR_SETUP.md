# 🎯 Configuration Polar - Guide Complet

## 1. Création du compte Polar

1. Aller sur [polar.sh](https://polar.sh)
2. Créer un compte gratuit
3. Valider l'email de confirmation

## 2. Configuration de l'Organisation

1. Dans Polar dashboard, aller dans **Settings** → **Organization**
2. Renseigner les informations de votre entreprise
3. Configurer les détails fiscaux (important pour l'Europe)

## 3. Création des Produits

### Produit 1: Création de Site Web (399€)
```
Nom: Création Site Web Professionnel
Prix: 399€
Type: One-time purchase
Description: Création complète d'un site web professionnel avec design adapté au secteur d'activité
```

### Produit 2: Maintenance Mensuelle (29€/mois)
```
Nom: Maintenance Site Web
Prix: 29€
Type: Recurring (Monthly)
Description: Maintenance, sécurité, sauvegarde et support technique
```

## 4. Récupération des API Keys

1. Aller dans **Settings** → **Access Tokens**
2. Créer un nouveau token avec les permissions :
   - `checkouts:write`
   - `orders:read`
   - `products:read`
   - `subscriptions:read`
3. Copier le token généré

## 5. Configuration des Variables d'Environnement

Mettre à jour `.env.local` :

```bash
# POLAR API CONFIGURATION
POLAR_ACCESS_TOKEN=polar_at_your_actual_token_here
POLAR_MODE=sandbox  # ou "production" pour le live

# Product Price IDs (à récupérer depuis Polar dashboard)
POLAR_SITE_CREATION_PRICE_ID=price_xxxxxxxxxxxxx
POLAR_MAINTENANCE_PRICE_ID=price_xxxxxxxxxxxxx

# Webhook Secret (à configurer après création webhook)
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

## 6. Configuration du Webhook

1. Dans Polar dashboard, aller dans **Settings** → **Webhooks**
2. Créer un nouveau webhook :
   - **URL**: `https://votre-domaine.com/api/webhooks/polar`
   - **Events sélectionnés**:
     - `checkout.updated`
     - `order.created`
     - `subscription.active`
     - `subscription.canceled`
     - `subscription.revoked`
3. Copier le **Webhook Secret** généré
4. Mettre à jour `POLAR_WEBHOOK_SECRET` dans `.env.local`

## 7. Tests en Mode Sandbox

### Test du Workflow Complet

1. **Créer une demande client** via `/demande`
2. **Se connecter au dashboard admin** via `/login`
3. **Créer un lien de paiement** depuis le dashboard
4. **Tester le paiement** avec les cartes de test Polar :
   - Carte réussie : `4242424242424242`
   - CVC : `123`
   - Date : Future (ex: 12/30)

### Vérification des Webhooks

Utiliser [ngrok](https://ngrok.com) pour les tests locaux :

```bash
# Installer ngrok
npm install -g ngrok

# Exposer le serveur local
ngrok http 3334

# Utiliser l'URL ngrok dans la configuration webhook Polar
https://abc123.ngrok.io/api/webhooks/polar
```

## 8. Récupération des Product Price IDs

1. Dans Polar dashboard, aller dans **Products**
2. Cliquer sur chaque produit créé
3. Dans l'onglet **Pricing**, copier le **Price ID**
4. Mettre à jour les variables dans `.env.local`

## 9. Passage en Production

1. Changer `POLAR_MODE=production` dans `.env.local`
2. Utiliser le vrai token de production
3. Configurer le webhook avec l'URL de production
4. Tester avec de vrais paiements (petits montants)

## 10. Monitoring et Logs

### Dashboard Polar
- Vérifier les paiements dans **Orders**
- Surveiller les webhooks dans **Webhooks** → **Deliveries**
- Consulter les métriques dans **Analytics**

### Logs Application
- Vérifier les logs Next.js pour les webhooks
- Monitorer la base de données pour les commandes
- Suivre les emails envoyés

## 🎯 Checklist de Validation

- [ ] Compte Polar créé et vérifié
- [ ] Organisation configurée avec détails fiscaux
- [ ] 2 produits créés (399€ + 29€/mois)
- [ ] Access Token généré avec bonnes permissions
- [ ] Variables d'environnement mises à jour
- [ ] Webhook configuré avec bonne URL
- [ ] Test complet en mode sandbox réussi
- [ ] Logs webhook fonctionnels
- [ ] Emails de confirmation envoyés
- [ ] Base de données mise à jour correctement

## 🚨 Points d'Attention

1. **Signature Webhook** : Le secret doit être en base64
2. **Product Price IDs** : Bien récupérer les IDs depuis Polar
3. **Modes Sandbox/Production** : Ne pas mélanger les tokens
4. **HTTPS obligatoire** : Les webhooks nécessitent HTTPS
5. **Timeout webhook** : Polar timeout après 30 secondes

## 📞 Support

- Documentation Polar : [docs.polar.sh](https://docs.polar.sh)
- Support Polar : support@polar.sh
- API Reference : [api.polar.sh](https://api.polar.sh)