import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import archiver from 'archiver';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
export const passesRouter = Router();

const passSchema = z.object({
  memberId: z.string(),
  designData: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    textColor: z.string(),
    cardStyle: z.enum(['modern', 'classic', 'minimal', 'sport']),
    usePrimaryColor: z.boolean(),
    useSecondaryColor: z.boolean(),
    elementStyles: z.record(z.object({
      position: z.object({ x: z.number(), y: z.number() }),
      fontSize: z.number(),
      rotation: z.number(),
      fontWeight: z.string(),
      fontFamily: z.string(),
      fontWidth: z.number(),
      shadow: z.object({
        enabled: z.boolean(),
        x: z.number(),
        y: z.number(),
        blur: z.number(),
        color: z.string()
      }),
      glow: z.object({
        enabled: z.boolean(),
        blur: z.number(),
        color: z.string()
      })
    }))
  })
});

passesRouter.post('/apple-wallet', requireAuth, async (req, res) => {
  try {
    const parse = passSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
    const { memberId, designData } = parse.data;
    
    let member = await prisma.member.findUnique({ where: { id: memberId } });
    
    // Create demo member if it doesn't exist
    if (!member && memberId === 'demo-member-id') {
      // First create demo user if it doesn't exist
      let demoUser = await prisma.user.findUnique({ where: { id: 'demo-user' } });
      if (!demoUser) {
        demoUser = await prisma.user.create({
          data: {
            id: 'demo-user',
            email: 'demo@fitnessstudio.com',
            passwordHash: 'demo-password-hash',
            role: 'MEMBER'
          }
        });
      }
      
      member = await prisma.member.create({
        data: {
          id: 'demo-member-id',
          membershipId: 'DEMO001',
          firstName: 'Demo',
          lastName: 'User',
          points: 100,
          status: 'ACTIVE',
          userId: 'demo-user'
        }
      });
    }
    
    if (!member) return res.status(404).json({ error: 'Member not found' });

    // Create pass data structure
    const passData = {
      formatVersion: 1,
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID || 'pass.com.fitnessstudio.membership',
      teamIdentifier: process.env.APPLE_TEAM_ID || 'TEAM123',
      organizationName: 'Fitness Studio',
      description: 'Digital Membership Card',
      serialNumber: member.membershipId,
      generic: {
        primaryFields: [
          {
            key: 'name',
            label: 'NAME',
            value: `${member.firstName} ${member.lastName}`
          }
        ],
        secondaryFields: [
          {
            key: 'membershipId',
            label: 'MEMBERSHIP ID',
            value: member.membershipId
          },
          {
            key: 'points',
            label: 'POINTS',
            value: member.points.toString()
          }
        ]
      },
      barcodes: [
        {
          format: 'PKBarcodeFormatQR',
          message: member.membershipId,
          messageEncoding: 'iso-8859-1'
        }
      ]
    };

    // Create .pkpass file manually
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    
    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => {
      const buffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
      res.setHeader('Content-Disposition', `attachment; filename="membership-${member.membershipId}.pkpass"`);
      res.send(buffer);
    });

    // Add pass.json
    archive.append(JSON.stringify(passData, null, 2), { name: 'pass.json' });
    
    // Add manifest.json (required for .pkpass)
    const manifest = {
      'pass.json': createHash('sha1').update(JSON.stringify(passData, null, 2)).digest('hex')
    };
    archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });
    
    // Add signature (placeholder - would be signed with Apple certificates)
    const signature = 'PLACEHOLDER_SIGNATURE';
    archive.append(signature, { name: 'signature' });
    
    archive.finalize();
    
  } catch (error) {
    console.error('Error generating Apple Wallet pass:', error);
    res.status(500).json({ error: 'Failed to generate pass' });
  }
});

// Google Wallet Integration
passesRouter.post('/google-wallet', requireAuth, async (req, res) => {
  try {
    const { memberId } = req.body;
    
    if (!memberId) {
      return res.status(400).json({ error: 'Member ID is required' });
    }

    // Find or create demo member
    let member = await prisma.member.findUnique({
      where: { membershipId: memberId }
    });

    if (!member) {
      // Create demo user and member if not found
      const demoUser = await prisma.user.upsert({
        where: { email: 'demo@fitnessstudio.com' },
        update: {},
        create: {
          email: 'demo@fitnessstudio.com',
          passwordHash: await bcrypt.hash('demo123', 10),
          role: 'MEMBER'
        }
      });

      member = await prisma.member.create({
        data: {
          membershipId: 'demo-member-id',
          firstName: 'Demo',
          lastName: 'Member',
          email: 'demo@fitnessstudio.com',
          points: 0,
          userId: demoUser.id
        }
      });
    }

    // Google Wallet API Integration
    const { google } = require('googleapis');
    
    // Load service account credentials
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      return res.status(500).json({ 
        error: 'Google Service Account Key not configured',
        instructions: 'Please set GOOGLE_SERVICE_ACCOUNT_KEY environment variable with your service account JSON'
      });
    }

    const credentials = JSON.parse(serviceAccountKey);
    
    // Create JWT client
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/wallet_object.issuer']
    );

    // Create wallet client
    const wallet = google.walletobjects({ version: 'v1', auth });

    // Create Loyalty Object
    const loyaltyObject = {
      id: `${credentials.issuer_id}.${member.membershipId}`,
      issuerId: credentials.issuer_id,
      issuerName: 'Fitnessstudio Portal',
      programName: 'Fitnessstudio Membership',
      programLogo: {
        sourceUri: {
          uri: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=XKY'
        }
      },
      reviewStatus: 'UNDER_REVIEW',
      allowMultipleUsersPerObject: false,
      locations: [
        {
          kind: 'walletobjects#latLongPoint',
          latitude: 52.5200,
          longitude: 13.4050
        }
      ],
      textModulesData: [
        {
          header: 'Mitgliedschaft',
          body: `${member.firstName} ${member.lastName}`
        },
        {
          header: 'Mitglieds-ID',
          body: member.membershipId
        },
        {
          header: 'Punkte',
          body: member.points.toString()
        }
      ],
      linksModuleData: {
        uris: [
          {
            uri: 'https://fitnessstudio-portal.com',
            description: 'Fitnessstudio Portal'
          }
        ]
      },
      imageModulesData: [
        {
          mainImage: {
            sourceUri: {
              uri: 'https://via.placeholder.com/400x200/007AFF/FFFFFF?text=Digital+Membership+Card'
            }
          }
        }
      ],
      state: 'ACTIVE',
      accountId: member.membershipId,
      accountName: `${member.firstName} ${member.lastName}`,
      loyaltyPoints: {
        balance: {
          kind: 'walletobjects#loyaltyPointsBalance',
          stringBalance: `${member.points} Punkte`
        }
      }
    };

    // Create the loyalty object
    const createdObject = await wallet.loyaltyobject.insert({
      resource: loyaltyObject
    });

    // Create JWT for adding to Google Wallet
    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      origins: ['https://fitnessstudio-portal.com'],
      typ: 'savetowallet',
      payload: {
        loyaltyObjects: [
          {
            id: createdObject.data.id
          }
        ]
      }
    };

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' });

    // Create save URL
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

    res.json({
      success: true,
      message: 'Google Wallet Loyalty Card created successfully',
      data: {
        loyaltyObject: createdObject.data,
        saveUrl: saveUrl,
        jwt: token
      },
      instructions: {
        step1: 'Copy the saveUrl and open it in a browser',
        step2: 'Or use the JWT token with Google Wallet API',
        step3: 'The loyalty card will be added to the user\'s Google Wallet'
      }
    });

  } catch (error) {
    console.error('Google Wallet Error:', error);
    
    if (error.code === 'ENOENT' || error.message.includes('credentials')) {
      return res.status(500).json({
        error: 'Google Wallet credentials not configured',
        instructions: [
          '1. Download your service account JSON key from Google Cloud Console',
          '2. Set the GOOGLE_SERVICE_ACCOUNT_KEY environment variable',
          '3. Make sure the service account has Wallet API Admin role'
        ]
      });
    }
    
    res.status(500).json({
      error: 'Failed to create Google Wallet pass',
      details: error.message
    });
  }
});

// Generate individual Google Wallet link for a specific user
passesRouter.post('/google-wallet-link/:memberId', requireAuth, async (req, res) => {
  try {
    const { memberId } = req.params;
    const { designData } = req.body; // Design data from the design center
    
    if (!memberId) {
      return res.status(400).json({ error: 'Member ID is required' });
    }

    // Find the member
    const member = await prisma.member.findUnique({
      where: { membershipId: memberId },
      include: { user: true }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Google Wallet API Integration
    const { google } = require('googleapis');
    
    // Load service account credentials
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      return res.status(500).json({ 
        error: 'Google Service Account Key not configured',
        instructions: 'Please set GOOGLE_SERVICE_ACCOUNT_KEY environment variable'
      });
    }

    const credentials = JSON.parse(serviceAccountKey);
    
    // Create JWT client
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/wallet_object.issuer']
    );

    // Create wallet client
    const wallet = google.walletobjects({ version: 'v1', auth });

    // Create custom design based on design center data
    const customDesign = designData || {
      primaryColor: '#007AFF',
      secondaryColor: '#5856D6',
      textColor: '#000000',
      cardStyle: 'modern'
    };

    // Create Loyalty Object with custom design
    const loyaltyObject = {
      id: `${credentials.issuer_id}.${member.membershipId}`,
      issuerId: credentials.issuer_id,
      issuerName: 'Fitnessstudio Portal',
      programName: 'Fitnessstudio Membership',
      programLogo: {
        sourceUri: {
          uri: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=XKY'
        }
      },
      reviewStatus: 'UNDER_REVIEW',
      allowMultipleUsersPerObject: false,
      locations: [
        {
          kind: 'walletobjects#latLongPoint',
          latitude: 52.5200,
          longitude: 13.4050
        }
      ],
      textModulesData: [
        {
          header: 'Mitgliedschaft',
          body: `${member.firstName} ${member.lastName}`
        },
        {
          header: 'Mitglieds-ID',
          body: member.membershipId
        },
        {
          header: 'Punkte',
          body: member.points.toString()
        }
      ],
      linksModuleData: {
        uris: [
          {
            uri: 'https://fitnessstudio-portal.com',
            description: 'Fitnessstudio Portal'
          }
        ]
      },
      imageModulesData: [
        {
          mainImage: {
            sourceUri: {
              uri: `https://via.placeholder.com/400x200/${customDesign.primaryColor.replace('#', '')}/FFFFFF?text=Digital+Membership+Card`
            }
          }
        }
      ],
      state: 'ACTIVE',
      accountId: member.membershipId,
      accountName: `${member.firstName} ${member.lastName}`,
      loyaltyPoints: {
        balance: {
          kind: 'walletobjects#loyaltyPointsBalance',
          stringBalance: `${member.points} Punkte`
        }
      }
    };

    // Create the loyalty object
    const createdObject = await wallet.loyaltyobject.insert({
      resource: loyaltyObject
    });

    // Create JWT for adding to Google Wallet
    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      origins: ['https://fitnessstudio-portal.com'],
      typ: 'savetowallet',
      payload: {
        loyaltyObjects: [
          {
            id: createdObject.data.id
          }
        ]
      }
    };

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' });

    // Create save URL
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

    // Store the link in database for tracking
    await prisma.member.update({
      where: { membershipId: memberId },
      data: {
        googleWalletLink: saveUrl,
        googleWalletCreatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Individual Google Wallet link created successfully',
      data: {
        memberId: member.membershipId,
        memberName: `${member.firstName} ${member.lastName}`,
        memberEmail: member.email,
        saveUrl: saveUrl,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(saveUrl)}`,
        designData: customDesign
      }
    });

  } catch (error) {
    console.error('Google Wallet Link Error:', error);
    res.status(500).json({
      error: 'Failed to create Google Wallet link',
      details: error.message
    });
  }
});

// Generate Google Wallet links for all active members
passesRouter.post('/google-wallet-links-bulk', requireAuth, async (req, res) => {
  try {
    const { designData } = req.body; // Design data from the design center
    
    // Get all active members
    const members = await prisma.member.findMany({
      where: { status: 'ACTIVE' },
      include: { user: true }
    });

    const results = [];
    const errors = [];

    for (const member of members) {
      try {
        // Generate individual link for each member
        const response = await fetch(`http://localhost:4000/api/passes/google-wallet-link/${member.membershipId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo-token'
          },
          body: JSON.stringify({ designData })
        });

        const data = await response.json();
        
        if (data.success) {
          results.push({
            memberId: member.membershipId,
            memberName: `${member.firstName} ${member.lastName}`,
            memberEmail: member.email,
            saveUrl: data.data.saveUrl,
            qrCode: data.data.qrCode
          });
        } else {
          errors.push({
            memberId: member.membershipId,
            memberName: `${member.firstName} ${member.lastName}`,
            error: data.error
          });
        }
      } catch (error) {
        errors.push({
          memberId: member.membershipId,
          memberName: `${member.firstName} ${member.lastName}`,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Generated ${results.length} Google Wallet links`,
      data: {
        successful: results,
        failed: errors,
        totalMembers: members.length,
        successfulCount: results.length,
        failedCount: errors.length
      }
    });

  } catch (error) {
    console.error('Bulk Google Wallet Links Error:', error);
    res.status(500).json({
      error: 'Failed to generate bulk Google Wallet links',
      details: error.message
    });
  }
});

// Demo Google Wallet Integration (for testing without real certificates)
passesRouter.post('/google-wallet-demo/:memberId', requireAuth, async (req, res) => {
  try {
    const { memberId } = req.params;
    const { designData } = req.body;
    
    if (!memberId) {
      return res.status(400).json({ error: 'Member ID is required' });
    }

    // Find or create demo member
    let member = await prisma.member.findUnique({
      where: { membershipId: memberId }
    });

    if (!member) {
      // Create demo user and member if not found
      const demoUser = await prisma.user.upsert({
        where: { email: 'demo@fitnessstudio.com' },
        update: {},
        create: {
          email: 'demo@fitnessstudio.com',
          passwordHash: await bcrypt.hash('demo123', 10),
          role: 'MEMBER'
        }
      });

      member = await prisma.member.create({
        data: {
          membershipId: 'demo-member-id',
          firstName: 'Demo',
          lastName: 'Member',
          email: 'demo@fitnessstudio.com',
          points: 0,
          userId: demoUser.id
        }
      });
    }

    // Create demo Google Wallet data
    const customDesign = designData || {
      primaryColor: '#007AFF',
      secondaryColor: '#5856D6',
      textColor: '#000000',
      cardStyle: 'modern'
    };

    // Generate demo save URL (simulates Google Wallet)
    const demoToken = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const demoSaveUrl = `https://pay.google.com/gp/v/save/${demoToken}`;
    
    // Create demo QR code
    const demoQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(demoSaveUrl)}`;

    // Store demo link in database
    await prisma.member.update({
      where: { membershipId: memberId },
      data: {
        googleWalletLink: demoSaveUrl,
        googleWalletCreatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Demo Google Wallet Loyalty Card created successfully',
      data: {
        memberId: member.membershipId,
        memberName: `${member.firstName} ${member.lastName}`,
        memberEmail: member.email,
        saveUrl: demoSaveUrl,
        qrCode: demoQrCode,
        designData: customDesign,
        demoMode: true
      },
      instructions: {
        step1: 'Dies ist ein Demo-Modus ohne echte Google Zertifikate',
        step2: 'Der Link simuliert die Google Wallet Integration',
        step3: 'Für echte Tests: Google Cloud Setup erforderlich',
        step4: 'QR-Code und E-Mail funktionieren bereits'
      }
    });

  } catch (error) {
    console.error('Demo Google Wallet Error:', error);
    res.status(500).json({
      error: 'Failed to create demo Google Wallet pass',
      details: error.message
    });
  }
});

passesRouter.get('/:memberId/status', requireAuth, async (req, res) => {
  try {
    const { memberId } = req.params;
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) return res.status(404).json({ error: 'Member not found' });

    // Check if passes exist for this member
    // This would typically check against Apple/Google APIs
    res.json({
      memberId,
      appleWalletActive: false, // Would check actual status
      googleWalletActive: false, // Would check actual status
      lastUpdated: member.updatedAt
    });
  } catch (error) {
    console.error('Error checking pass status:', error);
    res.status(500).json({ error: 'Failed to check pass status' });
  }
});

// Test endpoint for Apple Wallet compatibility
passesRouter.get('/test-apple-wallet', async (req, res) => {
  try {
    // Create a more compatible pass structure
    const passData = {
      formatVersion: 1,
      passTypeIdentifier: "pass.com.fitnessstudio.membership",
      teamIdentifier: "TEAM123",
      organizationName: "Fitness Studio",
      description: "Digital Membership Card",
      serialNumber: "DEMO001",
      generic: {
        primaryFields: [
          {
            key: "name",
            label: "NAME",
            value: "Demo User"
          }
        ],
        secondaryFields: [
          {
            key: "membershipId",
            label: "MEMBERSHIP ID",
            value: "DEMO001"
          },
          {
            key: "points",
            label: "POINTS",
            value: "100"
          }
        ]
      },
      barcodes: [
        {
          format: "PKBarcodeFormatQR",
          message: "DEMO001",
          messageEncoding: "iso-8859-1"
        }
      ],
      // Add required fields for better compatibility
      storeCard: {
        primaryFields: [
          {
            key: "balance",
            label: "BALANCE",
            value: "100 points"
          }
        ]
      }
    };

    // Create .pkpass file manually
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    
    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => {
      const buffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
      res.setHeader('Content-Disposition', `attachment; filename="test-membership.pkpass"`);
      res.send(buffer);
    });

    // Add pass.json
    archive.append(JSON.stringify(passData, null, 2), { name: 'pass.json' });
    
    // Add manifest.json (required for .pkpass)
    const manifest = {
      'pass.json': createHash('sha1').update(JSON.stringify(passData, null, 2)).digest('hex')
    };
    archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });
    
    // Add signature (placeholder - would be signed with Apple certificates)
    const signature = 'PLACEHOLDER_SIGNATURE_FOR_TESTING';
    archive.append(signature, { name: 'signature' });
    
    archive.finalize();
    
  } catch (error) {
    console.error('Error generating test Apple Wallet pass:', error);
    res.status(500).json({ error: 'Failed to generate test pass' });
  }
});

