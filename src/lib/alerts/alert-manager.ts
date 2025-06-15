// =============================================================================
// 🚨 SYSTÈME D'ALERTES PROACTIVES - CORE PLATFORM
// =============================================================================

import { coreLogger } from '@/lib/monitoring';
import { db } from '@/lib/db';
import { metriquesOrchestration } from '@/lib/db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';

// =============================================================================
// 🎯 TYPES ET INTERFACES
// =============================================================================

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metricName: string;
  condition: {
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
    threshold: number;
    duration: number; // minutes
  };
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  channels: AlertChannel[];
  enabled: boolean;
  cooldown: number; // minutes
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface AlertChannel {
  type: 'slack' | 'email' | 'webhook' | 'sms';
  config: {
    webhook?: string;
    channel?: string;
    recipients?: string[];
    template?: string;
  };
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  message: string;
  severity: AlertRule['severity'];
  status: 'active' | 'resolved' | 'acknowledged';
  triggerValue: number;
  threshold: number;
  firstTriggered: number;
  lastTriggered: number;
  acknowledgedBy?: string;
  resolvedAt?: number;
  metadata?: Record<string, any>;
}

export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  alertsByAgent: Record<string, number>;
  alertsByType: Record<string, number>;
  mttr: number; // Mean Time To Resolution
  alertFrequency: number; // alerts per hour
}

// =============================================================================
// 🔧 GESTIONNAIRE D'ALERTES
// =============================================================================

export class AlertManager {
  private static instance: AlertManager;
  private rules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_FREQUENCY = 30000; // 30 seconds

  private constructor() {
    this.initializeDefaultRules();
    this.startPeriodicChecks();
  }

  public static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  // =============================================================================
  // 🏗️ INITIALISATION DES RÈGLES PAR DÉFAUT
  // =============================================================================

  private initializeDefaultRules(): void {
    // Règle: Temps de réponse élevé
    this.addRule({
      id: 'high-response-time',
      name: 'High Response Time',
      description: 'Alert when response time exceeds threshold',
      metricName: 'response_time',
      condition: {
        operator: 'gt',
        threshold: 1000, // 1 second
        duration: 5 // 5 minutes
      },
      severity: 'warning',
      channels: [
        {
          type: 'slack',
          config: {
            webhook: process.env.SLACK_WEBHOOK_URL,
            channel: '#alerts-performance'
          },
          enabled: true
        }
      ],
      enabled: true,
      cooldown: 15
    });

    // Règle: Taux d'erreur élevé
    this.addRule({
      id: 'high-error-rate',
      name: 'High Error Rate',
      description: 'Alert when error rate is too high',
      metricName: 'error_count',
      condition: {
        operator: 'gt',
        threshold: 10,
        duration: 3
      },
      severity: 'critical',
      channels: [
        {
          type: 'slack',
          config: {
            webhook: process.env.SLACK_WEBHOOK_URL,
            channel: '#alerts-critical'
          },
          enabled: true
        },
        {
          type: 'email',
          config: {
            recipients: [process.env.ALERT_EMAIL || 'admin@example.com']
          },
          enabled: true
        }
      ],
      enabled: true,
      cooldown: 10
    });

    // Règle: Agent indisponible
    this.addRule({
      id: 'agent-down',
      name: 'Agent Down',
      description: 'Alert when an agent is not responding',
      metricName: 'agent_health',
      condition: {
        operator: 'eq',
        threshold: 0, // 0 = down
        duration: 2
      },
      severity: 'emergency',
      channels: [
        {
          type: 'slack',
          config: {
            webhook: process.env.SLACK_WEBHOOK_URL,
            channel: '#alerts-critical'
          },
          enabled: true
        },
        {
          type: 'email',
          config: {
            recipients: [process.env.ALERT_EMAIL || 'admin@example.com']
          },
          enabled: true
        }
      ],
      enabled: true,
      cooldown: 5
    });

    // Règle: Utilisation mémoire élevée
    this.addRule({
      id: 'high-memory-usage',
      name: 'High Memory Usage',
      description: 'Alert when memory usage exceeds 80%',
      metricName: 'memory_usage',
      condition: {
        operator: 'gt',
        threshold: 80,
        duration: 10
      },
      severity: 'warning',
      channels: [
        {
          type: 'slack',
          config: {
            webhook: process.env.SLACK_WEBHOOK_URL,
            channel: '#alerts-performance'
          },
          enabled: true
        }
      ],
      enabled: true,
      cooldown: 30
    });

    // Règle: File d'attente surchargée
    this.addRule({
      id: 'queue-overload',
      name: 'Queue Overload',
      description: 'Alert when task queue is too large',
      metricName: 'queue_size',
      condition: {
        operator: 'gt',
        threshold: 50,
        duration: 5
      },
      severity: 'warning',
      channels: [
        {
          type: 'slack',
          config: {
            webhook: process.env.SLACK_WEBHOOK_URL,
            channel: '#alerts-performance'
          },
          enabled: true
        }
      ],
      enabled: true,
      cooldown: 20
    });

    coreLogger.info(`Initialized ${this.rules.size} default alert rules`);
  }

  // =============================================================================
  // 📏 GESTION DES RÈGLES
  // =============================================================================

  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    coreLogger.info(`Added alert rule: ${rule.name}`, { ruleId: rule.id });
  }

  updateRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    const updatedRule = { ...rule, ...updates };
    this.rules.set(ruleId, updatedRule);
    
    coreLogger.info(`Updated alert rule: ${rule.name}`, { ruleId });
    return true;
  }

  removeRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    this.rules.delete(ruleId);
    coreLogger.info(`Removed alert rule: ${rule.name}`, { ruleId });
    return true;
  }

  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  getRule(ruleId: string): AlertRule | undefined {
    return this.rules.get(ruleId);
  }

  // =============================================================================
  // 🔍 VÉRIFICATION DES MÉTRIQUES
  // =============================================================================

  private startPeriodicChecks(): void {
    this.checkInterval = setInterval(async () => {
      await this.checkAllRules();
    }, this.CHECK_FREQUENCY);

    coreLogger.info('Started periodic alert checks', { 
      frequency: this.CHECK_FREQUENCY 
    });
  }

  private async checkAllRules(): Promise<void> {
    try {
      const enabledRules = Array.from(this.rules.values()).filter(rule => rule.enabled);
      
      for (const rule of enabledRules) {
        await this.checkRule(rule);
      }
    } catch (error) {
      coreLogger.error('Error during alert rule checking', error as Error);
    }
  }

  private async checkRule(rule: AlertRule): Promise<void> {
    try {
      // Récupérer les métriques récentes
      const since = new Date(Date.now() - rule.condition.duration * 60 * 1000);
      
      const metrics = await db.select({
        value: metriquesOrchestration.valeur,
        timestamp: metriquesOrchestration.dateCreation,
        agentType: metriquesOrchestration.agentType
      })
      .from(metriquesOrchestration)
      .where(
        and(
          eq(metriquesOrchestration.metrique, rule.metricName),
          sql`date_creation >= ${since}`
        )
      )
      .orderBy(desc(metriquesOrchestration.dateCreation))
      .limit(100);

      if (metrics.length === 0) return;

      // Évaluer la condition
      const latestValue = parseFloat(metrics[0].value);
      const shouldTrigger = this.evaluateCondition(
        latestValue,
        rule.condition.operator,
        rule.condition.threshold
      );

      const alertId = `${rule.id}-${rule.metricName}`;
      const existingAlert = this.activeAlerts.get(alertId);

      if (shouldTrigger && !existingAlert) {
        // Déclencher une nouvelle alerte
        await this.triggerAlert(rule, latestValue, metrics[0].agentType);
      } else if (!shouldTrigger && existingAlert) {
        // Résoudre l'alerte
        await this.resolveAlert(alertId);
      } else if (shouldTrigger && existingAlert) {
        // Mettre à jour l'alerte existante
        existingAlert.lastTriggered = Date.now();
        existingAlert.triggerValue = latestValue;
      }

    } catch (error) {
      coreLogger.error(`Error checking rule ${rule.name}`, error as Error);
    }
  }

  private evaluateCondition(
    value: number,
    operator: AlertRule['condition']['operator'],
    threshold: number
  ): boolean {
    switch (operator) {
      case 'gt': return value > threshold;
      case 'gte': return value >= threshold;
      case 'lt': return value < threshold;
      case 'lte': return value <= threshold;
      case 'eq': return value === threshold;
      case 'ne': return value !== threshold;
      default: return false;
    }
  }

  // =============================================================================
  // 🚨 GESTION DES ALERTES
  // =============================================================================

  private async triggerAlert(
    rule: AlertRule,
    value: number,
    agentType?: string
  ): Promise<void> {
    const alertId = `${rule.id}-${rule.metricName}`;
    const now = Date.now();

    // Vérifier le cooldown
    const lastAlert = this.alertHistory.find(
      a => a.ruleId === rule.id && now - a.lastTriggered < rule.cooldown * 60 * 1000
    );
    
    if (lastAlert) {
      coreLogger.debug(`Alert ${rule.name} in cooldown period`);
      return;
    }

    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      message: this.generateAlertMessage(rule, value, agentType),
      severity: rule.severity,
      status: 'active',
      triggerValue: value,
      threshold: rule.condition.threshold,
      firstTriggered: now,
      lastTriggered: now,
      metadata: {
        agentType,
        rule: rule.metadata
      }
    };

    this.activeAlerts.set(alertId, alert);
    this.alertHistory.push(alert);

    // Envoyer les notifications
    await this.sendNotifications(rule, alert);

    // Enregistrer en base
    await this.logAlert(alert);

    coreLogger.warn(`Alert triggered: ${rule.name}`, {
      alertId,
      value,
      threshold: rule.condition.threshold,
      severity: rule.severity
    });
  }

  private async resolveAlert(alertId: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return;

    alert.status = 'resolved';
    alert.resolvedAt = Date.now();

    this.activeAlerts.delete(alertId);

    // Notification de résolution
    const rule = this.rules.get(alert.ruleId);
    if (rule) {
      await this.sendResolutionNotification(rule, alert);
    }

    coreLogger.info(`Alert resolved: ${alert.ruleName}`, { alertId });
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;

    alert.status = 'acknowledged';
    alert.acknowledgedBy = acknowledgedBy;

    coreLogger.info(`Alert acknowledged: ${alert.ruleName}`, {
      alertId,
      acknowledgedBy
    });

    return true;
  }

  // =============================================================================
  // 📧 SYSTÈME DE NOTIFICATIONS
  // =============================================================================

  private async sendNotifications(rule: AlertRule, alert: Alert): Promise<void> {
    for (const channel of rule.channels.filter(c => c.enabled)) {
      try {
        switch (channel.type) {
          case 'slack':
            await this.sendSlackNotification(channel, alert);
            break;
          case 'email':
            await this.sendEmailNotification(channel, alert);
            break;
          case 'webhook':
            await this.sendWebhookNotification(channel, alert);
            break;
        }
      } catch (error) {
        coreLogger.error(`Failed to send ${channel.type} notification`, error as Error);
      }
    }
  }

  private async sendSlackNotification(channel: AlertChannel, alert: Alert): Promise<void> {
    if (!channel.config.webhook) return;

    const color = this.getSeverityColor(alert.severity);
    const payload = {
      channel: channel.config.channel,
      username: 'Core Platform Alert',
      icon_emoji: ':warning:',
      attachments: [{
        color,
        title: `🚨 ${alert.ruleName}`,
        text: alert.message,
        fields: [
          {
            title: 'Severity',
            value: alert.severity.toUpperCase(),
            short: true
          },
          {
            title: 'Value',
            value: `${alert.triggerValue} (threshold: ${alert.threshold})`,
            short: true
          },
          {
            title: 'Agent',
            value: alert.metadata?.agentType || 'Unknown',
            short: true
          },
          {
            title: 'Time',
            value: new Date(alert.firstTriggered).toISOString(),
            short: true
          }
        ],
        footer: 'Core Platform Monitoring',
        ts: Math.floor(alert.firstTriggered / 1000)
      }]
    };

    const response = await fetch(channel.config.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }
  }

  private async sendEmailNotification(channel: AlertChannel, alert: Alert): Promise<void> {
    // TODO: Implémenter l'envoi d'email avec nodemailer
    coreLogger.info('Email notification sent', { 
      recipients: channel.config.recipients,
      alert: alert.id 
    });
  }

  private async sendWebhookNotification(channel: AlertChannel, alert: Alert): Promise<void> {
    if (!channel.config.webhook) return;

    const payload = {
      alertId: alert.id,
      ruleName: alert.ruleName,
      message: alert.message,
      severity: alert.severity,
      triggerValue: alert.triggerValue,
      threshold: alert.threshold,
      timestamp: alert.firstTriggered,
      metadata: alert.metadata
    };

    const response = await fetch(channel.config.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }
  }

  private async sendResolutionNotification(rule: AlertRule, alert: Alert): Promise<void> {
    // Envoyer uniquement sur Slack pour les résolutions
    const slackChannels = rule.channels.filter(c => c.type === 'slack' && c.enabled);
    
    for (const channel of slackChannels) {
      try {
        const payload = {
          channel: channel.config.channel,
          text: `✅ **RESOLVED** ${alert.ruleName} - The alert condition is no longer met.`,
          username: 'Core Platform Alert',
          icon_emoji: ':white_check_mark:'
        };

        if (channel.config.webhook) {
          await fetch(channel.config.webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      } catch (error) {
        coreLogger.error('Failed to send resolution notification', error as Error);
      }
    }
  }

  // =============================================================================
  // 🎨 UTILITAIRES
  // =============================================================================

  private generateAlertMessage(rule: AlertRule, value: number, agentType?: string): string {
    const agentText = agentType ? ` on agent ${agentType}` : '';
    return `${rule.description}${agentText}. Current value: ${value}, Threshold: ${rule.condition.threshold}`;
  }

  private getSeverityColor(severity: AlertRule['severity']): string {
    switch (severity) {
      case 'info': return '#36a64f';      // green
      case 'warning': return '#ff9900';   // orange
      case 'critical': return '#ff0000';  // red
      case 'emergency': return '#8b0000'; // dark red
      default: return '#cccccc';          // gray
    }
  }

  private async logAlert(alert: Alert): Promise<void> {
    try {
      await db.insert(metriquesOrchestration).values({
        metrique: 'alert_triggered',
        valeur: alert.severity,
        unite: 'severity',
        agentType: alert.metadata?.agentType,
        metadonnees: JSON.stringify({
          alertId: alert.id,
          ruleName: alert.ruleName,
          triggerValue: alert.triggerValue,
          threshold: alert.threshold
        })
      });
    } catch (error) {
      coreLogger.error('Failed to log alert to database', error as Error);
    }
  }

  // =============================================================================
  // 📊 STATISTIQUES ET RAPPORTS
  // =============================================================================

  getAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  getAlertHistory(limit: number = 100): Alert[] {
    return this.alertHistory.slice(-limit);
  }

  getAlertStats(): AlertStats {
    const activeAlerts = Array.from(this.activeAlerts.values());
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'emergency');
    
    const alertsByAgent: Record<string, number> = {};
    const alertsByType: Record<string, number> = {};
    
    for (const alert of activeAlerts) {
      const agent = alert.metadata?.agentType || 'unknown';
      alertsByAgent[agent] = (alertsByAgent[agent] || 0) + 1;
      alertsByType[alert.severity] = (alertsByType[alert.severity] || 0) + 1;
    }

    // Calculer MTTR (Mean Time To Resolution)
    const resolvedAlerts = this.alertHistory.filter(a => a.resolvedAt);
    const mttr = resolvedAlerts.length > 0 
      ? resolvedAlerts.reduce((sum, a) => sum + (a.resolvedAt! - a.firstTriggered), 0) / resolvedAlerts.length
      : 0;

    // Fréquence des alertes (dernière heure)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentAlerts = this.alertHistory.filter(a => a.firstTriggered > oneHourAgo);

    return {
      totalAlerts: this.alertHistory.length,
      activeAlerts: activeAlerts.length,
      criticalAlerts: criticalAlerts.length,
      alertsByAgent,
      alertsByType,
      mttr: Math.round(mttr / 60000), // en minutes
      alertFrequency: recentAlerts.length
    };
  }

  // =============================================================================
  // 🧹 NETTOYAGE
  // =============================================================================

  cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// =============================================================================
// 🎯 EXPORT ET INSTANCE SINGLETON
// =============================================================================

export const alertManager = AlertManager.getInstance();
export default alertManager;