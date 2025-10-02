import { Router } from 'express';
// Role is now a string, not an enum
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1)
});

authRouter.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, walletType } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate membership ID
    const membershipId = `MEM${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create user and member with email verification
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'MEMBER' as any,
        isEmailVerified: false, // Email not verified yet
        member: {
          create: {
            membershipId,
            firstName,
            lastName,
            email,
            points: 0,
            status: 'PENDING' // Status pending until email verified
          }
        }
      },
      include: {
        member: true
      }
    });

    // Generate email verification token
    const verificationToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Send verification email
    try {
      const { EmailService } = require('../services/emailService');
      const emailService = new EmailService();
      
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify?token=${verificationToken}`;
      
      await emailService.sendVerificationEmail(
        user.email,
        `${user.member.firstName} ${user.member.lastName}`,
        verificationUrl
      );
    } catch (emailError) {
      console.error('Verification email failed:', emailError);
      // Don't fail registration if email fails
    }

    // If wallet type is selected, generate demo wallet link
    let walletData = null;
    if (walletType && user.member) {
      try {
        if (walletType === 'google') {
          // Generate demo Google Wallet link
          const demoToken = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const demoSaveUrl = `https://pay.google.com/gp/v/save/${demoToken}`;
          const demoQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(demoSaveUrl)}`;
          
          walletData = {
            type: 'google',
            saveUrl: demoSaveUrl,
            qrCode: demoQrCode,
            memberName: `${user.member.firstName} ${user.member.lastName}`,
            memberId: user.member.membershipId
          };

          // Store demo link in database
          await prisma.member.update({
            where: { membershipId: user.member.membershipId },
            data: {
              googleWalletLink: demoSaveUrl,
              googleWalletCreatedAt: new Date()
            }
          });

        } else if (walletType === 'apple') {
          // Generate demo Apple Wallet link
          const appleWalletUrl = `https://fitnessstudio-portal.com/apple-wallet/${user.member.membershipId}`;
          const appleQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appleWalletUrl)}`;
          
          walletData = {
            type: 'apple',
            saveUrl: appleWalletUrl,
            qrCode: appleQrCode,
            memberName: `${user.member.firstName} ${user.member.lastName}`,
            memberId: user.member.membershipId
          };
        }

        // Try to send email (but don't fail if it doesn't work)
        try {
          const { EmailService } = require('../services/emailService');
          const emailService = new EmailService();
          
          if (walletType === 'google' && walletData) {
            await emailService.sendGoogleWalletEmail(
              user.member.email,
              walletData.memberName,
              walletData.saveUrl,
              walletData.qrCode
            );
          } else if (walletType === 'apple' && walletData) {
            await emailService.sendAppleWalletEmail(
              user.member.email,
              walletData.memberName,
              walletData.saveUrl
            );
          }
        } catch (emailError) {
          console.error('Email sending failed (demo mode):', emailError);
          // Don't fail registration if email fails
        }

      } catch (walletError) {
        console.error('Wallet generation error:', walletError);
        // Don't fail registration if wallet generation fails
      }
    }

    res.json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        member: user.member ? {
          id: user.member.id,
          membershipId: user.member.membershipId,
          firstName: user.member.firstName,
          lastName: user.member.lastName,
          points: user.member.points,
          status: user.member.status
        } : null
      },
      walletData: walletData,
      demoMode: true,
      emailVerificationSent: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { member: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        member: user.member ? {
          id: user.member.id,
          membershipId: user.member.membershipId,
          firstName: user.member.firstName,
          lastName: user.member.lastName,
          points: user.member.points
        } : null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email verification route
authRouter.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (!decoded.userId || !decoded.email) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    // Update user email verification status
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { 
        isEmailVerified: true 
      },
      include: { member: true }
    });

    // Update member status to ACTIVE
    if (user.member) {
      await prisma.member.update({
        where: { id: user.member.id },
        data: { status: 'ACTIVE' }
      });
    }

    // Redirect to verified page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/verified?email=${encodeURIComponent(user.email)}`);

  } catch (error) {
    console.error('Email verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Verification token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid verification token' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

const promoteSchema = z.object({ email: z.string().email(), token: z.string().min(1) });

authRouter.post('/promote', async (req, res) => {
  const parse = promoteSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { email, token } = parse.data;
  if (!process.env.ADMIN_SETUP_TOKEN || token !== process.env.ADMIN_SETUP_TOKEN) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const user = await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
  res.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
});

// Create test users for development
authRouter.post('/create-test-users', async (req, res) => {
  try {
    // Create test member
    const memberPasswordHash = await bcrypt.hash('member123', 12);
    const memberUser = await prisma.user.upsert({
      where: { email: 'member@fitnessstudio.com' },
      update: {},
      create: {
        email: 'member@fitnessstudio.com',
        passwordHash: memberPasswordHash,
        role: 'MEMBER',
        member: {
          create: {
            firstName: 'Max',
            lastName: 'Mustermann',
            membershipId: 'MEMBER001',
            points: 50,
            status: 'ACTIVE'
          }
        }
      },
      include: { member: true }
    });

    // Create test admin
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@fitnessstudio.com' },
      update: {},
      create: {
        email: 'admin@fitnessstudio.com',
        passwordHash: adminPasswordHash,
        role: 'ADMIN'
      }
    });

    res.json({
      success: true,
      message: 'Test users created successfully',
      users: {
        member: {
          email: memberUser.email,
          role: memberUser.role,
          member: memberUser.member
        },
        admin: {
          email: adminUser.email,
          role: adminUser.role
        }
      }
    });
  } catch (error) {
    console.error('Error creating test users:', error);
    res.status(500).json({ error: 'Failed to create test users' });
  }
});
