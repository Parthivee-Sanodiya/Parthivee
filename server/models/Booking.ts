import mongoose, { Schema, Document } from 'mongoose';

export interface IBookedSeat {
  seatNumber: string;
  row: string;
  type: 'executive' | 'club' | 'recliner';
  price: number;
}

export interface IBooking extends Document {
  bookingId: string;
  user: mongoose.Types.ObjectId;
  movie: mongoose.Types.ObjectId;
  cinema: mongoose.Types.ObjectId;
  screen: mongoose.Types.ObjectId;
  showtime: mongoose.Types.ObjectId;
  seats: IBookedSeat[];
  seatNumbers: string[];
  ticketQuantity: number;
  subtotal: number;
  convenienceFee: number;
  taxes: number;
  totalAmount: number;
  bookingDate: Date;
  payment?: mongoose.Types.ObjectId;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  bookingStatus: 'confirmed' | 'cancelled';
  qrCodeDataUrl: string;
  verificationCode: string;
  customerDetails: {
    name: string;
    email: string;
    mobile: string;
  };
  cancellation?: {
    cancelledAt: Date;
    reason: string;
    refundAmount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
    cinema: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true },
    screen: { type: Schema.Types.ObjectId, ref: 'Screen', required: true },
    showtime: { type: Schema.Types.ObjectId, ref: 'Showtime', required: true, index: true },
    seats: [
      {
        seatNumber: { type: String, required: true },
        row: { type: String, required: true },
        type: { type: String, enum: ['executive', 'club', 'recliner'], required: true },
        price: { type: Number, required: true },
      },
    ],
    seatNumbers: [{ type: String, required: true }],
    ticketQuantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    convenienceFee: { type: Number, required: true, default: 35 },
    taxes: { type: Number, required: true, default: 18 },
    totalAmount: { type: Number, required: true },
    bookingDate: { type: Date, default: Date.now },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed',
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    qrCodeDataUrl: { type: String, default: '' },
    verificationCode: { type: String, required: true },
    customerDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      mobile: { type: String, required: true },
    },
    cancellation: {
      cancelledAt: { type: Date },
      reason: { type: String },
      refundAmount: { type: Number },
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
