import mongoose, { Schema, Document } from 'mongoose';

export interface ISeatConfig {
  row: string;
  number: number;
  id: string; // e.g. "A1"
  type: 'executive' | 'club' | 'recliner';
}

export interface IScreen extends Document {
  cinema: mongoose.Types.ObjectId;
  screenNumber: number;
  screenName: string;
  soundSystem: string;
  projectionType: string;
  totalSeats: number;
  rows: {
    rowName: string;
    type: 'executive' | 'club' | 'recliner';
    seatsCount: number;
    aisleAfter: number[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ScreenSchema = new Schema<IScreen>(
  {
    cinema: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true, index: true },
    screenNumber: { type: Number, required: true },
    screenName: { type: String, required: true },
    soundSystem: { type: String, default: 'Dolby Atmos 7.1' },
    projectionType: { type: String, default: '4K Laser RGB' },
    totalSeats: { type: Number, default: 80 },
    rows: [
      {
        rowName: { type: String, required: true },
        type: { type: String, enum: ['executive', 'club', 'recliner'], required: true },
        seatsCount: { type: Number, required: true },
        aisleAfter: [{ type: Number }],
      },
    ],
  },
  { timestamps: true }
);

export const Screen = mongoose.models.Screen || mongoose.model<IScreen>('Screen', ScreenSchema);
