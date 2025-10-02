import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { prisma } from '../prisma';

export const statsRouter = Router();

// Get basic statistics
statsRouter.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const totalMembers = await prisma.member.count();
    const activeMembers = await prisma.member.count({
      where: { status: 'ACTIVE' }
    });
    
    // Calculate total points
    const members = await prisma.member.findMany({
      select: { points: true }
    });
    const totalPoints = members.reduce((sum, member) => sum + member.points, 0);
    const averagePoints = totalMembers > 0 ? totalPoints / totalMembers : 0;
    
    // Count recent check-ins (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const recentCheckins = await prisma.checkinSession.count({
      where: {
        checkinAt: { gte: yesterday }
      }
    });

    res.json({
      totalMembers,
      activeMembers,
      totalPoints,
      averagePoints,
      recentCheckins
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get live studio statistics
statsRouter.get('/live', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Get all members with their latest check-in session
    const members = await prisma.member.findMany({
      include: {
        checkinSessions: {
          orderBy: { checkinAt: 'desc' },
          take: 1
        }
      }
    });

    // Calculate statistics
    const totalMembers = members.length; // Gesamt Mitglieder (alle mit digitaler Karte)
    const activeMembers = members.filter(m => m.status === 'ACTIVE').length; // Aktive Mitglieder
    
    // Count currently active sessions (checked in but not checked out)
    const currentlyInStudio = members.filter(member => {
      const latestSession = member.checkinSessions[0];
      return latestSession && latestSession.isActive && !latestSession.checkoutAt;
    }).length;

    // Calculate utilization percentage based on active members
    const utilizationPercentage = activeMembers > 0 ? Math.round((currentlyInStudio / activeMembers) * 100) : 0;

    // Count check-ins today (0:00 to 23:59)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkinsToday = await prisma.checkinSession.count({
      where: {
        checkinAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Calculate average session time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSessions = await prisma.checkinSession.findMany({
      where: {
        checkinAt: { gte: thirtyDaysAgo },
        checkoutAt: { not: null }
      },
      select: {
        checkinAt: true,
        checkoutAt: true
      }
    });

    let totalSessionTime = 0;
    let sessionCount = 0;

    recentSessions.forEach(session => {
      if (session.checkoutAt) {
        const duration = session.checkoutAt.getTime() - session.checkinAt.getTime();
        totalSessionTime += duration;
        sessionCount++;
      }
    });

    const averageSessionTime = sessionCount > 0 ? Math.round(totalSessionTime / sessionCount / (1000 * 60)) : 45; // in minutes

    // Get currently in studio members with details
    const currentlyInStudioMembers = members
      .filter(member => {
        const latestSession = member.checkinSessions[0];
        return latestSession && latestSession.isActive && !latestSession.checkoutAt;
      })
      .map(member => ({
        id: member.id,
        membershipId: member.membershipId,
        firstName: member.firstName,
        lastName: member.lastName,
        points: member.points,
        status: member.status,
        lastCheckin: member.checkinSessions[0]?.checkinAt.toISOString(),
        isCurrentlyInStudio: true
      }));

    // Get recent check-ins (last 10)
    const recentCheckins = await prisma.checkinSession.findMany({
      include: {
        member: {
          select: {
            id: true,
            membershipId: true,
            firstName: true,
            lastName: true,
            status: true
          }
        }
      },
      orderBy: { checkinAt: 'desc' },
      take: 10
    });

    const recentCheckinsFormatted = recentCheckins.map(session => ({
      id: session.member.id,
      membershipId: session.member.membershipId,
      firstName: session.member.firstName,
      lastName: session.member.lastName,
      status: session.member.status,
      lastCheckin: session.checkinAt.toISOString(),
      isCurrentlyInStudio: session.isActive && !session.checkoutAt
    }));

    res.json({
      stats: {
        totalMembers,           // Gesamt Mitglieder (alle mit digitaler Karte)
        activeMembers,          // Aktive Mitglieder (Status = ACTIVE)
        currentlyInStudio,      // Aktuell im Studio (eingecheckt, nicht ausgecheckt)
        utilizationPercentage,  // Auslastung % (currentlyInStudio / activeMembers * 100)
        checkinsToday,          // Check-ins heute (0:00 bis 23:59)
        averageSessionTime      // Durchschnittliche Session-Zeit
      },
      currentlyInStudioMembers,
      recentCheckins: recentCheckinsFormatted
    });

  } catch (error) {
    console.error('Error fetching live stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get hourly utilization data for today
statsRouter.get('/hourly', requireAuth, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get total active members (same as in /live endpoint)
    const activeMembers = await prisma.member.count({
      where: { status: 'ACTIVE' }
    });

    // Get hourly check-in data for today
    const hourlyData = [];
    const currentHour = new Date().getHours();

    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(today);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hour + 1, 0, 0, 0);

      // Count active sessions during this hour (same logic as /live endpoint)
      const activeSessionsInHour = await prisma.checkinSession.count({
        where: {
          checkinAt: { lt: hourEnd },
          OR: [
            { checkoutAt: { gte: hourStart } },
            { checkoutAt: null, isActive: true }
          ]
        }
      });

      // Calculate utilization percentage (same formula as /live endpoint)
      const utilization = activeMembers > 0 ? Math.round((activeSessionsInHour / activeMembers) * 100) : 0;

      hourlyData.push({
        hour,
        utilization,
        activeSessions: activeSessionsInHour,
        totalActiveMembers: activeMembers,
        isCurrentHour: hour === currentHour,
        isPast: hour < currentHour
      });
    }

    res.json({ hourlyData });

  } catch (error) {
    console.error('Error fetching hourly stats:', error);
    res.status(500).json({ error: 'Failed to fetch hourly statistics' });
  }
});

// Get historical statistics
statsRouter.get('/historical', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysCount = Math.min(parseInt(days as string) || 7, 30); // Max 30 days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    // Get daily check-in counts
    const dailyStats = await prisma.checkinSession.groupBy({
      by: ['checkinAt'],
      where: {
        checkinAt: { gte: startDate }
      },
      _count: {
        id: true
      }
    });

    // Get peak hours data
    const hourlyStats = await prisma.checkinSession.groupBy({
      by: ['checkinAt'],
      where: {
        checkinAt: { gte: startDate }
      },
      _count: {
        id: true
      }
    });

    res.json({
      dailyStats,
      hourlyStats
    });

  } catch (error) {
    console.error('Error fetching historical stats:', error);
    res.status(500).json({ error: 'Failed to fetch historical statistics' });
  }
});
