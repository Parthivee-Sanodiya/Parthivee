import mongoose, { Schema, Document } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  poster: string;
  banner: string;
  description: string;
  genre: string[];
  duration: number; // in minutes
  releaseDate: string;
  language: string[];
  director: string;
  cast: string[];
  rating: number; // e.g. 8.6
  votes: number;
  certificate: string; // e.g. U/A 16+, A, U
  trailerUrl: string;
  status: 'now_showing' | 'coming_soon';
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MovieSchema = new Schema<IMovie>(
  {
    title: { type: String, required: true, trim: true, index: true },
    poster: { type: String, required: true },
    banner: { type: String, required: true },
    description: { type: String, required: true },
    genre: [{ type: String, required: true, index: true }],
    duration: { type: Number, required: true },
    releaseDate: { type: String, required: true },
    language: [{ type: String, required: true, index: true }],
    director: { type: String, required: true },
    cast: [{ type: String, required: true }],
    rating: { type: Number, default: 8.0 },
    votes: { type: Number, default: 1200 },
    certificate: { type: String, default: 'U/A' },
    trailerUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon'],
      default: 'now_showing',
      index: true,
    },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Movie = mongoose.models.Movie || mongoose.model<IMovie>('Movie', MovieSchema);
