import { Router, Response } from 'express';
import { Payment } from '../models/Payment.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// POST /api/payments/demo
router.post('/demo', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, method, details, bookingId, simulateFailure = false } = req.body;

    if (!amount || !method) {
      res.status(400).json({ success: false, message: 'Amount and payment method are required.' });
      return;
    }

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const paymentId = `PAY-DEMO-${randomSuffix}`;

    if (simulateFailure) {
      const payment = await Payment.create({
        paymentId,
        bookingId: bookingId || 'PENDING',
        user: req.userId,
        amount,
        method,
        details: details || {},
        status: 'failed',
        failureReason: 'Transaction declined by bank authorization simulator (Demo).',
      });

      res.status(402).json({
        success: false,
        message: 'Payment simulation declined. Please try another demo method.',
        payment,
      });
      return;
    }

    const payment = await Payment.create({
      paymentId,
      bookingId: bookingId || 'PENDING',
      user: req.userId,
      amount,
      method,
      details: details || {},
      status: 'success',
    });

    res.json({
      success: true,
      message: 'Demo payment approved instantly!',
      payment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Payment processing error.', error: error.message });
  }
});

// GET /api/payments/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const payment = await Payment.findOne({
      $or: [{ _id: req.params.id }, { paymentId: req.params.id }],
    });

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found.' });
      return;
    }

    res.json({ success: true, payment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment details.' });
  }
});

export default router;
