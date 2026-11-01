import { Router, Request, Response } from 'express';
import { Screen } from '../models/Screen.ts';
import { authenticate, adminOnly, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/screens/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const screen = await Screen.findById(req.params.id).populate('cinema');
    if (!screen) {
      res.status(404).json({ success: false, message: 'Screen not found.' });
      return;
    }
    res.json({ success: true, screen });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch screen details.' });
  }
});

// POST /api/screens (Admin only)
router.post('/', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const screen = await Screen.create(req.body);
    res.status(201).json({ success: true, message: 'Screen created successfully.', screen });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to create screen.', error: error.message });
  }
});

export default router;
