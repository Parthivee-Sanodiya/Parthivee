import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.ts';
import { authenticate, AuthRequest, JWT_SECRET } from '../middleware/auth.ts';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, mobile, password, confirmPassword } = req.body;

    if (!name || !email || !mobile || !password) {
      res.status(400).json({ success: false, message: 'All fields are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    const emailLower = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: emailLower,
      mobile: mobile.trim(),
      password: hashedPassword,
      role: 'user',
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to IMovies.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.', error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user!._id,
        name: req.user!.name,
        email: req.user!.email,
        mobile: req.user!.mobile,
        role: req.user!.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error retrieving profile.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, mobile } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (name) user.name = name.trim();
    if (mobile) user.mobile = mobile.trim();
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error updating profile.' });
  }
});

export default router;
