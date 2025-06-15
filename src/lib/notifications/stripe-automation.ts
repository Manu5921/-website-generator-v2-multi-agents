// =============================================================================
// 📨 SERVICE DE NOTIFICATIONS - AUTOMATION STRIPE → WORKFLOW
// =============================================================================

import { db } from '@/lib/db';
import { demandesClients, commandes, projetsMultiAgents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// =============================================================================
// 🎯 INTERFACES DE NOTIFICATION
// =============================================================================

export interface NotificationData {
  type: 'paiement_confirme' | 'paiement_echec' | 'workflow_demarre' | 'projet_termine';
  demande: any;
  projetId?: string;
  secteur?: string;
  montant?: number;
  erreur?: string;
  tempsEcoule?: number;
}

export interface EmailClientData {
  email: string;
  nom: string;
  entreprise: string;
  secteur: string;
  projetId: string;
  montant: number;
  tempsEstime: number;
  urlSuivi: string;
}

export interface NotificationAdminData {
  type: string;
  demande: any;
  projetId: string;
  secteur: string;
  montant: number;
  channel: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// =============================================================================
// 🚀 SERVICE PRINCIPAL DE NOTIFICATIONS
// =============================================================================

export class StripeAutomationNotifications {
  private static instance: StripeAutomationNotifications;
  
  private constructor() {}

  public static getInstance(): StripeAutomationNotifications {
    if (!StripeAutomationNotifications.instance) {
      StripeAutomationNotifications.instance = new StripeAutomationNotifications();
    }
    return StripeAutomationNotifications.instance;
  }

  // =============================================================================
  // 📨 ORCHESTRATEUR DE NOTIFICATIONS
  // =============================================================================

  public async envoyerNotifications(data: NotificationData): Promise<void> {
    try {
      console.log(`📨 Envoi notifications ${data.type} pour ${data.demande.entreprise}`);

      switch (data.type) {
        case 'paiement_confirme':
          await this.traiterPaiementConfirme(data);
          break;

        case 'paiement_echec':
          await this.traiterPaiementEchec(data);
          break;

        case 'workflow_demarre':
          await this.traiterWorkflowDemarre(data);
          break;

        case 'projet_termine':
          await this.traiterProjetTermine(data);
          break;

        default:
          console.warn(`Type de notification non géré: ${data.type}`);
      }

      // Enregistrer la notification en base pour traçabilité
      await this.enregistrerNotification(data);

    } catch (error) {
      console.error('❌ Erreur envoi notifications:', error);
      // Ne pas faire échouer le processus principal pour une erreur de notification
    }
  }

  // =============================================================================
  // 🎯 GESTIONNAIRES SPÉCIFIQUES PAR TYPE
  // =============================================================================

  private async traiterPaiementConfirme(data: NotificationData): Promise<void> {
    const { demande, projetId, secteur, montant } = data;

    // Email client : Paiement confirmé + Site en création
    await this.envoyerEmailPaiementConfirme({
      email: demande.email,
      nom: demande.nom,
      entreprise: demande.entreprise,
      secteur: secteur!,
      projetId: projetId!,
      montant: montant!,
      tempsEstime: this.getTempsEstimeSecteur(secteur!),
      urlSuivi: `${process.env.NEXT_PUBLIC_APP_URL}/suivi/${projetId}`
    });

    // Notification admin : Nouveau projet automatique
    await this.envoyerNotificationAdmin({
      type: 'nouveau_projet_automatique',
      demande,
      projetId: projetId!,
      secteur: secteur!,
      montant: montant!,
      channel: '#projets-automatiques',
      priority: 'high'
    });

    // Notification temps réel via WebSocket (si disponible)
    await this.envoyerNotificationTempsReel({
      type: 'projet_demarre',
      projetId: projetId!,
      entreprise: demande.entreprise,
      secteur: secteur!
    });
  }

  private async traiterPaiementEchec(data: NotificationData): Promise<void> {
    const { demande, erreur } = data;

    // Email client : Échec paiement + Lien pour retry
    await this.envoyerEmailEchecPaiement({
      email: demande.email,
      nom: demande.nom,
      entreprise: demande.entreprise,
      erreur: erreur || 'Erreur de paiement inconnue'
    });

    // Notification admin : Échec paiement à surveiller
    await this.envoyerNotificationAdmin({
      type: 'echec_paiement',
      demande,
      projetId: 'N/A',
      secteur: 'N/A',
      montant: 0,
      channel: '#alertes-paiement',
      priority: 'medium'
    });
  }

  private async traiterWorkflowDemarre(data: NotificationData): Promise<void> {
    const { demande, projetId, secteur } = data;

    // Notification temps réel : Workflow en cours
    await this.envoyerNotificationTempsReel({
      type: 'workflow_en_cours',
      projetId: projetId!,
      entreprise: demande.entreprise,
      secteur: secteur!,
      etapeActuelle: 'Initialisation'
    });

    // SMS client (optionnel si numéro disponible)
    if (demande.telephone) {
      await this.envoyerSMSClient({
        telephone: demande.telephone,
        message: `🚀 ${demande.entreprise}: Votre site ${secteur} est en création ! Suivi: ${process.env.NEXT_PUBLIC_APP_URL}/suivi/${projetId}`
      });
    }
  }

  private async traiterProjetTermine(data: NotificationData): Promise<void> {
    const { demande, projetId, secteur, tempsEcoule } = data;

    // Email client : Site terminé + Lien d'accès
    await this.envoyerEmailSiteTermine({
      email: demande.email,
      nom: demande.nom,
      entreprise: demande.entreprise,
      secteur: secteur!,
      projetId: projetId!,
      tempsEcoule: tempsEcoule!,
      urlSite: `${process.env.NEXT_PUBLIC_APP_URL}/sites/${projetId}`
    });

    // Notification admin : Projet terminé avec succès
    await this.envoyerNotificationAdmin({
      type: 'projet_termine_succes',
      demande,
      projetId: projetId!,
      secteur: secteur!,
      montant: 0,
      channel: '#projets-termines',
      priority: 'low'
    });
  }

  // =============================================================================
  // 📧 SERVICES D'EMAIL SPÉCIALISÉS
  // =============================================================================

  private async envoyerEmailPaiementConfirme(data: EmailClientData): Promise<void> {
    const emailContent = {
      to: data.email,
      subject: `✅ Paiement confirmé - Votre site ${data.entreprise} est en création !`,
      template: 'paiement-confirme-workflow',
      data: {
        nom: data.nom,
        entreprise: data.entreprise,
        secteur: data.secteur,
        montant: data.montant,
        tempsEstime: data.tempsEstime,
        urlSuivi: data.urlSuivi,
        projetId: data.projetId,
        messagePersonnalise: this.getMessagePersonnaliseSecteur(data.secteur),
        etapesWorkflow: this.getEtapesWorkflow(data.secteur)
      }
    };

    console.log('📧 Email paiement confirmé préparé:', emailContent);
    
    // TODO: Intégrer avec service d'email (SendGrid, Resend, etc.)
    await this.simuleEnvoiEmail(emailContent);
  }

  private async envoyerEmailEchecPaiement(data: {
    email: string;
    nom: string;
    entreprise: string;
    erreur: string;
  }): Promise<void> {
    const emailContent = {
      to: data.email,
      subject: `❌ Problème de paiement - ${data.entreprise}`,
      template: 'echec-paiement-retry',
      data: {
        nom: data.nom,
        entreprise: data.entreprise,
        erreur: data.erreur,
        urlRetry: `${process.env.NEXT_PUBLIC_APP_URL}/demande?retry=true`,
        supportEmail: 'support@website-generator.com'
      }
    };

    console.log('📧 Email échec paiement préparé:', emailContent);
    await this.simuleEnvoiEmail(emailContent);
  }

  private async envoyerEmailSiteTermine(data: {
    email: string;
    nom: string;
    entreprise: string;
    secteur: string;
    projetId: string;
    tempsEcoule: number;
    urlSite: string;
  }): Promise<void> {
    const emailContent = {
      to: data.email,
      subject: `🎉 Votre site ${data.entreprise} est prêt !`,
      template: 'site-termine-livraison',
      data: {
        nom: data.nom,
        entreprise: data.entreprise,
        secteur: data.secteur,
        tempsEcoule: data.tempsEcoule,
        urlSite: data.urlSite,
        urlAdmin: `${data.urlSite}/admin`,
        guideUtilisation: `${process.env.NEXT_PUBLIC_APP_URL}/guide/${data.secteur}`,
        supportEmail: 'support@website-generator.com'
      }
    };

    console.log('📧 Email site terminé préparé:', emailContent);
    await this.simuleEnvoiEmail(emailContent);
  }

  // =============================================================================
  // 🔔 NOTIFICATIONS ADMIN ET TEMPS RÉEL
  // =============================================================================

  private async envoyerNotificationAdmin(data: NotificationAdminData): Promise<void> {
    const notification = {
      channel: data.channel,
      priority: data.priority,
      message: this.formatMessageAdmin(data),
      timestamp: new Date(),
      metadata: {
        projetId: data.projetId,
        secteur: data.secteur,
        entreprise: data.demande.entreprise,
        client: {
          nom: data.demande.nom,
          email: data.demande.email,
          ville: data.demande.ville
        }
      }
    };

    console.log('🔔 Notification admin préparée:', notification);
    
    // TODO: Intégrer avec Slack, Discord, etc.
    await this.simuleNotificationAdmin(notification);
  }

  private async envoyerNotificationTempsReel(data: {
    type: string;
    projetId: string;
    entreprise: string;
    secteur: string;
    etapeActuelle?: string;
  }): Promise<void> {
    const notification = {
      type: data.type,
      projetId: data.projetId,
      message: `${data.entreprise} - ${data.secteur}`,
      etapeActuelle: data.etapeActuelle,
      timestamp: new Date()
    };

    console.log('⚡ Notification temps réel préparée:', notification);
    
    // TODO: Intégrer avec WebSocket pour dashboard temps réel
    await this.simuleNotificationTempsReel(notification);
  }

  private async envoyerSMSClient(data: {
    telephone: string;
    message: string;
  }): Promise<void> {
    console.log(`📱 SMS préparé pour ${data.telephone}:`, data.message);
    
    // TODO: Intégrer avec service SMS (Twilio, etc.)
    await this.simuleSMS(data);
  }

  // =============================================================================
  // 🛠️ MÉTHODES UTILITAIRES
  // =============================================================================

  private getTempsEstimeSecteur(secteur: string): number {
    const temps = {
      'restaurant': 25,
      'coiffeur': 20,
      'artisan': 22
    };
    return temps[secteur as keyof typeof temps] || 25;
  }

  private getMessagePersonnaliseSecteur(secteur: string): string {
    const messages = {
      'restaurant': 'Votre site restaurant sera créé avec système de réservation et menu dynamique !',
      'coiffeur': 'Votre salon aura un site élégant avec prise de rendez-vous automatique !',
      'artisan': 'Votre site d\'artisan inclura portfolio et système de devis automatique !'
    };
    return messages[secteur as keyof typeof messages] || 'Votre site professionnel sera créé avec toutes les fonctionnalités adaptées !';
  }

  private getEtapesWorkflow(secteur: string): string[] {
    const etapes: Record<string, string[]> = {
      'restaurant': [
        '🎨 Création des maquettes élégantes',
        '💻 Développement du site et réservations',
        '📱 Lancement des campagnes marketing'
      ],
      'coiffeur': [
        '🎨 Design moderne et raffiné',
        '💻 Site + système de rendez-vous',
        '📱 Marketing beauté ciblé'
      ],
      'artisan': [
        '🎨 Design authentique avec portfolio',
        '💻 Site vitrine + système de devis',
        '📱 Marketing local B2B/B2C'
      ]
    };
    return etapes[secteur] || ['🎨 Design professionnel', '💻 Développement complet', '📱 Marketing ciblé'];
  }

  private formatMessageAdmin(data: NotificationAdminData): string {
    switch (data.type) {
      case 'nouveau_projet_automatique':
        return `🎉 **NOUVEAU PROJET AUTOMATIQUE**
        
**Entreprise:** ${data.demande.entreprise}
**Secteur:** ${data.secteur}
**Montant:** ${data.montant}€
**Projet ID:** ${data.projetId}
**Client:** ${data.demande.nom} (${data.demande.email})
**Ville:** ${data.demande.ville}

✅ Workflow démarré automatiquement
⏱️ Temps estimé: ${this.getTempsEstimeSecteur(data.secteur)} minutes
🔗 Suivi: /suivi/${data.projetId}`;

      case 'echec_paiement':
        return `❌ **ÉCHEC PAIEMENT**
        
**Entreprise:** ${data.demande.entreprise}
**Client:** ${data.demande.nom} (${data.demande.email})
**Ville:** ${data.demande.ville}

⚠️ Vérifier les logs Stripe pour détails`;

      case 'projet_termine_succes':
        return `🎉 **PROJET TERMINÉ**
        
**Entreprise:** ${data.demande.entreprise}
**Secteur:** ${data.secteur}
**Projet ID:** ${data.projetId}

✅ Site livré avec succès !`;

      default:
        return `📊 Notification: ${data.type} - ${data.demande.entreprise}`;
    }
  }

  private async enregistrerNotification(data: NotificationData): Promise<void> {
    // TODO: Enregistrer en base pour audit et statistiques
    console.log('📝 Notification enregistrée:', {
      type: data.type,
      entreprise: data.demande.entreprise,
      projetId: data.projetId,
      timestamp: new Date()
    });
  }

  // =============================================================================
  // 🧪 SIMULATEURS (REMPLACER PAR VRAIS SERVICES EN PRODUCTION)
  // =============================================================================

  private async simuleEnvoiEmail(emailContent: any): Promise<void> {
    console.log('📧 [SIMULATION] Email envoyé:', emailContent.subject);
    // TODO: Remplacer par vraie intégration email
  }

  private async simuleNotificationAdmin(notification: any): Promise<void> {
    console.log('🔔 [SIMULATION] Notification admin:', notification.message.substring(0, 100) + '...');
    // TODO: Remplacer par vraie intégration Slack/Discord
  }

  private async simuleNotificationTempsReel(notification: any): Promise<void> {
    console.log('⚡ [SIMULATION] Notification temps réel:', notification.type);
    // TODO: Remplacer par vraie intégration WebSocket
  }

  private async simuleSMS(data: any): Promise<void> {
    console.log('📱 [SIMULATION] SMS envoyé au', data.telephone);
    // TODO: Remplacer par vraie intégration SMS
  }
}

// =============================================================================
// 🎯 EXPORT ET INSTANCE SINGLETON
// =============================================================================

export const stripeNotifications = StripeAutomationNotifications.getInstance();