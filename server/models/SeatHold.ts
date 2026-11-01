import mongoose, { Schema, Document } from 'mongoose';

export interface ISeatHold extends Document {
  showtime: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  sessionId: string;
  seats: string[];
  expiresAt: Date;
  status: 'active' | 'released' | 'converted';
  createdAt: Date;
  updatedAt: Date;
}

const SeatHoldSchema = new Schema<ISeatHold>(
  {
    showtime: { type: Schema.Types.ObjectId, ref: 'Showtime', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String, required: true, index: true },
    seats: [{ type: String, required: true }],
    expiresAt: { type: Date, required: true, index: { expires: '0s' } }, // TTL index automatically expires documents
    status: {
      type: String,
      enum: ['active', 'released', 'converted'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

export const SeatHold = mongoose.models.SeatHold || mongoose.model<ISeatHold>('SeatHold', SeatHoldSchema);
