import React, { useState } from 'react';
import { Building, MapPin, Film, Sparkles, Award } from 'lucide-react';
import { Cinema, Movie } from '../types/index.ts';

interface CinemasPageProps {
  cinemas: Cinema[];
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export const CinemasPage: React.FC<CinemasPageProps> = ({
  cinemas,
  movies,
  onSelectMovie,
}) => {
  const [selectedCity, setSelectedCity] = useState('All');

  const cities = ['All', 'Mumbai', 'Delhi NCR', 'Bengaluru'];

  const filteredCinemas = selectedCity === 'All'
    ? cinemas
    : cinemas.filter((c) => c.city.toLowerCase() === selectedCity.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <span className="text-rose-500 text-xs font-bold uppercase tracking-wider block mb-1">
            Partner Multiplexes
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            Cinemas & Auditoriums
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Certified Dolby Atmos, Commercial Laser IMAX, and VIP Recliner Loungers.
          </p>
        </div>

        {/* City Filter Tabs */}
        <div className="flex p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedCity === city
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Cinema Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCinemas.map((cinema) => (
          <div
            key={cinema._id}
            className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl hover:border-neutral-700 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold">
                  {cinema.city}
                </span>
                <span className="text-xs text-neutral-400">
                  {cinema.totalScreens} Auditoriums
                </span>
              </div>

              <h3 className="font-heading text-lg font-bold text-white">
                {cinema.name}
              </h3>

              <p className="text-xs text-neutral-400 flex items-start gap-1.5 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>{cinema.address}</span>
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-800/80 space-y-3">
              <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider block">
                Amenities & Standards
              </span>
              <div className="flex flex-wrap gap-1.5">
                {cinema.facilities.map((fac) => (
                  <span
                    key={fac}
                    className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-lg text-[11px]"
                  >
                    {fac}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
