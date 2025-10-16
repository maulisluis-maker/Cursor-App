import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../prisma';

export const memberRouter = Router();

// Get member's wallet card
memberRouter.get('/wallet-card', requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'MEMBER') {
      return res.status(403).json({ error: 'Member access required' });
    }

    const member = await prisma.member.findUnique({
      where: { userId: req.user.id },
      include: {
        user: true
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const walletCard = await prisma.walletCard.findFirst({
      where: {
        memberId: member.id,
        isActive: true
      },
      include: {
        cardDesign: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!walletCard) {
      return res.status(404).json({ 
        error: 'No wallet card found',
        member: {
          id: member.id,
          membershipId: member.membershipId,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          points: member.points,
          status: member.status
        }
      });
    }

    res.json({
      success: true,
      walletCard,
      member: {
        id: member.id,
        membershipId: member.membershipId,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        points: member.points,
        status: member.status
      }
    });
  } catch (error) {
    console.error('Error fetching member wallet card:', error);
    res.status(500).json({ error: 'Failed to fetch wallet card' });
  }
});

// Request wallet card creation
memberRouter.post('/request-wallet-card', requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'MEMBER') {
      return res.status(403).json({ error: 'Member access required' });
    }

    const member = await prisma.member.findUnique({
      where: { userId: req.user.id },
      include: {
        user: true
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (member.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Member account must be active to request wallet card' });
    }

    // Check if member already has an active wallet card
    const existingCard = await prisma.walletCard.findFirst({
      where: {
        memberId: member.id,
        isActive: true
      }
    });

    if (existingCard) {
      return res.status(400).json({ error: 'Member already has an active wallet card' });
    }

    // Check if user wants Google Wallet
    if (!member.user.wantsGoogleWallet) {
      return res.status(400).json({ error: 'Google Wallet not requested during registration' });
    }

    // Get active card design
    const activeDesign = await prisma.cardDesign.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!activeDesign) {
      return res.status(400).json({ error: 'No active card design available' });
    }

    // Generate wallet card
    const { WalletService } = require('../services/wallet/walletService');
    const walletService = new WalletService();
    
    const payload = {
      memberId: member.id,
      membershipId: member.membershipId,
      fullName: `${member.firstName} ${member.lastName}`,
      points: member.points,
      qrData: member.membershipId
    };

    const designData = JSON.parse(activeDesign.designData);
    const walletResult = await walletService.generateWalletPass(payload, designData, 'google');

    if (!walletResult.success || !walletResult.passUrl) {
      return res.status(500).json({ error: 'Failed to generate wallet card' });
    }

    // Create wallet card record
    const walletCard = await prisma.walletCard.create({
      data: {
        memberId: member.id,
        cardUrl: walletResult.passUrl,
        points: member.points,
        cardDesignId: activeDesign.id,
        isActive: true
      },
      include: {
        cardDesign: true
      }
    });

    // Send email to member
    try {
      const { EmailService } = require('../services/emailService');
      const emailService = new EmailService();
      
      await emailService.sendGoogleWalletCardEmail(
        member.email,
        `${member.firstName} ${member.lastName}`,
        walletResult.passUrl,
        member.membershipId
      );
    } catch (emailError) {
      console.error('Failed to send wallet email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Wallet card created successfully',
      walletCard
    });
  } catch (error) {
    console.error('Error requesting wallet card:', error);
    res.status(500).json({ error: 'Failed to request wallet card' });
  }
});

// Get member profile
memberRouter.get('/profile', requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'MEMBER') {
      return res.status(403).json({ error: 'Member access required' });
    }

    const member = await prisma.member.findUnique({
      where: { userId: req.user.id }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({
      success: true,
      member: {
        id: member.id,
        membershipId: member.membershipId,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        points: member.points,
        status: member.status,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching member profile:', error);
    res.status(500).json({ error: 'Failed to fetch member profile' });
  }
});

// Update wallet card access time
memberRouter.post('/wallet-card/:cardId/access', requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'MEMBER') {
      return res.status(403).json({ error: 'Member access required' });
    }

    const { cardId } = req.params;

    const member = await prisma.member.findUnique({
      where: { userId: req.user.id }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const walletCard = await prisma.walletCard.findFirst({
      where: {
        id: cardId,
        memberId: member.id
      }
    });

    if (!walletCard) {
      return res.status(404).json({ error: 'Wallet card not found' });
    }

    await prisma.walletCard.update({
      where: { id: cardId },
      data: { lastAccessedAt: new Date() }
    });

    res.json({
      success: true,
      message: 'Access time updated'
    });
  } catch (error) {
    console.error('Error updating wallet card access:', error);
    res.status(500).json({ error: 'Failed to update access time' });
  }
});
