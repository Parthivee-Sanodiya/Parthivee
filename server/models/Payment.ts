import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  paymentId: string;
  bookingId: string;
  user: mongoose.Types.ObjectId;
  amount: number;
  method: 'upi' | 'card' | 'counter';
  details: {
    upiId?: string;
    cardLast4?: string;
    cardNetwork?: string;
    counterBranch?: string;
  };
  status: 'success' | 'failed';
  failureReason?: string;
  transactionTimestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    bookingId: { type: String, required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['upi', 'card', 'counter'], required: true },
    details: {
      upiId: { type: String },
      cardLast4: { type: String },
      cardNetwork: { type: String },
      counterBranch: { type: String },
    },
    status: { type: String, enum: ['success', 'failed'], default: 'success' },
    failureReason: { type: String },
    transactionTimestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
