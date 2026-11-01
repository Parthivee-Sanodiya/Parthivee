const BASE_URL = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('imovies_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('imovies_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('imovies_token');
}

export function getSessionId(): string {
  let id = sessionStorage.getItem('imovies_session_id');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    sessionStorage.setItem('imovies_session_id', id);
  }
  return id;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (payload: { name: string; email: string; mobile: string; password: string; confirmPassword?: string }) =>
    request<{ success: boolean; token: string; user: any; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ success: boolean; user: any }>('/auth/me'),

  updateProfile: (data: { name?: string; mobile?: string }) =>
    request<{ success: boolean; user: any; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Movies
  getMovies: (params?: { status?: string; genre?: string; language?: string; search?: string; sort?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.genre) searchParams.set('genre', params.genre);
    if (params?.language) searchParams.set('language', params.language);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sort) searchParams.set('sort', params.sort);

    const qs = searchParams.toString();
    return request<{ success: boolean; count: number; movies: any[] }>(`/movies${qs ? `?${qs}` : ''}`);
  },

  getMovie: (id: string) => request<{ success: boolean; movie: any }>(`/movies/${id}`),

  createMovie: (data: any) =>
    request<{ success: boolean; movie: any; message: string }>('/movies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMovie: (id: string, data: any) =>
    request<{ success: boolean; movie: any; message: string }>(`/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMovie: (id: string) =>
    request<{ success: boolean; message: string }>(`/movies/${id}`, {
      method: 'DELETE',
    }),

  // Cinemas
  getCinemas: (city?: string) => {
    const qs = city && city !== 'All' ? `?city=${encodeURIComponent(city)}` : '';
    return request<{ success: boolean; count: number; cinemas: any[] }>(`/cinemas${qs}`);
  },

  getCinema: (id: string) => request<{ success: boolean; cinema: any; screens: any[] }>(`/cinemas/${id}`),

  // Showtimes
  getShowtimes: (params?: { movieId?: string; cinemaId?: string; date?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.movieId) searchParams.set('movieId', params.movieId);
    if (params?.cinemaId) searchParams.set('cinemaId', params.cinemaId);
    if (params?.date) searchParams.set('date', params.date);

    const qs = searchParams.toString();
    return request<{ success: boolean; count: number; showtimes: any[] }>(`/showtimes${qs ? `?${qs}` : ''}`);
  },

  getShowtime: (id: string) => request<{ success: boolean; showtime: any }>(`/showtimes/${id}`),

  createShowtime: (data: any) =>
    request<{ success: boolean; showtime: any; message: string }>('/showtimes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteShowtime: (id: string) =>
    request<{ success: boolean; message: string }>(`/showtimes/${id}`, {
      method: 'DELETE',
    }),

  // Seats & Holds
  getSeats: (showtimeId: string, sessionId: string) =>
    request<{
      success: boolean;
      showtime: any;
      screen: any;
      bookedSeats: string[];
      heldSeats: string[];
      myHeldSeats: string[];
      myHoldExpiresAt: string | null;
    }>(`/seats/${showtimeId}/seats?sessionId=${encodeURIComponent(sessionId)}`),

  holdSeats: (payload: { showtimeId: string; seats: string[]; sessionId: string }) =>
    request<{
      success: boolean;
      message: string;
      holdId: string;
      seats: string[];
      expiresAt: string;
      ttlSeconds: number;
    }>('/seats/hold', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  releaseSeats: (sessionId: string, showtimeId: string) =>
    request<{ success: boolean; message: string }>(`/seats/hold/${sessionId}/${showtimeId}`, {
      method: 'DELETE',
    }),

  // Bookings
  createBooking: (payload: {
    showtimeId: string;
    seats: string[];
    sessionId: string;
    customerDetails: { name: string; email: string; mobile: string };
    paymentMethod: 'upi' | 'card' | 'counter';
    paymentDetails?: any;
    simulateFailure?: boolean;
  }) =>
    request<{ success: boolean; message: string; booking: any }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyBookings: () => request<{ success: boolean; count: number; bookings: any[] }>('/bookings/my-bookings'),

  getBooking: (id: string) => request<{ success: boolean; booking: any }>(`/bookings/${id}`),

  cancelBooking: (id: string, reason?: string) =>
    request<{ success: boolean; message: string; booking: any }>(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  // Admin
  getAdminDashboard: () => request<{ success: boolean; stats: any; recentBookings: any[] }>('/admin/dashboard'),

  getAdminBookings: (params?: { status?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    const qs = searchParams.toString();
    return request<{ success: boolean; count: number; bookings: any[] }>(`/admin/bookings${qs ? `?${qs}` : ''}`);
  },

  getAdminUsers: () => request<{ success: boolean; count: number; users: any[] }>('/admin/users'),

  reseedDatabase: () => request<{ success: boolean; message: string }>('/admin/reseed', { method: 'POST' }),
};
