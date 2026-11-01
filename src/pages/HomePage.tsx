import React, { useState } from 'react';
import { Film, Play, Ticket, Star, Sparkles, Shield, Clock, Award, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { Movie } from '../types/index.ts';
import { MovieCard } from '../components/MovieCard.tsx';

interface HomePageProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onWatchTrailer: (title: string, trailerUrl: string) => void;
  onNavigate: (view: string, param?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  movies,
  onSelectMovie,
  onWatchTrailer,
  onNavigate,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const featuredMovie = movies.find((m) => m.featured) || movies[0];
  const nowShowing = movies.filter((m) => m.status === 'now_showing');
  const comingSoon = movies.filter((m) => m.status === 'coming_soon');

  const genres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Comedy', 'Thriller', 'Adventure'];

  const filteredNowShowing = selectedGenre === 'All'
    ? nowShowing
    : nowShowing.filter((m) => m.genre.some((g) => g.toLowerCase() === selectedGenre.toLowerCase()));

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Cinematic Hero Section */}
      {featuredMovie && (
        <section className="relative w-full min-h-[580px] lg:min-h-[640px] flex items-end overflow-hidden border-b border-neutral-800">
          {/* Backdrop Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={featuredMovie.banner}
              alt={featuredMovie.title}
              className="w-full h-full object-cover object-center filter brightness-60"
            />
            {/* Gradient Mask for high contrast typography */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
            <div className="max-w-2xl space-y-4">
              {/* Unboxed Metadata Header */}
              <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
                <span className="text-rose-500 font-bold uppercase tracking-wider">Spotlight Premiere</span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span>{featuredMovie.certificate}</span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span>{featuredMovie.genre.join(', ')}</span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span>{Math.floor(featuredMovie.duration / 60)}h {featuredMovie.duration % 60}m</span>
              </div>

              {/* Title */}
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                {featuredMovie.title}
              </h1>

              {/* Rating & Languages */}
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-neutral-900/90 backdrop-blur-md px-3 py-1 rounded-lg border border-neutral-800">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{featuredMovie.rating.toFixed(1)}</span>
                  <span className="text-xs text-neutral-400 font-normal">
                    ({featuredMovie.votes.toLocaleString()} votes)
                  </span>
                </div>
                <span className="text-xs text-neutral-300 bg-neutral-900/90 backdrop-blur-md px-3 py-1 rounded-lg border border-neutral-800">
                  {featuredMovie.language.join(', ')}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-300 line-clamp-3 leading-relaxed max-w-xl">
                {featuredMovie.description}
              </p>

              {/* Cast & Director unboxed info */}
              <div className="text-xs text-neutral-400 pt-1">
                <span className="text-neutral-200 font-medium">Starring:</span>{' '}
                {featuredMovie.cast.slice(0, 3).join(', ')}
              </div>

              {/* Action CTAs */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onSelectMovie(featuredMovie)}
                  className="py-3 px-6 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-rose-950/60 flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book Tickets Now</span>
                </button>

                {featuredMovie.trailerUrl && (
                  <button
                    onClick={() => onWatchTrailer(featuredMovie.title, featuredMovie.trailerUrl)}
                    className="py-3 px-5 bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700/80 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md"
                  >
                    <Play className="w-4 h-4 fill-current text-rose-500" />
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Now Showing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Film className="w-3.5 h-3.5" />
              <span>In Cinemas Now</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              Now Showing
            </h2>
          </div>

          {/* Interactive Genre Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedGenre === genre
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        {filteredNowShowing.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredNowShowing.map((movie) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                onSelectMovie={onSelectMovie}
                onWatchTrailer={onWatchTrailer}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-neutral-900/40 rounded-2xl border border-neutral-800">
            <Film className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm text-neutral-400">No movies found in "{selectedGenre}" genre.</p>
            <button
              onClick={() => setSelectedGenre('All')}
              className="mt-3 px-4 py-2 bg-neutral-800 text-white rounded-lg text-xs font-medium hover:bg-neutral-700"
            >
              Reset Genre Filter
            </button>
          </div>
        )}
      </section>

      {/* 3. Why Choose IMovies? Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 bg-gradient-to-b from-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-3xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-rose-500 text-xs font-bold uppercase tracking-wider block mb-1">
              Elevated Cinema Standards
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              Why Book With IMovies?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              Engineered for seamless seat reservation, zero-latency atomic holds, and instant verified mobile entry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-neutral-900/80 border border-neutral-800/80 rounded-2xl hover:border-neutral-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/30">
                <Ticket className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">Instant Digital E-Ticket</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Receive verifiable QR-code digital boarding passes ready for smartphone box office scanning.
              </p>
            </div>

            <div className="p-5 bg-neutral-900/80 border border-neutral-800/80 rounded-2xl hover:border-neutral-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">Live Atomic Seat Hold</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Real-time 8-minute temporary holds prevent double bookings and guarantee your exact chosen seats.
              </p>
            </div>

            <div className="p-5 bg-neutral-900/80 border border-neutral-800/80 rounded-2xl hover:border-neutral-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/30">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">IMAX & Dolby Atmos</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Filter by premier exhibition formats including Commercial Laser IMAX, 4DX, and Gold Class Recliners.
              </p>
            </div>

            <div className="p-5 bg-neutral-900/80 border border-neutral-800/80 rounded-2xl hover:border-neutral-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">Guaranteed Cancellation</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Transparent cancellation policy with instant seat release back to the auditorium and refund tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Coming Soon Section */}
      {comingSoon.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upcoming Releases</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                Coming Soon
              </h2>
            </div>

            <button
              onClick={() => onNavigate('movies')}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Explore All Upcoming</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {comingSoon.map((movie) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                onSelectMovie={onSelectMovie}
                onWatchTrailer={onWatchTrailer}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. Customer Testimonials / Real Cinema Community */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-rose-500 text-xs font-bold uppercase tracking-wider block mb-1">
            Audience Reviews
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Loved by Movie Lovers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              "The interactive seat selection on IMovies is ridiculously smooth. You can see exact row spacing,
              and the digital QR pass opened right up at the PVR Palladium usher scanner."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-neutral-800">
              <div className="w-8 h-8 rounded-full bg-rose-600/30 text-rose-400 flex items-center justify-center font-bold text-xs">
                R
              </div>
              <div>
                <p className="text-xs font-bold text-white">Rahul Deshmukh</p>
                <p className="text-[10px] text-neutral-400">Mumbai Cinema Club</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              "Seat holds prevent the usual frustration when two friends are deciding on seats simultaneously.
              The demo checkout and instant e-ticket generation worked flawlessly."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-neutral-800">
              <div className="w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                K
              </div>
              <div>
                <p className="text-xs font-bold text-white">Kavita Swaminathan</p>
                <p className="text-[10px] text-neutral-400">Bengaluru Cinephile</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              "Clean cinematic dark mode, comprehensive details about directors, cast, and sound systems.
              Easily the cleanest ticket booking experience I have tested."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-neutral-800">
              <div className="w-8 h-8 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div>
                <p className="text-xs font-bold text-white">Amanpreet Singh</p>
                <p className="text-[10px] text-neutral-400">Delhi NCR</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
