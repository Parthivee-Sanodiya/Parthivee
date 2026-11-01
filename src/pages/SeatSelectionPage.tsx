import React, { useState, useEffect } from 'react';
import {
  Film,
  Clock,
  ArrowLeft,
  Shield,
  CheckCircle2,
  AlertCircle,
  Armchair,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { Showtime, Screen, ScreenRow } from '../types/index.ts';
import { api, getSessionId } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface SeatSelectionPageProps {
  showtimeId: string;
  onBack: () => void;
  onProceedToCheckout: (checkoutData: {
    showtime: Showtime;
    screen: Screen;
    selectedSeats: string[];
    seatBreakdown: { seatNumber: string; row: string; type: string; price: number }[];
    subtotal: number;
    convenienceFee: number;
    taxes: number;
    totalAmount: number;
  }) => void;
}

export const SeatSelectionPage: React.FC<SeatSelectionPageProps> = ({
  showtimeId,
  onBack,
  onProceedToCheckout,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const sessionId = getSessionId();

  const [loading, setLoading] = useState(true);
  const [showtime, setShowtime] = useState<any>(null);
  const [screen, setScreen] = useState<any>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [heldSeats, setHeldSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [holdSuccessMsg, setHoldSuccessMsg] = useState<string>('');
  const [holdingInProgress, setHoldingInProgress] = useState<boolean>(false);

  // Load seats layout & booked state
  const loadSeatData = async () => {
    try {
      setErrorMsg('');
      const data = await api.getSeats(showtimeId, sessionId);
      if (data.success) {
        setShowtime(data.showtime);
        setScreen(data.screen);
        setBookedSeats(data.bookedSeats || []);
        setHeldSeats(data.heldSeats || []);

        if (data.myHeldSeats && data.myHeldSeats.length > 0) {
          setSelectedSeats(data.myHeldSeats);
        }

        if (data.myHoldExpiresAt) {
          const exp = new Date(data.myHoldExpiresAt);
          setHoldExpiresAt(exp);
          const diff = Math.max(0, Math.floor((exp.getTime() - Date.now()) / 1000));
          setSecondsRemaining(diff);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load auditorium seating.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeatData();
    // Auto-refresh seat availability every 12 seconds
    const interval = setInterval(loadSeatData, 12000);
    return () => clearInterval(interval);
  }, [showtimeId]);

  // Live countdown timer for held seats
  useEffect(() => {
    if (!holdExpiresAt || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((holdExpiresAt.getTime() - now) / 1000));
      setSecondsRemaining(diff);

      if (diff === 0) {
        // Hold expired!
        setSelectedSeats([]);
        setHoldExpiresAt(null);
        setErrorMsg('Your 8-minute seat reservation has expired. Please reselect your seats.');
        loadSeatData();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [holdExpiresAt, secondsRemaining]);

  // Handle seat click
  const handleToggleSeat = async (seatId: string) => {
    if (bookedSeats.includes(seatId) || heldSeats.includes(seatId) || holdingInProgress) {
      return;
    }

    setErrorMsg('');
    setHoldSuccessMsg('');

    let updatedSelection: string[];
    if (selectedSeats.includes(seatId)) {
      updatedSelection = selectedSeats.filter((s) => s !== seatId);
    } else {
      if (selectedSeats.length >= 8) {
        setErrorMsg('Maximum 8 seats allowed per booking transaction.');
        return;
      }
      updatedSelection = [...selectedSeats, seatId];
    }

    if (updatedSelection.length === 0) {
      setSelectedSeats([]);
      setHoldExpiresAt(null);
      setSecondsRemaining(0);
      try {
        await api.releaseSeats(sessionId, showtimeId);
      } catch {}
      return;
    }

    // Atomically hold seats in MongoDB
    setHoldingInProgress(true);
    try {
      const res = await api.holdSeats({
        showtimeId,
        seats: updatedSelection,
        sessionId,
      });

      if (res.success) {
        setSelectedSeats(res.seats);
        const exp = new Date(res.expiresAt);
        setHoldExpiresAt(exp);
        setSecondsRemaining(res.ttlSeconds);
        setHoldSuccessMsg(`Seats held! You have 8 minutes to complete booking.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Seat could not be reserved. Please select another seat.');
      await loadSeatData();
    } finally {
      setHoldingInProgress(false);
    }
  };

  // Helper to get seat tier & pricing
  const getSeatInfo = (seatId: string) => {
    const rowLetter = seatId.charAt(0);
    const rowInfo = screen?.rows?.find((r: ScreenRow) => r.rowName === rowLetter);
    const type = (rowInfo?.type || 'executive') as 'executive' | 'club' | 'recliner';
    const price = showtime?.pricing?.[type] || 250;
    return { row: rowLetter, type, price };
  };

  // Compute breakdown
  const seatBreakdown = selectedSeats.map((seatId) => {
    const info = getSeatInfo(seatId);
    return {
      seatNumber: seatId,
      row: info.row,
      type: info.type,
      price: info.price,
    };
  });

  const subtotal = seatBreakdown.reduce((sum, item) => sum + item.price, 0);
  const convenienceFee = selectedSeats.length > 0 ? selectedSeats.length * 28 : 0;
  const taxes = Math.round((subtotal + convenienceFee) * 0.05); // 5% GST
  const totalAmount = subtotal + convenienceFee + taxes;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      setErrorMsg('Please select at least 1 seat to continue.');
      return;
    }

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    onProceedToCheckout({
      showtime,
      screen,
      selectedSeats,
      seatBreakdown,
      subtotal,
      convenienceFee,
      taxes,
      totalAmount,
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-neutral-400">Loading auditorium layout and real-time seat states...</p>
      </div>
    );
  }

  if (!showtime || !screen) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">Showtime Unavailable</h2>
        <p className="text-xs text-neutral-400 mb-6">The requested showtime details could not be found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-neutral-800 text-white rounded-xl text-xs font-semibold hover:bg-neutral-700"
        >
          Return to Movies
        </button>
      </div>
    );
  }

  // Group rows by tier
  const tiers = [
    { type: 'recliner', label: 'Recliner Loungers (VIP)', price: showtime.pricing.recliner },
    { type: 'club', label: 'Club Class (Gold)', price: showtime.pricing.club },
    { type: 'executive', label: 'Executive Class (Silver)', price: showtime.pricing.executive },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-32">
      {/* 1. Header Bar with Movie, Cinema, and Live Timer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-0.5">
              <span>{showtime.cinema.name}</span>
              <span aria-hidden="true">·</span>
              <span className="text-rose-400 font-medium">{screen.screenName}</span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-white">
              {showtime.movie.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-neutral-300 mt-1">
              <span>{showtime.date}</span>
              <span aria-hidden="true">·</span>
              <span className="text-rose-500 font-bold">{showtime.startTime}</span>
              <span aria-hidden="true">·</span>
              <span>{showtime.format}</span>
              <span aria-hidden="true">·</span>
              <span>{showtime.language}</span>
            </div>
          </div>
        </div>

        {/* Live Reservation Hold Timer */}
        {secondsRemaining > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-rose-950/40 border border-rose-800/80 rounded-xl">
            <Clock className="w-5 h-5 text-rose-500 animate-pulse" />
            <div>
              <p className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                Temporary Hold Active
              </p>
              <p className="font-heading text-lg font-black text-white">
                {formatTimer(secondsRemaining)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl flex items-center gap-2 text-rose-300 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {holdSuccessMsg && !errorMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2 text-emerald-300 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{holdSuccessMsg}</span>
        </div>
      )}

      {/* 2. Seat Status Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 p-4 bg-neutral-900/60 border border-neutral-850 rounded-2xl text-xs text-neutral-300">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md border-2 border-emerald-500/80 bg-neutral-950 flex items-center justify-center text-[10px] text-emerald-400 font-bold">
            ✓
          </div>
          <span>Available</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-rose-600 border border-rose-500 shadow-md shadow-rose-950 flex items-center justify-center text-[10px] text-white font-bold">
            ★
          </div>
          <span>Selected (Your Seats)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-[10px] text-amber-400 font-bold">
            🔒
          </div>
          <span>Hold (Another User)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-neutral-800 border border-neutral-700/60 text-neutral-600 flex items-center justify-center text-[10px]">
            ✕
          </div>
          <span>Booked</span>
        </div>
      </div>

      {/* 3. Curved Cinema Screen Visual Indicator */}
      <div className="py-6 px-4 flex flex-col items-center">
        <div className="w-full max-w-2xl relative">
          {/* Ambient Glow */}
          <div className="w-full h-8 cinema-screen-glow mx-auto rounded-t-full" />
          {/* Curved white screen bar */}
          <div className="w-full h-2.5 bg-gradient-to-r from-neutral-600 via-rose-500 to-neutral-600 rounded-t-full shadow-lg shadow-rose-950/40" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 text-center mt-2">
            ALL EYES THIS WAY · SCREEN
          </p>
        </div>
      </div>

      {/* 4. Interactive Auditorium Seat Grid by Tier */}
      <div className="p-6 sm:p-8 bg-neutral-900/80 border border-neutral-800 rounded-3xl overflow-x-auto">
        <div className="min-w-[620px] max-w-4xl mx-auto space-y-8">
          {tiers.map((tier) => {
            const tierRows = screen.rows.filter((r: ScreenRow) => r.type === tier.type);
            if (tierRows.length === 0) return null;

            return (
              <div key={tier.type} className="space-y-3">
                {/* Tier Title Header */}
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1.5 text-xs">
                  <span className="font-heading font-bold text-neutral-300">
                    {tier.label}
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    ₹{tier.price}
                  </span>
                </div>

                {/* Rows in this tier */}
                <div className="space-y-2 pt-1">
                  {tierRows.map((row: ScreenRow) => (
                    <div key={row.rowName} className="flex items-center justify-center gap-2">
                      {/* Left Row Label */}
                      <span className="w-6 text-center text-xs font-bold text-neutral-500">
                        {row.rowName}
                      </span>

                      {/* Seats in Row */}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {Array.from({ length: row.seatsCount }).map((_, idx) => {
                          const seatNum = idx + 1;
                          const seatId = `${row.rowName}${seatNum}`;
                          const isBooked = bookedSeats.includes(seatId);
                          const isHeldByOther = heldSeats.includes(seatId);
                          const isSelected = selectedSeats.includes(seatId);
                          const isAisle = row.aisleAfter?.includes(seatNum);

                          let seatClasses = '';
                          if (isSelected) {
                            seatClasses =
                              'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950 scale-105';
                          } else if (isBooked) {
                            seatClasses =
                              'bg-neutral-800/80 text-neutral-600 border-neutral-800 cursor-not-allowed opacity-60';
                          } else if (isHeldByOther) {
                            seatClasses =
                              'bg-amber-950/40 text-amber-500 border-amber-800/50 cursor-not-allowed';
                          } else {
                            seatClasses =
                              'bg-neutral-950 text-emerald-400 border-emerald-900/60 hover:border-emerald-500 hover:bg-emerald-950/20 cursor-pointer';
                          }

                          const seatWidth = tier.type === 'recliner' ? 'w-8 h-8' : 'w-7 h-7';

                          return (
                            <React.Fragment key={seatId}>
                              <button
                                type="button"
                                disabled={isBooked || isHeldByOther || holdingInProgress}
                                onClick={() => handleToggleSeat(seatId)}
                                className={`rounded-lg border text-[11px] font-semibold flex items-center justify-center transition-all ${seatWidth} ${seatClasses}`}
                                title={`${seatId} - ${tier.label} (₹${tier.price})`}
                              >
                                {isBooked ? '×' : isHeldByOther ? '🔒' : seatNum}
                              </button>

                              {/* Aisle Spacer */}
                              {isAisle && (
                                <div className="w-4 sm:w-6 pointer-events-none" aria-hidden="true" />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Right Row Label */}
                      <span className="w-6 text-center text-xs font-bold text-neutral-500">
                        {row.rowName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Sticky Bottom Booking Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Selected Seat Badges */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-neutral-400 font-medium">Selected Seats:</span>
            {selectedSeats.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedSeats.map((seatId) => (
                  <span
                    key={seatId}
                    className="px-2.5 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold"
                  >
                    {seatId}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-neutral-500 italic">No seats selected yet</span>
            )}
          </div>

          {/* Pricing & CTA */}
          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
            <div className="text-right">
              <p className="text-[10px] text-neutral-400 uppercase font-semibold">Total Payable</p>
              <p className="font-heading text-xl sm:text-2xl font-black text-white">
                ₹{totalAmount}
              </p>
            </div>

            <button
              onClick={handleProceed}
              disabled={selectedSeats.length === 0 || holdingInProgress}
              className="py-3 px-6 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-rose-950/60 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <Ticket className="w-4 h-4" />
              <span>Proceed to Checkout ({selectedSeats.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
