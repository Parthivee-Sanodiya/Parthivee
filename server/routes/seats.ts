import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Showtime } from '../models/Showtime.ts';
import { Screen } from '../models/Screen.ts';
import { SeatHold } from '../models/SeatHold.ts';
import { optionalAuthenticate, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/showtimes/:id/seats
router.get('/:id/seats', optionalAuthenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { sessionId } = req.query;

    const showtime = await Showtime.findById(id)
      .populate('movie', 'title poster duration certificate language')
      .populate('cinema', 'name city address facilities')
      .populate('screen');

    if (!showtime) {
      res.status(404).json({ success: false, message: 'Showtime not found.' });
      return;
    }

    const screen = await Screen.findById(showtime.screen);
    if (!screen) {
      res.status(404).json({ success: false, message: 'Screen layout not found.' });
      return;
    }

    const now = new Date();

    // Clean up expired holds if any
    await SeatHold.deleteMany({ expiresAt: { $lte: now } });

    // Active holds on this showtime
    const activeHolds = await SeatHold.find({
      showtime: showtime._id,
      status: 'active',
      expiresAt: { $gt: now },
    });

    const otherUsersHeldSeats: string[] = [];
    let myHeldSeats: string[] = [];
    let myHoldExpiresAt: Date | null = null;

    activeHolds.forEach((hold) => {
      const isMyHold = sessionId && hold.sessionId === sessionId;
      if (isMyHold) {
        myHeldSeats = hold.seats;
        myHoldExpiresAt = hold.expiresAt;
      } else {
        otherUsersHeldSeats.push(...hold.seats);
      }
    });

    res.json({
      success: true,
      showtime: {
        id: showtime._id,
        date: showtime.date,
        startTime: showtime.startTime,
        format: showtime.format,
        language: showtime.language,
        pricing: showtime.pricing,
        movie: showtime.movie,
        cinema: showtime.cinema,
      },
      screen: {
        id: screen._id,
        screenName: screen.screenName,
        soundSystem: screen.soundSystem,
        projectionType: screen.projectionType,
        totalSeats: screen.totalSeats,
        rows: screen.rows,
      },
      bookedSeats: showtime.bookedSeats || [],
      heldSeats: otherUsersHeldSeats,
      myHeldSeats,
      myHoldExpiresAt,
    });
  } catch (error: any) {
    console.error('Error fetching seat layout:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch seating layout.' });
  }
});

// POST /api/seats/hold (Atomic seat reservation)
router.post('/hold', optionalAuthenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { showtimeId, seats, sessionId } = req.body;

    if (!showtimeId || !Array.isArray(seats) || seats.length === 0 || !sessionId) {
      res.status(400).json({ success: false, message: 'Showtime ID, seats list, and sessionId are required.' });
      return;
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      res.status(404).json({ success: false, message: 'Showtime not found.' });
      return;
    }

    const now = new Date();

    // 1. Check if any seat is already booked
    const alreadyBooked = seats.filter((s: string) => showtime.bookedSeats.includes(s));
    if (alreadyBooked.length > 0) {
      res.status(409).json({
        success: false,
        message: `Seat(s) ${alreadyBooked.join(', ')} have already been booked. Please pick another seat.`,
        conflictedSeats: alreadyBooked,
      });
      return;
    }

    // 2. Check if any seat is currently held by someone else
    const competingHolds = await SeatHold.find({
      showtime: showtime._id,
      status: 'active',
      sessionId: { $ne: sessionId },
      expiresAt: { $gt: now },
      seats: { $in: seats },
    });

    if (competingHolds.length > 0) {
      const conflicted = competingHolds.flatMap((h) => h.seats.filter((s: string) => seats.includes(s)));
      res.status(409).json({
        success: false,
        message: `Seat(s) ${[...new Set(conflicted)].join(', ')} are currently on hold by another customer.`,
        conflictedSeats: conflicted,
      });
      return;
    }

    // 3. Atomically upsert hold for this session (8 minutes expiry)
    const holdDurationMinutes = 8;
    const expiresAt = new Date(Date.now() + holdDurationMinutes * 60 * 1000);

    const hold = await SeatHold.findOneAndUpdate(
      { showtime: showtime._id, sessionId },
      {
        showtime: showtime._id,
        sessionId,
        userId: req.userId ? new mongoose.Types.ObjectId(req.userId) : undefined,
        seats,
        expiresAt,
        status: 'active',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: 'Seats held successfully for 8 minutes.',
      holdId: hold._id,
      seats: hold.seats,
      expiresAt: hold.expiresAt,
      ttlSeconds: holdDurationMinutes * 60,
    });
  } catch (error: any) {
    console.error('Error holding seats:', error);
    res.status(500).json({ success: false, message: 'Could not reserve seats.' });
  }
});

// DELETE /api/seats/hold/:sessionId/:showtimeId (Release seats)
router.delete('/hold/:sessionId/:showtimeId', async (req: Request, res: Response) => {
  try {
    const { sessionId, showtimeId } = req.params;
    await SeatHold.deleteMany({ showtime: showtimeId, sessionId });
    res.json({ success: true, message: 'Held seats released.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to release hold.' });
  }
});

export default router;
