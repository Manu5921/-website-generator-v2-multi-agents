# 🌐 Website Generator Platform

Une plateforme complète de génération automatique de sites web professionnels avec système de paiement intégré et dashboard d'administration.

## 📋 Description

Cette application Next.js permet de :
- 📝 Collecter des demandes de création de sites web via un formulaire client
- 💳 Gérer les paiements avec Stripe (et Polar en alternative)
- 👨‍💼 Administrer les demandes via un dashboard sécurisé
- 🚀 Générer automatiquement des sites web
- 📧 Envoyer des emails de confirmation automatiques

## ✨ Fonctionnalités

### 🎯 Core Features
- **Formulaire client** : Interface simple pour les demandes de sites web
- **Dashboard admin** : Gestion complète des demandes avec NextAuth
- **Paiements** : Intégration Stripe + Polar pour les transactions
- **Base de données** : PostgreSQL via Neon avec Drizzle ORM
- **Emails** : Système d'envoi automatique avec Nodemailer
- **Déploiement** : Optimisé pour Vercel

### 💳 Systèmes de Paiement
- **Stripe** : Solution principale avec liens de paiement directs
- **Polar** : Alternative avec API complète (backup)
- **Tests** : Cartes de test et environnement sandbox

## 🚀 Installation

### Prérequis
- Node.js 18+
- PostgreSQL (via Neon recommandé)
- Compte Stripe (pour les paiements)

### 1. Cloner le projet
```bash
git clone <repository-url>
cd website-generator-platform
npm install
```

### 2. Configuration environnement
Copiez `.env.example` vers `.env.local` et configurez :

```bash
# Base de données Neon
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL=http://localhost:3334
NEXTAUTH_SECRET=your-secret-here

# Stripe (principal)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Polar (backup)
POLAR_ACCESS_TOKEN=polar_oat_...
POLAR_ORGANIZATION_ID=...

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your.email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Initialiser la base de données
```bash
npm run db:push
```

### 4. Créer l'admin
```bash
npm run init-admin
```

### 5. Lancer en développement
```bash
npm run dev
```

L'application sera disponible sur http://localhost:3334

## 🎛️ Utilisation

### Pour les clients
1. **Formulaire** : http://localhost:3334/demande
2. **Remplir** les informations d'entreprise
3. **Soumettre** la demande

### Pour l'admin
1. **Connexion** : http://localhost:3334/login
2. **Dashboard** : http://localhost:3334/dashboard
3. **Gestion** des demandes et paiements

### Tests de paiement
- **Stripe** : Utilise les liens directs configurés
- **Carte test** : `4242 4242 4242 4242`
- **Date** : n'importe quelle date future
- **CVC** : n'importe quel code 3 chiffres

## 🏗️ Architecture

### Stack technique
- **Frontend** : Next.js 15 + TypeScript + Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : PostgreSQL + Drizzle ORM
- **Auth** : NextAuth.js
- **Paiements** : Stripe + Polar
- **Emails** : Nodemailer
- **Déploiement** : Vercel

### Structure des dossiers
```
src/
├── app/                    # Pages et API routes
│   ├── api/               # Backend API
│   ├── dashboard/         # Interface admin
│   ├── demande/          # Formulaire client
│   └── paiement/         # Pages de paiement
├── components/           # Composants React
├── lib/                  # Utilitaires et clients
│   ├── auth.ts          # Configuration NextAuth
│   ├── db/              # Base de données
│   ├── stripe/          # Client Stripe
│   ├── polar/           # Client Polar
│   └── email/           # Client email
```

## 💾 Base de données

### Tables principales
- **demandes_clients** : Demandes de sites web
- **commandes** : Commandes et paiements
- **users** : Comptes administrateurs

### Migrations
```bash
npm run db:generate  # Générer une migration
npm run db:push      # Appliquer en base
npm run db:studio    # Interface Drizzle Studio
```

## 🔐 Sécurité

- **Authentification** : NextAuth avec sessions sécurisées
- **API Protection** : Routes admin protégées
- **Variables d'environnement** : Secrets non exposés
- **HTTPS** : SSL en production
- **CORS** : Configuration appropriée

## 🚀 Déploiement

### Vercel (recommandé)
1. **Connecter** le repository GitHub
2. **Configurer** les variables d'environnement
3. **Déployer** automatiquement

### Variables Vercel nécessaires
```bash
DATABASE_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
```

### URL de production
https://site-pro-one.vercel.app

## 📧 Configuration Email

### Gmail (recommandé)
1. **Activer** l'authentification 2FA
2. **Générer** un mot de passe d'application
3. **Configurer** SMTP_USER et SMTP_PASS

### Autres providers
Adaptez SMTP_HOST et SMTP_PORT selon votre fournisseur.

## 🛠️ Scripts disponibles

```bash
npm run dev          # Développement
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Linting
npm run db:push      # Sync base de données
npm run db:studio    # Interface DB
npm run init-admin   # Créer admin
```

## 🧪 Tests

### Tests de paiement
- **Stripe** : Liens directs configurés
- **Polar** : API avec produits de test
- **Cartes test** : Documentation Stripe/Polar

### Environnements
- **Local** : http://localhost:3334
- **Production** : URL Vercel

## 📚 Documentation

- **DEVBOOK.md** : Documentation technique détaillée
- **POLAR_SETUP.md** : Configuration Polar spécifique
- **SESSION_RESUME_PROMPT.md** : Guide de reprise de session

## 🔧 Dépannage

### Problèmes courants
1. **Erreur DB** : Vérifier DATABASE_URL
2. **Auth échouée** : Vérifier NEXTAUTH_SECRET
3. **Paiement bloqué** : Vérifier clés Stripe
4. **Email non envoyé** : Vérifier SMTP config

### Debug
```bash
npm run dev         # Mode développement avec logs
tail -f nextjs.log  # Suivre les logs
```

## 🤝 Contribution

1. **Fork** le projet
2. **Créer** une branche feature
3. **Commit** vos changements
4. **Push** vers la branche
5. **Ouvrir** une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- **Issues** : Ouvrir un ticket GitHub
- **Documentation** : Consulter DEVBOOK.md
- **Email** : contact@website-generator.com

---

Made with ❤️ using Next.js and TypeScript