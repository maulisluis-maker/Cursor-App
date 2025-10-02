import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../prisma';

export const privacyRouter = Router();

privacyRouter.get('/export', requireAuth, async (req, res) => {
  const auth = (req as any).auth as { sub: string };
  const user = await prisma.user.findUnique({ where: { id: auth.sub }, include: { member: { include: { transactions: true } } } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  const exportData = {
    user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
    member: user.member ? {
      id: user.member.id,
      membershipId: user.member.membershipId,
      firstName: user.member.firstName,
      lastName: user.member.lastName,
      points: user.member.points,
      status: user.member.status,
      createdAt: user.member.createdAt,
      transactions: user.member.transactions
    } : null
  };
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="data-export.json"');
  res.send(JSON.stringify(exportData, null, 2));
});

privacyRouter.delete('/delete', requireAuth, async (req, res) => {
  const auth = (req as any).auth as { sub: string };
  const user = await prisma.user.findUnique({ where: { id: auth.sub }, include: { member: true } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  await prisma.$transaction(async (tx) => {
    if (user.member) {
      await tx.pointsTransaction.deleteMany({ where: { memberId: user.member.id } });
      await tx.member.delete({ where: { id: user.member.id } });
    }
    await tx.user.delete({ where: { id: user.id } });
  });
  res.json({ ok: true });
});
