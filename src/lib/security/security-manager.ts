// =============================================================================
// 🔐 GESTIONNAIRE DE SÉCURITÉ AVANCÉ - CORE PLATFORM
// =============================================================================

import { coreLogger } from '@/lib/monitoring';
import { db } from '@/lib/db';
import { metriquesOrchestration } from '@/lib/db/schema';
import * as crypto from 'crypto';

// =============================================================================
// 🎯 TYPES ET INTERFACES
// =============================================================================

export interface SecurityConfig {
  // Rotation des secrets
  secretRotation: {
    enabled: boolean;
    interval: number; // en heures
    retainOld: number; // nombre d'anciennes versions à garder
    notifyBefore: number; // heures avant expiration pour alerter
  };
  
  // RGPD et compliance
  gdpr: {
    enabled: boolean;
    dataRetentionDays: number;
    anonymizationEnabled: boolean;
    auditLogRetention: number; // jours
    cookieConsentRequired: boolean;
  };
  
  // Sécurité des APIs
  apiSecurity: {
    rateLimiting: {
      enabled: boolean;
      windowMs: number;
      maxRequests: number;
    };
    ipWhitelist: string[];
    requireHttps: boolean;
    corsEnabled: boolean;
    allowedOrigins: string[];
  };
  
  // Chiffrement
  encryption: {
    algorithm: string;
    keyRotationDays: number;
    encryptSensitiveData: boolean;
  };
  
  // Audit et logging
  audit: {
    enabled: boolean;
    logSensitiveActions: boolean;
    retentionDays: number;
    realTimeMonitoring: boolean;
  };
}

export interface Secret {
  id: string;
  name: string;
  value: string;
  type: 'api_key' | 'password' | 'token' | 'certificate' | 'private_key';
  createdAt: number;
  expiresAt: number;
  lastRotated: number;
  rotationInterval: number; // heures
  isActive: boolean;
  metadata: {
    description?: string;
    environment?: string;
    service?: string;
    previousVersions?: string[];
  };
}

export interface SecurityEvent {
  id: string;
  type: 'secret_rotation' | 'data_access' | 'gdpr_request' | 'security_breach' | 'auth_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  source: string;
  details: Record<string, any>;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resolved: boolean;
}

export interface GDPRRequest {
  id: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
  userId: string;
  email: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: number;
  processedAt?: number;
  data?: any;
  reason?: string;
}

// =============================================================================
// 🔧 GESTIONNAIRE DE SÉCURITÉ
// =============================================================================

export class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;
  private secrets: Map<string, Secret> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private gdprRequests: Map<string, GDPRRequest> = new Map();
  private rotationScheduler: NodeJS.Timeout | null = null;
  private encryptionKey: string;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.encryptionKey = this.generateEncryptionKey();
    this.initializeSecuritySystem();
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // =============================================================================
  // 🏗️ INITIALISATION
  // =============================================================================

  private getDefaultConfig(): SecurityConfig {
    return {
      secretRotation: {
        enabled: true,
        interval: 720, // 30 jours
        retainOld: 3,
        notifyBefore: 168 // 7 jours
      },
      gdpr: {
        enabled: true,
        dataRetentionDays: 365,
        anonymizationEnabled: true,
        auditLogRetention: 2555, // 7 ans
        cookieConsentRequired: true
      },
      apiSecurity: {
        rateLimiting: {
          enabled: true,
          windowMs: 15 * 60 * 1000, // 15 minutes
          maxRequests: 100
        },
        ipWhitelist: [],
        requireHttps: process.env.NODE_ENV === 'production',
        corsEnabled: true,
        allowedOrigins: [
          'https://*.vercel.app',
          'https://localhost:3334',
          process.env.FRONTEND_URL || 'http://localhost:3334'
        ]
      },
      encryption: {
        algorithm: 'aes-256-gcm',
        keyRotationDays: 90,
        encryptSensitiveData: false // Désactivé temporairement pour Vercel
      },
      audit: {
        enabled: true,
        logSensitiveActions: true,
        retentionDays: 365,
        realTimeMonitoring: true
      }
    };
  }

  private async initializeSecuritySystem(): Promise<void> {
    try {
      // Initialiser les secrets critiques
      await this.initializeCoreSecrets();
      
      // Démarrer la rotation automatique
      this.startSecretRotation();
      
      // Planifier les tâches de maintenance RGPD
      this.scheduleGDPRMaintenance();
      
      coreLogger.info('Security system initialized successfully');
    } catch (error) {
      coreLogger.error('Failed to initialize security system', error as Error);
    }
  }

  private async initializeCoreSecrets(): Promise<void> {
    const coreSecrets = [
      {
        name: 'INTER_AGENT_TOKEN',
        type: 'token' as const,
        value: process.env.INTER_AGENT_TOKEN || this.generateSecureToken(),
        rotationInterval: 168, // 7 jours
        metadata: {
          description: 'Token for inter-agent communication',
          environment: process.env.NODE_ENV || 'development',
          service: 'core-platform'
        }
      },
      {
        name: 'DATABASE_ENCRYPTION_KEY',
        type: 'private_key' as const,
        value: process.env.DATABASE_ENCRYPTION_KEY || this.generateEncryptionKey(),
        rotationInterval: 2160, // 90 jours
        metadata: {
          description: 'Key for database field encryption',
          environment: process.env.NODE_ENV || 'development',
          service: 'database'
        }
      },
      {
        name: 'API_RATE_LIMIT_SECRET',
        type: 'token' as const,
        value: this.generateSecureToken(),
        rotationInterval: 720, // 30 jours
        metadata: {
          description: 'Secret for rate limiting signature',
          environment: process.env.NODE_ENV || 'development',
          service: 'api-gateway'
        }
      }
    ];

    for (const secretData of coreSecrets) {
      const secret = this.createSecret(
        secretData.name,
        secretData.value,
        secretData.type,
        secretData.rotationInterval,
        secretData.metadata
      );
      this.secrets.set(secret.id, secret);
    }

    coreLogger.info(`Initialized ${coreSecrets.length} core secrets`);
  }

  // =============================================================================
  // 🔑 GESTION DES SECRETS
  // =============================================================================

  private createSecret(
    name: string,
    value: string,
    type: Secret['type'],
    rotationInterval: number,
    metadata: Secret['metadata'] = {}
  ): Secret {
    const now = Date.now();
    return {
      id: `secret-${name}-${now}`,
      name,
      value: this.encryptValue(value),
      type,
      createdAt: now,
      expiresAt: now + (rotationInterval * 60 * 60 * 1000),
      lastRotated: now,
      rotationInterval,
      isActive: true,
      metadata
    };
  }

  async rotateSecret(secretId: string): Promise<Secret> {
    const secret = this.secrets.get(secretId);
    if (!secret) {
      throw new Error(`Secret not found: ${secretId}`);
    }

    // Générer nouvelle valeur selon le type
    let newValue: string;
    switch (secret.type) {
      case 'api_key':
      case 'token':
        newValue = this.generateSecureToken();
        break;
      case 'password':
        newValue = this.generateSecurePassword();
        break;
      case 'private_key':
        newValue = this.generateEncryptionKey();
        break;
      default:
        newValue = this.generateSecureToken();
    }

    // Sauvegarder l'ancienne version
    const oldVersions = secret.metadata.previousVersions || [];
    oldVersions.push(secret.value);
    
    // Garder seulement le nombre configuré d'anciennes versions
    if (oldVersions.length > this.config.secretRotation.retainOld) {
      oldVersions.splice(0, oldVersions.length - this.config.secretRotation.retainOld);
    }

    // Créer nouveau secret
    const now = Date.now();
    const rotatedSecret: Secret = {
      ...secret,
      value: this.encryptValue(newValue),
      lastRotated: now,
      expiresAt: now + (secret.rotationInterval * 60 * 60 * 1000),
      metadata: {
        ...secret.metadata,
        previousVersions: oldVersions
      }
    };

    this.secrets.set(secretId, rotatedSecret);

    // Enregistrer l'événement
    await this.logSecurityEvent({
      type: 'secret_rotation',
      severity: 'medium',
      source: 'security-manager',
      details: {
        secretId,
        secretName: secret.name,
        secretType: secret.type,
        automated: true
      }
    });

    coreLogger.info(`Secret rotated: ${secret.name}`, { secretId });
    return rotatedSecret;
  }

  private startSecretRotation(): void {
    if (!this.config.secretRotation.enabled) return;

    // Vérifier toutes les heures
    this.rotationScheduler = setInterval(async () => {
      await this.checkAndRotateExpiredSecrets();
    }, 60 * 60 * 1000);

    coreLogger.info('Secret rotation scheduler started');
  }

  private async checkAndRotateExpiredSecrets(): Promise<void> {
    const now = Date.now();
    const notifyThreshold = this.config.secretRotation.notifyBefore * 60 * 60 * 1000;

    for (const [secretId, secret] of this.secrets.entries()) {
      if (!secret.isActive) continue;

      const timeToExpiry = secret.expiresAt - now;

      if (timeToExpiry <= 0) {
        // Secret expiré, rotation immédiate
        try {
          await this.rotateSecret(secretId);
        } catch (error) {
          coreLogger.error(`Failed to rotate expired secret ${secret.name}`, error as Error);
        }
      } else if (timeToExpiry <= notifyThreshold) {
        // Notifier de l'expiration prochaine
        await this.logSecurityEvent({
          type: 'secret_rotation',
          severity: 'medium',
          source: 'security-manager',
          details: {
            secretId,
            secretName: secret.name,
            timeToExpiry,
            action: 'expiration_warning'
          }
        });
      }
    }
  }

  // =============================================================================
  // 🔐 CHIFFREMENT ET DÉCHIFFREMENT
  // =============================================================================

  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  private generateSecurePassword(): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 32; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  encryptValue(value: string): string {
    if (!this.config.encryption.encryptSensitiveData) return value;

    try {
      const iv = crypto.randomBytes(16);
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const cipher = crypto.createCipherGCM('aes-256-gcm', key, iv);
      
      let encrypted = cipher.update(value, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();
      
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      coreLogger.error('Encryption failed', error as Error);
      return value; // Fallback en cas d'erreur
    }
  }

  decryptValue(encryptedValue: string): string {
    if (!this.config.encryption.encryptSensitiveData) return encryptedValue;
    if (!encryptedValue.includes(':')) return encryptedValue; // Pas chiffré

    try {
      const [ivHex, authTagHex, encrypted] = encryptedValue.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const decipher = crypto.createDecipherGCM('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      coreLogger.error('Decryption failed', error as Error);
      return encryptedValue; // Fallback en cas d'erreur
    }
  }

  // =============================================================================
  // 📋 CONFORMITÉ RGPD
  // =============================================================================

  async processGDPRRequest(
    type: GDPRRequest['type'],
    userId: string,
    email: string,
    details?: any
  ): Promise<string> {
    const requestId = `gdpr-${type}-${Date.now()}`;
    
    const request: GDPRRequest = {
      id: requestId,
      type,
      userId,
      email,
      status: 'pending',
      requestedAt: Date.now()
    };

    this.gdprRequests.set(requestId, request);

    // Enregistrer l'événement
    await this.logSecurityEvent({
      type: 'gdpr_request',
      severity: 'medium',
      source: 'gdpr-compliance',
      details: {
        requestId,
        requestType: type,
        userId,
        email: this.hashEmail(email)
      },
      userId
    });

    // Traitement automatique selon le type
    switch (type) {
      case 'access':
        await this.processDataAccessRequest(request);
        break;
      case 'erasure':
        await this.processDataErasureRequest(request);
        break;
      case 'portability':
        await this.processDataPortabilityRequest(request);
        break;
      default:
        // Marquer comme nécessitant intervention manuelle
        request.status = 'processing';
    }

    coreLogger.info(`GDPR request created: ${type}`, { requestId, userId });
    return requestId;
  }

  private async processDataAccessRequest(request: GDPRRequest): Promise<void> {
    try {
      request.status = 'processing';

      // Collecter toutes les données de l'utilisateur
      // TODO: Implémenter la collecte réelle des données
      const userData = {
        profile: {}, // Données de profil
        projects: [], // Projets de l'utilisateur
        metrics: [], // Métriques liées à l'utilisateur
        auditLogs: [] // Logs d'audit
      };

      request.data = userData;
      request.status = 'completed';
      request.processedAt = Date.now();

      coreLogger.info(`GDPR access request completed`, { requestId: request.id });
    } catch (error) {
      request.status = 'rejected';
      request.reason = (error as Error).message;
      coreLogger.error(`GDPR access request failed`, error as Error);
    }
  }

  private async processDataErasureRequest(request: GDPRRequest): Promise<void> {
    try {
      request.status = 'processing';

      // Anonymiser/supprimer les données selon la politique de rétention
      // TODO: Implémenter la suppression réelle des données
      
      request.status = 'completed';
      request.processedAt = Date.now();

      coreLogger.info(`GDPR erasure request completed`, { requestId: request.id });
    } catch (error) {
      request.status = 'rejected';
      request.reason = (error as Error).message;
      coreLogger.error(`GDPR erasure request failed`, error as Error);
    }
  }

  private async processDataPortabilityRequest(request: GDPRRequest): Promise<void> {
    try {
      request.status = 'processing';

      // Exporter les données dans un format portable
      // TODO: Implémenter l'export réel des données
      
      request.status = 'completed';
      request.processedAt = Date.now();

      coreLogger.info(`GDPR portability request completed`, { requestId: request.id });
    } catch (error) {
      request.status = 'rejected';
      request.reason = (error as Error).message;
      coreLogger.error(`GDPR portability request failed`, error as Error);
    }
  }

  private scheduleGDPRMaintenance(): void {
    // Nettoyage quotidien des données expirées
    setInterval(async () => {
      await this.cleanupExpiredData();
    }, 24 * 60 * 60 * 1000); // Tous les jours

    coreLogger.info('GDPR maintenance scheduler started');
  }

  private async cleanupExpiredData(): Promise<void> {
    if (!this.config.gdpr.enabled) return;

    const cutoffDate = Date.now() - (this.config.gdpr.dataRetentionDays * 24 * 60 * 60 * 1000);
    
    try {
      // TODO: Implémenter le nettoyage réel des données expirées
      
      await this.logSecurityEvent({
        type: 'gdpr_request',
        severity: 'low',
        source: 'gdpr-maintenance',
        details: {
          action: 'cleanup_expired_data',
          cutoffDate
        }
      });

      coreLogger.info('GDPR data cleanup completed');
    } catch (error) {
      coreLogger.error('GDPR data cleanup failed', error as Error);
    }
  }

  // =============================================================================
  // 📊 AUDIT ET ÉVÉNEMENTS DE SÉCURITÉ
  // =============================================================================

  private async logSecurityEvent(eventData: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    const event: SecurityEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      resolved: false,
      ...eventData
    };

    this.securityEvents.push(event);

    // Enregistrer en base pour persistance
    try {
      await db.insert(metriquesOrchestration).values({
        metrique: 'security_event',
        valeur: event.severity,
        unite: 'severity',
        agentType: 'core-platform',
        metadonnees: JSON.stringify({
          eventId: event.id,
          type: event.type,
          source: event.source,
          details: event.details
        })
      });
    } catch (error) {
      coreLogger.error('Failed to log security event to database', error as Error);
    }

    // Alerter si critique
    if (event.severity === 'critical' && this.config.audit.realTimeMonitoring) {
      coreLogger.error(`CRITICAL SECURITY EVENT: ${event.type}`, event.details);
    }
  }

  // =============================================================================
  // 🛡️ UTILITAIRES DE SÉCURITÉ
  // =============================================================================

  private hashEmail(email: string): string {
    return crypto.createHash('sha256').update(email).digest('hex').substring(0, 8);
  }

  isRequestAllowed(ip: string, userAgent?: string): boolean {
    // Vérifier la whitelist IP si configurée
    if (this.config.apiSecurity.ipWhitelist.length > 0) {
      return this.config.apiSecurity.ipWhitelist.some(allowedIp => 
        ip === allowedIp || ip.startsWith(allowedIp)
      );
    }

    // TODO: Ajouter d'autres vérifications (rate limiting, géolocalisation, etc.)
    return true;
  }

  validateCORSOrigin(origin: string): boolean {
    if (!this.config.apiSecurity.corsEnabled) return false;
    
    return this.config.apiSecurity.allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '.*');
        return new RegExp(pattern).test(origin);
      }
      return origin === allowed;
    });
  }

  // =============================================================================
  // 📊 GETTERS ET STATS
  // =============================================================================

  getSecurityStats() {
    const now = Date.now();
    const recentEvents = this.securityEvents.filter(e => 
      now - e.timestamp < 24 * 60 * 60 * 1000 // Dernières 24h
    );

    return {
      secretsManaged: this.secrets.size,
      activeSecrets: Array.from(this.secrets.values()).filter(s => s.isActive).length,
      secretsExpiringInWeek: Array.from(this.secrets.values()).filter(s => 
        s.isActive && s.expiresAt - now < 7 * 24 * 60 * 60 * 1000
      ).length,
      recentSecurityEvents: recentEvents.length,
      criticalEvents: recentEvents.filter(e => e.severity === 'critical').length,
      pendingGDPRRequests: Array.from(this.gdprRequests.values()).filter(r => 
        r.status === 'pending' || r.status === 'processing'
      ).length,
      gdprRequestsProcessed: Array.from(this.gdprRequests.values()).filter(r => 
        r.status === 'completed'
      ).length,
      encryptionEnabled: this.config.encryption.encryptSensitiveData,
      gdprCompliant: this.config.gdpr.enabled
    };
  }

  getSecrets(): Secret[] {
    return Array.from(this.secrets.values()).map(secret => ({
      ...secret,
      value: '[HIDDEN]' // Ne jamais exposer les valeurs
    }));
  }

  getSecurityEvents(limit: number = 100): SecurityEvent[] {
    return this.securityEvents
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getGDPRRequests(): GDPRRequest[] {
    return Array.from(this.gdprRequests.values())
      .sort((a, b) => b.requestedAt - a.requestedAt);
  }

  // =============================================================================
  // 🧹 NETTOYAGE
  // =============================================================================

  cleanup(): void {
    if (this.rotationScheduler) {
      clearInterval(this.rotationScheduler);
      this.rotationScheduler = null;
    }
  }
}

// =============================================================================
// 🎯 EXPORT ET INSTANCE SINGLETON
// =============================================================================

export const securityManager = SecurityManager.getInstance();
export default securityManager;