import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  User,
  Phone,
  Mail,
  Shield,
} from 'lucide-react';
import { Booking } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface MyBookingsPageProps {
  onViewTicket: (booking: Booking) => void;
  onExploreMovies: () => void;
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({
  onViewTicket,
  onExploreMovies,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of schedule');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBookings = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.getMyBookings();
      if (res.success) {
        setBookings(res.bookings || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isAuthenticated]);

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setCancellingBookingId(cancelModalBooking._id);
    setActionMessage(null);

    try {
      const res = await api.cancelBooking(cancelModalBooking._id, cancelReason);
      if (res.success) {
        setActionMessage({
          type: 'success',
          text: res.message || 'Booking cancelled successfully. Seats released to cinema availability.',
        });
        setCancelModalBooking(null);
        await fetchBookings();
      }
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to cancel booking. Please try again.',
      });
    } finally {
      setCancellingBookingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <Ticket className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="font-heading text-xl font-bold text-white">Sign In to View Bookings</h2>
        <p className="text-xs text-neutral-400">
          Sign in to access your digital cinema passes, view QR codes, and manage your tickets.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="py-2.5 px-6 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-950/60 transition-all cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.bookingStatus === activeTab;
  });

  const confirmedCount = bookings.filter((b) => b.bookingStatus === 'confirmed').length;
  const cancelledCount = bookings.filter((b) => b.bookingStatus === 'cancelled').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-24">
      {/* 1. Profile Overview Header */}
      <div className="p-6 sm:p-8 bg-neutral-900 border border-neutral-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-rose-950/50">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-white">
              {user?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span>{user?.email}</span>
              </span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-neutral-500" />
                <span>{user?.mobile}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats summary */}
        <div className="flex items-center gap-4">
          <div className="px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-center min-w-[100px]">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Active Passes</span>
            <span className="font-heading text-xl font-black text-rose-500">{confirmedCount}</span>
          </div>
          <div className="px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-center min-w-[100px]">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total Bookings</span>
            <span className="font-heading text-xl font-black text-white">{bookings.length}</span>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800 text-rose-300'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* 2. Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-rose-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'confirmed'
                ? 'bg-rose-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Confirmed Passes ({confirmedCount})
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'cancelled'
                ? 'bg-rose-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Cancelled ({cancelledCount})
          </button>
        </div>

        <button
          onClick={fetchBookings}
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 3. Bookings List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-400">Loading your cinema bookings from database...</p>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const m = b.movie as any;
            const c = b.cinema as any;
            const s = b.screen as any;
            const st = b.showtime as any;
            const isCancelled = b.bookingStatus === 'cancelled';

            return (
              <div
                key={b._id}
                className="p-5 sm:p-6 bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex gap-4 items-start sm:items-center">
                  <img
                    src={m?.poster}
                    alt={m?.title}
                    className="w-16 h-24 sm:w-20 sm:h-28 object-cover rounded-xl border border-neutral-800 shrink-0"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isCancelled
                            ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        }`}
                      >
                        {isCancelled ? 'Cancelled' : 'Confirmed'}
                      </span>
                      <span className="font-mono text-xs text-neutral-400">#{b.bookingId}</span>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-white leading-tight">
                      {m?.title}
                    </h3>

                    <p className="text-xs text-neutral-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{c?.name} · {s?.screenName || 'Audi 1'}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-rose-400" />
                        <span>{st?.date || 'Today'}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-rose-400" />
                        <span>{st?.startTime}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-rose-400 font-bold">
                        Seats: {b.seatNumbers?.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-800">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-neutral-400 block uppercase">Amount Paid</span>
                    <span className="font-heading text-base font-bold text-white">
                      ₹{b.totalAmount}
                    </span>
                    {isCancelled && b.cancellation && (
                      <span className="text-[10px] text-rose-400 block">
                        Refunded: ₹{b.cancellation.refundAmount}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => onViewTicket(b)}
                      className="flex-1 sm:flex-none py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-rose-400" />
                      <span>View Ticket</span>
                    </button>

                    {!isCancelled && (
                      <button
                        onClick={() => setCancelModalBooking(b)}
                        className="py-2 px-3 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-neutral-900/40 rounded-3xl border border-neutral-800 space-y-4">
          <Ticket className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {activeTab === 'cancelled'
              ? 'You have no cancelled tickets.'
              : 'You have not booked any movie tickets yet. Explore movies currently showing!'}
          </p>
          <button
            onClick={onExploreMovies}
            className="py-2.5 px-6 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-950/60 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Explore Movies</span>
          </button>
        </div>
      )}

      {/* 4. Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-500">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-heading text-lg font-bold text-white">
                Cancel Booking?
              </h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to cancel booking <strong>#{cancelModalBooking.bookingId}</strong> for{' '}
              <strong>{(cancelModalBooking.movie as any)?.title}</strong>?
            </p>

            {/* Cancellation Policy explanation */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-neutral-200 font-semibold">
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span>IMovies Cancellation Terms</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                • Seats {cancelModalBooking.seatNumbers?.join(', ')} will be immediately released back to the auditorium.
              </p>
              <p className="text-[11px] text-emerald-400 font-medium">
                • 80% refund (₹{Math.round(cancelModalBooking.totalAmount * 0.8)}) will be credited to your original demo payment mode.
              </p>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Reason for Cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Change of schedule">Change of schedule / plans</option>
                <option value="Booked wrong showtime or cinema">Booked wrong showtime or cinema</option>
                <option value="Personal emergency">Personal emergency</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="py-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancellingBookingId !== null}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-950/50 cursor-pointer disabled:opacity-50"
              >
                {cancellingBookingId ? 'Cancelling...' : 'Confirm & Release Seats'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
