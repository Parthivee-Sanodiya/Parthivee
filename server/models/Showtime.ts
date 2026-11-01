import mongoose, { Schema, Document } from 'mongoose';

export interface IShowtimePricing {
  executive: number;
  club: number;
  recliner: number;
}

export interface IShowtime extends Document {
  movie: mongoose.Types.ObjectId;
  cinema: mongoose.Types.ObjectId;
  screen: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:30 AM", "02:15 PM"
  format: string; // e.g. "IMAX 3D", "Dolby Atmos 2D", "4DX"
  language: string;
  pricing: IShowtimePricing;
  bookedSeats: string[]; // e.g. ["D4", "D5"]
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShowtimeSchema = new Schema<IShowtime>(
  {
    movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    cinema: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true, index: true },
    screen: { type: Schema.Types.ObjectId, ref: 'Screen', required: true },
    date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
    startTime: { type: String, required: true },
    format: { type: String, default: '2D Dolby Atmos' },
    language: { type: String, default: 'Hindi' },
    pricing: {
      executive: { type: Number, required: true, default: 220 },
      club: { type: Number, required: true, default: 320 },
      recliner: { type: Number, required: true, default: 520 },
    },
    bookedSeats: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index for fast schedule lookups
ShowtimeSchema.index({ movie: 1, cinema: 1, date: 1 });

export const Showtime = mongoose.models.Showtime || mongoose.model<IShowtime>('Showtime', ShowtimeSchema);
