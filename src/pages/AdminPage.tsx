import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Film,
  Users,
  Ticket,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Movie, Cinema, Screen, Showtime, Booking, User as UserType } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

export const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'movies' | 'showtimes' | 'bookings' | 'users'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Movie Modal state
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    poster: '',
    banner: '',
    description: '',
    genre: 'Action, Thriller',
    duration: 150,
    releaseDate: '2026-05-15',
    language: 'Hindi, English',
    director: '',
    cast: '',
    rating: 8.5,
    certificate: 'U/A 16+',
    trailerUrl: '',
    status: 'now_showing',
  });

  // Showtime Modal state
  const [showShowtimeModal, setShowShowtimeModal] = useState(false);
  const [showtimeForm, setShowtimeForm] = useState({
    movieId: '',
    cinemaId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '07:30 PM',
    format: 'IMAX 3D Laser',
    executivePrice: 240,
    clubPrice: 380,
    reclinerPrice: 580,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, moviesRes, cinemasRes, bookingsRes, usersRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getMovies(),
        api.getCinemas(),
        api.getAdminBookings(),
        api.getAdminUsers(),
      ]);

      if (dashRes.success) {
        setStats(dashRes.stats);
        setRecentBookings(dashRes.recentBookings || []);
      }
      if (moviesRes.success) setMovies(moviesRes.movies || []);
      if (cinemasRes.success) setCinemas(cinemasRes.cinemas || []);
      if (bookingsRes.success) setAllBookings(bookingsRes.bookings || []);
      if (usersRes.success) setUsersList(usersRes.users || []);
    } catch (err: any) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const handleReseed = async () => {
    if (!window.confirm('Reset and re-seed database with default cinema dataset?')) return;
    try {
      setLoading(true);
      const res = await api.reseedDatabase();
      if (res.success) {
        setActionMsg({ type: 'success', text: res.message });
        await loadData();
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to reseed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddMovie = () => {
    setEditingMovie(null);
    setMovieForm({
      title: '',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
      banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      description: '',
      genre: 'Action, Sci-Fi',
      duration: 155,
      releaseDate: new Date().toISOString().split('T')[0],
      language: 'Hindi, English',
      director: '',
      cast: '',
      rating: 8.5,
      certificate: 'U/A 16+',
      trailerUrl: '',
      status: 'now_showing',
    });
    setShowMovieModal(true);
  };

  const handleOpenEditMovie = (m: Movie) => {
    setEditingMovie(m);
    setMovieForm({
      title: m.title,
      poster: m.poster,
      banner: m.banner,
      description: m.description,
      genre: m.genre.join(', '),
      duration: m.duration,
      releaseDate: m.releaseDate,
      language: m.language.join(', '),
      director: m.director,
      cast: m.cast.join(', '),
      rating: m.rating,
      certificate: m.certificate,
      trailerUrl: m.trailerUrl || '',
      status: m.status,
    });
    setShowMovieModal(true);
  };

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg(null);

    const payload = {
      ...movieForm,
      genre: movieForm.genre.split(',').map((s) => s.trim()).filter(Boolean),
      language: movieForm.language.split(',').map((s) => s.trim()).filter(Boolean),
      cast: movieForm.cast.split(',').map((s) => s.trim()).filter(Boolean),
      duration: Number(movieForm.duration),
      rating: Number(movieForm.rating),
    };

    try {
      if (editingMovie) {
        await api.updateMovie(editingMovie._id, payload);
        setActionMsg({ type: 'success', text: `Movie "${movieForm.title}" updated successfully.` });
      } else {
        await api.createMovie(payload);
        setActionMsg({ type: 'success', text: `Movie "${movieForm.title}" added to catalogue.` });
      }
      setShowMovieModal(false);
      await loadData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to save movie.' });
    }
  };

  const handleDeleteMovie = async (id: string, title: string) => {
    if (!window.confirm(`Delete movie "${title}" from catalogue?`)) return;
    try {
      await api.deleteMovie(id);
      setActionMsg({ type: 'success', text: `Movie "${title}" removed.` });
      await loadData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to delete movie.' });
    }
  };

  const handleCreateShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg(null);

    if (!showtimeForm.movieId || !showtimeForm.cinemaId) {
      setActionMsg({ type: 'error', text: 'Please select both a movie and a cinema.' });
      return;
    }

    try {
      const cinemaDetails = await api.getCinema(showtimeForm.cinemaId);
      const screens = cinemaDetails.screens || [];
      const firstScreen = screens[0];

      if (!firstScreen) {
        throw new Error('This cinema has no configured screens.');
      }

      const movieObj = movies.find((m) => m._id === showtimeForm.movieId);

      await api.createShowtime({
        movie: showtimeForm.movieId,
        cinema: showtimeForm.cinemaId,
        screen: firstScreen._id,
        date: showtimeForm.date,
        startTime: showtimeForm.startTime,
        format: showtimeForm.format,
        language: movieObj?.language?.[0] || 'Hindi',
        pricing: {
          executive: Number(showtimeForm.executivePrice),
          club: Number(showtimeForm.clubPrice),
          recliner: Number(showtimeForm.reclinerPrice),
        },
        bookedSeats: [],
        isActive: true,
      });

      setActionMsg({ type: 'success', text: 'New showtime scheduled successfully in auditorium!' });
      setShowShowtimeModal(false);
      await loadData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to schedule showtime.' });
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="font-heading text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-neutral-400">
          You must be logged in as an authorized IMovies administrator to view this control center.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-24">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>IMovies Administrative Control</span>
          </div>
          <h1 className="font-heading text-3xl font-black text-white">
            Admin Management Center
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Logged in as <strong>{user?.name}</strong> ({user?.email})
          </p>
        </div>

        {/* Global quick actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReseed}
            className="py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            title="Reset sample database to default seed state"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Database Seed</span>
          </button>

          <button
            onClick={loadData}
            className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
            actionMsg.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800 text-rose-300'
          }`}
        >
          {actionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex p-1 bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'overview' ? 'bg-rose-600 text-white shadow' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Analytics Overview
        </button>
        <button
          onClick={() => setActiveTab('movies')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'movies' ? 'bg-rose-600 text-white shadow' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Movies Catalogue ({movies.length})
        </button>
        <button
          onClick={() => setActiveTab('showtimes')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'showtimes' ? 'bg-rose-600 text-white shadow' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Showtimes Scheduler
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'bookings' ? 'bg-rose-600 text-white shadow' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Platform Bookings ({allBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'users' ? 'bg-rose-600 text-white shadow' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Registered Users ({usersList.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-semibold uppercase">Total Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="font-heading text-3xl font-black text-white">
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-[11px] text-neutral-400">
                {stats.confirmedCount} confirmed ticket bookings
              </p>
            </div>

            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-semibold uppercase">Tickets Sold</span>
                <Ticket className="w-4 h-4 text-rose-500" />
              </div>
              <p className="font-heading text-3xl font-black text-white">
                {stats.totalTicketsSold}
              </p>
              <p className="text-[11px] text-neutral-400">
                Across {stats.totalCinemas} partner multiplexes
              </p>
            </div>

            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-semibold uppercase">Active Movies</span>
                <Film className="w-4 h-4 text-rose-400" />
              </div>
              <p className="font-heading text-3xl font-black text-white">
                {stats.activeMovies} / {stats.totalMovies}
              </p>
              <p className="text-[11px] text-neutral-400">
                {stats.totalMovies - stats.activeMovies} coming soon releases
              </p>
            </div>

            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-semibold uppercase">Registered Users</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <p className="font-heading text-3xl font-black text-white">
                {stats.totalUsers}
              </p>
              <p className="text-[11px] text-neutral-400">
                Stored in MongoDB users collection
              </p>
            </div>
          </div>

          {/* Recent Bookings Activity */}
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4">
            <h3 className="font-heading text-base font-bold text-white">
              Recent Transactions & Admissions
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-500 uppercase text-[10px]">
                    <th className="pb-3">Booking ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Movie</th>
                    <th className="pb-3">Cinema</th>
                    <th className="pb-3">Seats</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850">
                  {recentBookings.map((b) => (
                    <tr key={b._id} className="text-neutral-300">
                      <td className="py-3 font-mono font-bold text-white">#{b.bookingId}</td>
                      <td className="py-3">{b.user?.name || b.customerDetails?.name || 'Customer'}</td>
                      <td className="py-3 font-medium text-white">{b.movie?.title}</td>
                      <td className="py-3">{b.cinema?.name}</td>
                      <td className="py-3 font-mono text-rose-400">{b.seatNumbers?.join(', ')}</td>
                      <td className="py-3 font-bold text-white">₹{b.totalAmount}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            b.bookingStatus === 'confirmed'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Movies Management */}
      {activeTab === 'movies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-white">All Movies in Catalogue</h3>
            <button
              onClick={handleOpenAddMovie}
              className="py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-950 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Movie</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.map((m) => (
              <div
                key={m._id}
                className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex gap-4 items-center justify-between"
              >
                <div className="flex gap-3 items-center">
                  <img
                    src={m.poster}
                    alt={m.title}
                    className="w-14 h-20 object-cover rounded-xl border border-neutral-800 shrink-0"
                  />
                  <div>
                    <h4 className="font-heading text-sm font-bold text-white line-clamp-1">
                      {m.title}
                    </h4>
                    <p className="text-xs text-neutral-400">{m.genre.slice(0, 2).join(', ')}</p>
                    <p className="text-[11px] text-rose-400 font-semibold mt-1">
                      {m.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEditMovie(m)}
                    className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
                    title="Edit Movie"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMovie(m._id, m.title)}
                    className="p-2 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 rounded-lg cursor-pointer"
                    title="Delete Movie"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Showtimes Scheduler */}
      {activeTab === 'showtimes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-white">Auditorium Showtime Schedules</h3>
              <p className="text-xs text-neutral-400">Schedule new screenings across multiplexes</p>
            </div>
            <button
              onClick={() => setShowShowtimeModal(true)}
              className="py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-950 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Showtime</span>
            </button>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Active Cinema Screens & Formats
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cinemas.map((c) => (
                <div key={c._id} className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                  <p className="font-bold text-white text-sm">{c.name}</p>
                  <p className="text-xs text-neutral-400">{c.city}</p>
                  <div className="text-[11px] text-rose-400 pt-1">
                    {c.facilities.slice(0, 3).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Platform Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <h3 className="font-heading text-lg font-bold text-white">All Platform Bookings</h3>
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 uppercase text-[10px]">
                  <th className="pb-3">Booking ID</th>
                  <th className="pb-3">User / Customer</th>
                  <th className="pb-3">Movie</th>
                  <th className="pb-3">Cinema / Screen</th>
                  <th className="pb-3">Seats</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {allBookings.map((b) => (
                  <tr key={b._id} className="text-neutral-300">
                    <td className="py-3 font-mono font-bold text-white">#{b.bookingId}</td>
                    <td className="py-3">
                      <p className="font-medium text-white">{b.user?.name || b.customerDetails?.name}</p>
                      <p className="text-[10px] text-neutral-500">{b.user?.email || b.customerDetails?.email}</p>
                    </td>
                    <td className="py-3 font-medium text-white">{b.movie?.title}</td>
                    <td className="py-3">{b.cinema?.name}</td>
                    <td className="py-3 font-mono text-rose-400 font-bold">{b.seatNumbers?.join(', ')}</td>
                    <td className="py-3 font-bold text-white">₹{b.totalAmount}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.bookingStatus === 'confirmed'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="py-3 text-[11px] text-neutral-400">
                      {new Date(b.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Users */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="font-heading text-lg font-bold text-white">Registered Users in MongoDB</h3>
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 uppercase text-[10px]">
                  <th className="pb-3">Full Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Mobile</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {usersList.map((u) => (
                  <tr key={u.id} className="text-neutral-300">
                    <td className="py-3 font-bold text-white">{u.name}</td>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3 font-mono">{u.mobile}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-neutral-500 text-[11px]">Member</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Movie */}
      {showMovieModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <h3 className="font-heading text-xl font-bold text-white">
              {editingMovie ? 'Edit Movie' : 'Add New Movie to IMovies'}
            </h3>

            <form onSubmit={handleSaveMovie} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Movie Title</label>
                  <input
                    type="text"
                    required
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Poster URL</label>
                  <input
                    type="url"
                    required
                    value={movieForm.poster}
                    onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Banner Backdrop URL</label>
                  <input
                    type="url"
                    required
                    value={movieForm.banner}
                    onChange={(e) => setMovieForm({ ...movieForm, banner: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Description / Synopsis</label>
                  <textarea
                    required
                    rows={3}
                    value={movieForm.description}
                    onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    required
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Languages (comma separated)</label>
                  <input
                    type="text"
                    required
                    value={movieForm.language}
                    onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Director</label>
                  <input
                    type="text"
                    required
                    value={movieForm.director}
                    onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Cast (comma separated)</label>
                  <input
                    type="text"
                    required
                    value={movieForm.cast}
                    onChange={(e) => setMovieForm({ ...movieForm, cast: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    required
                    value={movieForm.duration}
                    onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Status</label>
                  <select
                    value={movieForm.status}
                    onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Rating (e.g. 8.6)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={movieForm.rating}
                    onChange={(e) => setMovieForm({ ...movieForm, rating: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Trailer YouTube URL</label>
                  <input
                    type="url"
                    value={movieForm.trailerUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowMovieModal(false)}
                  className="py-2 px-4 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-950 cursor-pointer"
                >
                  Save Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Showtime */}
      {showShowtimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-heading text-xl font-bold text-white">Create New Showtime</h3>

            <form onSubmit={handleCreateShowtime} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Movie</label>
                <select
                  required
                  value={showtimeForm.movieId}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="">Select Movie...</option>
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Cinema Multiplex</label>
                <select
                  required
                  value={showtimeForm.cinemaId}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, cinemaId: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="">Select Cinema...</option>
                  {cinemas.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={showtimeForm.date}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, date: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    placeholder="07:30 PM"
                    value={showtimeForm.startTime}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, startTime: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Projection Format</label>
                <select
                  value={showtimeForm.format}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, format: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="IMAX 3D Laser">IMAX 3D Laser</option>
                  <option value="Dolby Atmos 2D">Dolby Atmos 2D</option>
                  <option value="4DX Motion">4DX Motion</option>
                  <option value="2D Digital">2D Digital</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Executive (₹)</label>
                  <input
                    type="number"
                    value={showtimeForm.executivePrice}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, executivePrice: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Club (₹)</label>
                  <input
                    type="number"
                    value={showtimeForm.clubPrice}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, clubPrice: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Recliner (₹)</label>
                  <input
                    type="number"
                    value={showtimeForm.reclinerPrice}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, reclinerPrice: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowShowtimeModal(false)}
                  className="py-2 px-4 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-950 cursor-pointer"
                >
                  Schedule Showtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
