import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';

export const testRouter = Router();

testRouter.post('/create-users', async (req, res) => {
  try {
    // Create admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@fitnessstudio.com' },
      update: {},
      create: {
        email: 'admin@fitnessstudio.com',
        passwordHash: adminPasswordHash,
        role: 'ADMIN' as any
      }
    });

    // Create member user
    const memberPasswordHash = await bcrypt.hash('member123', 12);
    const memberUser = await prisma.user.upsert({
      where: { email: 'member@fitnessstudio.com' },
      update: {},
      create: {
        email: 'member@fitnessstudio.com',
        passwordHash: memberPasswordHash,
        role: 'MEMBER' as any,
        member: {
          create: {
            membershipId: 'MEMBER001',
            firstName: 'Max',
            lastName: 'Mustermann',
            email: 'member@fitnessstudio.com',
            points: 50,
            status: 'ACTIVE'
          }
        }
      },
      include: { member: true }
    });

    res.json({
      success: true,
      message: 'Test users created successfully',
      users: {
        admin: {
          email: adminUser.email,
          role: adminUser.role
        },
        member: {
          email: memberUser.email,
          role: memberUser.role,
          member: memberUser.member
        }
      }
    });
  } catch (error) {
    console.error('Error creating test users:', error);
    res.status(500).json({ error: 'Failed to create test users', details: error });
  }
});
