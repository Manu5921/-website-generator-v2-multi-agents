// =============================================================================
// 💰 SYSTÈME DE MONÉTISATION RÉCURRENTE - AUTOMATIONS IA
// =============================================================================

import { db } from '@/lib/db';
import {
  commandes,
  sitesGeneres,
  workflowsAutomatises,
  executionsWorkflow,
  metriquesAgentsIA,
  type InsertCommande
} from '@/lib/db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

// =============================================================================
// 🎯 TYPES ET INTERFACES
// =============================================================================

export interface AutomationPackage {
  id: string;
  name: string;
  description: string;
  price: number; // Prix mensuel en euros
  features: string[];
  agentsIncluded: string[];
  maxExecutions: number;
  maxWorkflows: number;
  priority: 'standard' | 'premium' | 'enterprise';
  stripePriceId: string;
}

export interface AutomationSubscription {
  id: string;
  siteId: string;
  packageId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'past_due' | 'canceled' | 'paused';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  monthlyPrice: number;
  usage: {
    executions: number;
    workflows: number;
    agentsActive: string[];
  };
  nextBillingDate: Date;
  cancelAtPeriodEnd: boolean;
}

export interface UsageMetrics {
  siteId: string;
  period: string;
  totalExecutions: number;
  activeWorkflows: number;
  agentsUsed: string[];
  estimatedCost: number;
  savingsGenerated: number;
  roiMultiplier: number;
}

export interface AutomationBilling {
  subscriptionId: string;
  billingPeriod: string;
  basePrice: number;
  usageOverages: number;
  totalAmount: number;
  breakdown: {
    serviceClient: { executions: number; cost: number };
    marketing: { campaigns: number; cost: number };
    businessIntelligence: { reports: number; cost: number };
    workflows: { active: number; cost: number };
  };
}

// =============================================================================
// 📦 PACKAGES D'AUTOMATION
// =============================================================================

export const AUTOMATION_PACKAGES: AutomationPackage[] = [
  {
    id: 'starter',
    name: 'Automation Starter',
    description: 'Parfait pour débuter avec l\'IA conversationnelle',
    price: 79,
    features: [
      'Service client IA 24/7',
      'FAQ intelligente par secteur',
      '500 conversations/mois',
      '3 workflows N8N basiques',
      'Support email'
    ],
    agentsIncluded: ['service-client'],
    maxExecutions: 500,
    maxWorkflows: 3,
    priority: 'standard',
    stripePriceId: 'price_automation_starter_monthly'
  },
  {
    id: 'professional',
    name: 'Automation Professional',
    description: 'Solution complète pour entrepreneurs ambitieux',
    price: 149,
    features: [
      'Tous les agents IA',
      '2000 conversations/mois',
      '10 workflows N8N avancés',
      'Marketing automation',
      'Analytics BI',
      'Support prioritaire'
    ],
    agentsIncluded: ['service-client', 'marketing-automation', 'business-intelligence'],
    maxExecutions: 2000,
    maxWorkflows: 10,
    priority: 'premium',
    stripePriceId: 'price_automation_pro_monthly'
  },
  {
    id: 'enterprise',
    name: 'Automation Enterprise',
    description: 'Puissance maximale pour entreprises en croissance',
    price: 249,
    features: [
      'Tous les agents IA',
      'Conversations illimitées',
      'Workflows illimités',
      'IA personnalisée',
      'Intégrations sur mesure',
      'Support dédié 24/7',
      'Rapports exécutifs'
    ],
    agentsIncluded: ['service-client', 'marketing-automation', 'business-intelligence'],
    maxExecutions: -1, // illimité
    maxWorkflows: -1, // illimité
    priority: 'enterprise',
    stripePriceId: 'price_automation_enterprise_monthly'
  }
];

// =============================================================================
// 💰 CLASSE GESTIONNAIRE DE MONÉTISATION
// =============================================================================

export class AutomationMonetization {
  private static instance: AutomationMonetization;
  private stripe: any;

  private constructor() {
    // Initialiser Stripe (en mode test pour l'instant)
    this.stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }

  public static getInstance(): AutomationMonetization {
    if (!AutomationMonetization.instance) {
      AutomationMonetization.instance = new AutomationMonetization();
    }
    return AutomationMonetization.instance;
  }

  // =============================================================================
  // 🚀 CRÉATION D'ABONNEMENTS
  // =============================================================================

  public async createAutomationSubscription(
    siteId: string,
    packageId: string,
    customerEmail: string,
    customerName: string
  ): Promise<string> {
    try {
      const automationPackage = AUTOMATION_PACKAGES.find(p => p.id === packageId);
      if (!automationPackage) {
        throw new Error(`Package ${packageId} non trouvé`);
      }

      // Créer ou récupérer le customer Stripe
      const customer = await this.createOrGetStripeCustomer(customerEmail, customerName, siteId);

      // Créer l'abonnement Stripe
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: automationPackage.stripePriceId,
        }],
        metadata: {
          siteId,
          packageId,
          automationType: 'ai_agents'
        },
        billing_cycle_anchor: Math.floor(Date.now() / 1000), // Commencer immédiatement
        proration_behavior: 'none'
      });

      // Enregistrer l'abonnement en base
      const subscriptionData: AutomationSubscription = {
        id: subscription.id,
        siteId,
        packageId,
        stripeSubscriptionId: subscription.id,
        status: 'active',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        monthlyPrice: automationPackage.price,
        usage: {
          executions: 0,
          workflows: 0,
          agentsActive: []
        },
        nextBillingDate: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: false
      };

      await this.saveSubscriptionToDatabase(subscriptionData);

      // Activer automatiquement les agents inclus
      await this.activateIncludedAgents(siteId, automationPackage.agentsIncluded);

      console.log(`[monetization] Abonnement automation créé: ${subscription.id} pour site ${siteId}`);
      
      return subscription.id;

    } catch (error) {
      console.error('Erreur création abonnement automation:', error);
      throw error;
    }
  }

  // =============================================================================
  // 📊 TRACKING D'USAGE
  // =============================================================================

  public async trackAutomationUsage(
    siteId: string,
    agentType: string,
    action: string,
    quantity: number = 1
  ): Promise<void> {
    try {
      // Récupérer l'abonnement actif
      const subscription = await this.getActiveSubscription(siteId);
      if (!subscription) {
        console.warn(`Pas d'abonnement actif pour le site ${siteId}`);
        return;
      }

      // Vérifier les limites
      const withinLimits = await this.checkUsageLimits(subscription, agentType, quantity);
      if (!withinLimits) {
        await this.handleUsageOverage(subscription, agentType, quantity);
        return;
      }

      // Enregistrer l'usage
      await this.recordUsage(siteId, agentType, action, quantity);

      // Mettre à jour les métriques
      await this.updateUsageMetrics(subscription.id, agentType, quantity);

    } catch (error) {
      console.error('Erreur tracking usage:', error);
    }
  }

  private async checkUsageLimits(
    subscription: AutomationSubscription,
    agentType: string,
    quantity: number
  ): Promise<boolean> {
    const packageInfo = AUTOMATION_PACKAGES.find(p => p.id === subscription.packageId);
    if (!packageInfo) return false;

    // Vérifier si l'agent est inclus dans le package
    if (!packageInfo.agentsIncluded.includes(agentType)) {
      return false;
    }

    // Pour les packages Enterprise (illimité), toujours autoriser
    if (packageInfo.maxExecutions === -1) {
      return true;
    }

    // Vérifier les limites d'exécutions
    const currentUsage = subscription.usage.executions;
    return (currentUsage + quantity) <= packageInfo.maxExecutions;
  }

  private async handleUsageOverage(
    subscription: AutomationSubscription,
    agentType: string,
    quantity: number
  ): Promise<void> {
    // Calculer le coût de dépassement
    const overageCost = this.calculateOverageCost(agentType, quantity);
    
    // Enregistrer le dépassement pour facturation
    await this.recordOverageUsage(subscription.id, agentType, quantity, overageCost);
    
    // Notifier le client
    await this.notifyUsageOverage(subscription.siteId, agentType, overageCost);
  }

  private calculateOverageCost(agentType: string, quantity: number): number {
    const overage_rates = {
      'service-client': 0.05, // 5 centimes par conversation supplémentaire
      'marketing-automation': 0.02, // 2 centimes par email supplémentaire
      'business-intelligence': 0.10 // 10 centimes par rapport supplémentaire
    };

    return (overage_rates[agentType] || 0.01) * quantity;
  }

  // =============================================================================
  // 💳 FACTURATION INTELLIGENTE
  // =============================================================================

  public async generateMonthlyBilling(subscriptionId: string): Promise<AutomationBilling> {
    try {
      const subscription = await this.getSubscriptionById(subscriptionId);
      if (!subscription) {
        throw new Error(`Abonnement ${subscriptionId} non trouvé`);
      }

      const packageInfo = AUTOMATION_PACKAGES.find(p => p.id === subscription.packageId);
      if (!packageInfo) {
        throw new Error(`Package ${subscription.packageId} non trouvé`);
      }

      // Calculer l'usage du mois
      const monthlyUsage = await this.getMonthlyUsage(subscription.siteId);
      
      // Calculer les dépassements
      const overages = await this.calculateOverages(subscription, monthlyUsage);

      const billing: AutomationBilling = {
        subscriptionId,
        billingPeriod: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
        basePrice: packageInfo.price,
        usageOverages: overages.total,
        totalAmount: packageInfo.price + overages.total,
        breakdown: {
          serviceClient: {
            executions: monthlyUsage.serviceClient.executions,
            cost: overages.serviceClient
          },
          marketing: {
            campaigns: monthlyUsage.marketing.campaigns,
            cost: overages.marketing
          },
          businessIntelligence: {
            reports: monthlyUsage.businessIntelligence.reports,
            cost: overages.businessIntelligence
          },
          workflows: {
            active: monthlyUsage.workflows.active,
            cost: overages.workflows
          }
        }
      };

      // Traiter la facturation Stripe si nécessaire
      if (overages.total > 0) {
        await this.processOverageBilling(subscriptionId, overages.total);
      }

      return billing;

    } catch (error) {
      console.error('Erreur génération facturation:', error);
      throw error;
    }
  }

  // =============================================================================
  // 📈 ROI ET VALEUR AJOUTÉE
  // =============================================================================

  public async calculateAutomationROI(siteId: string, period: string = '30d'): Promise<{
    investment: number;
    savings: number;
    revenue: number;
    roi: number;
    breakdown: Record<string, any>;
  }> {
    try {
      const subscription = await this.getActiveSubscription(siteId);
      if (!subscription) {
        return { investment: 0, savings: 0, revenue: 0, roi: 0, breakdown: {} };
      }

      // Calculer l'investissement (coût abonnement)
      const investment = subscription.monthlyPrice;

      // Estimer les économies générées
      const savings = await this.calculateCostSavings(siteId, period);

      // Estimer le revenu généré par l'automation
      const revenue = await this.calculateRevenueGenerated(siteId, period);

      // Calculer le ROI
      const roi = investment > 0 ? ((savings + revenue - investment) / investment) * 100 : 0;

      const breakdown = {
        timeSaved: savings.timeSaved, // heures économisées
        leadConversions: revenue.leadConversions,
        customerSatisfaction: savings.satisfactionIncrease,
        automatedTasks: savings.automatedTasks
      };

      return {
        investment,
        savings: savings.total,
        revenue: revenue.total,
        roi,
        breakdown
      };

    } catch (error) {
      console.error('Erreur calcul ROI:', error);
      return { investment: 0, savings: 0, revenue: 0, roi: 0, breakdown: {} };
    }
  }

  private async calculateCostSavings(siteId: string, period: string): Promise<any> {
    // Estimer les économies basées sur l'automation
    // Temps humain économisé, réduction des erreurs, etc.
    
    const automation_hours_saved = 40; // heures/mois
    const hourly_rate = 25; // €/heure
    const error_reduction_savings = 150; // €/mois

    return {
      timeSaved: automation_hours_saved,
      total: (automation_hours_saved * hourly_rate) + error_reduction_savings,
      satisfactionIncrease: 15, // %
      automatedTasks: 85 // %
    };
  }

  private async calculateRevenueGenerated(siteId: string, period: string): Promise<any> {
    // Estimer le revenu généré par l'amélioration des conversions
    
    const improved_conversions = 12; // conversions supplémentaires
    const avg_order_value = 150; // €
    const retention_improvement = 200; // € de revenu récurrent

    return {
      leadConversions: improved_conversions,
      total: (improved_conversions * avg_order_value) + retention_improvement
    };
  }

  // =============================================================================
  // 🔧 FONCTIONS UTILITAIRES
  // =============================================================================

  private async createOrGetStripeCustomer(email: string, name: string, siteId: string) {
    // Vérifier si le customer existe déjà
    const existingCustomers = await this.stripe.customers.list({
      email: email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Créer un nouveau customer
    return await this.stripe.customers.create({
      email,
      name,
      metadata: {
        siteId,
        source: 'automation_subscription'
      }
    });
  }

  private async saveSubscriptionToDatabase(subscription: AutomationSubscription): Promise<void> {
    // En production, sauvegarder en base de données
    console.log('Abonnement sauvegardé:', subscription.id);
  }

  private async activateIncludedAgents(siteId: string, agentIds: string[]): Promise<void> {
    // Activer automatiquement les agents inclus dans le package
    for (const agentId of agentIds) {
      console.log(`Activation agent ${agentId} pour site ${siteId}`);
      // Logique d'activation spécifique à chaque agent
    }
  }

  private async getActiveSubscription(siteId: string): Promise<AutomationSubscription | null> {
    // Simulation - en production, récupérer depuis la base
    return {
      id: 'sub_test_123',
      siteId,
      packageId: 'professional',
      stripeSubscriptionId: 'sub_test_123',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      monthlyPrice: 149,
      usage: {
        executions: 450,
        workflows: 3,
        agentsActive: ['service-client', 'marketing-automation']
      },
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false
    };
  }

  private async getSubscriptionById(id: string): Promise<AutomationSubscription | null> {
    // Simulation - en production, récupérer depuis la base
    return await this.getActiveSubscription('test-site');
  }

  private async recordUsage(siteId: string, agentType: string, action: string, quantity: number): Promise<void> {
    console.log(`Usage enregistré: ${siteId} - ${agentType} - ${action} x${quantity}`);
  }

  private async updateUsageMetrics(subscriptionId: string, agentType: string, quantity: number): Promise<void> {
    console.log(`Métriques mises à jour: ${subscriptionId} - ${agentType} x${quantity}`);
  }

  private async recordOverageUsage(subscriptionId: string, agentType: string, quantity: number, cost: number): Promise<void> {
    console.log(`Dépassement enregistré: ${subscriptionId} - ${agentType} x${quantity} = ${cost}€`);
  }

  private async notifyUsageOverage(siteId: string, agentType: string, cost: number): Promise<void> {
    console.log(`Notification dépassement: Site ${siteId} - ${agentType} - ${cost}€`);
  }

  private async getMonthlyUsage(siteId: string): Promise<any> {
    // Simulation des données d'usage mensuel
    return {
      serviceClient: { executions: 450 },
      marketing: { campaigns: 12 },
      businessIntelligence: { reports: 8 },
      workflows: { active: 3 }
    };
  }

  private async calculateOverages(subscription: AutomationSubscription, usage: any): Promise<any> {
    const packageInfo = AUTOMATION_PACKAGES.find(p => p.id === subscription.packageId);
    if (!packageInfo || packageInfo.maxExecutions === -1) {
      return { total: 0, serviceClient: 0, marketing: 0, businessIntelligence: 0, workflows: 0 };
    }

    const overages = {
      serviceClient: Math.max(0, usage.serviceClient.executions - packageInfo.maxExecutions) * 0.05,
      marketing: Math.max(0, usage.marketing.campaigns - 10) * 2, // 2€ par campagne supplémentaire
      businessIntelligence: Math.max(0, usage.businessIntelligence.reports - 5) * 5, // 5€ par rapport supplémentaire
      workflows: Math.max(0, usage.workflows.active - packageInfo.maxWorkflows) * 10 // 10€ par workflow supplémentaire
    };

    return {
      ...overages,
      total: Object.values(overages).reduce((sum, cost) => sum + cost, 0)
    };
  }

  private async processOverageBilling(subscriptionId: string, amount: number): Promise<void> {
    // Créer un invoice item pour les dépassements
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      await this.stripe.invoiceItems.create({
        customer: subscription.customer,
        amount: Math.round(amount * 100), // Stripe utilise les centimes
        currency: 'eur',
        description: 'Dépassement d\'usage - Automations IA',
        subscription: subscriptionId
      });

      console.log(`Facturation dépassement créée: ${amount}€ pour ${subscriptionId}`);
    } catch (error) {
      console.error('Erreur facturation dépassement:', error);
    }
  }

  // =============================================================================
  // 📊 API PUBLIQUE
  // =============================================================================

  public getPackages(): AutomationPackage[] {
    return AUTOMATION_PACKAGES;
  }

  public getPackageById(id: string): AutomationPackage | undefined {
    return AUTOMATION_PACKAGES.find(p => p.id === id);
  }

  public async upgradeSubscription(subscriptionId: string, newPackageId: string): Promise<void> {
    // Logique de mise à niveau d'abonnement
    console.log(`Upgrade abonnement ${subscriptionId} vers ${newPackageId}`);
  }

  public async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<void> {
    // Logique d'annulation d'abonnement
    try {
      await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd
      });
      
      console.log(`Abonnement ${subscriptionId} annulé (fin de période: ${cancelAtPeriodEnd})`);
    } catch (error) {
      console.error('Erreur annulation abonnement:', error);
      throw error;
    }
  }
}

// =============================================================================
// 🎯 EXPORT ET INSTANCE SINGLETON
// =============================================================================

export const automationMonetization = AutomationMonetization.getInstance();
export default automationMonetization;