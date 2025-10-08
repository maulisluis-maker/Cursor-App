import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { EmailService } from '../services/emailService';

const router = Router();
const prisma = new PrismaClient();
const emailService = new EmailService();

// Generate unique ticket number
function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `XKYS-${timestamp}-${random}`;
}

// ==========================================
// MEMBER ROUTES
// ==========================================

// Create new support ticket (Member)
router.post('/tickets', requireAuth, async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;
    const userId = (req as any).user.userId;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // Create ticket with first message
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber: generateTicketNumber(),
        subject,
        status: 'OPEN',
        priority: priority || 'NORMAL',
        category: category || 'GENERAL',
        createdBy: userId,
        messages: {
          create: {
            senderId: userId,
            senderRole: 'MEMBER',
            message,
            isInternal: false
          }
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Get user details for email notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { member: true }
    });

    // Send email notification to admin
    if (user && user.member) {
      try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@xkys.de';
        await emailService.sendSupportTicketNotification(
          adminEmail,
          ticket.ticketNumber,
          ticket.subject,
          `${user.member.firstName} ${user.member.lastName}`,
          user.email,
          message,
          ticket.priority
        );
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
        // Don't fail ticket creation if email fails
      }
    }

    res.json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

// Get user's tickets (Member)
router.get('/tickets/my', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const tickets = await prisma.supportTicket.findMany({
      where: { createdBy: userId },
      include: {
        messages: {
          where: { isInternal: false }, // Don't show internal notes to members
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get single ticket details (Member)
router.get('/tickets/:ticketId', requireAuth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          where: userRole === 'ADMIN' ? {} : { isInternal: false },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user has access to this ticket
    if (userRole !== 'ADMIN' && ticket.createdBy !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Add message to ticket
router.post('/tickets/:ticketId/messages', requireAuth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, isInternal } = req.body;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if ticket exists and user has access
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (userRole !== 'ADMIN' && ticket.createdBy !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only admins can create internal notes
    const canCreateInternal = userRole === 'ADMIN' && isInternal === true;

    const newMessage = await prisma.supportMessage.create({
      data: {
        ticketId,
        senderId: userId,
        senderRole: userRole,
        message,
        isInternal: canCreateInternal
      }
    });

    // Update ticket status if member replies
    if (userRole === 'MEMBER' && ticket.status === 'RESOLVED') {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { 
          status: 'OPEN',
          updatedAt: new Date()
        }
      });
    }

    // Update ticket timestamp
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    });

    // Send email notification
    try {
      if (userRole === 'ADMIN' && !canCreateInternal) {
        // Admin replied to member - notify member
        const user = await prisma.user.findUnique({
          where: { id: ticket.createdBy },
          include: { member: true }
        });

        if (user && user.member) {
          await emailService.sendSupportReplyNotification(
            user.email,
            `${user.member.firstName} ${user.member.lastName}`,
            ticket.ticketNumber,
            ticket.subject,
            message
          );
        }
      } else if (userRole === 'MEMBER') {
        // Member replied - notify admin
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { member: true }
        });

        if (user && user.member) {
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@xkys.de';
          await emailService.sendSupportTicketNotification(
            adminEmail,
            ticket.ticketNumber,
            `RE: ${ticket.subject}`,
            `${user.member.firstName} ${user.member.lastName}`,
            user.email,
            message,
            ticket.priority
          );
        }
      }
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail message creation if email fails
    }

    res.json(newMessage);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get all tickets (Admin)
router.get('/admin/tickets', requireAuth, async (req, res) => {
  try {
    const userRole = (req as any).user.role;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, priority, assignedTo } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(tickets);
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Update ticket status (Admin)
router.patch('/admin/tickets/:ticketId', requireAuth, async (req, res) => {
  try {
    const userRole = (req as any).user.role;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { ticketId } = req.params;
    const { status, priority, assignedTo, category } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (category) updateData.category = category;

    // Set resolvedAt when status changes to RESOLVED or CLOSED
    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    res.json(ticket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Get ticket statistics (Admin)
router.get('/admin/stats', requireAuth, async (req, res) => {
  try {
    const userRole = (req as any).user.role;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const [total, open, inProgress, resolved, closed] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
      prisma.supportTicket.count({ where: { status: 'CLOSED' } })
    ]);

    const stats = {
      total,
      open,
      inProgress,
      resolved,
      closed,
      active: open + inProgress
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Mark messages as read
router.post('/tickets/:ticketId/messages/mark-read', requireAuth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = (req as any).user.userId;

    await prisma.supportMessage.updateMany({
      where: {
        ticketId,
        senderId: { not: userId },
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get unread message count
router.get('/tickets/unread-count', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    let unreadCount = 0;

    if (userRole === 'ADMIN') {
      // Count unread messages in all tickets for admin
      unreadCount = await prisma.supportMessage.count({
        where: {
          senderRole: 'MEMBER',
          readAt: null
        }
      });
    } else {
      // Count unread messages in user's tickets
      const userTickets = await prisma.supportTicket.findMany({
        where: { createdBy: userId },
        select: { id: true }
      });

      const ticketIds = userTickets.map(t => t.id);

      unreadCount = await prisma.supportMessage.count({
        where: {
          ticketId: { in: ticketIds },
          senderId: { not: userId },
          readAt: null
        }
      });
    }

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

export default router;
