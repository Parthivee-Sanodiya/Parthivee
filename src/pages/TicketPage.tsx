import React, { useRef } from 'react';
import {
  Film,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  Ticket as TicketIcon,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Booking } from '../types/index.ts';

interface TicketPageProps {
  booking: Booking;
  onNavigateHome: () => void;
  onNavigateMyBookings: () => void;
}

export const TicketPage: React.FC<TicketPageProps> = ({
  booking,
  onNavigateHome,
  onNavigateMyBookings,
}) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const movie = booking.movie as any;
  const cinema = booking.cinema as any;
  const screen = booking.screen as any;
  const showtime = booking.showtime as any;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-24">
      {/* Top Status & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block">
              Booking Confirmed
            </span>
            <h1 className="font-heading text-2xl font-black text-white">
              Your Digital E-Ticket is Ready!
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-rose-500" />
            <span>Print / Save PDF</span>
          </button>
          <button
            onClick={onNavigateMyBookings}
            className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-950/60 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <TicketIcon className="w-4 h-4" />
            <span>My Bookings</span>
          </button>
        </div>
      </div>

      {/* Visual Cinema Boarding Pass / Digital E-Ticket */}
      <div
        ref={ticketRef}
        className="relative bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl print:shadow-none print:border-black print:text-black print:bg-white"
      >
        {/* Ticket Top Ribbon */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 p-4 sm:p-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black/30 backdrop-blur-md flex items-center justify-center text-white">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-black text-xl tracking-tight leading-none block">
                IMOVIES
              </span>
              <span className="text-[9px] uppercase tracking-widest text-rose-200 font-bold">
                Official Digital Admission Pass
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-rose-200 block uppercase font-bold tracking-wider">
              Booking Reference
            </span>
            <span className="font-mono text-sm sm:text-base font-black tracking-wider">
              {booking.bookingId}
            </span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Column: Movie & Cinema Details */}
          <div className="md:col-span-8 space-y-6">
            <div className="flex gap-4 items-start">
              <img
                src={movie?.poster}
                alt={movie?.title}
                className="w-24 sm:w-28 aspect-[2/3] object-cover rounded-xl border border-neutral-800 shadow-md shrink-0"
              />
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="text-rose-400 font-bold">{movie?.certificate || 'U/A'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{movie?.language?.[0] || 'Hindi'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{showtime?.format || '2D'}</span>
                </div>

                <h2 className="font-heading text-2xl sm:text-3xl font-black text-white leading-tight">
                  {movie?.title}
                </h2>

                <p className="text-xs text-neutral-300 font-semibold flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{cinema?.name}</span>
                </p>
                <p className="text-[11px] text-neutral-400 pl-5">{cinema?.address}</p>
              </div>
            </div>

            {/* Grid of Key Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-neutral-950 rounded-2xl border border-neutral-800/80">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-0.5">
                  Show Date
                </span>
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  <span>{showtime?.date}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-0.5">
                  Showtime
                </span>
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>{showtime?.startTime}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-0.5">
                  Screen / Audi
                </span>
                <span className="text-xs sm:text-sm font-bold text-white">
                  {screen?.screenName || 'Audi 1'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-0.5">
                  Seat Number(s)
                </span>
                <span className="text-xs sm:text-sm font-black text-rose-400">
                  {booking.seatNumbers?.join(', ')}
                </span>
              </div>
            </div>

            {/* Customer & Ticket Quantity */}
            <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 pt-1 border-t border-neutral-800/60">
              <div>
                <span className="text-neutral-500">Booked for: </span>
                <span className="text-white font-medium">{booking.customerDetails?.name}</span>
                <span className="text-neutral-500 ml-2">({booking.customerDetails?.mobile})</span>
              </div>
              <div>
                <span className="text-neutral-500">Tickets: </span>
                <span className="text-white font-bold">{booking.ticketQuantity} Admits</span>
                <span className="text-neutral-500 ml-3">Paid: </span>
                <span className="text-emerald-400 font-bold">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Scannable QR Code & Security Stamp */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-neutral-950 rounded-2xl border border-neutral-800 text-center space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
              Box Office Scan Code
            </span>

            {/* Real Rendered QR Code */}
            <div className="p-2 bg-white rounded-2xl shadow-xl">
              {booking.qrCodeDataUrl ? (
                <img
                  src={booking.qrCodeDataUrl}
                  alt="Ticket Verification QR Code"
                  className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                />
              ) : (
                <div className="w-40 h-40 bg-neutral-200 flex items-center justify-center text-black text-xs">
                  QR Code Unavailable
                </div>
              )}
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-500 block uppercase font-mono">
                Security Verification
              </span>
              <span className="font-mono text-xs font-bold text-rose-400 tracking-wider">
                {booking.verificationCode}
              </span>
            </div>

            <p className="text-[10px] text-neutral-500 leading-tight">
              Please present this verified QR pass to the usher at auditorium entrance.
            </p>
          </div>
        </div>

        {/* Perforated Stub Line Effect */}
        <div className="relative border-t-2 border-dashed border-neutral-800 px-6 py-4 bg-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Status: Verified & Confirmed in MongoDB</span>
          </div>
          <span className="font-mono text-[11px]">
            Issued on: {new Date(booking.bookingDate || Date.now()).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Bottom Nav actions */}
      <div className="flex items-center justify-between pt-4 print:hidden">
        <button
          onClick={onNavigateHome}
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <button
          onClick={onNavigateMyBookings}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
        >
          View all your bookings →
        </button>
      </div>
    </div>
  );
};
