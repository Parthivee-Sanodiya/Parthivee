import { Router, Request, Response } from 'express';
import { Showtime } from '../models/Showtime.ts';
import { authenticate, adminOnly, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/showtimes
router.get('/', async (req: Request, res: Response) => {
  try {
    const { movieId, cinemaId, date } = req.query;
    const filter: any = { isActive: true };

    if (movieId) filter.movie = movieId;
    if (cinemaId) filter.cinema = cinemaId;
    if (date) filter.date = date;

    const showtimes = await Showtime.find(filter)
      .populate('movie', 'title poster certificate duration language genre rating')
      .populate('cinema', 'name city address facilities')
      .populate('screen', 'screenName soundSystem projectionType totalSeats rows')
      .sort({ date: 1, startTime: 1 });

    res.json({ success: true, count: showtimes.length, showtimes });
  } catch (error: any) {
    console.error('Error fetching showtimes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch showtimes.' });
  }
});

// GET /api/showtimes/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie')
      .populate('cinema')
      .populate('screen');

    if (!showtime) {
      res.status(404).json({ success: false, message: 'Showtime not found.' });
      return;
    }

    res.json({ success: true, showtime });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch showtime details.' });
  }
});

// POST /api/showtimes (Admin only)
router.post('/', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const showtime = await Showtime.create(req.body);
    res.status(201).json({ success: true, message: 'Showtime created successfully.', showtime });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to create showtime.', error: error.message });
  }
});

// DELETE /api/showtimes/:id (Admin only)
router.delete('/:id', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);
    if (!showtime) {
      res.status(404).json({ success: false, message: 'Showtime not found.' });
      return;
    }
    res.json({ success: true, message: 'Showtime deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete showtime.' });
  }
});

export default router;
