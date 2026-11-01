import React from 'react';
import { Film, Shield, Database, Server, Smartphone, CheckCircle2, Lock, Sparkles, Layers } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 pb-24">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-rose-500 text-xs font-bold uppercase tracking-wider block">
          Academic Project Architecture
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-black text-white">
          About IMovies Platform
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
          IMovies is a production-grade full-stack cinema ticket booking system developed on the
          MERN architecture (MongoDB, Express.js, React.js, and Node.js).
        </p>
      </div>

      {/* Tech Stack Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-white">MongoDB & Mongoose</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Connected to real MongoDB collections: Users, Movies, Cinemas, Screens, Showtimes,
            SeatHolds, Bookings, and Payments with schema constraints and indexes.
          </p>
        </div>

        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-white">Express & Node.js</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Modular RESTful API endpoints with JWT bearer authentication, bcrypt password hashing,
            role authorization, and CORS handling.
          </p>
        </div>

        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-white">React 19 & Tailwind</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Cinematic dark theme with responsive layouts, unboxed metadata discipline, and interactive
            curved cinema seat selection layout.
          </p>
        </div>

        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-white">Atomic Holds & QR</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            8-minute temporary seat reservation with automatic expiry to prevent race conditions,
            plus verifiable QR digital e-ticket rendering.
          </p>
        </div>
      </div>

      {/* Feature Matrix */}
      <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-6">
        <h2 className="font-heading text-xl font-bold text-white">
          Key Functional Features Implemented
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Real-Time Seat Availability:</strong>
              <span className="text-neutral-400">
                Showtime seat status is directly retrieved and validated against MongoDB.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Race Condition Prevention:</strong>
              <span className="text-neutral-400">
                Atomic MongoDB holds prevent two users from booking the same seat simultaneously.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Demo Payment System:</strong>
              <span className="text-neutral-400">
                Simulates UPI, Credit/Debit card, and Box Office counter payments with failure toggles.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Digital E-Ticket with QR Pass:</strong>
              <span className="text-neutral-400">
                Encodes booking ID, movie details, seats, and verification hash in scannable QR format.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Cancellation & Instant Release:</strong>
              <span className="text-neutral-400">
                Releases seats back to the auditorium immediately and issues refund confirmation.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Full Admin Control Center:</strong>
              <span className="text-neutral-400">
                Movie CRUD, schedule new showtimes, inspect booking revenue, and reset database seeds.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
