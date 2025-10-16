import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../prisma';

export const adminRouter = Router();

// Get all wallet cards for admin management
adminRouter.get('/wallet-cards', requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const walletCards = await prisma.walletCard.findMany({
      include: {
        member: {
          select: {
            id: true,
            membershipId: true,
            firstName: true,
            lastName: true,
            email: true,
            points: true
          }
        },
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

    res.json({
      success: true,
      walletCards
    });
  } catch (error) {
    console.error('Error fetching wallet cards:', error);
    res.status(500).json({ error: 'Failed to fetch wallet cards' });
  }
});

// Update card points
adminRouter.put('/wallet-cards/:cardId/points', requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { cardId } = req.params;
    const { points } = req.body;

    if (!points || points < 0) {
      return res.status(400).json({ error: 'Valid points value required' });
    }

    // Update wallet card points
    const updatedCard = await prisma.walletCard.update({
      where: { id: cardId },
      data: { points: parseInt(points) },
      include: {
        member: true
      }
    });

    // Also update member points
    await prisma.member.update({
      where: { id: updatedCard.memberId },
      data: { points: parseInt(points) }
    });

    res.json({
      success: true,
      message: 'Points updated successfully',
      card: updatedCard
    });
  } catch (error) {
    console.error('Error updating card points:', error);
    res.status(500).json({ error: 'Failed to update card points' });
  }
});

// Toggle card status (active/inactive)
adminRouter.put('/wallet-cards/:cardId/status', requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { cardId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean value' });
    }

    const updatedCard = await prisma.walletCard.update({
      where: { id: cardId },
      data: { isActive },
      include: {
        member: true
      }
    });

    res.json({
      success: true,
      message: `Card ${isActive ? 'activated' : 'deactivated'} successfully`,
      card: updatedCard
    });
  } catch (error) {
    console.error('Error updating card status:', error);
    res.status(500).json({ error: 'Failed to update card status' });
  }
});

// Resend wallet email to member
adminRouter.post('/wallet-cards/:cardId/resend-email', requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { cardId } = req.params;

    const walletCard = await prisma.walletCard.findUnique({
      where: { id: cardId },
      include: {
        member: true
      }
    });

    if (!walletCard) {
      return res.status(404).json({ error: 'Wallet card not found' });
    }

    // Send Google Wallet card email
    const { EmailService } = require('../services/emailService');
    const emailService = new EmailService();
    
    await emailService.sendGoogleWalletCardEmail(
      walletCard.member.email,
      `${walletCard.member.firstName} ${walletCard.member.lastName}`,
      walletCard.cardUrl,
      walletCard.member.membershipId
    );

    // Update last accessed time
    await prisma.walletCard.update({
      where: { id: cardId },
      data: { lastAccessedAt: new Date() }
    });

    res.json({
      success: true,
      message: 'Wallet email resent successfully'
    });
  } catch (error) {
    console.error('Error resending wallet email:', error);
    res.status(500).json({ error: 'Failed to resend wallet email' });
  }
});

// Get wallet card statistics
adminRouter.get('/wallet-cards/stats', requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const totalCards = await prisma.walletCard.count();
    const activeCards = await prisma.walletCard.count({
      where: { isActive: true }
    });
    const inactiveCards = totalCards - activeCards;
    
    const totalPoints = await prisma.walletCard.aggregate({
      _sum: {
        points: true
      }
    });

    const recentCards = await prisma.walletCard.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    res.json({
      success: true,
      stats: {
        totalCards,
        activeCards,
        inactiveCards,
        totalPoints: totalPoints._sum.points || 0,
        recentCards
      }
    });
  } catch (error) {
    console.error('Error fetching wallet card stats:', error);
    res.status(500).json({ error: 'Failed to fetch wallet card statistics' });
  }
});

// Create new wallet card for existing member
adminRouter.post('/wallet-cards/create', requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { memberId, designId } = req.body;

    if (!memberId) {
      return res.status(400).json({ error: 'Member ID is required' });
    }

    // Get member
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
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

    // Get active design or specified design
    const cardDesign = designId ? 
      await prisma.cardDesign.findUnique({ where: { id: designId } }) :
      await prisma.cardDesign.findFirst({ where: { isActive: true } });

    if (!cardDesign) {
      return res.status(400).json({ error: 'No active card design found' });
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

    const designData = JSON.parse(cardDesign.designData);
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
        cardDesignId: cardDesign.id,
        isActive: true
      },
      include: {
        member: true,
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
    console.error('Error creating wallet card:', error);
    res.status(500).json({ error: 'Failed to create wallet card' });
  }
});
