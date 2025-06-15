/**
 * 📧 CLIENT EMAIL - Nodemailer
 * Pour envoyer des emails aux clients
 */

import nodemailer from 'nodemailer';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailClient {
  private transporter;

  constructor() {
    // Skip email configuration if not properly configured
    if (!process.env.SMTP_HOST || 
        !process.env.SMTP_USER || 
        !process.env.SMTP_PASS ||
        process.env.SMTP_USER === 'your.email@gmail.com' ||
        process.env.SMTP_PASS === 'your-app-password') {
      this.transporter = null;
      return;
    }
    
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true pour 465, false pour autres ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Envoyer un email
   */
  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.log('📧 Email would be sent (SMTP not configured):', { to: data.to, subject: data.subject });
        return true;
      }
      
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
      });
      
      console.log(`✅ Email envoyé à: ${data.to}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      return false;
    }
  }

  /**
   * Email de confirmation de demande
   */
  async sendDemandeConfirmation(data: {
    clientEmail: string;
    clientNom: string;
    entreprise: string;
  }): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">✅ Demande reçue !</h2>
        
        <p>Bonjour <strong>${data.clientNom}</strong>,</p>
        
        <p>Nous avons bien reçu votre demande de création de site web pour <strong>${data.entreprise}</strong>.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #059669; margin: 0 0 10px 0;">📋 Prochaines étapes :</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Nous analysons votre demande sous 24h</li>
            <li>Vous recevrez un lien de paiement sécurisé</li>
            <li>Votre site sera créé dans les 48h après paiement</li>
          </ul>
        </div>
        
        <p><strong>Prix :</strong> 399€ (paiement unique) + 29€/mois (maintenance)</p>
        
        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        
        <p>Cordialement,<br>L'équipe Website Generator</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          Cet email a été envoyé automatiquement, merci de ne pas y répondre.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: data.clientEmail,
      subject: `✅ Demande reçue - Site web ${data.entreprise}`,
      html,
      text: `Bonjour ${data.clientNom}, nous avons bien reçu votre demande de site web pour ${data.entreprise}. Prix: 399€ + 29€/mois maintenance.`
    });
  }

  /**
   * Email avec lien de paiement
   */
  async sendLienPaiement(data: {
    clientEmail: string;
    clientNom: string;
    entreprise: string;
    montant: number;
    lienPaiement: string;
  }): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">💳 Lien de paiement - ${data.entreprise}</h2>
        
        <p>Bonjour <strong>${data.clientNom}</strong>,</p>
        
        <p>Votre demande a été validée ! Vous pouvez maintenant procéder au paiement pour lancer la création de votre site web.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="color: #059669; margin: 0 0 15px 0;">💰 Montant à payer</h3>
          <p style="font-size: 24px; font-weight: bold; color: #059669; margin: 0 0 20px 0;">
            ${data.montant}€
          </p>
          <a href="${data.lienPaiement}" 
             style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            💳 Payer maintenant
          </a>
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #92400e; margin: 0 0 10px 0;">⚡ Après paiement :</h4>
          <ul style="margin: 0; padding-left: 20px; color: #92400e;">
            <li>Création automatique de votre site web</li>
            <li>Envoi de l'URL dans les 48h</li>
            <li>Maintenance incluse (29€/mois)</li>
          </ul>
        </div>
        
        <p>Le lien est valide pendant 7 jours.</p>
        
        <p>Cordialement,<br>L'équipe Website Generator</p>
      </div>
    `;

    return this.sendEmail({
      to: data.clientEmail,
      subject: `💳 Paiement - Site web ${data.entreprise} (${data.montant}€)`,
      html,
      text: `Lien de paiement pour ${data.entreprise}: ${data.lienPaiement} - Montant: ${data.montant}€`
    });
  }

  /**
   * Email de livraison du site
   */
  async sendSiteLivre(data: {
    clientEmail: string;
    clientNom: string;
    entreprise: string;
    urlSite: string;
  }): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">🎉 Votre site web est prêt !</h2>
        
        <p>Bonjour <strong>${data.clientNom}</strong>,</p>
        
        <p>Excellente nouvelle ! Votre site web pour <strong>${data.entreprise}</strong> est maintenant en ligne et accessible à tous vos clients.</p>
        
        <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
          <h3 style="color: #059669; margin: 0 0 15px 0;">🌐 Votre site web</h3>
          <p style="font-size: 18px; margin: 0 0 20px 0; word-break: break-all;">
            <a href="${data.urlSite}" style="color: #059669; font-weight: bold;">${data.urlSite}</a>
          </p>
          <a href="${data.urlSite}" 
             style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            🌐 Voir mon site
          </a>
        </div>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1d4ed8; margin: 0 0 10px 0;">✅ Ce qui est inclus :</h4>
          <ul style="margin: 0; padding-left: 20px; color: #1d4ed8;">
            <li>Design professionnel adapté à votre secteur</li>
            <li>Site responsive (mobile, tablette, desktop)</li>
            <li>Formulaire de contact fonctionnel</li>
            <li>Optimisation SEO de base</li>
            <li>Hébergement sécurisé</li>
          </ul>
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #92400e; margin: 0 0 10px 0;">🔧 Maintenance (29€/mois) :</h4>
          <ul style="margin: 0; padding-left: 20px; color: #92400e;">
            <li>Mises à jour de sécurité</li>
            <li>Sauvegarde automatique</li>
            <li>Support technique</li>
            <li>Modifications mineures</li>
          </ul>
        </div>
        
        <p>Votre site est maintenant visible par tous vos clients. Partagez votre URL !</p>
        
        <p>Cordialement,<br>L'équipe Website Generator</p>
      </div>
    `;

    return this.sendEmail({
      to: data.clientEmail,
      subject: `🎉 Votre site ${data.entreprise} est en ligne !`,
      html,
      text: `Votre site web ${data.entreprise} est prêt ! URL: ${data.urlSite}`
    });
  }
}

export const emailClient = new EmailClient();