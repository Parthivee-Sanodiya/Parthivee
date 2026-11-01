import React, { useState } from 'react';
import { Film, User, ShieldCheck, Ticket, LogOut, Menu, X, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  searchQuery,
  onSearchChange,
}) => {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'movies', label: 'Movies' },
    { id: 'cinemas', label: 'Cinemas' },
    { id: 'my-bookings', label: 'My Bookings', requiresAuth: true },
    { id: 'about', label: 'About Us' },
  ];

  const handleNav = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform duration-200">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-heading font-black text-2xl tracking-tight text-white flex items-center gap-1">
              I<span className="text-rose-500">Movies</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block -mt-1">
              Cinema Booking
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer relative ${
                  isActive
                    ? 'text-rose-500 font-semibold'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-rose-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Search bar & User controls */}
        <div className="flex items-center gap-3">
          {/* Quick Search Input */}
          <div className="hidden lg:flex items-center relative w-56 xl:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search movies, genres..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 text-neutral-500 hover:text-neutral-300 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Admin link badge */}
          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Admin Panel</span>
            </button>
          )}

          {/* Auth Button or Profile */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-medium text-neutral-200 cursor-pointer transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold text-[11px] border border-rose-500/30">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate hidden sm:inline">{user?.name}</span>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-neutral-800">
                    <p className="text-xs font-semibold text-neutral-100">{user?.name}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold tracking-wider uppercase text-rose-400">
                      {user?.role === 'admin' ? 'Administrator' : 'Cinema Member'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleNav('my-bookings')}
                    className="w-full text-left px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2 cursor-pointer"
                  >
                    <Ticket className="w-4 h-4 text-rose-400" />
                    My Bookings & E-Tickets
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleNav('admin')}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-rose-400" />
                      Admin Control Center
                    </button>
                  )}

                  <div className="border-t border-neutral-800 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-rose-950/50 transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950 px-4 pt-3 pb-6 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentView === link.id
                    ? 'bg-rose-600/10 text-rose-500 font-semibold'
                    : 'text-neutral-300 hover:bg-neutral-900'
                }`}
              >
                {link.label}
              </button>
            ))}

            {isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Panel
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
