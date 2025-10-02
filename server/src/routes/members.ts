import { Router } from 'express';
import { MemberStatus } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { prisma } from '../prisma';

export const membersRouter = Router();

membersRouter.get('/me', requireAuth, async (req, res) => {
  try {
    const auth = (req as any).auth as { sub: string };
    
    if (!auth || !auth.sub) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }
    
    const user = await prisma.user.findUnique({ 
      where: { id: auth.sub }, 
      include: { member: true } 
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        member: user.member 
      } 
    });
  } catch (error) {
    console.error('Error in /me endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID (for member dashboard)
membersRouter.get('/user/:userId', requireAuth, async (req, res) => {
  const { userId } = req.params;
  const auth = (req as any).auth as { sub: string, role: string };
  
  // Users can only access their own data, admins can access any user
  if (auth.role !== 'ADMIN' && auth.sub !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const user = await prisma.user.findUnique({ 
    where: { id: userId }, 
    include: { member: true } 
  });
  
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, role: user.role, member: user.member });
});

// Member detail (admin only)
membersRouter.get('/:memberId', requireAuth, requireAdmin, async (req, res) => {
  const { memberId } = req.params;
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return res.status(404).json({ error: 'Not found' });
  res.json({ member });
});

// Admin list with pagination
membersRouter.get('/', requireAuth, requireAdmin, async (req, res) => {
  const { q, status } = req.query as { q?: string; status?: string };
  const page = Math.max(1, Number((req.query as any).page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number((req.query as any).pageSize) || 10));
  const skip = (page - 1) * pageSize;
  const where: any = {};
  if (q) {
    where.OR = [
      { email: { contains: q, mode: 'insensitive' } },
      { member: { firstName: { contains: q, mode: 'insensitive' } } },
      { member: { lastName: { contains: q, mode: 'insensitive' } } },
      { member: { membershipId: { contains: q, mode: 'insensitive' } } }
    ];
  }
  if (status && ['ACTIVE', 'BLOCKED'].includes(status)) {
    where.member = { ...(where.member || {}), status };
  }
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, include: { member: true }, orderBy: { createdAt: 'desc' }, skip, take: pageSize })
  ]);
  res.json({ users, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

const createMemberSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(8)
});

membersRouter.post('/', requireAuth, requireAdmin, async (req, res) => {
  const parse = createMemberSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { email } = parse.data;
  res.status(501).json({ error: 'Use /api/auth/register for members; admin invite flow TBD' });
});

const updateStatusSchema = z.object({ status: z.enum(['ACTIVE', 'BLOCKED']) });

membersRouter.patch('/:memberId/status', requireAuth, requireAdmin, async (req, res) => {
  const { memberId } = req.params;
  const parse = updateStatusSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const member = await prisma.member.update({ where: { id: memberId }, data: { status: parse.data.status } });
  res.json({ member });
});

const adjustPointsSchema = z.object({ delta: z.number().int(), reason: z.string().optional() });

membersRouter.post('/:memberId/points', requireAuth, requireAdmin, async (req, res) => {
  const { memberId } = req.params;
  const parse = adjustPointsSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { delta, reason } = parse.data;
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.member.update({ where: { id: memberId }, data: { points: { increment: delta } } });
    const txr = await tx.pointsTransaction.create({ data: { memberId, delta, reason } });
    return { updated, txr };
  });
  res.json({ member: result.updated, transaction: result.txr });
});

// Points history
membersRouter.get('/:memberId/transactions', requireAuth, requireAdmin, async (req, res) => {
  const { memberId } = req.params;
  const transactions = await prisma.pointsTransaction.findMany({ 
    where: { memberId }, 
    orderBy: { createdAt: 'desc' } 
  });
  res.json({ transactions });
});
