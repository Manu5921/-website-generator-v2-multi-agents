// =============================================================================
// 📈 AGENT MARKETING AUTOMATION IA
// =============================================================================

import { db } from '@/lib/db';
import {
  contacts,
  templatesCommunication,
  executionsWorkflow,
  metriquesAgentsIA,
  workflowsAutomatises,
  type Contact,
  type InsertTemplateCommunication,
  type InsertExecutionWorkflow,
  type WorkflowAutomatise
} from '@/lib/db/schema';
import { eq, and, desc, gte, lte, sql, inArray } from 'drizzle-orm';

// =============================================================================
// 🎯 TYPES ET INTERFACES
// =============================================================================

export interface EmailSequence {
  id: string;
  name: string;
  secteur: string;
  triggers: string[];
  steps: EmailStep[];
  goals: {
    conversionRate: number;
    openRate: number;
    clickRate: number;
  };
}

export interface EmailStep {
  ordre: number;
  delai: number; // en heures
  sujet: string;
  contenu: string;
  conditions?: string[];
  actions?: string[];
  type: 'welcome' | 'nurturing' | 'promotion' | 'retargeting' | 'conversion';
}

export interface LeadNurturingConfig {
  secteur: string;
  stages: {
    awareness: { duration: number; touchpoints: number };
    consideration: { duration: number; touchpoints: number };
    decision: { duration: number; touchpoints: number };
  };
  personalisation: {
    industry: boolean;
    behaviour: boolean;
    demography: boolean;
  };
}

export interface CampaignMetrics {
  campaignId: string;
  periode: string;
  emailsSent: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
  roi: number;
  unsubscribeRate: number;
}

export interface PersonalisationData {
  secteur: string;
  comportement: {
    pagesVues: string[];
    tempsNavigation: number;
    interactions: string[];
  };
  demographie: {
    region?: string;
    tailleEntreprise?: string;
    poste?: string;
  };
  historique: {
    derniereInteraction: Date;
    frequenceVisite: number;
    sourceAcquisition: string;
  };
}

// =============================================================================
// 📈 CLASSE AGENT MARKETING AUTOMATION IA
// =============================================================================

export class MarketingAutomationIA {
  private static instance: MarketingAutomationIA;
  private sequencesCache: Map<string, EmailSequence[]> = new Map();
  private activeExecutions: Map<string, any> = new Map();

  private constructor() {
    this.initializeEmailSequences();
  }

  public static getInstance(): MarketingAutomationIA {
    if (!MarketingAutomationIA.instance) {
      MarketingAutomationIA.instance = new MarketingAutomationIA();
    }
    return MarketingAutomationIA.instance;
  }

  // =============================================================================
  // 🚀 SÉQUENCES EMAIL INTELLIGENTES
  // =============================================================================

  public async deployEmailSequence(
    siteId: string,
    secteur: string,
    sequenceType: string,
    customConfig?: Partial<EmailSequence>
  ): Promise<string> {
    try {
      // Récupérer la séquence template
      const sequence = this.getSequenceTemplate(secteur, sequenceType);
      
      // Personnaliser la séquence si nécessaire
      if (customConfig) {
        Object.assign(sequence, customConfig);
      }

      // Créer le workflow principal
      const [workflow] = await db.insert(workflowsAutomatises).values({
        nom: sequence.name,
        secteur,
        type: 'nurturing',
        description: `Séquence ${sequenceType} automatisée pour ${secteur}`,
        configuration: JSON.stringify({
          sequenceId: sequence.id,
          steps: sequence.steps,
          goals: sequence.goals,
          triggers: sequence.triggers
        })
      }).returning();

      // Créer les templates d'email pour chaque étape
      for (const step of sequence.steps) {
        await db.insert(templatesCommunication).values({
          workflowId: workflow.id,
          canal: 'email',
          etape: step.ordre,
          nom: `${sequence.name} - Étape ${step.ordre}`,
          sujet: step.sujet,
          contenu: step.contenu,
          delaiEnvoi: step.delai * 60, // Convertir en minutes
          conditions: JSON.stringify(step.conditions || [])
        });
      }

      console.log(`[marketing-ia] Séquence ${sequenceType} déployée pour ${secteur}:`, workflow.id);
      
      return workflow.id;

    } catch (error) {
      console.error('Erreur déploiement séquence email:', error);
      throw error;
    }
  }

  public async triggerEmailSequence(
    contactId: string,
    sequenceId: string,
    eventData?: Record<string, any>
  ): Promise<string> {
    try {
      // Récupérer le contact et le workflow
      const [contact] = await db.select()
        .from(contacts)
        .where(eq(contacts.id, contactId));

      const [workflow] = await db.select()
        .from(workflowsAutomatises)
        .where(eq(workflowsAutomatises.id, sequenceId));

      if (!contact || !workflow) {
        throw new Error('Contact ou workflow non trouvé');
      }

      // Créer l'exécution
      const [execution] = await db.insert(executionsWorkflow).values({
        workflowId: sequenceId,
        contactId,
        statutExecution: 'en_cours',
        etapeActuelle: 1,
        donneesContext: JSON.stringify({
          eventData,
          startTime: new Date().toISOString(),
          contactData: contact,
          personalisation: await this.generatePersonalisationData(contact)
        })
      }).returning();

      // Démarrer la séquence
      await this.executeNextStep(execution.id);

      this.activeExecutions.set(execution.id, {
        contactId,
        sequenceId,
        startTime: new Date()
      });

      return execution.id;

    } catch (error) {
      console.error('Erreur déclenchement séquence:', error);
      throw error;
    }
  }

  private async executeNextStep(executionId: string): Promise<void> {
    try {
      // Récupérer l'exécution
      const [execution] = await db.select()
        .from(executionsWorkflow)
        .where(eq(executionsWorkflow.id, executionId));

      if (!execution || execution.statutExecution !== 'en_cours') {
        return;
      }

      // Récupérer l'étape suivante
      const [template] = await db.select()
        .from(templatesCommunication)
        .where(
          and(
            eq(templatesCommunication.workflowId, execution.workflowId),
            eq(templatesCommunication.etape, execution.etapeActuelle)
          )
        );

      if (!template) {
        // Fin de séquence
        await db.update(executionsWorkflow)
          .set({
            statutExecution: 'termine',
            dateFin: new Date()
          })
          .where(eq(executionsWorkflow.id, executionId));
        return;
      }

      // Vérifier les conditions
      const context = JSON.parse(execution.donneesContext || '{}');
      const conditions = JSON.parse(template.conditions || '[]');
      
      if (!this.checkConditions(conditions, context)) {
        // Passer à l'étape suivante
        await db.update(executionsWorkflow)
          .set({ etapeActuelle: execution.etapeActuelle + 1 })
          .where(eq(executionsWorkflow.id, executionId));
        
        await this.executeNextStep(executionId);
        return;
      }

      // Envoyer l'email
      await this.sendPersonalizedEmail(execution.contactId, template, context);

      // Programmer l'étape suivante
      if (template.delaiEnvoi > 0) {
        setTimeout(async () => {
          await db.update(executionsWorkflow)
            .set({ etapeActuelle: execution.etapeActuelle + 1 })
            .where(eq(executionsWorkflow.id, executionId));
          
          await this.executeNextStep(executionId);
        }, template.delaiEnvoi * 60 * 1000); // Convertir en millisecondes
      } else {
        await db.update(executionsWorkflow)
          .set({ etapeActuelle: execution.etapeActuelle + 1 })
          .where(eq(executionsWorkflow.id, executionId));
        
        await this.executeNextStep(executionId);
      }

    } catch (error) {
      console.error('Erreur exécution étape:', error);
      
      // Marquer comme en erreur
      await db.update(executionsWorkflow)
        .set({
          statutExecution: 'echoue',
          erreurs: JSON.stringify({ message: error.message, timestamp: new Date() })
        })
        .where(eq(executionsWorkflow.id, executionId));
    }
  }

  // =============================================================================
  // 🎯 RETARGETING COMPORTEMENTAL
  // =============================================================================

  public async setupBehavioralRetargeting(
    siteId: string,
    secteur: string,
    rules: Array<{
      trigger: string;
      conditions: Record<string, any>;
      action: string;
      delay: number;
    }>
  ): Promise<void> {
    try {
      for (const rule of rules) {
        const [workflow] = await db.insert(workflowsAutomatises).values({
          nom: `Retargeting - ${rule.trigger}`,
          secteur,
          type: 'relance',
          description: `Retargeting automatique basé sur ${rule.trigger}`,
          configuration: JSON.stringify({
            trigger: rule.trigger,
            conditions: rule.conditions,
            action: rule.action,
            delay: rule.delay
          })
        }).returning();

        // Créer le template de retargeting
        await db.insert(templatesCommunication).values({
          workflowId: workflow.id,
          canal: 'email',
          etape: 1,
          nom: `Retargeting - ${rule.trigger}`,
          sujet: this.generateRetargetingSubject(rule.trigger, secteur),
          contenu: this.generateRetargetingContent(rule.trigger, secteur),
          delaiEnvoi: rule.delay
        });
      }

      console.log(`[marketing-ia] Retargeting configuré pour ${secteur}`);

    } catch (error) {
      console.error('Erreur configuration retargeting:', error);
      throw error;
    }
  }

  public async trackUserBehavior(
    contactId: string,
    event: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      // Mettre à jour les données de comportement du contact
      await db.update(contacts)
        .set({
          derniereInteraction: new Date(),
          donneesCustom: sql`jsonb_set(COALESCE(donnees_custom, '{}'), '{behavior}', ${JSON.stringify({
            event,
            data,
            timestamp: new Date().toISOString()
          })})`
        })
        .where(eq(contacts.id, contactId));

      // Vérifier les triggers de retargeting
      await this.checkRetargetingTriggers(contactId, event, data);

    } catch (error) {
      console.error('Erreur tracking comportement:', error);
    }
  }

  private async checkRetargetingTriggers(
    contactId: string,
    event: string,
    data: Record<string, any>
  ): Promise<void> {
    // Récupérer les workflows de retargeting actifs
    const workflows = await db.select()
      .from(workflowsAutomatises)
      .where(
        and(
          eq(workflowsAutomatises.type, 'relance'),
          eq(workflowsAutomatises.actif, true)
        )
      );

    for (const workflow of workflows) {
      const config = JSON.parse(workflow.configuration);
      
      if (config.trigger === event) {
        // Vérifier les conditions
        if (this.checkRetargetingConditions(config.conditions, data)) {
          // Déclencher le retargeting
          await this.triggerEmailSequence(contactId, workflow.id, data);
        }
      }
    }
  }

  // =============================================================================
  // 🧠 PERSONALISATION INTELLIGENTE
  // =============================================================================

  private async generatePersonalisationData(contact: Contact): Promise<PersonalisationData> {
    const customData = JSON.parse(contact.donneesCustom || '{}');
    
    return {
      secteur: contact.secteurActivite || 'general',
      comportement: {
        pagesVues: customData.behavior?.pagesVues || [],
        tempsNavigation: customData.behavior?.tempsNavigation || 0,
        interactions: customData.behavior?.interactions || []
      },
      demographie: {
        region: customData.demographie?.region,
        tailleEntreprise: customData.demographie?.tailleEntreprise,
        poste: customData.demographie?.poste
      },
      historique: {
        derniereInteraction: contact.derniereInteraction,
        frequenceVisite: customData.historique?.frequenceVisite || 1,
        sourceAcquisition: contact.source
      }
    };
  }

  private async sendPersonalizedEmail(
    contactId: string,
    template: any,
    context: any
  ): Promise<void> {
    try {
      // Récupérer le contact
      const [contact] = await db.select()
        .from(contacts)
        .where(eq(contacts.id, contactId));

      if (!contact) return;

      // Personnaliser le contenu
      const personalizedSubject = this.personalizeContent(template.sujet, contact, context);
      const personalizedContent = this.personalizeContent(template.contenu, contact, context);

      // Simuler l'envoi d'email (intégration avec service email à implémenter)
      console.log(`[marketing-ia] Email envoyé à ${contact.email}:`, {
        subject: personalizedSubject,
        content: personalizedContent.substring(0, 100) + '...'
      });

      // Mettre à jour les métriques
      await this.updateEmailMetrics(template.workflowId, 'sent');

    } catch (error) {
      console.error('Erreur envoi email personnalisé:', error);
    }
  }

  private personalizeContent(
    content: string,
    contact: Contact,
    context: any
  ): string {
    let personalizedContent = content;

    // Variables de base
    personalizedContent = personalizedContent.replace(/\{nom\}/g, contact.nom);
    personalizedContent = personalizedContent.replace(/\{email\}/g, contact.email);
    personalizedContent = personalizedContent.replace(/\{entreprise\}/g, contact.entreprise || '');

    // Variables comportementales
    if (context.personalisation?.comportement) {
      const behavior = context.personalisation.comportement;
      personalizedContent = personalizedContent.replace(/\{derniere_page\}/g, 
        behavior.pagesVues?.[behavior.pagesVues.length - 1] || 'notre site');
    }

    // Variables sectorielles
    const secteur = contact.secteurActivite || context.personalisation?.secteur || 'votre secteur';
    personalizedContent = personalizedContent.replace(/\{secteur\}/g, secteur);

    return personalizedContent;
  }

  // =============================================================================
  // 📊 ANALYTICS ET MÉTRIQUES
  // =============================================================================

  public async getCampaignMetrics(
    workflowId: string,
    periode: string = '7d'
  ): Promise<CampaignMetrics> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (periode) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Récupérer les métriques
      const metrics = await db.select()
        .from(metriquesAgentsIA)
        .where(
          and(
            eq(metriquesAgentsIA.agent_type, 'marketing'),
            gte(metriquesAgentsIA.dateDebut, startDate)
          )
        );

      // Calculer les agrégations
      const totalSent = metrics.reduce((sum, m) => sum + (m.emails_envoyes || 0), 0);
      const totalRevenue = metrics.reduce((sum, m) => sum + parseFloat(m.revenue_genere.toString()), 0);
      const totalConversions = metrics.reduce((sum, m) => sum + (m.conversions_generees || 0), 0);

      const avgOpenRate = metrics.length > 0 
        ? metrics.reduce((sum, m) => sum + parseFloat(m.taux_ouverture.toString()), 0) / metrics.length
        : 0;

      const avgClickRate = metrics.length > 0
        ? metrics.reduce((sum, m) => sum + parseFloat(m.taux_clic.toString()), 0) / metrics.length
        : 0;

      return {
        campaignId: workflowId,
        periode,
        emailsSent: totalSent,
        openRate: avgOpenRate,
        clickRate: avgClickRate,
        conversionRate: totalSent > 0 ? (totalConversions / totalSent) * 100 : 0,
        revenue: totalRevenue,
        roi: totalRevenue > 0 ? ((totalRevenue - (totalSent * 0.1)) / (totalSent * 0.1)) * 100 : 0,
        unsubscribeRate: 0.5 // Placeholder
      };

    } catch (error) {
      console.error('Erreur récupération métriques campagne:', error);
      throw error;
    }
  }

  private async updateEmailMetrics(
    workflowId: string,
    action: 'sent' | 'opened' | 'clicked' | 'converted'
  ): Promise<void> {
    try {
      const now = new Date();
      const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
      const endOfHour = new Date(startOfHour.getTime() + 60 * 60 * 1000);

      // Récupérer ou créer les métriques de l'heure
      const [metrics] = await db.select()
        .from(metriquesAgentsIA)
        .where(
          and(
            eq(metriquesAgentsIA.agent_type, 'marketing'),
            eq(metriquesAgentsIA.periode, 'heure'),
            gte(metriquesAgentsIA.dateDebut, startOfHour),
            lte(metriquesAgentsIA.dateFin, endOfHour)
          )
        );

      const updateData: any = {};

      switch (action) {
        case 'sent':
          updateData.emails_envoyes = sql`${metriquesAgentsIA.emails_envoyes} + 1`;
          break;
        case 'opened':
          updateData.taux_ouverture = sql`${metriquesAgentsIA.taux_ouverture} + 1`;
          break;
        case 'clicked':
          updateData.taux_clic = sql`${metriquesAgentsIA.taux_clic} + 1`;
          break;
        case 'converted':
          updateData.conversions_generees = sql`${metriquesAgentsIA.conversions_generees} + 1`;
          break;
      }

      if (metrics) {
        await db.update(metriquesAgentsIA)
          .set(updateData)
          .where(eq(metriquesAgentsIA.id, metrics.id));
      } else {
        await db.insert(metriquesAgentsIA).values({
          agent_type: 'marketing',
          periode: 'heure',
          dateDebut: startOfHour,
          dateFin: endOfHour,
          ...updateData
        });
      }

    } catch (error) {
      console.error('Erreur mise à jour métriques email:', error);
    }
  }

  // =============================================================================
  // 🎯 UTILITAIRES
  // =============================================================================

  private getSequenceTemplate(secteur: string, type: string): EmailSequence {
    const sequences = this.sequencesCache.get(secteur) || this.getDefaultSequences(secteur);
    
    return sequences.find(s => s.id.includes(type)) || sequences[0];
  }

  private getDefaultSequences(secteur: string): EmailSequence[] {
    const sequences: EmailSequence[] = [];

    switch (secteur) {
      case 'restaurant':
        sequences.push({
          id: `${secteur}-welcome`,
          name: 'Séquence Bienvenue Restaurant',
          secteur,
          triggers: ['inscription_newsletter', 'premiere_visite'],
          goals: { conversionRate: 15, openRate: 35, clickRate: 8 },
          steps: [
            {
              ordre: 1,
              delai: 0,
              type: 'welcome',
              sujet: 'Bienvenue chez {entreprise} ! 🍽️',
              contenu: `Bonjour {nom},\n\nMerci de votre visite ! Découvrez notre carte et réservez votre table dès maintenant.`
            },
            {
              ordre: 2,
              delai: 24,
              type: 'nurturing',
              sujet: 'Nos spécialités qui font la différence',
              contenu: `{nom}, laissez-vous tenter par nos spécialités du chef...`
            }
          ]
        });
        break;

      case 'coiffeur':
        sequences.push({
          id: `${secteur}-appointment`,
          name: 'Séquence Prise de Rendez-vous',
          secteur,
          triggers: ['visite_services', 'abandon_booking'],
          goals: { conversionRate: 25, openRate: 40, clickRate: 12 },
          steps: [
            {
              ordre: 1,
              delai: 2,
              type: 'retargeting',
              sujet: 'Votre nouveau look vous attend ! ✨',
              contenu: `{nom}, réservez votre rendez-vous et bénéficiez de 10% de réduction.`
            }
          ]
        });
        break;

      case 'artisan':
        sequences.push({
          id: `${secteur}-devis`,
          name: 'Séquence Demande de Devis',
          secteur,
          triggers: ['demande_devis', 'visite_portfolio'],
          goals: { conversionRate: 30, openRate: 45, clickRate: 15 },
          steps: [
            {
              ordre: 1,
              delai: 1,
              type: 'welcome',
              sujet: 'Votre projet nous intéresse ! 🔨',
              contenu: `{nom}, nous préparons votre devis personnalisé. Première estimation sous 24h.`
            },
            {
              ordre: 2,
              delai: 48,
              type: 'nurturing',
              sujet: 'Nos dernières réalisations {secteur}',
              contenu: `Découvrez nos travaux récents et les témoignages de nos clients satisfaits.`
            }
          ]
        });
        break;
    }

    this.sequencesCache.set(secteur, sequences);
    return sequences;
  }

  private checkConditions(conditions: string[], context: any): boolean {
    // Logique de vérification des conditions
    // À implémenter selon les besoins spécifiques
    return conditions.length === 0 || conditions.every(condition => {
      // Exemple de condition simple
      return context[condition] !== undefined;
    });
  }

  private checkRetargetingConditions(conditions: Record<string, any>, data: Record<string, any>): boolean {
    return Object.entries(conditions).every(([key, value]) => {
      return data[key] === value;
    });
  }

  private generateRetargetingSubject(trigger: string, secteur: string): string {
    const subjects: Record<string, Record<string, string>> = {
      abandon_cart: {
        restaurant: 'Votre réservation vous attend ! 🍽️',
        coiffeur: 'Votre rendez-vous beauté vous attend ! ✨',
        artisan: 'Votre projet mérite notre expertise ! 🔨'
      },
      page_exit: {
        restaurant: 'Une petite faim ? Nos spécialités vous attendent',
        coiffeur: 'Envie d\'un nouveau look ?',
        artisan: 'Besoin d\'un devis gratuit ?'
      }
    };

    return subjects[trigger]?.[secteur] || 'Nous avons quelque chose pour vous !';
  }

  private generateRetargetingContent(trigger: string, secteur: string): string {
    const contents: Record<string, Record<string, string>> = {
      abandon_cart: {
        restaurant: 'Finalisez votre réservation et profitez de 10% de réduction sur votre addition.',
        coiffeur: 'Réservez votre créneau et bénéficiez d\'une prestation gratuite.',
        artisan: 'Obtenez votre devis détaillé sous 24h, sans engagement.'
      }
    };

    return contents[trigger]?.[secteur] || 'Reprenez là où vous vous êtes arrêté(e) !';
  }

  private async initializeEmailSequences(): Promise<void> {
    // Initialisation des séquences par défaut
    const secteurs = ['restaurant', 'coiffeur', 'artisan'];
    for (const secteur of secteurs) {
      this.getDefaultSequences(secteur);
    }
  }

  // =============================================================================
  // 📊 API PUBLIQUE
  // =============================================================================

  public async getActiveSequences(siteId: string): Promise<WorkflowAutomatise[]> {
    return await db.select()
      .from(workflowsAutomatises)
      .where(eq(workflowsAutomatises.actif, true));
  }

  public async pauseSequence(workflowId: string): Promise<void> {
    await db.update(workflowsAutomatises)
      .set({ actif: false })
      .where(eq(workflowsAutomatises.id, workflowId));
  }

  public async resumeSequence(workflowId: string): Promise<void> {
    await db.update(workflowsAutomatises)
      .set({ actif: true })
      .where(eq(workflowsAutomatises.id, workflowId));
  }
}

// =============================================================================
// 🎯 EXPORT ET INSTANCE SINGLETON
// =============================================================================

export const marketingAutomationIA = MarketingAutomationIA.getInstance();
export default marketingAutomationIA;