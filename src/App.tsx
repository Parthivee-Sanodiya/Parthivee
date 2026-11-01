import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { TrailerModal } from './components/TrailerModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { MoviesPage } from './pages/MoviesPage.tsx';
import { MovieDetailsPage } from './pages/MovieDetailsPage.tsx';
import { SeatSelectionPage } from './pages/SeatSelectionPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { TicketPage } from './pages/TicketPage.tsx';
import { MyBookingsPage } from './pages/MyBookingsPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { CinemasPage } from './pages/CinemasPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { Movie, Cinema, Booking } from './types/index.ts';
import { api } from './services/api.ts';

function AppContent() {
  const { isAuthenticated, openAuthModal } = useAuth();

  // Navigation View State
  const [currentView, setCurrentView] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected entities for drill-down views
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  // Global movie and cinema lists
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Trailer modal state
  const [trailerModal, setTrailerModal] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
  }>({
    isOpen: false,
    title: '',
    url: '',
  });

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [moviesRes, cinemasRes] = await Promise.all([
        api.getMovies(),
        api.getCinemas(),
      ]);

      if (moviesRes.success) setMovies(moviesRes.movies || []);
      if (cinemasRes.success) setCinemas(cinemasRes.cinemas || []);
    } catch (err) {
      console.error('Error fetching initial cinema data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleNavigate = (view: string, param?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'movie-details' && param) {
      setSelectedMovie(param);
    }

    if (view === 'seat-selection' && param) {
      setSelectedShowtimeId(param);
    }

    if (view === 'ticket' && param) {
      setCurrentBooking(param);
    }

    if (view === 'my-bookings' && !isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setCurrentView(view);
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    handleNavigate('movie-details', movie);
  };

  const handleSelectShowtime = (showtimeId: string) => {
    setSelectedShowtimeId(showtimeId);
    handleNavigate('seat-selection', showtimeId);
  };

  const handleProceedToCheckout = (data: any) => {
    setCheckoutData(data);
    handleNavigate('checkout');
  };

  const handleBookingSuccess = (booking: Booking) => {
    setCurrentBooking(booking);
    handleNavigate('ticket', booking);
  };

  const handleWatchTrailer = (title: string, trailerUrl: string) => {
    setTrailerModal({
      isOpen: true,
      title,
      url: trailerUrl,
    });
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim() && currentView !== 'movies') {
      setCurrentView('movies');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 selection:bg-rose-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {loading ? (
          <div className="py-32 text-center">
            <div className="w-10 h-10 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs text-neutral-400 font-medium">Connecting to IMovies Cinema Systems...</p>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomePage
                movies={movies}
                onSelectMovie={handleSelectMovie}
                onWatchTrailer={handleWatchTrailer}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'movies' && (
              <MoviesPage
                movies={movies}
                onSelectMovie={handleSelectMovie}
                onWatchTrailer={handleWatchTrailer}
              />
            )}

            {currentView === 'cinemas' && (
              <CinemasPage
                cinemas={cinemas}
                movies={movies}
                onSelectMovie={handleSelectMovie}
              />
            )}

            {currentView === 'movie-details' && selectedMovie && (
              <MovieDetailsPage
                movie={selectedMovie}
                onBack={() => handleNavigate('movies')}
                onSelectShowtime={handleSelectShowtime}
                onWatchTrailer={handleWatchTrailer}
              />
            )}

            {currentView === 'seat-selection' && selectedShowtimeId && (
              <SeatSelectionPage
                showtimeId={selectedShowtimeId}
                onBack={() => {
                  if (selectedMovie) handleNavigate('movie-details', selectedMovie);
                  else handleNavigate('movies');
                }}
                onProceedToCheckout={handleProceedToCheckout}
              />
            )}

            {currentView === 'checkout' && checkoutData && (
              <CheckoutPage
                checkoutData={checkoutData}
                onBack={() => {
                  if (selectedShowtimeId) handleNavigate('seat-selection', selectedShowtimeId);
                  else handleNavigate('home');
                }}
                onBookingSuccess={handleBookingSuccess}
              />
            )}

            {currentView === 'ticket' && currentBooking && (
              <TicketPage
                booking={currentBooking}
                onNavigateHome={() => handleNavigate('home')}
                onNavigateMyBookings={() => handleNavigate('my-bookings')}
              />
            )}

            {currentView === 'my-bookings' && (
              <MyBookingsPage
                onViewTicket={(b) => handleNavigate('ticket', b)}
                onExploreMovies={() => handleNavigate('movies')}
              />
            )}

            {currentView === 'admin' && <AdminPage />}

            {currentView === 'about' && <AboutPage />}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Global Modals */}
      <AuthModal />

      <TrailerModal
        isOpen={trailerModal.isOpen}
        onClose={() => setTrailerModal({ ...trailerModal, isOpen: false })}
        title={trailerModal.title}
        trailerUrl={trailerModal.url}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
