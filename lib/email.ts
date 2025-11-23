// lib/email.ts

import { Resend } from "resend";

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("❌ RESEND_API_KEY manquant");
    return null; // empêcher plantage au build
  }

  return new Resend(apiKey);
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  static async sendEmail(options: EmailOptions) {
    const resend = getResend();

    if (!resend) {
      console.error("❌ Impossible d'envoyer l'email (clé API manquante)");
      return;
    }

    try {
      const { data, error } = await resend.emails.send({
        from: options.from || process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) throw error;

      console.log("✅ Email envoyé :", data?.id);
      return data;
    } catch (error) {
      console.error("❌ Erreur envoi email :", error);
      throw error;
    }
  }


  // Email de bienvenue
  static async sendWelcomeEmail(to: string, name: string | null) {
    const subject = 'Bienvenue sur notre plateforme !';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue !</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${name || 'cher utilisateur'},</h2>
            <p>Nous sommes ravis de vous accueillir sur notre plateforme !</p>
            <p>Votre compte a été créé avec succès et vous pouvez dès maintenant :</p>
            <ul>
              <li>Accéder à toutes les fonctionnalités</li>
              <li>Personnaliser votre profil</li>
              <li>Découvrir notre communauté</li>
            </ul>
            <p style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}" class="button">Commencer à explorer</a>
            </p>
            <p>Si vous avez des questions, n'hésitez pas à répondre à cet email.</p>
            <p>Bien cordialement,<br>L'équipe de la plateforme</p>
          </div>
          <div class="footer">
            <p>© 2024 Plateforme. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  // Email de réinitialisation de mot de passe
  static async sendPasswordResetEmail(to: string, resetToken: string) {
    const subject = 'Réinitialisation de votre mot de passe';
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            </p>
            <div class="warning">
              <p><strong>⚠️ Important :</strong> Ce lien expirera dans 1 heure.</p>
              <p>Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.</p>
            </div>
            <p>Bien cordialement,<br>L'équipe de la plateforme</p>
          </div>
          <div class="footer">
            <p>© 2024 Plateforme. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  // Email de vérification 2FA activée
  static async sendTwoFactorEnabledEmail(to: string, name: string | null) {
    const subject = 'Authentification à deux facteurs activée';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .success { background: #D1FAE5; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 2FA Activée</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${name || 'cher utilisateur'},</h2>
            <div class="success">
              <p><strong>✅ L'authentification à deux facteurs a été activée avec succès sur votre compte.</strong></p>
            </div>
            <p>Votre compte est maintenant sécurisé avec une couche de protection supplémentaire.</p>
            <p><strong>Conseils de sécurité :</strong></p>
            <ul>
              <li>Conservez vos codes de secours en lieu sûr</li>
              <li>Ne partagez jamais vos codes 2FA</li>
              <li>Utilisez une application d'authentification fiable</li>
            </ul>
            <p>Si vous n'avez pas effectué cette action, veuillez nous contacter immédiatement.</p>
            <p>Bien cordialement,<br>L'équipe de la plateforme</p>
          </div>
          <div class="footer">
            <p>© 2024 Plateforme. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  // Email pour les codes de secours 2FA
  static async sendBackupCodesEmail(to: string, name: string | null, backupCodes: string[]) {
    const subject = 'Vos codes de secours 2FA';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .codes { background: #EDE9FE; padding: 20px; border-radius: 5px; margin: 20px 0; font-family: monospace; }
          .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Codes de secours 2FA</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${name || 'cher utilisateur'},</h2>
            <p>Voici vos codes de secours pour l'authentification à deux facteurs :</p>
            <div class="codes">
              ${backupCodes.map(code => `<div><strong>${code}</strong></div>`).join('')}
            </div>
            <div class="warning">
              <p><strong>⚠️ Important :</strong></p>
              <ul>
                <li>Conservez ces codes en lieu sûr</li>
                <li>Chaque code ne peut être utilisé qu'une seule fois</li>
                <li>Ne partagez jamais ces codes avec personne</li>
                <li>Si vous perdez ces codes, vous pouvez en générer de nouveaux</li>
              </ul>
            </div>
            <p>Bien cordialement,<br>L'équipe de la plateforme</p>
          </div>
          <div class="footer">
            <p>© 2024 Plateforme. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  // Dans lib/email.ts - Ajoutez cette méthode à la fin de la classe EmailService

// Email pour l'envoi des codes 2FA
static async send2FACodeEmail(to: string, name: string | null, code: string) {
  const subject = 'Votre code de vérification à deux facteurs';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .code-display { background: #EDE9FE; padding: 25px; text-align: center; font-size: 42px; font-weight: bold; letter-spacing: 12px; margin: 25px 0; border-radius: 8px; font-family: monospace; }
        .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .info-box { background: #DBEAFE; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Vérification de Connexion</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${name || 'cher utilisateur'},</h2>
          <p>Une tentative de connexion a été détectée sur votre compte. Utilisez le code de vérification ci-dessous :</p>
          
          <div class="code-display">
            ${code}
          </div>
          
          <div class="info-box">
            <p><strong>📝 Comment utiliser ce code :</strong></p>
            <p>Copiez ce code de 6 chiffres et collez-le dans le champ de vérification sur notre site.</p>
          </div>
          
          <div class="warning">
            <p><strong>⚠️ Sécurité :</strong></p>
            <ul>
              <li>Ce code expirera dans <strong>10 minutes</strong></li>
              <li>Ne partagez jamais ce code avec personne</li>
              <li>Si vous n'avez pas tenté de vous connecter, veuillez ignorer cet email</li>
            </ul>
          </div>
          
          <p>Bien cordialement,<br>L'équipe de DéveloppementPersonnel</p>
        </div>
        <div class="footer">
          <p>© 2024 Plateforme de Développement Personnel. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return this.sendEmail({ to, subject, html });
}
}