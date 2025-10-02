import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { EmailService } from '../services/emailService.js';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();
const emailService = new EmailService();
export const emailRouter = Router();

const sendQRCodeSchema = z.object({
  memberId: z.string(),
  email: z.string().email()
});

// Test SMTP connection
emailRouter.post('/test-smtp', requireAuth, async (req, res) => {
  try {
    const { smtpConfig, testEmail } = req.body;
    
    if (!smtpConfig || !testEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'SMTP-Konfiguration und Test-E-Mail erforderlich' 
      });
    }

    // Create test transporter
    const testTransporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: parseInt(smtpConfig.port),
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass
      }
    });

    // Test connection
    try {
      await testTransporter.verify();
    } catch (verifyError) {
      return res.json({
        success: false,
        error: 'SMTP-Verbindung fehlgeschlagen',
        details: verifyError instanceof Error ? verifyError.message : 'Unbekannter Fehler'
      });
    }

    // Send test email
    try {
      const testMailOptions = {
        from: smtpConfig.from || smtpConfig.user,
        to: testEmail,
        subject: '🧪 SMTP-Test - Fitnessstudio',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🏋️ Fitnessstudio SMTP-Test</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Ihre SMTP-Konfiguration funktioniert!</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">✅ SMTP-Verbindung erfolgreich!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Ihre SMTP-Konfiguration ist korrekt eingerichtet. 
                Das Fitnessstudio-System kann jetzt E-Mails an Mitglieder versenden.
              </p>
              
              <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #2c5aa0; margin-top: 0;">📧 SMTP-Details:</h4>
                <ul style="color: #666; line-height: 1.6;">
                  <li><strong>Host:</strong> ${smtpConfig.host}</li>
                  <li><strong>Port:</strong> ${smtpConfig.port}</li>
                  <li><strong>SSL/TLS:</strong> ${smtpConfig.secure ? 'Ja' : 'Nein'}</li>
                  <li><strong>Benutzer:</strong> ${smtpConfig.user}</li>
                  <li><strong>Absender:</strong> ${smtpConfig.from || smtpConfig.user}</li>
                </ul>
              </div>
              
              <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #155724; margin-top: 0;">🎉 Bereit für Produktion!</h4>
                <p style="color: #155724; margin: 0;">
                  Ihre E-Mail-Konfiguration ist vollständig funktionsfähig. 
                  Mitglieder können jetzt QR-Codes und digitale Wallet-Karten erhalten.
                </p>
              </div>
              
              <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
                  Gesendet am ${new Date().toLocaleString('de-DE')}
                </p>
                <p style="color: #999; font-size: 12px; text-align: center; margin: 10px 0 0 0;">
                  Powered by XKY Technologies
                </p>
              </div>
            </div>
          </div>
        `
      };

      const info = await testTransporter.sendMail(testMailOptions);
      
      res.json({
        success: true,
        message: 'SMTP-Test erfolgreich! Test-E-Mail wurde versendet.',
        data: {
          messageId: info.messageId,
          smtpConfig: {
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure,
            user: smtpConfig.user,
            from: smtpConfig.from || smtpConfig.user
          },
          testEmail: testEmail,
          sentAt: new Date().toISOString()
        }
      });

    } catch (sendError) {
      res.json({
        success: false,
        error: 'E-Mail-Versand fehlgeschlagen',
        details: sendError instanceof Error ? sendError.message : 'Unbekannter Fehler'
      });
    }

  } catch (error) {
    console.error('SMTP test error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
});

// Test email route for frontend testing
emailRouter.post('/test-send-email', requireAuth, async (req, res) => {
  try {
    const { memberId, email, walletType } = req.body;
    
    // Mock response for testing
    res.json({
      success: true,
      message: `✅ Test-E-Mail erfolgreich versendet an ${email}`,
      data: {
        memberId: memberId,
        email: email,
        walletType: walletType || 'google',
        qrCodeUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        saveUrl: 'https://pay.google.com/gp/v/save/example',
        sentAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test bulk email route for frontend testing
emailRouter.post('/test-send-bulk-email', requireAuth, async (req, res) => {
  try {
    const { email, walletType } = req.body;
    
    // Get all active members
    const members = await prisma.member.findMany({
      where: { status: 'ACTIVE' },
      include: { user: true }
    });
    
    // Mock response for testing
    res.json({
      success: true,
      message: `✅ Test-Massen-E-Mails erfolgreich versendet an ${members.length} Mitglieder`,
      data: {
        totalMembers: members.length,
        emailsSent: members.length,
        emailsFailed: 0,
        walletType: walletType || 'google',
        sentAt: new Date().toISOString(),
        members: members.map(member => ({
          memberId: member.membershipId,
          name: `${member.firstName} ${member.lastName}`,
          email: member.user?.email || email,
          success: true
        }))
      }
    });
  } catch (error) {
    console.error('Test bulk email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send QR code to member via email
emailRouter.post('/send-qr-code', requireAuth, async (req, res) => {
  try {
    const parse = sendQRCodeSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    
    const { memberId, email } = parse.data;
    
    // Find member
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true }
    });
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    // Generate QR code
    const qrCodeDataUrl = await emailService.generateQRCodeDataUrl(member.membershipId);
    
    // Send email
    const result = await emailService.sendQRCodeEmail(
      email,
      `${member.firstName} ${member.lastName}`,
      member.membershipId,
      qrCodeDataUrl
    );
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'QR-Code E-Mail erfolgreich versendet',
        memberId: member.membershipId,
        email: email
      });
    } else {
      res.status(500).json({ 
        error: 'E-Mail konnte nicht versendet werden',
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Send QR code email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send QR code to all members (admin function)
emailRouter.post('/send-qr-codes-to-all', requireAuth, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    
    // Get all active members
    const members = await prisma.member.findMany({
      where: { status: 'ACTIVE' },
      include: { user: true }
    });
    
    const results = [];
    
    for (const member of members) {
      try {
        const qrCodeDataUrl = await emailService.generateQRCodeDataUrl(member.membershipId);
        
        const result = await emailService.sendQRCodeEmail(
          email, // Use same email for all (for testing)
          `${member.firstName} ${member.lastName}`,
          member.membershipId,
          qrCodeDataUrl
        );
        
        results.push({
          memberId: member.membershipId,
          name: `${member.firstName} ${member.lastName}`,
          success: result.success,
          error: result.error
        });
              } catch (error) {
          results.push({
            memberId: member.membershipId,
            name: `${member.firstName} ${member.lastName}`,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    
    res.json({
      success: true,
      message: `QR-Codes versendet: ${successCount} erfolgreich, ${errorCount} fehlgeschlagen`,
      results: results
    });
  } catch (error) {
    console.error('Send QR codes to all error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send Google Wallet links to all active members
emailRouter.post('/send-google-wallet-to-all', requireAuth, async (req, res) => {
  try {
    const { designData } = req.body; // Design data from the design center
    
    // First, generate Google Wallet links for all members
    const walletResponse = await fetch('http://localhost:4000/api/passes/google-wallet-links-bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-token'
      },
      body: JSON.stringify({ designData })
    });

    const walletData = await walletResponse.json();
    
    if (!walletData.success) {
      return res.status(500).json({
        error: 'Failed to generate Google Wallet links',
        details: walletData.error
      });
    }

    // Prepare email data
    const emailMembers = walletData.data.successful.map((member: any) => ({
      email: member.memberEmail,
      name: member.memberName,
      saveUrl: member.saveUrl,
      qrCodeUrl: member.qrCode
    }));

    // Send emails
    const emailService = new EmailService();
    const emailResults = await emailService.sendBulkGoogleWalletEmails(emailMembers);

    res.json({
      success: true,
      message: `Google Wallet emails sent successfully`,
      data: {
        walletLinksGenerated: walletData.data.successfulCount,
        walletLinksFailed: walletData.data.failedCount,
        emailsSent: emailResults.successful,
        emailsFailed: emailResults.failed,
        emailErrors: emailResults.errors,
        totalMembers: walletData.data.totalMembers
      }
    });

  } catch (error) {
    console.error('Error sending Google Wallet emails:', error);
    res.status(500).json({
      error: 'Failed to send Google Wallet emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send Google Wallet link to a specific member
emailRouter.post('/send-google-wallet/:memberId', requireAuth, async (req, res) => {
  try {
    const { memberId } = req.params;
    const { designData } = req.body;
    
    // Generate Google Wallet link for specific member
    const walletResponse = await fetch(`http://localhost:4000/api/passes/google-wallet-link/${memberId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-token'
      },
      body: JSON.stringify({ designData })
    });

    const walletData = await walletResponse.json();
    
    if (!walletData.success) {
      return res.status(500).json({
        error: 'Failed to generate Google Wallet link',
        details: walletData.error
      });
    }

    // Send email
    const emailService = new EmailService();
    const emailSuccess = await emailService.sendGoogleWalletEmail(
      walletData.data.memberEmail,
      walletData.data.memberName,
      walletData.data.saveUrl,
      walletData.data.qrCode
    );

    if (emailSuccess) {
      res.json({
        success: true,
        message: 'Google Wallet email sent successfully',
        data: {
          memberId: walletData.data.memberId,
          memberName: walletData.data.memberName,
          memberEmail: walletData.data.memberEmail,
          emailSent: true
        }
      });
    } else {
      res.status(500).json({
        error: 'Failed to send email',
        data: {
          memberId: walletData.data.memberId,
          memberName: walletData.data.memberName,
          memberEmail: walletData.data.memberEmail,
          emailSent: false
        }
      });
    }

  } catch (error) {
    console.error('Error sending Google Wallet email:', error);
    res.status(500).json({
      error: 'Failed to send Google Wallet email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get member info for email form
emailRouter.get('/member/:memberId', requireAuth, async (req, res) => {
  try {
    const { memberId } = req.params;
    
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true }
    });
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json({
      memberId: member.membershipId,
      name: `${member.firstName} ${member.lastName}`,
      email: member.user?.email || '',
      status: member.status
    });
  } catch (error) {
    console.error('Get member info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
