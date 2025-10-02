import { Router } from 'express';
import { prisma } from '../prisma';
import jwt from 'jsonwebtoken';
import { WalletService } from '../services/wallet/walletService';
import { requireAuth } from '../middleware/auth';

export const walletRouter = Router();
const walletService = new WalletService();

// Generate wallet pass with design integration (Apple Wallet .pkpass or Google Wallet)
walletRouter.post('/generate', requireAuth, async (req, res) => {
  try {
    const { email, walletType, designId } = req.body;

    if (!email || !walletType) {
      return res.status(400).json({ error: 'Email and wallet type are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { member: true }
    });

    if (!user || !user.member) {
      return res.status(404).json({ error: 'User or member not found' });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({ error: 'Email not verified' });
    }

    // Get active design or specified design
    let designData = null;
    if (designId) {
      const design = await prisma.cardDesign.findUnique({
        where: { id: designId }
      });
      if (design) {
        designData = JSON.parse(design.designData);
      }
    } else {
      // Get active design
      const activeDesign = await prisma.cardDesign.findFirst({
        where: { isActive: true }
      });
      if (activeDesign) {
        designData = JSON.parse(activeDesign.designData);
      }
    }

    // Create wallet payload
    const walletPayload = {
      memberId: user.member.id,
      membershipId: user.member.membershipId,
      fullName: `${user.member.firstName} ${user.member.lastName}`,
      email: user.member.email,
      points: user.member.points,
      qrData: user.member.membershipId // Will be enhanced with QR generation
    };

    // Generate wallet pass using the service
    const result = await walletService.generateWalletPass(
      walletPayload,
      designData || getDefaultDesign(),
      walletType
    );

    // Update member with wallet info
    if (walletType === 'apple') {
      await prisma.member.update({
        where: { id: user.member.id },
        data: {
          appleWalletLink: result.passUrl,
          appleWalletCreatedAt: new Date()
        }
      });
    } else if (walletType === 'google') {
      await prisma.member.update({
        where: { id: user.member.id },
        data: {
          googleWalletLink: result.passUrl,
          googleWalletCreatedAt: new Date()
        }
      });
    }

    res.json(result);

  } catch (error) {
    console.error('Wallet generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get default design
function getDefaultDesign() {
  return {
    cardTitle: 'FITNESSSTUDIO',
    cardSubtitle: 'Premium Membership',
    primaryColor: '#1f2937',
    secondaryColor: '#374151',
    primaryColorEnabled: true,
    secondaryColorEnabled: true,
    textColor: '#ffffff',
    textColorEnabled: true,
    textStyle: 'modern',
    textSize: 'medium',
    shadow: true,
    glow: false,
    glowColor: '#ffffff',
    glowIntensity: 10,
    layout: 'standard',
    layers: {
      logo: true,
      title: true,
      subtitle: true
    },
    elements: []
  };
}

// Get Apple Wallet .pkpass file
walletRouter.get('/apple/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await prisma.member.findUnique({
      where: { membershipId: memberId },
      include: { user: true }
    });

    if (!member || !member.user?.isEmailVerified) {
      return res.status(404).json({ error: 'Member not found or email not verified' });
    }

    // Get the actual .pkpass file
    try {
      const passFile = await walletService.getApplePassFile(memberId);
      res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
      res.setHeader('Content-Disposition', `attachment; filename="${memberId}.pkpass"`);
      res.send(passFile);
    } catch (fileError) {
      // Fallback to demo response if file not available
      res.json({
        success: true,
        message: 'Apple Wallet pass would be generated here',
        memberId: member.membershipId,
        memberName: `${member.firstName} ${member.lastName}`,
        note: 'In production, this would return a .pkpass file for Apple Wallet'
      });
    }

  } catch (error) {
    console.error('Apple Wallet generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Google Wallet pass
walletRouter.get('/google/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await prisma.member.findUnique({
      where: { membershipId: memberId },
      include: { user: true }
    });

    if (!member || !member.user?.isEmailVerified) {
      return res.status(404).json({ error: 'Member not found or email not verified' });
    }

    // Get the Google Wallet JWT
    try {
      const jwt = await walletService.getGooglePassJWT(memberId);
      res.json({
        success: true,
        message: 'Google Wallet pass generated successfully',
        jwt,
        passUrl: `https://pay.google.com/gp/v/save/${jwt}`,
        memberId: member.membershipId,
        memberName: `${member.firstName} ${member.lastName}`
      });
    } catch (jwtError) {
      // Fallback to demo response
      res.json({
        success: true,
        message: 'Google Wallet pass would be generated here',
        memberId: member.membershipId,
        memberName: `${member.firstName} ${member.lastName}`,
        note: 'In production, this would return a Google Wallet pass object'
      });
    }

  } catch (error) {
    console.error('Google Wallet generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// New route: Generate wallet pass with design from Design Center
walletRouter.post('/generate-with-design', requireAuth, async (req, res) => {
  try {
    const { memberId, walletType, designId } = req.body;

    if (!memberId || !walletType) {
      return res.status(400).json({ error: 'Member ID and wallet type are required' });
    }

    // Find member
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true }
    });

    if (!member || !member.user) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (!member.user.isEmailVerified) {
      return res.status(400).json({ error: 'Email not verified' });
    }

    // Get design data
    let designData = null;
    if (designId) {
      const design = await prisma.cardDesign.findUnique({
        where: { id: designId }
      });
      if (design) {
        designData = JSON.parse(design.designData);
      }
    } else {
      // Get active design
      const activeDesign = await prisma.cardDesign.findFirst({
        where: { isActive: true }
      });
      if (activeDesign) {
        designData = JSON.parse(activeDesign.designData);
      }
    }

    // Create wallet payload
    const walletPayload = {
      memberId: member.id,
      membershipId: member.membershipId,
      fullName: `${member.firstName} ${member.lastName}`,
      email: member.email,
      points: member.points,
      qrData: member.membershipId
    };

    // Generate wallet pass
    const result = await walletService.generateWalletPass(
      walletPayload,
      designData || getDefaultDesign(),
      walletType
    );

    // Update member with wallet info
    if (walletType === 'apple') {
      await prisma.member.update({
        where: { id: member.id },
        data: {
          appleWalletLink: result.passUrl,
          appleWalletCreatedAt: new Date()
        }
      });
    } else if (walletType === 'google') {
      await prisma.member.update({
        where: { id: member.id },
        data: {
          googleWalletLink: result.passUrl,
          googleWalletCreatedAt: new Date()
        }
      });
    }

    res.json(result);

  } catch (error) {
    console.error('Wallet generation with design error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
