import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';

const prisma = new PrismaClient();
export const checkinRouter = Router();

const checkinSchema = z.object({
  membershipId: z.string().optional(),
  memberId: z.string().optional()
}).refine((d) => !!d.membershipId || !!d.memberId, { message: 'membershipId or memberId required' });

checkinRouter.post('/', requireAuth, async (req, res) => {
  const parse = checkinSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { membershipId, memberId } = parse.data;
  const member = await prisma.member.findFirst({ where: { OR: [{ id: memberId }, { membershipId }] } });
  if (!member) return res.status(404).json({ error: 'Member not found' });

  // 20-minute cooldown since last successful check-in
  const lastCheckin = await prisma.pointsTransaction.findFirst({
    where: { memberId: member.id, reason: 'checkin' },
    orderBy: { createdAt: 'desc' }
  });
  const COOLDOWN_MINUTES = 20;
  if (lastCheckin) {
    const diffMs = Date.now() - new Date(lastCheckin.createdAt).getTime();
    const diffMinutes = diffMs / (1000 * 60);
    if (diffMinutes < COOLDOWN_MINUTES) {
      const remainingMs = COOLDOWN_MINUTES * 60 * 1000 - diffMs;
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
      return res.status(200).json({
        member,
        cooldownActive: true,
        nextEligibleAt: new Date(Date.now() + remainingMs).toISOString(),
        message: `Check-in cool-down aktiv. Bitte warte noch ca. ${remainingMinutes} Minute(n).`
      });
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const m = await tx.member.update({ where: { id: member.id }, data: { points: { increment: 1 } } });
    await tx.pointsTransaction.create({ data: { memberId: member.id, delta: 1, reason: 'checkin' } });
    return m;
  });
  res.json({ member: updated, cooldownActive: false });
});
