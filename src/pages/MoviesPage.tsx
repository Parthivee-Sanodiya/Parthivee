import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, Film, Star, Calendar } from 'lucide-react';
import { Movie } from '../types/index.ts';
import { MovieCard } from '../components/MovieCard.tsx';

interface MoviesPageProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onWatchTrailer: (title: string, trailerUrl: string) => void;
  initialStatus?: 'now_showing' | 'coming_soon';
}

export const MoviesPage: React.FC<MoviesPageProps> = ({
  movies,
  onSelectMovie,
  onWatchTrailer,
  initialStatus = 'now_showing',
}) => {
  const [statusTab, setStatusTab] = useState<'now_showing' | 'coming_soon'>(initialStatus);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'releaseDate' | 'featured'>('rating');

  const genres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Comedy', 'Thriller', 'Adventure', 'Horror', 'Biography', 'Animation'];
  const languages = ['All', 'Hindi', 'English', 'Telugu', 'Tamil'];

  // Filter movies
  const filteredMovies = movies
    .filter((movie) => movie.status === statusTab)
    .filter((movie) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        movie.title.toLowerCase().includes(q) ||
        movie.cast.some((c) => c.toLowerCase().includes(q)) ||
        movie.director.toLowerCase().includes(q)
      );
    })
    .filter((movie) => {
      if (selectedGenre === 'All') return true;
      return movie.genre.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());
    })
    .filter((movie) => {
      if (selectedLanguage === 'All') return true;
      return movie.language.some((l) => l.toLowerCase() === selectedLanguage.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'releaseDate') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <span className="text-rose-500 text-xs font-bold uppercase tracking-wider block mb-1">
            Cinema Catalogue
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            {statusTab === 'now_showing' ? 'Now Playing in Theatres' : 'Upcoming Blockbuster Premieres'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Showing {filteredMovies.length} movies matching current filters.
          </p>
        </div>

        {/* Status Switch Tabs */}
        <div className="flex p-1 bg-neutral-900 border border-neutral-800 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setStatusTab('now_showing')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              statusTab === 'now_showing'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Now Showing
          </button>
          <button
            onClick={() => setStatusTab('coming_soon')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              statusTab === 'coming_soon'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Coming Soon
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, star, director..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-300 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Language Selector */}
          <div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors cursor-pointer"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  Language: {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors cursor-pointer"
            >
              <option value="rating">Sort: Highest Rating</option>
              <option value="releaseDate">Sort: Release Date</option>
              <option value="featured">Sort: Featured Spotlight</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(search || selectedGenre !== 'All' || selectedLanguage !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedGenre('All');
                setSelectedLanguage('All');
              }}
              className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Genre Tags Horizontal Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-neutral-800/60">
          <span className="text-[11px] uppercase font-bold text-neutral-500 mr-2 shrink-0">Genre:</span>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedGenre === genre
                  ? 'bg-rose-600 text-white font-semibold shadow-sm'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              onSelectMovie={onSelectMovie}
              onWatchTrailer={onWatchTrailer}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-neutral-900/50 rounded-2xl border border-neutral-800">
          <Film className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No movies matched your criteria</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
            Try adjusting your search terms, changing the genre filter, or viewing all languages.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedGenre('All');
              setSelectedLanguage('All');
            }}
            className="py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
