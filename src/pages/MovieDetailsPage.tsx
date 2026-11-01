import React, { useState, useEffect } from 'react';
import {
  Film,
  Star,
  Play,
  Clock,
  Calendar,
  MapPin,
  ChevronRight,
  Ticket,
  Sparkles,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { Movie, Showtime, Cinema } from '../types/index.ts';
import { api } from '../services/api.ts';

interface MovieDetailsPageProps {
  movie: Movie;
  onBack: () => void;
  onSelectShowtime: (showtimeId: string) => void;
  onWatchTrailer: (title: string, trailerUrl: string) => void;
}

export const MovieDetailsPage: React.FC<MovieDetailsPageProps> = ({
  movie,
  onBack,
  onSelectShowtime,
  onWatchTrailer,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<{ dateStr: string; dayLabel: string; dateNum: string; monthLabel: string }[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState<boolean>(true);
  const [selectedFormat, setSelectedFormat] = useState<string>('All');

  // Generate next 4 calendar booking days
  useEffect(() => {
    const dates = [];
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      dates.push({
        dateStr: iso,
        dayLabel: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()],
        dateNum: d.getDate().toString().padStart(2, '0'),
        monthLabel: months[d.getMonth()],
      });
    }

    setAvailableDates(dates);
    if (dates.length > 0) {
      setSelectedDate(dates[0].dateStr);
    }
  }, []);

  // Fetch showtimes for this movie & date
  useEffect(() => {
    if (!selectedDate || !movie._id) return;

    let isMounted = true;
    setLoadingShowtimes(true);

    api
      .getShowtimes({ movieId: movie._id, date: selectedDate })
      .then((res) => {
        if (!isMounted) return;
        if (res.success) {
          setShowtimes(res.showtimes);
        }
      })
      .catch((err) => console.error('Error fetching movie showtimes:', err))
      .finally(() => {
        if (isMounted) setLoadingShowtimes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [movie._id, selectedDate]);

  // Group showtimes by cinema
  const showtimesByCinema = showtimes.reduce<Record<string, { cinema: Cinema; slots: Showtime[] }>>((acc, st) => {
    const cid = (st.cinema as any)._id || st.cinema;
    if (!acc[cid]) {
      acc[cid] = {
        cinema: st.cinema as Cinema,
        slots: [],
      };
    }

    if (selectedFormat === 'All' || st.format.toLowerCase().includes(selectedFormat.toLowerCase())) {
      acc[cid].slots.push(st);
    }

    return acc;
  }, {});

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-12 pb-24">
      {/* 1. Backdrop Hero Banner */}
      <div className="relative w-full min-h-[440px] md:min-h-[500px] flex items-end overflow-hidden border-b border-neutral-800">
        <div className="absolute inset-0 z-0">
          <img
            src={movie.banner || movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-transparent" />
        </div>

        {/* Back navigation button */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/80 hover:bg-neutral-800 backdrop-blur-md text-neutral-300 hover:text-white rounded-lg text-xs font-semibold border border-neutral-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Movies</span>
          </button>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-end">
            {/* Movie Poster */}
            <div className="w-36 sm:w-48 shrink-0 rounded-2xl overflow-hidden border border-neutral-700/80 shadow-2xl bg-neutral-900">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
              />
            </div>

            {/* Movie Title & Info */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                <span className="text-rose-500 font-bold uppercase tracking-wider">
                  {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                </span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span>{movie.certificate}</span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span>{formatDuration(movie.duration)}</span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span>{movie.language.join(', ')}</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                {movie.title}
              </h1>

              {/* Rating, Votes & Genres */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-neutral-900/90 px-3 py-1 rounded-lg border border-neutral-800 text-xs">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{movie.rating.toFixed(1)} / 10</span>
                  <span className="text-neutral-400 font-normal">({movie.votes.toLocaleString()} votes)</span>
                </div>

                <div className="text-xs text-neutral-300 font-medium bg-neutral-900/90 px-3 py-1 rounded-lg border border-neutral-800">
                  {movie.genre.join(', ')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                {movie.trailerUrl && (
                  <button
                    onClick={() => onWatchTrailer(movie.title, movie.trailerUrl)}
                    className="py-2.5 px-4 bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700/80 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-rose-500" />
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Movie Synopsis & Cast Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Synopsis */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-heading text-lg font-bold text-white">About the Movie</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">{movie.description}</p>

            <div className="pt-4 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-neutral-500 block uppercase font-bold text-[10px] tracking-wider mb-0.5">
                  Directed By
                </span>
                <span className="text-white font-medium">{movie.director}</span>
              </div>
              <div>
                <span className="text-neutral-500 block uppercase font-bold text-[10px] tracking-wider mb-0.5">
                  Release Date
                </span>
                <span className="text-white font-medium">{movie.releaseDate}</span>
              </div>
            </div>

            {/* Cast List */}
            <div className="pt-4 border-t border-neutral-800">
              <span className="text-neutral-500 block uppercase font-bold text-[10px] tracking-wider mb-2">
                Starring Cast
              </span>
              <div className="flex flex-wrap gap-2">
                {movie.cast.map((actor) => (
                  <span
                    key={actor}
                    className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-lg text-xs font-medium"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Specifications Box */}
          <div className="p-6 bg-neutral-900/60 border border-neutral-800 rounded-2xl space-y-4 h-fit">
            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
              <Info className="w-4 h-4" />
              <span>Cinema Guidelines</span>
            </div>
            <ul className="space-y-2.5 text-xs text-neutral-400 leading-relaxed">
              <li>• Mobile tickets with verifiable QR code are accepted at all partner multiplexes.</li>
              <li>• Outside food & beverages are strictly prohibited inside the auditoriums.</li>
              <li>• Real-time atomic seat locks hold your chosen seats for 8 minutes during checkout.</li>
              <li>• Full or 80% refund available according to transparent cancellation policy.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Cinema & Showtime Booking Selector */}
      {movie.status === 'now_showing' ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-6 sm:p-8 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
              <div>
                <span className="text-rose-500 text-xs font-bold uppercase tracking-wider block mb-1">
                  Select Showtime
                </span>
                <h2 className="font-heading text-2xl font-black text-white">
                  Book Seats in Real-Time
                </h2>
              </div>

              {/* Format Filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-400 font-medium">Format:</span>
                {['All', 'IMAX', 'Dolby Atmos', '2D'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                      selectedFormat === fmt
                        ? 'bg-rose-600 text-white'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection Carousel */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {availableDates.map((item) => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`flex flex-col items-center justify-center min-w-[76px] py-3 px-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-950/60 scale-102'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {item.dayLabel}
                    </span>
                    <span className="font-heading text-xl font-black my-0.5">{item.dateNum}</span>
                    <span className="text-[10px] font-medium">{item.monthLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Cinema Listings with Showtimes */}
            <div className="space-y-6 pt-2">
              {loadingShowtimes ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-neutral-400">Loading cinema auditoriums & schedules...</p>
                </div>
              ) : Object.keys(showtimesByCinema).length > 0 ? (
                Object.values(showtimesByCinema).map(({ cinema, slots }) => {
                  if (slots.length === 0) return null;
                  return (
                    <div
                      key={cinema._id}
                      className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4"
                    >
                      {/* Cinema Title & Amenities */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-850 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-heading text-base font-bold text-white">
                              {cinema.name}
                            </h3>
                            <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                              {cinema.city}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                            <span>{cinema.address}</span>
                          </p>
                        </div>

                        {/* Facilities tags unboxed */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-400">
                          {cinema.facilities.slice(0, 3).map((f) => (
                            <span key={f} className="text-neutral-400">
                              {f} ·
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Showtime Slots */}
                      <div className="flex flex-wrap gap-3 pt-1">
                        {slots.map((slot) => (
                          <button
                            key={slot._id}
                            onClick={() => onSelectShowtime(slot._id)}
                            className="group flex flex-col items-center p-3 bg-neutral-900 hover:bg-rose-950/30 border border-neutral-800 hover:border-rose-500/80 rounded-xl transition-all cursor-pointer min-w-[124px] text-left"
                          >
                            <span className="font-heading text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                              {slot.startTime}
                            </span>
                            <span className="text-[10px] font-semibold text-neutral-400 mt-0.5">
                              {slot.format}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-medium mt-1">
                              From ₹{slot.pricing.executive}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-neutral-950 rounded-2xl border border-neutral-800">
                  <Clock className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">
                    No showtimes currently scheduled for {selectedDate}. Please select another date.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-3xl text-center max-w-xl mx-auto">
            <Calendar className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Coming Soon to IMovies Multiplexes</h3>
            <p className="text-xs text-neutral-400 mb-6">
              This film is scheduled for release on {movie.releaseDate}. Advance ticket booking opens 5 days prior to release.
            </p>
            <button
              onClick={() => onWatchTrailer(movie.title, movie.trailerUrl)}
              className="py-2.5 px-6 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-950/60 inline-flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Official Trailer</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
