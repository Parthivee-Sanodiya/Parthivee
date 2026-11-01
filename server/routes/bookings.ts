import { Router, Response } from 'express';
import QRCode from 'qrcode';
import { Booking } from '../models/Booking.ts';
import { Showtime } from '../models/Showtime.ts';
import { Screen } from '../models/Screen.ts';
import { Payment } from '../models/Payment.ts';
import { SeatHold } from '../models/SeatHold.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// POST /api/bookings (Create booking and process demo payment)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      showtimeId,
      seats,
      sessionId,
      customerDetails,
      paymentMethod = 'upi',
      paymentDetails = {},
      simulateFailure = false,
    } = req.body;

    if (!showtimeId || !Array.isArray(seats) || seats.length === 0) {
      res.status(400).json({ success: false, message: 'Showtime ID and seats array are required.' });
      return;
    }

    const showtime = await Showtime.findById(showtimeId)
      .populate('movie')
      .populate('cinema')
      .populate('screen');

    if (!showtime) {
      res.status(404).json({ success: false, message: 'Selected showtime does not exist.' });
      return;
    }

    const screen = await Screen.findById(showtime.screen);
    if (!screen) {
      res.status(404).json({ success: false, message: 'Screen layout does not exist.' });
      return;
    }

    // 1. Verify none of the seats are already permanently booked
    const alreadyBooked = seats.filter((s: string) => showtime.bookedSeats.includes(s));
    if (alreadyBooked.length > 0) {
      res.status(409).json({
        success: false,
        message: `Seat(s) ${alreadyBooked.join(', ')} are already booked.`,
      });
      return;
    }

    // 2. Handle payment failure simulation
    if (simulateFailure) {
      // Log failed payment
      const failPaymentId = `PAY-FAIL-${Date.now().toString().slice(-6)}`;
      await Payment.create({
        paymentId: failPaymentId,
        bookingId: 'UNCONFIRMED',
        user: req.userId,
        amount: 0,
        method: paymentMethod,
        details: paymentDetails,
        status: 'failed',
        failureReason: 'Demo payment simulated as failed by user request or bank gateway timeout.',
      });

      // Release hold on failure
      if (sessionId) {
        await SeatHold.deleteMany({ showtime: showtime._id, sessionId });
      }

      res.status(402).json({
        success: false,
        message: 'Payment simulation failed. Your seats have been released.',
      });
      return;
    }

    // 3. Compute detailed seat pricing
    const bookedSeatItems = seats.map((seatId: string) => {
      const rowLetter = seatId.charAt(0);
      const rowInfo = screen.rows.find((r: any) => r.rowName === rowLetter);
      const seatType = (rowInfo?.type || 'executive') as 'executive' | 'club' | 'recliner';
      const price = showtime.pricing[seatType] || 250;

      return {
        seatNumber: seatId,
        row: rowLetter,
        type: seatType,
        price,
      };
    });

    const subtotal = bookedSeatItems.reduce((sum: number, item: any) => sum + item.price, 0);
    const convenienceFee = Math.round(bookedSeatItems.length * 28);
    const taxes = Math.round((subtotal + convenienceFee) * 0.05); // 5% GST
    const totalAmount = subtotal + convenienceFee + taxes;

    // 4. Generate unique IDs & Verification Tokens
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `IMV-${Date.now().toString().slice(-5)}-${randomSuffix}`;
    const verificationCode = `VER-${Math.floor(100000 + Math.random() * 900000)}`;

    // 5. Generate authentic Digital E-Ticket QR Code
    const qrPayload = JSON.stringify({
      bookingId,
      verificationCode,
      movie: (showtime.movie as any).title,
      cinema: (showtime.cinema as any).name,
      screen: screen.screenName,
      showtime: `${showtime.date} · ${showtime.startTime}`,
      seats: seats.join(','),
      totalAmount,
      customer: customerDetails?.name || req.user?.name,
      verified: true,
      issuedAt: new Date().toISOString(),
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 256,
    });

    // 6. Record Payment
    const paymentId = `PAY-DEMO-${Date.now().toString().slice(-6)}-${randomSuffix}`;
    const payment = await Payment.create({
      paymentId,
      bookingId,
      user: req.userId,
      amount: totalAmount,
      method: paymentMethod,
      details: paymentDetails,
      status: 'success',
      transactionTimestamp: new Date(),
    });

    // 7. Atomically lock seats into showtime permanently
    await Showtime.findByIdAndUpdate(showtime._id, {
      $addToSet: { bookedSeats: { $each: seats } },
    });

    // 8. Convert or clear temporary hold
    if (sessionId) {
      await SeatHold.deleteMany({ showtime: showtime._id, sessionId });
    }

    // 9. Create confirmed Booking record
    const booking = await Booking.create({
      bookingId,
      user: req.userId,
      movie: showtime.movie._id,
      cinema: showtime.cinema._id,
      screen: screen._id,
      showtime: showtime._id,
      seats: bookedSeatItems,
      seatNumbers: seats,
      ticketQuantity: seats.length,
      subtotal,
      convenienceFee,
      taxes,
      totalAmount,
      bookingDate: new Date(),
      payment: payment._id,
      paymentStatus: 'completed',
      bookingStatus: 'confirmed',
      qrCodeDataUrl,
      verificationCode,
      customerDetails: {
        name: customerDetails?.name || req.user?.name || 'Customer',
        email: customerDetails?.email || req.user?.email || 'customer@imovies.com',
        mobile: customerDetails?.mobile || req.user?.mobile || '9999999999',
      },
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie')
      .populate('cinema')
      .populate('screen')
      .populate('showtime')
      .populate('payment');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: populatedBooking,
    });
  } catch (error: any) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to process booking.', error: error.message });
  }
});

// GET /api/bookings/my-bookings
router.get('/my-bookings', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate('movie')
      .populate('cinema')
      .populate('screen')
      .populate('showtime')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch user bookings.' });
  }
});

// GET /api/bookings/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findOne({
      $or: [{ _id: req.params.id }, { bookingId: req.params.id }],
    })
      .populate('movie')
      .populate('cinema')
      .populate('screen')
      .populate('showtime')
      .populate('payment');

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    // Verify ownership if not admin
    if (req.user?.role !== 'admin' && booking.user.toString() !== req.userId) {
      res.status(403).json({ success: false, message: 'Unauthorized to view this booking.' });
      return;
    }

    res.json({ success: true, booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch booking details.' });
  }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { reason = 'Customer requested cancellation' } = req.body;
    const booking = await Booking.findOne({
      $or: [{ _id: req.params.id }, { bookingId: req.params.id }],
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    if (req.user?.role !== 'admin' && booking.user.toString() !== req.userId) {
      res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
      return;
    }

    if (booking.bookingStatus === 'cancelled') {
      res.status(400).json({ success: false, message: 'This booking has already been cancelled.' });
      return;
    }

    // Cancellation Policy: 80% refund if cancelled before showtime
    const refundAmount = Math.round(booking.totalAmount * 0.8);

    // Release seats atomically back to showtime availability
    await Showtime.findByIdAndUpdate(booking.showtime, {
      $pull: { bookedSeats: { $in: booking.seatNumbers } },
    });

    // Update booking state
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancellation = {
      cancelledAt: new Date(),
      reason,
      refundAmount,
    };
    await booking.save();

    // Update payment record
    if (booking.payment) {
      await Payment.findByIdAndUpdate(booking.payment, {
        status: 'failed',
        failureReason: `Refunded ₹${refundAmount} following booking cancellation.`,
      });
    }

    res.json({
      success: true,
      message: `Booking cancelled successfully. A refund of ₹${refundAmount} has been credited to your original payment mode (Demo).`,
      booking,
    });
  } catch (error: any) {
    console.error('Cancellation error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel booking.' });
  }
});

export default router;
