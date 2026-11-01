import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './server/config/db.ts';
import { seedDatabase } from './server/seed/seedData.ts';

// Routes
import authRoutes from './server/routes/auth.ts';
import movieRoutes from './server/routes/movies.ts';
import cinemaRoutes from './server/routes/cinemas.ts';
import screenRoutes from './server/routes/screens.ts';
import showtimeRoutes from './server/routes/showtimes.ts';
import seatRoutes from './server/routes/seats.ts';
import bookingRoutes from './server/routes/bookings.ts';
import paymentRoutes from './server/routes/payments.ts';
import adminRoutes from './server/routes/admin.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Basic security & parsing middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Healthcheck & system status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    app: 'IMovies API Server',
    database: 'MongoDB',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/screens', screenRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Global API error handler
app.use('/api/*', (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

async function startServer() {
  try {
    // 1. Connect to MongoDB (via MONGODB_URI or automatic MongoMemoryServer)
    await connectDB();

    // 2. Initialize Seed Data if needed
    await seedDatabase(false);

    // 3. Mount Vite in development or static dist in production
    if (!isProduction) {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite middleware mounted in development mode.');
    } else {
      const distPath = path.resolve(__dirname, 'dist');
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
      console.log('Serving production static build from dist/.');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🎬 IMovies Cinema Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Fatal error starting IMovies server:', error);
    process.exit(1);
  }
}

startServer();
