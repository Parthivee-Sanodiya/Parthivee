import React, { useState } from 'react';
import { Star, Play, Ticket, Clock, Calendar } from 'lucide-react';
import { Movie } from '../types/index.ts';

interface MovieCardProps {
  movie: Movie;
  onSelectMovie: (movie: Movie) => void;
  onWatchTrailer: (title: string, trailerUrl: string) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onSelectMovie,
  onWatchTrailer,
}) => {
  const [imgError, setImgError] = useState(false);
  const fallbackImg = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="group relative flex flex-col bg-neutral-900 border border-neutral-800/80 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/20">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950">
        <img
          src={imgError ? fallbackImg : movie.poster}
          alt={movie.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Quick hover trailer button */}
        {movie.trailerUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWatchTrailer(movie.title, movie.trailerUrl);
            }}
            className="absolute top-3 right-3 p-2.5 rounded-full bg-neutral-900/80 backdrop-blur-md text-white hover:bg-rose-600 transition-colors shadow-lg cursor-pointer opacity-90 group-hover:opacity-100"
            aria-label="Play trailer"
            title="Watch Trailer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        )}

        {/* Rating and Certificate unboxed bottom metadata */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-neutral-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-800">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{movie.rating.toFixed(1)}</span>
            <span className="text-[10px] text-neutral-400 font-normal">/10</span>
          </div>

          <span className="text-[11px] font-semibold text-neutral-300 bg-neutral-950/80 backdrop-blur-md px-2 py-1 rounded-lg border border-neutral-800">
            {movie.certificate}
          </span>
        </div>
      </div>

      {/* Movie Details Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Metadata: clean unboxed text with typographic separators */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1.5">
            <span>{movie.genre.slice(0, 2).join(' / ')}</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>{movie.language[0]}</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>{formatDuration(movie.duration)}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectMovie(movie)}
            className="font-heading text-base font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-1 cursor-pointer"
            title={movie.title}
          >
            {movie.title}
          </h3>

          <p className="text-xs text-neutral-400 line-clamp-2 mt-1.5 leading-relaxed">
            {movie.description}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4 mt-2 border-t border-neutral-800/60 flex items-center gap-2">
          {movie.status === 'now_showing' ? (
            <button
              onClick={() => onSelectMovie(movie)}
              className="w-full py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-950/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Book Tickets</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectMovie(movie)}
              className="w-full py-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              <span>Releases {movie.releaseDate}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
