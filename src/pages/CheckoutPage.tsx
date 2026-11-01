import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
  Sparkles,
  Ticket,
  Clock,
} from 'lucide-react';
import { Showtime, Screen } from '../types/index.ts';
import { api, getSessionId } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface CheckoutPageProps {
  checkoutData: {
    showtime: Showtime;
    screen: Screen;
    selectedSeats: string[];
    seatBreakdown: { seatNumber: string; row: string; type: string; price: number }[];
    subtotal: number;
    convenienceFee: number;
    taxes: number;
    totalAmount: number;
  };
  onBack: () => void;
  onBookingSuccess: (booking: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  checkoutData,
  onBack,
  onBookingSuccess,
}) => {
  const { user } = useAuth();
  const sessionId = getSessionId();

  // Contact details
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState(user?.mobile || '');

  // Payment tab: 'upi' | 'card' | 'counter'
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'counter'>('upi');
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [cardHolder, setCardHolder] = useState(user?.name || 'ADITI VARMA');

  // Simulator toggle for academic testers
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { showtime, screen, selectedSeats, seatBreakdown, subtotal, convenienceFee, taxes, totalAmount } =
    checkoutData;

  const handleFillDemoCard = () => {
    setCardNumber('4532 8910 2345 6789');
    setCardExpiry('12/29');
    setCardCvv('421');
    setCardHolder(user?.name.toUpperCase() || 'ADITI VARMA');
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !mobile.trim()) {
      setErrorMessage('Please provide complete customer contact details for ticket dispatch.');
      return;
    }

    setProcessing(true);

    // Realistic demo gateway latency
    await new Promise((resolve) => setTimeout(resolve, 1400));

    try {
      const res = await api.createBooking({
        showtimeId: showtime._id,
        seats: selectedSeats,
        sessionId,
        customerDetails: {
          name: name.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
        },
        paymentMethod,
        paymentDetails:
          paymentMethod === 'upi'
            ? { upiId }
            : paymentMethod === 'card'
            ? { cardLast4: cardNumber.slice(-4), cardNetwork: 'Visa Platinum' }
            : { counterBranch: showtime.cinema.name },
        simulateFailure,
      });

      if (res.success && res.booking) {
        onBookingSuccess(res.booking);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Payment simulation failed. Your seats have been released per policy.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-neutral-800 pb-4">
        <button
          onClick={onBack}
          className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-rose-500 text-xs font-bold uppercase tracking-wider block">
            Step 6 of 8 · Payment Gateway
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Confirm & Pay
          </h1>
        </div>
      </div>

      {/* Academic Project Demo Notice */}
      <div className="p-4 bg-neutral-900/80 border border-neutral-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-neutral-300">
          <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
          <span>
            <strong className="text-white">DEMO MODE ACTIVE:</strong> No real money or card data is charged.
            You can simulate both successful booking and failed transaction outcomes.
          </span>
        </div>

        {/* Simulator Toggle */}
        <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800 shrink-0">
          <span className="text-[11px] font-semibold text-neutral-400">Simulation:</span>
          <button
            type="button"
            onClick={() => setSimulateFailure(false)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              !simulateFailure ? 'bg-emerald-600 text-white shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            ✓ Success
          </button>
          <button
            type="button"
            onClick={() => setSimulateFailure(true)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              simulateFailure ? 'bg-rose-600 text-white shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            ✕ Fail
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl flex items-start gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Transaction Failed</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleProcessPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Contact & Payment Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Details */}
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
            <h2 className="font-heading text-base font-bold text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-rose-500" />
              <span>Ticket Delivery Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Email Address (For E-Ticket PDF)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Mobile Number (For SMS QR Code)
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-500" />
                <span>Select Payment Method (Demo)</span>
              </h2>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>256-Bit SSL Mock</span>
              </span>
            </div>

            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                  paymentMethod === 'upi'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                UPI / QR
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                  paymentMethod === 'card'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Credit / Debit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('counter')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                  paymentMethod === 'counter'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Pay at Counter
              </button>
            </div>

            {/* UPI Option */}
            {paymentMethod === 'upi' && (
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                  <span className="text-xs font-semibold text-neutral-300 block">
                    Instant UPI Verification
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. aditi@okhdfcbank"
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => setUpiId('demo@okhdfcbank')}
                      className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl"
                    >
                      Use Demo UPI
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-1">
                    <span>Supported: Google Pay</span>
                    <span aria-hidden="true">·</span>
                    <span>PhonePe</span>
                    <span aria-hidden="true">·</span>
                    <span>Paytm</span>
                    <span aria-hidden="true">·</span>
                    <span>BHIM</span>
                  </div>
                </div>
              </div>
            )}

            {/* Card Option */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">Demo Card Details</span>
                  <button
                    type="button"
                    onClick={handleFillDemoCard}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    Auto-Fill Test Card
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Counter Option */}
            {paymentMethod === 'counter' && (
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-neutral-300 block">
                  Reserve & Pay at Multiplex Box Office
                </span>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Your tickets will be confirmed instantly. Please present your booking ID at the
                  {showtime.cinema.name} box office 30 minutes prior to showtime to collect physical tickets.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full py-3.5 px-6 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-xl shadow-rose-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
            >
              {processing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Demo Transaction...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    Pay ₹{totalAmount} & Generate E-Ticket
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-5 sticky top-24">
            <h3 className="font-heading text-base font-bold text-white border-b border-neutral-800 pb-3">
              Booking Order Summary
            </h3>

            {/* Movie & Cinema Info */}
            <div className="flex gap-4">
              <img
                src={showtime.movie.poster}
                alt={showtime.movie.title}
                className="w-16 h-24 object-cover rounded-xl border border-neutral-800 shrink-0"
              />
              <div className="space-y-1">
                <h4 className="font-heading text-sm font-bold text-white">
                  {showtime.movie.title}
                </h4>
                <p className="text-xs text-neutral-400">{showtime.cinema.name}</p>
                <p className="text-xs text-rose-400 font-medium">{screen.screenName}</p>
                <p className="text-xs text-neutral-300">
                  {showtime.date} · {showtime.startTime} ({showtime.format})
                </p>
              </div>
            </div>

            {/* Seats Chosen */}
            <div className="pt-2 border-t border-neutral-800/80">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span>Seats Selected ({selectedSeats.length})</span>
                <span className="font-mono text-white font-bold">{selectedSeats.join(', ')}</span>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-400">
                {seatBreakdown.map((item) => (
                  <div key={item.seatNumber} className="flex justify-between text-[11px]">
                    <span>
                      Seat {item.seatNumber} ({item.type})
                    </span>
                    <span className="text-neutral-200">₹{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Tickets Subtotal</span>
                <span className="text-neutral-200 font-medium">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Convenience Fee</span>
                <span className="text-neutral-200 font-medium">₹{convenienceFee}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Integrated GST (5%)</span>
                <span className="text-neutral-200 font-medium">₹{taxes}</span>
              </div>
              <div className="pt-2 border-t border-neutral-800 flex justify-between items-center">
                <span className="font-bold text-white">Total Amount</span>
                <span className="font-heading text-xl font-black text-rose-500">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            {/* Security Guarantee Note */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Refund Protection</span>
              </div>
              <p>Cancel up to 20 minutes before showtime for an 80% instant demo refund.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
