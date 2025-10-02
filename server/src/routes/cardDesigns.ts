import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/auth';

export const cardDesignsRouter = Router();

// Get all card designs
cardDesignsRouter.get('/', requireAuth, async (req, res) => {
  try {
    const designs = await prisma.cardDesign.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(designs);
  } catch (error) {
    console.error('Error fetching card designs:', error);
    res.status(500).json({ error: 'Failed to fetch card designs' });
  }
});

// Create a new card design
cardDesignsRouter.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, designData } = req.body;
    const userId = (req as any).user.id;

    const design = await prisma.cardDesign.create({
      data: {
        name,
        description,
        designData: JSON.stringify(designData),
        createdBy: userId
      }
    });

    res.json(design);
  } catch (error) {
    console.error('Error creating card design:', error);
    res.status(500).json({ error: 'Failed to create card design' });
  }
});

// Update a card design
cardDesignsRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, designData, isActive } = req.body;

    const design = await prisma.cardDesign.update({
      where: { id },
      data: {
        name,
        description,
        designData: designData ? JSON.stringify(designData) : undefined,
        isActive
      }
    });

    res.json(design);
  } catch (error) {
    console.error('Error updating card design:', error);
    res.status(500).json({ error: 'Failed to update card design' });
  }
});

// Activate a card design (deactivates all others)
cardDesignsRouter.post('/:id/activate', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Deactivate all designs
    await prisma.cardDesign.updateMany({
      data: { isActive: false }
    });

    // Activate the selected design
    const design = await prisma.cardDesign.update({
      where: { id },
      data: { isActive: true }
    });

    res.json(design);
  } catch (error) {
    console.error('Error activating card design:', error);
    res.status(500).json({ error: 'Failed to activate card design' });
  }
});

// Delete a card design
cardDesignsRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.cardDesign.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting card design:', error);
    res.status(500).json({ error: 'Failed to delete card design' });
  }
});

// Get active card design
cardDesignsRouter.get('/active', async (req, res) => {
  try {
    const design = await prisma.cardDesign.findFirst({
      where: { isActive: true }
    });
    res.json(design);
  } catch (error) {
    console.error('Error fetching active card design:', error);
    res.status(500).json({ error: 'Failed to fetch active card design' });
  }
});
