import mongoose, { Schema, Document } from 'mongoose';

export interface ICinema extends Document {
  name: string;
  city: string;
  address: string;
  facilities: string[];
  totalScreens: number;
  createdAt: Date;
  updatedAt: Date;
}

const CinemaSchema = new Schema<ICinema>(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    address: { type: String, required: true },
    facilities: [{ type: String }],
    totalScreens: { type: Number, default: 3 },
  },
  { timestamps: true }
);

export const Cinema = mongoose.models.Cinema || mongoose.model<ICinema>('Cinema', CinemaSchema);
