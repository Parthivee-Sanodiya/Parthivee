import { Router, Response } from 'express';
import { Booking } from '../models/Booking.ts';
import { Movie } from '../models/Movie.ts';
import { User } from '../models/User.ts';
import { Cinema } from '../models/Cinema.ts';
import { Showtime } from '../models/Showtime.ts';
import { authenticate, adminOnly, AuthRequest } from '../middleware/auth.ts';
import { seedDatabase } from '../seed/seedData.ts';

const router = Router();

// GET /api/admin/dashboard
router.get('/dashboard', authenticate, adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMovies = await Movie.countDocuments();
    const activeMovies = await Movie.countDocuments({ status: 'now_showing' });
    const totalCinemas = await Cinema.countDocuments();
    const totalShowtimes = await Showtime.countDocuments();

    const bookings = await Booking.find();
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((b) => b.bookingStatus === 'confirmed');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + (b.ticketQuantity || 0), 0);

    const recentBookings = await Booking.find()
      .populate('movie', 'title poster')
      .populate('cinema', 'name city')
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalBookings,
        confirmedCount: confirmedBookings.length,
        cancelledCount: totalBookings - confirmedBookings.length,
        totalTicketsSold,
        totalUsers,
        totalMovies,
        activeMovies,
        totalCinemas,
        totalShowtimes,
      },
      recentBookings,
    });
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin dashboard stats.' });
  }
});

// GET /api/admin/bookings
router.get('/bookings', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    const filter: any = {};

    if (status && status !== 'all') {
      filter.bookingStatus = status;
    }

    if (search) {
      filter.$or = [
        { bookingId: { $regex: search as string, $options: 'i' } },
        { 'customerDetails.name': { $regex: search as string, $options: 'i' } },
        { 'customerDetails.email': { $regex: search as string, $options: 'i' } },
      ];
    }

    const bookings = await Booking.find(filter)
      .populate('movie', 'title poster rating')
      .populate('cinema', 'name city')
      .populate('screen', 'screenName')
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve bookings.' });
  }
});

// GET /api/admin/users
router.get('/users', authenticate, adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

// POST /api/admin/reseed
router.post('/reseed', authenticate, adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    await seedDatabase(true);
    res.json({ success: true, message: 'IMovies database successfully reset and re-seeded with pristine cinema data!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to reseed database.', error: error.message });
  }
});

export default router;
