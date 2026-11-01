import { Router, Request, Response } from 'express';
import { Movie } from '../models/Movie.ts';
import { authenticate, adminOnly, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/movies
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, genre, language, search, sort } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (genre && genre !== 'All') {
      filter.genre = { $in: [new RegExp(`^${genre}$`, 'i')] };
    }

    if (language && language !== 'All') {
      filter.language = { $in: [new RegExp(`^${language}$`, 'i')] };
    }

    if (search) {
      filter.title = { $regex: search as string, $options: 'i' };
    }

    let query = Movie.find(filter);

    if (sort === 'rating') {
      query = query.sort({ rating: -1, votes: -1 });
    } else if (sort === 'releaseDate') {
      query = query.sort({ releaseDate: -1 });
    } else {
      query = query.sort({ featured: -1, rating: -1, createdAt: -1 });
    }

    const movies = await query.exec();
    res.json({ success: true, count: movies.length, movies });
  } catch (error: any) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch movies.' });
  }
});

// GET /api/movies/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      res.status(404).json({ success: false, message: 'Movie not found.' });
      return;
    }
    res.json({ success: true, movie });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch movie details.' });
  }
});

// POST /api/movies (Admin only)
router.post('/', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, message: 'Movie created successfully.', movie });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to create movie.', error: error.message });
  }
});

// PUT /api/movies/:id (Admin only)
router.put('/:id', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!movie) {
      res.status(404).json({ success: false, message: 'Movie not found.' });
      return;
    }
    res.json({ success: true, message: 'Movie updated successfully.', movie });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to update movie.', error: error.message });
  }
});

// DELETE /api/movies/:id (Admin only)
router.delete('/:id', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      res.status(404).json({ success: false, message: 'Movie not found.' });
      return;
    }
    res.json({ success: true, message: 'Movie deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete movie.' });
  }
});

export default router;
