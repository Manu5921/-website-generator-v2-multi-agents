// 📧📱 Service de communication multi-canal
// Agent Automation - Configuration SMS/Email/Notifications

export interface CommunicationConfig {
  email: {
    provider: 'resend' | 'sendgrid' | 'mailgun';
    apiKey: string;
    from: string;
    replyTo?: string;
  };
  sms: {
    provider: 'twilio' | 'ovh' | 'orange';
    apiKey: string;
    apiSecret: string;
    from: string;
  };
  whatsapp: {
    provider: 'twilio' | 'meta' | 'whatsapp-business';
    apiKey: string;
    phoneNumberId?: string;
  };
  notifications: {
    push: boolean;
    slack?: {
      webhook: string;
      channel: string;
    };
    webhook?: {
      url: string;
      secret: string;
    };
  };
}

export interface MessageTemplate {
  id: string;
  nom: string;
  canal: 'email' | 'sms' | 'whatsapp' | 'notification';
  secteur: string;
  type: string;
  sujet?: string;
  contenu: string;
  variables: string[];
  metadata?: Record<string, any>;
}

export interface SendMessageRequest {
  destinataire: {
    nom: string;
    email?: string;
    telephone?: string;
    whatsapp?: string;
  };
  template: MessageTemplate;
  variables: Record<string, string>;
  delai?: number; // en minutes
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  scheduledFor?: Date;
  deliveredAt?: Date;
}

// =============================================================================
// 📧 SERVICE EMAIL
// =============================================================================

export class EmailService {
  private config: CommunicationConfig['email'];

  constructor(config: CommunicationConfig['email']) {
    this.config = config;
  }

  async sendEmail(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      if (!request.destinataire.email) {
        return { success: false, error: 'Email destinataire manquant' };
      }

      const contenuFinal = this.processTemplate(request.template.contenu, request.variables);
      const sujetFinal = request.template.sujet ? 
        this.processTemplate(request.template.sujet, request.variables) : 
        'Notification';

      const emailData = {
        from: this.config.from,
        to: request.destinataire.email,
        subject: sujetFinal,
        html: contenuFinal,
        replyTo: this.config.replyTo
      };

      let messageId: string;

      switch (this.config.provider) {
        case 'resend':
          messageId = await this.sendWithResend(emailData);
          break;
        case 'sendgrid':
          messageId = await this.sendWithSendgrid(emailData);
          break;
        case 'mailgun':
          messageId = await this.sendWithMailgun(emailData);
          break;
        default:
          throw new Error(`Provider email non supporté: ${this.config.provider}`);
      }

      return {
        success: true,
        messageId,
        deliveredAt: new Date()
      };

    } catch (error) {
      console.error('Erreur envoi email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  private async sendWithResend(emailData: any): Promise<string> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.id;
  }

  private async sendWithSendgrid(emailData: any): Promise<string> {
    // Implémentation SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: emailData.to }] }],
        from: { email: emailData.from },
        subject: emailData.subject,
        content: [{ type: 'text/html', value: emailData.html }]
      }),
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`);
    }

    return response.headers.get('x-message-id') || 'sendgrid-' + Date.now();
  }

  private async sendWithMailgun(emailData: any): Promise<string> {
    // Implémentation Mailgun
    const domain = 'sandbox123.mailgun.org'; // À configurer
    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${this.config.apiKey}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html
      }),
    });

    if (!response.ok) {
      throw new Error(`Mailgun API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.id;
  }

  private processTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }
}

// =============================================================================
// 📱 SERVICE SMS
// =============================================================================

export class SMSService {
  private config: CommunicationConfig['sms'];

  constructor(config: CommunicationConfig['sms']) {
    this.config = config;
  }

  async sendSMS(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      if (!request.destinataire.telephone) {
        return { success: false, error: 'Numéro de téléphone manquant' };
      }

      const contenuFinal = this.processTemplate(request.template.contenu, request.variables);
      
      // Validation de la longueur SMS (160 caractères max)
      if (contenuFinal.length > 160) {
        console.warn(`SMS trop long (${contenuFinal.length} caractères), sera fragmenté`);
      }

      const smsData = {
        from: this.config.from,
        to: this.normalizePhoneNumber(request.destinataire.telephone),
        body: contenuFinal
      };

      let messageId: string;

      switch (this.config.provider) {
        case 'twilio':
          messageId = await this.sendWithTwilio(smsData);
          break;
        case 'ovh':
          messageId = await this.sendWithOVH(smsData);
          break;
        case 'orange':
          messageId = await this.sendWithOrange(smsData);
          break;
        default:
          throw new Error(`Provider SMS non supporté: ${this.config.provider}`);
      }

      return {
        success: true,
        messageId,
        deliveredAt: new Date()
      };

    } catch (error) {
      console.error('Erreur envoi SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  private async sendWithTwilio(smsData: any): Promise<string> {
    const accountSid = this.config.apiKey;
    const authToken = this.config.apiSecret;
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: smsData.from,
        To: smsData.to,
        Body: smsData.body
      }),
    });

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.sid;
  }

  private async sendWithOVH(smsData: any): Promise<string> {
    // Implémentation OVH SMS API
    const response = await fetch('https://eu.api.ovh.com/1.0/sms/serviceName/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ovh-Application': this.config.apiKey,
        'X-Ovh-Consumer': this.config.apiSecret
      },
      body: JSON.stringify({
        message: smsData.body,
        senderForResponse: true,
        receivers: [smsData.to]
      }),
    });

    if (!response.ok) {
      throw new Error(`OVH SMS API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.ids[0];
  }

  private async sendWithOrange(smsData: any): Promise<string> {
    // Implémentation Orange SMS API
    const response = await fetch('https://api.orange.com/smsmessaging/v1/outbound/tel:+33000000000/requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        outboundSMSMessageRequest: {
          address: [`tel:${smsData.to}`],
          senderAddress: `tel:${smsData.from}`,
          outboundSMSTextMessage: {
            message: smsData.body
          }
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Orange SMS API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.outboundSMSMessageRequest.resourceReference.resourceURL;
  }

  private normalizePhoneNumber(phone: string): string {
    // Normalisation des numéros français
    let normalized = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    
    if (normalized.startsWith('06') || normalized.startsWith('07')) {
      normalized = '+33' + normalized.substring(1);
    } else if (normalized.startsWith('33')) {
      normalized = '+' + normalized;
    } else if (!normalized.startsWith('+')) {
      normalized = '+33' + normalized;
    }
    
    return normalized;
  }

  private processTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }
}

// =============================================================================
// 📢 SERVICE NOTIFICATIONS
// =============================================================================

export class NotificationService {
  private config: CommunicationConfig['notifications'];

  constructor(config: CommunicationConfig['notifications']) {
    this.config = config;
  }

  async sendNotification(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const contenuFinal = this.processTemplate(request.template.contenu, request.variables);
      
      const results = await Promise.allSettled([
        this.config.slack ? this.sendSlackNotification(contenuFinal, request) : null,
        this.config.webhook ? this.sendWebhookNotification(contenuFinal, request) : null,
        this.config.push ? this.sendPushNotification(contenuFinal, request) : null
      ]);

      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      
      return {
        success: successCount > 0,
        messageId: `notification-${Date.now()}`,
        deliveredAt: new Date()
      };

    } catch (error) {
      console.error('Erreur envoi notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  private async sendSlackNotification(contenu: string, request: SendMessageRequest): Promise<boolean> {
    if (!this.config.slack) return false;

    try {
      const response = await fetch(this.config.slack.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: this.config.slack.channel,
          text: contenu,
          username: 'Workflow Bot',
          icon_emoji: ':robot_face:'
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur Slack:', error);
      return false;
    }
  }

  private async sendWebhookNotification(contenu: string, request: SendMessageRequest): Promise<boolean> {
    if (!this.config.webhook) return false;

    try {
      const response = await fetch(this.config.webhook.url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Webhook-Secret': this.config.webhook.secret
        },
        body: JSON.stringify({
          type: 'workflow_notification',
          content: contenu,
          destinataire: request.destinataire,
          template: request.template.nom,
          timestamp: new Date().toISOString()
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur Webhook:', error);
      return false;
    }
  }

  private async sendPushNotification(contenu: string, request: SendMessageRequest): Promise<boolean> {
    // Implémentation push notifications (FCM, APNs, etc.)
    console.log('Push notification:', contenu);
    return true;
  }

  private processTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }
}

// =============================================================================
// 🎯 SERVICE PRINCIPAL DE COMMUNICATION
// =============================================================================

export class CommunicationManager {
  private emailService: EmailService;
  private smsService: SMSService;
  private notificationService: NotificationService;

  constructor(config: CommunicationConfig) {
    this.emailService = new EmailService(config.email);
    this.smsService = new SMSService(config.sms);
    this.notificationService = new NotificationService(config.notifications);
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    // Si délai spécifié, programmer l'envoi
    if (request.delai && request.delai > 0) {
      return this.scheduleMessage(request);
    }

    // Envoi immédiat selon le canal
    switch (request.template.canal) {
      case 'email':
        return this.emailService.sendEmail(request);
      case 'sms':
        return this.smsService.sendSMS(request);
      case 'notification':
        return this.notificationService.sendNotification(request);
      case 'whatsapp':
        return this.sendWhatsApp(request);
      default:
        return { success: false, error: `Canal non supporté: ${request.template.canal}` };
    }
  }

  private async scheduleMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const scheduledFor = new Date(Date.now() + (request.delai! * 60 * 1000));
    
    // Ici, on pourrait utiliser un système de queue (Redis, Bull, etc.)
    // Pour l'instant, on simule avec setTimeout
    setTimeout(async () => {
      await this.sendMessage({ ...request, delai: 0 });
    }, request.delai! * 60 * 1000);

    return {
      success: true,
      messageId: `scheduled-${Date.now()}`,
      scheduledFor
    };
  }

  private async sendWhatsApp(request: SendMessageRequest): Promise<SendMessageResponse> {
    // Implémentation WhatsApp Business API
    console.log('WhatsApp message:', request);
    return { success: true, messageId: `whatsapp-${Date.now()}` };
  }

  // Validation des templates
  validateTemplate(template: MessageTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.nom) errors.push('Nom du template requis');
    if (!template.contenu) errors.push('Contenu du template requis');
    if (!template.canal) errors.push('Canal de communication requis');
    
    if (template.canal === 'email' && !template.sujet) {
      errors.push('Sujet requis pour les emails');
    }

    if (template.canal === 'sms' && template.contenu.length > 160) {
      errors.push('Contenu SMS trop long (max 160 caractères)');
    }

    // Validation des variables
    const variablesInContent = template.contenu.match(/{{(.*?)}}/g) || [];
    const missingVariables = variablesInContent
      .map(v => v.replace(/[{}]/g, ''))
      .filter(v => !template.variables.includes(v));

    if (missingVariables.length > 0) {
      errors.push(`Variables manquantes: ${missingVariables.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// =============================================================================
// 📊 TEMPLATES PAR DÉFAUT SECTORIELS
// =============================================================================

export const defaultTemplatesBySector = {
  artisan: [
    {
      id: 'artisan-sms-devis-recu',
      nom: 'SMS Accusé réception devis',
      canal: 'sms' as const,
      secteur: 'artisan',
      type: 'devis',
      contenu: 'Bonjour {{prenom}}, votre demande de devis {{type_travaux}} est bien reçue ! Je vous rappelle sous 1h. {{nom_entreprise}} {{telephone}}',
      variables: ['prenom', 'type_travaux', 'nom_entreprise', 'telephone']
    }
  ],
  avocat: [
    {
      id: 'avocat-email-rdv-confirme',
      nom: 'Email confirmation RDV',
      canal: 'email' as const,
      secteur: 'avocat',
      type: 'consultation',
      sujet: 'Confirmation de votre rendez-vous - Me {{nom_avocat}}',
      contenu: `<p>Madame, Monsieur {{nom_client}},</p>
                <p>Je confirme votre rendez-vous le {{date_rdv}} à {{heure_rdv}}.</p>
                <p>Cordialement,<br>Me {{nom_avocat}}</p>`,
      variables: ['nom_client', 'nom_avocat', 'date_rdv', 'heure_rdv']
    }
  ],
  coach: [
    {
      id: 'coach-email-bienvenue',
      nom: 'Email de bienvenue',
      canal: 'email' as const,
      secteur: 'coach', 
      type: 'nurturing',
      sujet: 'Bienvenue {{prenom}} ! Votre transformation commence maintenant 🎯',
      contenu: `<h2>Bienvenue {{prenom}} !</h2>
                <p>Félicitations pour avoir franchi le premier pas vers {{objectif}}.</p>
                <p>{{nom_coach}}</p>`,
      variables: ['prenom', 'objectif', 'nom_coach']
    }
  ]
};

export { CommunicationConfig, MessageTemplate, SendMessageRequest, SendMessageResponse };