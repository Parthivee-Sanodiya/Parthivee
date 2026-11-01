import React from 'react';
import { Film, ShieldCheck, Heart, Sparkles, MapPin, Phone, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-neutral-800 bg-neutral-950 pt-16 pb-12 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-850">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-rose-950/50">
                <Film className="w-4 h-4" />
              </div>
              <span className="font-heading font-black text-2xl tracking-tight text-white">
                I<span className="text-rose-500">Movies</span>
              </span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Your premier gateway to extraordinary cinema experiences. Real-time seat allocation,
              multiplex scheduling, instant digital e-tickets, and verified booking management.
            </p>

            <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-200 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Academic MERN Showcase Project</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Connected to real MongoDB instance. Payments are in demo mode for academic evaluation.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('movies')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Now Showing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('movies')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Upcoming Releases
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cinemas')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Cinema Multiplexes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-bookings')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  My E-Tickets
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  About the Platform
                </button>
              </li>
            </ul>
          </div>

          {/* Multiplex Partners */}
          <div>
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-4">
              Cinema Formats
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>IMAX 3D with Commercial Laser</li>
              <li>Dolby Atmos 64-Channel Sound</li>
              <li>4DX Sensory Motion Seats</li>
              <li>VIP Gold Class & Recliners</li>
              <li>In-Seat Gourmet Dining</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-4">
              Support & Desk
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-rose-500" />
                <span>support@imovies.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-rose-500" />
                <span>+91 1800 200 4668 (Toll Free)</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Mumbai · Delhi NCR · Bengaluru</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} IMovies Cinema Systems. Built with MERN Stack.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>MongoDB Database Connected</span>
            <span aria-hidden="true">·</span>
            <span>REST API Verified</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-400 font-medium">Demo Payment Gateway</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
