import { Router, Request, Response } from 'express';
import { Cinema } from '../models/Cinema.ts';
import { Screen } from '../models/Screen.ts';
import { authenticate, adminOnly, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/cinemas
router.get('/', async (req: Request, res: Response) => {
  try {
    const { city } = req.query;
    const filter: any = {};
    if (city && city !== 'All') {
      filter.city = { $regex: city as string, $options: 'i' };
    }

    const cinemas = await Cinema.find(filter).sort({ name: 1 });
    res.json({ success: true, count: cinemas.length, cinemas });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch cinemas.' });
  }
});

// GET /api/cinemas/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      res.status(404).json({ success: false, message: 'Cinema not found.' });
      return;
    }
    const screens = await Screen.find({ cinema: cinema._id });
    res.json({ success: true, cinema, screens });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch cinema details.' });
  }
});

// POST /api/cinemas (Admin only)
router.post('/', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const cinema = await Cinema.create(req.body);
    res.status(201).json({ success: true, message: 'Cinema created successfully.', cinema });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to create cinema.', error: error.message });
  }
});

export default router;
