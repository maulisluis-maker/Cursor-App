import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Prefer environment configuration (e.g. Gmail), fallback to Ethereal-style defaults
    const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const secureEnv = process.env.SMTP_SECURE === 'true';
    const secure = secureEnv || port === 465; // Gmail uses 465/secure true
    const user = process.env.SMTP_USER || 'test@example.com';
    const pass = process.env.SMTP_PASS || 'test123';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });
  }

  async sendQRCodeEmail(memberEmail: string, memberName: string, memberId: string, qrCodeDataUrl: string) {
    const mailOptions = {
      from: '"Fitnessstudio" <noreply@fitnessstudio.com>',
      to: memberEmail,
      subject: 'Dein QR-Code für das Fitnessstudio',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Dein QR-Code</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .qr-code { text-align: center; margin: 20px 0; }
            .qr-code img { max-width: 200px; border: 2px solid #ddd; }
            .instructions { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏋️ Fitnessstudio QR-Code</h1>
            </div>
            
            <div class="content">
              <h2>Hallo ${memberName}!</h2>
              
              <p>Hier ist dein persönlicher QR-Code für das Fitnessstudio:</p>
              
              <div class="qr-code">
                <img src="${qrCodeDataUrl}" alt="QR-Code für ${memberId}">
                <p><strong>Member-ID: ${memberId}</strong></p>
              </div>
              
              <div class="instructions">
                <h3>📱 So verwendest du deinen QR-Code:</h3>
                <ol>
                  <li><strong>Speichere den QR-Code</strong> auf deinem Smartphone</li>
                  <li><strong>Zeige ihn beim Eingang</strong> dem Scanner vor</li>
                  <li><strong>Check-in wird automatisch</strong> verarbeitet</li>
                  <li><strong>Du erhältst +1 Punkt</strong> für jeden Besuch</li>
                </ol>
              </div>
              
              <div class="instructions">
                <h3>⚠️ Wichtige Hinweise:</h3>
                <ul>
                  <li>Der QR-Code ist persönlich - teile ihn nicht mit anderen</li>
                  <li>Nach dem Check-in gibt es eine 20-Minuten Wartezeit</li>
                  <li>Bei Problemen wende dich an das Studio-Personal</li>
                </ul>
              </div>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/member" class="button">Zum Member-Portal</a>
              </p>
            </div>
            
            <div class="footer">
              <p>Fitnessstudio - Dein QR-Code für einfache Check-ins</p>
              <p>Diese E-Mail wurde automatisch generiert. Bitte nicht antworten.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async generateQRCodeDataUrl(memberId: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(memberId, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw error instanceof Error ? error : new Error('QR Code generation failed');
    }
  }

  async sendVerificationEmail(memberEmail: string, memberName: string, verificationUrl: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.MAIL_FROM || this.transporter.options.auth?.user,
        to: memberEmail,
        subject: '✅ Bestätige deine E-Mail-Adresse - XKYS Fitnessstudio',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🏋️ XKYS Fitnessstudio</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">E-Mail-Adresse bestätigen</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">Hallo ${memberName}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Vielen Dank für deine Registrierung bei XKYS Fitnessstudio! 
                Um dein Konto zu aktivieren und deine digitale Mitgliedskarte zu erhalten, 
                musst du noch deine E-Mail-Adresse bestätigen.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #333; margin-top: 0;">📧 E-Mail-Adresse bestätigen</h3>
                <p style="color: #666; line-height: 1.6;">
                  Klicke auf den Button unten, um deine E-Mail-Adresse zu bestätigen 
                  und dein Konto zu aktivieren.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  ✅ E-Mail-Adresse bestätigen
                </a>
              </div>
              
              <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #2c5aa0; margin-top: 0;">🎯 Nach der Bestätigung:</h4>
                <ul style="color: #666; line-height: 1.6;">
                  <li>✅ Dein Konto wird aktiviert</li>
                  <li>✅ Du erhältst Zugang zum Member-Portal</li>
                  <li>✅ Deine digitale Mitgliedskarte wird erstellt</li>
                  <li>✅ Du kannst dich im Fitnessstudio einchecken</li>
                </ul>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>⚠️ Wichtig:</strong> Dieser Link ist 24 Stunden gültig. 
                  Falls der Link abgelaufen ist, registriere dich einfach erneut.
                </p>
              </div>
              
              <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
                  Falls du dich nicht registriert hast, kannst du diese E-Mail ignorieren.
                </p>
                <p style="color: #999; font-size: 12px; text-align: center; margin: 10px 0 0 0;">
                  Powered by XKYS Technologies
                </p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  async sendGoogleWalletEmail(memberEmail: string, memberName: string, saveUrl: string, qrCodeUrl: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.MAIL_FROM || this.transporter.options.auth?.user,
        to: memberEmail,
        subject: '🎫 Deine digitale Fitnessstudio-Mitgliedskarte ist bereit!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🏋️ Fitnessstudio Portal</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Deine digitale Mitgliedskarte wartet auf dich!</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">Hallo ${memberName}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Deine persönliche digitale Mitgliedskarte für Google Wallet ist bereit! 
                Mit dieser Karte kannst du dich schnell und einfach im Fitnessstudio einchecken.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h3 style="color: #333; margin-top: 0;">📱 So fügst du deine Karte hinzu:</h3>
                <ol style="color: #666; line-height: 1.8;">
                  <li>Öffne die <strong>Google Wallet App</strong> auf deinem Smartphone</li>
                  <li>Tippe auf das <strong>"+" Symbol</strong></li>
                  <li>Wähle <strong>"Loyalty card"</strong> oder <strong>"Treueprogramm"</strong></li>
                  <li>Scanne den QR-Code unten oder klicke auf den Link</li>
                  <li>Bestätige das Hinzufügen der Karte</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <h3 style="color: #333; margin-bottom: 15px;">QR-Code zum Scannen:</h3>
                <img src="${qrCodeUrl}" alt="Google Wallet QR Code" style="border: 2px solid #ddd; border-radius: 8px; max-width: 200px;">
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <h3 style="color: #333; margin-bottom: 15px;">Oder klicke hier:</h3>
                <a href="${saveUrl}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  🎫 Karte zu Google Wallet hinzufügen
                </a>
              </div>
              
              <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #2c5aa0; margin-top: 0;">💡 Vorteile deiner digitalen Karte:</h4>
                <ul style="color: #666; line-height: 1.6;">
                  <li>✅ Immer dabei - keine vergessenen Karten mehr</li>
                  <li>✅ Schneller Check-in mit QR-Code</li>
                  <li>✅ Automatische Punkte-Updates</li>
                  <li>✅ Umweltfreundlich - keine Plastikkarten</li>
                  <li>✅ Sicher mit biometrischer Authentifizierung</li>
                </ul>
              </div>
              
              <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
                  Falls du Fragen hast, kontaktiere uns gerne unter support@fitnessstudio-portal.com
                </p>
                <p style="color: #999; font-size: 12px; text-align: center; margin: 10px 0 0 0;">
                  Powered by XKY Technologies
                </p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending Google Wallet email:', error);
      return false;
    }
  }

  async sendBulkGoogleWalletEmails(members: Array<{
    email: string;
    name: string;
    saveUrl: string;
    qrCodeUrl: string;
  }>): Promise<{ successful: number; failed: number; errors: Array<{ email: string; error: string }> }> {
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>
    };

    for (const member of members) {
      try {
        const success = await this.sendGoogleWalletEmail(
          member.email,
          member.name,
          member.saveUrl,
          member.qrCodeUrl
        );
        
        if (success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push({ email: member.email, error: 'Email sending failed' });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({ 
          email: member.email, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }

  async sendAppleWalletEmail(memberEmail: string, memberName: string, appleWalletUrl: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.MAIL_FROM || this.transporter.options.auth?.user,
        to: memberEmail,
        subject: '🍎 Deine Apple Wallet Mitgliedskarte ist bereit!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #000000 0%, #333333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🏋️ Fitnessstudio Portal</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Deine Apple Wallet Mitgliedskarte wartet auf dich!</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">Hallo ${memberName}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Deine persönliche digitale Mitgliedskarte für Apple Wallet ist bereit! 
                Mit dieser Karte kannst du dich schnell und einfach im Fitnessstudio einchecken.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #000;">
                <h3 style="color: #333; margin-top: 0;">🍎 So fügst du deine Karte hinzu:</h3>
                <ol style="color: #666; line-height: 1.8;">
                  <li>Öffne die <strong>Apple Wallet App</strong> auf deinem iPhone</li>
                  <li>Tippe auf das <strong>"+" Symbol</strong></li>
                  <li>Wähle <strong>"Apple Wallet"</strong></li>
                  <li>Scanne den QR-Code oder klicke auf den Link</li>
                  <li>Bestätige das Hinzufügen der Karte</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <h3 style="color: #333; margin-bottom: 15px;">Klicke hier um deine Karte hinzuzufügen:</h3>
                <a href="${appleWalletUrl}" style="display: inline-block; background: #000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  🍎 Karte zu Apple Wallet hinzufügen
                </a>
              </div>
              
              <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #333; margin-top: 0;">💡 Vorteile deiner digitalen Karte:</h4>
                <ul style="color: #666; line-height: 1.6;">
                  <li>✅ Immer dabei - keine vergessenen Karten mehr</li>
                  <li>✅ Schneller Check-in mit QR-Code</li>
                  <li>✅ Automatische Punkte-Updates</li>
                  <li>✅ Umweltfreundlich - keine Plastikkarten</li>
                  <li>✅ Sicher mit Face ID oder Touch ID</li>
                </ul>
              </div>
              
              <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
                  Falls du Fragen hast, kontaktiere uns gerne unter support@fitnessstudio-portal.com
                </p>
                <p style="color: #999; font-size: 12px; text-align: center; margin: 10px 0 0 0;">
                  Powered by XKY Technologies
                </p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending Apple Wallet email:', error);
      return false;
    }
  }

  async sendSupportTicketNotification(
    adminEmail: string,
    ticketNumber: string,
    subject: string,
    memberName: string,
    memberEmail: string,
    message: string,
    priority: string
  ): Promise<boolean> {
    try {
      const priorityEmoji = priority === 'URGENT' ? '🚨' : priority === 'HIGH' ? '⚠️' : priority === 'NORMAL' ? '📋' : '📝';
      const priorityColor = priority === 'URGENT' ? '#dc2626' : priority === 'HIGH' ? '#f59e0b' : priority === 'NORMAL' ? '#3b82f6' : '#6b7280';

      const mailOptions = {
        from: process.env.MAIL_FROM || this.transporter.options.auth?.user,
        to: adminEmail,
        subject: `${priorityEmoji} Neues Support-Ticket: ${ticketNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">💬 XKYS Support Center</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Neues Support-Ticket</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <div style="background: ${priorityColor}; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <h2 style="margin: 0; font-size: 20px;">${priorityEmoji} Priorität: ${priority}</h2>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #333; margin-top: 0;">📋 Ticket Details</h3>
                <table style="width: 100%; color: #666;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Ticket-Nr:</td>
                    <td style="padding: 8px 0;">${ticketNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Betreff:</td>
                    <td style="padding: 8px 0;">${subject}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Von:</td>
                    <td style="padding: 8px 0;">${memberName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">E-Mail:</td>
                    <td style="padding: 8px 0;">${memberEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Priorität:</td>
                    <td style="padding: 8px 0; color: ${priorityColor}; font-weight: bold;">${priority}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #333; margin-top: 0;">💬 Nachricht</h3>
                <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/admin-dashboard/support" style="display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  📋 Ticket im Admin-Panel öffnen
                </a>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>⏰ Schnelle Reaktion erwünscht:</strong> Bitte beantworte dieses Ticket so schnell wie möglich, um eine hohe Kundenzufriedenheit zu gewährleisten.
                </p>
              </div>
              
              <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
                  Diese E-Mail wurde automatisch generiert.
                </p>
                <p style="color: #999; font-size: 12px; text-align: center; margin: 10px 0 0 0;">
                  Powered by XKYS Technologies
                </p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending support ticket notification:', error);
      return false;
    }
  }

  async sendSupportReplyNotification(
    memberEmail: string,
    memberName: string,
    ticketNumber: string,
    subject: string,
    replyMessage: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.MAIL_FROM || this.transporter.options.auth?.user,
        to: memberEmail,
        subject: `💬 Neue Antwort auf dein Support-Ticket ${ticketNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">💬 XKYS Support Center</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Neue Antwort vom Support-Team</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">Hallo ${memberName}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Das Support-Team hat auf dein Ticket geantwortet!
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #333; margin-top: 0;">📋 Ticket Details</h3>
                <table style="width: 100%; color: #666;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Ticket-Nr:</td>
                    <td style="padding: 8px 0;">${ticketNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Betreff:</td>
                    <td style="padding: 8px 0;">${subject}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #333; margin-top: 0;">💬 Antwort vom Support-Team</h3>
                <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${replyMessage}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/member-dashboard/support" style="display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  📋 Ticket anzeigen & antworten
                </a>
              </div>
              
              <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #2c5aa0; margin-top: 0;">💡 Tipp:</h4>
                <p style="color: #666; margin: 0;">
                  Du kannst direkt auf diese Nachricht antworten, indem du das Ticket im Member-Portal öffnest.
                </p>
              </div>
              
              <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
                  Diese E-Mail wurde automatisch generiert.
                </p>
                <p style="color: #999; font-size: 12px; text-align: center; margin: 10px 0 0 0;">
                  Powered by XKYS Technologies
                </p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending support reply notification:', error);
      return false;
    }
  }
}
