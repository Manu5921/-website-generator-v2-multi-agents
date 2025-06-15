// =============================================================================
// 🤖 AGENT SERVICE CLIENT IA 24/7
// =============================================================================

import { db } from '@/lib/db';
import {
  conversationsChat,
  messagesChat,
  baseConnaissances,
  intentsDetectes,
  escalationsHumaines,
  metriquesAgentsIA,
  contacts,
  type InsertConversationChat,
  type InsertMessageChat,
  type InsertEscalationHumaine,
  type ConversationChat,
  type MessageChat,
  type BaseConnaissance,
  type IntentDetecte
} from '@/lib/db/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

// =============================================================================
// 🎯 TYPES ET INTERFACES
// =============================================================================

export interface ChatMessage {
  id?: string;
  content: string;
  sender: 'client' | 'agent_ia' | 'humain';
  type?: 'texte' | 'image' | 'fichier' | 'action_button' | 'suggestion';
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface ConversationContext {
  siteId: string;
  secteur: string;
  sessionData?: Record<string, any>;
  userInfo?: {
    nom?: string;
    email?: string;
    telephone?: string;
  };
}

export interface IntentAnalysis {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  requiresEscalation: boolean;
  suggestedActions: string[];
}

export interface ServiceClientResponse {
  response: string;
  intent: string;
  confidence: number;
  actions?: Array<{
    type: 'button' | 'link' | 'phone' | 'email';
    label: string;
    value: string;
  }>;
  suggestions?: string[];
  escalation?: {
    required: boolean;
    reason?: string;
    priority?: 'basse' | 'normale' | 'haute' | 'urgente';
  };
}

// =============================================================================
// 🤖 CLASSE AGENT SERVICE CLIENT IA
// =============================================================================

export class ServiceClientIA {
  private static instance: ServiceClientIA;
  private knowledgeBaseCache: Map<string, BaseConnaissance[]> = new Map();
  private intentsCache: Map<string, IntentDetecte[]> = new Map();
  
  private constructor() {
    this.initializeDefaultIntents();
  }

  public static getInstance(): ServiceClientIA {
    if (!ServiceClientIA.instance) {
      ServiceClientIA.instance = new ServiceClientIA();
    }
    return ServiceClientIA.instance;
  }

  // =============================================================================
  // 🚀 GESTION DES CONVERSATIONS
  // =============================================================================

  public async startConversation(
    context: ConversationContext,
    initialMessage?: string
  ): Promise<string> {
    try {
      // Créer ou récupérer un contact
      let contactId: string | undefined;
      if (context.userInfo?.email) {
        const [contact] = await db.insert(contacts).values({
          siteId: context.siteId,
          nom: context.userInfo.nom || 'Visiteur',
          email: context.userInfo.email,
          telephone: context.userInfo.telephone,
          source: 'chat_web',
          secteurActivite: context.secteur
        }).onConflictDoNothing().returning();
        
        contactId = contact?.id;
      }

      // Créer une nouvelle conversation
      const [conversation] = await db.insert(conversationsChat).values({
        siteId: context.siteId,
        contactId,
        canal: 'chat_web',
        statut: 'active',
        agent_type: 'service_client',
        session_data: JSON.stringify(context.sessionData || {})
      }).returning();

      // Envoyer message de bienvenue
      const welcomeMessage = await this.generateWelcomeMessage(context.secteur);
      await this.addMessage(conversation.id, {
        content: welcomeMessage,
        sender: 'agent_ia',
        type: 'texte'
      });

      // Traiter le message initial si fourni
      if (initialMessage) {
        await this.processMessage(
          conversation.id,
          initialMessage,
          context
        );
      }

      return conversation.id;

    } catch (error) {
      console.error('Erreur création conversation:', error);
      throw error;
    }
  }

  public async processMessage(
    conversationId: string,
    message: string,
    context: ConversationContext
  ): Promise<ServiceClientResponse> {
    const startTime = Date.now();

    try {
      // Enregistrer le message client
      await this.addMessage(conversationId, {
        content: message,
        sender: 'client',
        type: 'texte'
      });

      // Analyser l'intention
      const intentAnalysis = await this.analyzeIntent(message, context.secteur);
      
      // Générer la réponse
      const response = await this.generateResponse(
        message,
        intentAnalysis,
        context
      );

      // Enregistrer la réponse
      const responseTime = Date.now() - startTime;
      await this.addMessage(conversationId, {
        content: response.response,
        sender: 'agent_ia',
        type: 'texte',
        metadata: {
          intent: response.intent,
          confidence: response.confidence,
          response_time: responseTime
        }
      });

      // Vérifier si escalation nécessaire
      if (response.escalation?.required) {
        await this.createEscalation(
          conversationId,
          response.escalation.reason || 'demande_complexe',
          response.escalation.priority || 'normale'
        );
      }

      // Enregistrer métriques
      await this.updateMetrics(context.siteId, responseTime, response.confidence);

      return response;

    } catch (error) {
      console.error('Erreur traitement message:', error);
      
      // Réponse d'erreur générique
      return {
        response: "Je rencontre un problème technique. Un agent humain va vous contacter rapidement.",
        intent: 'erreur_technique',
        confidence: 1.0,
        escalation: {
          required: true,
          reason: 'erreur_technique',
          priority: 'haute'
        }
      };
    }
  }

  // =============================================================================
  // 🧠 ANALYSE D'INTENTION
  // =============================================================================

  private async analyzeIntent(
    message: string,
    secteur: string
  ): Promise<IntentAnalysis> {
    const intents = await this.getIntents(secteur);
    const messageLower = message.toLowerCase();
    
    let bestMatch: IntentAnalysis = {
      intent: 'autre',
      confidence: 0.0,
      entities: {},
      requiresEscalation: false,
      suggestedActions: []
    };

    for (const intent of intents) {
      const patterns = intent.patterns as string[];
      let confidence = 0;
      let matches = 0;

      for (const pattern of patterns) {
        if (messageLower.includes(pattern.toLowerCase())) {
          matches++;
        }
      }

      confidence = matches / patterns.length;

      if (confidence > bestMatch.confidence && confidence >= parseFloat(intent.confidence_threshold.toString())) {
        bestMatch = {
          intent: intent.nom,
          confidence,
          entities: this.extractEntities(message, intent),
          requiresEscalation: confidence < 0.8,
          suggestedActions: (intent.actions as string[]) || []
        };
      }
    }

    return bestMatch;
  }

  private extractEntities(message: string, intent: IntentDetecte): Record<string, any> {
    const entities: Record<string, any> = {};
    const messageLower = message.toLowerCase();

    // Extraction d'entités basiques
    const phoneRegex = /(\+33|0)[1-9](\d{8})/g;
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
    const priceRegex = /(\d+)\s*€/g;

    const phoneMatch = messageLower.match(phoneRegex);
    if (phoneMatch) entities.telephone = phoneMatch[0];

    const emailMatch = messageLower.match(emailRegex);
    if (emailMatch) entities.email = emailMatch[0];

    const priceMatch = messageLower.match(priceRegex);
    if (priceMatch) entities.prix = priceMatch[0];

    return entities;
  }

  // =============================================================================
  // 💬 GÉNÉRATION DE RÉPONSES
  // =============================================================================

  private async generateResponse(
    message: string,
    intentAnalysis: IntentAnalysis,
    context: ConversationContext
  ): Promise<ServiceClientResponse> {
    // Rechercher dans la base de connaissances
    const knowledgeBase = await this.getKnowledgeBase(context.secteur);
    const relevantKnowledge = this.findRelevantKnowledge(message, knowledgeBase);

    if (relevantKnowledge && relevantKnowledge.length > 0) {
      const knowledge = relevantKnowledge[0];
      
      // Mettre à jour les statistiques d'utilisation
      await this.updateKnowledgeUsage(knowledge.id);

      return {
        response: knowledge.reponse,
        intent: intentAnalysis.intent,
        confidence: intentAnalysis.confidence,
        actions: this.generateActions(intentAnalysis, context),
        suggestions: this.generateSuggestions(context.secteur)
      };
    }

    // Réponses par défaut selon l'intention
    return this.generateDefaultResponse(intentAnalysis, context);
  }

  private findRelevantKnowledge(
    message: string,
    knowledgeBase: BaseConnaissance[]
  ): BaseConnaissance[] {
    const messageLower = message.toLowerCase();
    const relevant: Array<BaseConnaissance & { score: number }> = [];

    for (const knowledge of knowledgeBase) {
      let score = 0;
      const keywords = knowledge.keywords as string[] || [];
      
      // Score basé sur les mots-clés
      for (const keyword of keywords) {
        if (messageLower.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }

      // Score basé sur la similarité de la question
      const questionWords = knowledge.question.toLowerCase().split(' ');
      for (const word of questionWords) {
        if (word.length > 3 && messageLower.includes(word)) {
          score += 0.5;
        }
      }

      if (score > 0) {
        relevant.push({ ...knowledge, score });
      }
    }

    return relevant
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  private generateDefaultResponse(
    intentAnalysis: IntentAnalysis,
    context: ConversationContext
  ): ServiceClientResponse {
    const responses: Record<string, string> = {
      'demande_prix': `Je comprends que vous souhaitez connaître nos tarifs. Pouvez-vous me préciser quel service vous intéresse ?`,
      'prise_rdv': `Je peux vous aider à prendre rendez-vous. Quelle est votre disponibilité ?`,
      'information_service': `Je suis là pour vous renseigner sur nos services. Que souhaitez-vous savoir exactement ?`,
      'reclamation': `Je comprends votre préoccupation et je vais faire le nécessaire pour vous aider.`,
      'autre': `Je ne suis pas sûr de comprendre votre demande. Pouvez-vous reformuler ou être plus précis ?`
    };

    const response = responses[intentAnalysis.intent] || responses['autre'];
    const requiresEscalation = intentAnalysis.confidence < 0.6;

    return {
      response,
      intent: intentAnalysis.intent,
      confidence: intentAnalysis.confidence,
      actions: this.generateActions(intentAnalysis, context),
      escalation: requiresEscalation ? {
        required: true,
        reason: 'demande_complexe',
        priority: 'normale'
      } : undefined
    };
  }

  private generateActions(
    intentAnalysis: IntentAnalysis,
    context: ConversationContext
  ): Array<{ type: string; label: string; value: string }> {
    const actions = [];

    switch (intentAnalysis.intent) {
      case 'prise_rdv':
        actions.push({
          type: 'button',
          label: 'Prendre rendez-vous',
          value: 'booking_calendar'
        });
        break;
      
      case 'demande_prix':
        actions.push({
          type: 'button',
          label: 'Voir nos tarifs',
          value: 'pricing_page'
        });
        break;
      
      case 'contact_urgent':
        actions.push({
          type: 'phone',
          label: 'Appeler maintenant',
          value: 'tel:+33123456789'
        });
        break;
    }

    return actions;
  }

  private generateSuggestions(secteur: string): string[] {
    const suggestions: Record<string, string[]> = {
      'restaurant': [
        'Voir la carte',
        'Réserver une table',
        'Horaires d\'ouverture',
        'Informations allergènes'
      ],
      'coiffeur': [
        'Prendre rendez-vous',
        'Voir nos services',
        'Nos tarifs',
        'Conseils capillaires'
      ],
      'artisan': [
        'Demander un devis',
        'Voir nos réalisations',
        'Nos spécialités',
        'Zones d\'intervention'
      ]
    };

    return suggestions[secteur] || [
      'En savoir plus',
      'Nous contacter',
      'Nos services',
      'Horaires'
    ];
  }

  // =============================================================================
  // 🔄 GESTION DES ESCALATIONS
  // =============================================================================

  private async createEscalation(
    conversationId: string,
    reason: string,
    priority: 'basse' | 'normale' | 'haute' | 'urgente'
  ): Promise<void> {
    await db.insert(escalationsHumaines).values({
      conversationId,
      raison: reason as any,
      priorite: priority,
      statut: 'en_attente',
      notes_contexte: `Escalation automatique - Confiance IA insuffisante`
    });

    // Mettre à jour le statut de la conversation
    await db.update(conversationsChat)
      .set({ 
        statut: 'escalade_humaine',
        escalation_reason: reason
      })
      .where(eq(conversationsChat.id, conversationId));
  }

  // =============================================================================
  // 📊 MÉTRIQUES ET PERFORMANCE
  // =============================================================================

  private async updateMetrics(
    siteId: string,
    responseTime: number,
    confidence: number
  ): Promise<void> {
    const now = new Date();
    const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    const endOfHour = new Date(startOfHour.getTime() + 60 * 60 * 1000);

    // Récupérer ou créer les métriques de l'heure
    const [metrics] = await db.select()
      .from(metriquesAgentsIA)
      .where(
        and(
          eq(metriquesAgentsIA.agent_type, 'service_client'),
          eq(metriquesAgentsIA.siteId, siteId),
          eq(metriquesAgentsIA.periode, 'heure'),
          gte(metriquesAgentsIA.dateDebut, startOfHour),
          lte(metriquesAgentsIA.dateFin, endOfHour)
        )
      );

    if (metrics) {
      // Mettre à jour les métriques existantes
      await db.update(metriquesAgentsIA)
        .set({
          conversations_totales: sql`${metriquesAgentsIA.conversations_totales} + 1`,
          temps_reponse_moyen: sql`(${metriquesAgentsIA.temps_reponse_moyen} + ${responseTime}) / 2`
        })
        .where(eq(metriquesAgentsIA.id, metrics.id));
    } else {
      // Créer nouvelles métriques
      await db.insert(metriquesAgentsIA).values({
        agent_type: 'service_client',
        siteId,
        periode: 'heure',
        dateDebut: startOfHour,
        dateFin: endOfHour,
        conversations_totales: 1,
        temps_reponse_moyen: responseTime
      });
    }
  }

  // =============================================================================
  // 🗂️ GESTION DES DONNÉES
  // =============================================================================

  private async addMessage(
    conversationId: string,
    message: ChatMessage
  ): Promise<void> {
    await db.insert(messagesChat).values({
      conversationId,
      expediteur: message.sender,
      contenu: message.content,
      type_message: message.type || 'texte',
      metadata: message.metadata ? JSON.stringify(message.metadata) : undefined,
      response_time: message.metadata?.response_time,
      intent_detected: message.metadata?.intent,
      confidence_score: message.metadata?.confidence?.toString()
    });

    // Mettre à jour l'activité de la conversation
    await db.update(conversationsChat)
      .set({ derniereActivite: new Date() })
      .where(eq(conversationsChat.id, conversationId));
  }

  private async getKnowledgeBase(secteur: string): Promise<BaseConnaissance[]> {
    if (this.knowledgeBaseCache.has(secteur)) {
      return this.knowledgeBaseCache.get(secteur)!;
    }

    const knowledge = await db.select()
      .from(baseConnaissances)
      .where(
        and(
          eq(baseConnaissances.secteur, secteur),
          eq(baseConnaissances.actif, true)
        )
      )
      .orderBy(desc(baseConnaissances.priority));

    this.knowledgeBaseCache.set(secteur, knowledge);
    
    // Cache pendant 5 minutes
    setTimeout(() => {
      this.knowledgeBaseCache.delete(secteur);
    }, 5 * 60 * 1000);

    return knowledge;
  }

  private async getIntents(secteur: string): Promise<IntentDetecte[]> {
    if (this.intentsCache.has(secteur)) {
      return this.intentsCache.get(secteur)!;
    }

    const intents = await db.select()
      .from(intentsDetectes)
      .where(
        and(
          eq(intentsDetectes.secteur, secteur),
          eq(intentsDetectes.actif, true)
        )
      );

    this.intentsCache.set(secteur, intents);
    
    // Cache pendant 10 minutes
    setTimeout(() => {
      this.intentsCache.delete(secteur);
    }, 10 * 60 * 1000);

    return intents;
  }

  private async updateKnowledgeUsage(knowledgeId: string): Promise<void> {
    await db.update(baseConnaissances)
      .set({
        utilisation_count: sql`${baseConnaissances.utilisation_count} + 1`,
        derniere_utilisation: new Date()
      })
      .where(eq(baseConnaissances.id, knowledgeId));
  }

  private async generateWelcomeMessage(secteur: string): Promise<string> {
    const messages: Record<string, string> = {
      'restaurant': 'Bonjour ! 👋 Je suis votre assistant virtuel. Je peux vous aider avec les réservations, la carte, les allergènes ou toute autre question. Comment puis-je vous aider ?',
      'coiffeur': 'Bonjour ! ✨ Je suis là pour vous aider avec vos rendez-vous, nos services, tarifs ou conseils beauté. Que souhaitez-vous savoir ?',
      'artisan': 'Bonjour ! 🔨 Je peux vous renseigner sur nos services, vous aider pour un devis ou répondre à vos questions techniques. Comment puis-je vous assister ?'
    };

    return messages[secteur] || 'Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd\'hui ?';
  }

  // =============================================================================
  // 🚀 INITIALISATION
  // =============================================================================

  private async initializeDefaultIntents(): Promise<void> {
    // Cette méthode sera appelée pour initialiser les intents par défaut
    // Elle peut être étendue pour charger des intents prédéfinis
  }

  // =============================================================================
  // 📊 API PUBLIQUE
  // =============================================================================

  public async getConversationHistory(conversationId: string): Promise<MessageChat[]> {
    return await db.select()
      .from(messagesChat)
      .where(eq(messagesChat.conversationId, conversationId))
      .orderBy(messagesChat.dateEnvoi);
  }

  public async closeConversation(
    conversationId: string,
    satisfaction?: number
  ): Promise<void> {
    await db.update(conversationsChat)
      .set({
        statut: 'fermee',
        dateFermeture: new Date(),
        satisfaction: satisfaction,
        resolved_automatically: true
      })
      .where(eq(conversationsChat.id, conversationId));
  }

  public async getActiveConversations(siteId: string): Promise<ConversationChat[]> {
    return await db.select()
      .from(conversationsChat)
      .where(
        and(
          eq(conversationsChat.siteId, siteId),
          eq(conversationsChat.statut, 'active')
        )
      )
      .orderBy(desc(conversationsChat.derniereActivite));
  }
}

// =============================================================================
// 🎯 EXPORT ET INSTANCE SINGLETON
// =============================================================================

export const serviceClientIA = ServiceClientIA.getInstance();
export default serviceClientIA;