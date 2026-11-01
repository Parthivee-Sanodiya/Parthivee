export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'user' | 'admin';
}

export interface Movie {
  _id: string;
  title: string;
  poster: string;
  banner: string;
  description: string;
  genre: string[];
  duration: number;
  releaseDate: string;
  language: string[];
  director: string;
  cast: string[];
  rating: number;
  votes: number;
  certificate: string;
  trailerUrl: string;
  status: 'now_showing' | 'coming_soon';
  featured?: boolean;
}

export interface Cinema {
  _id: string;
  name: string;
  city: string;
  address: string;
  facilities: string[];
  totalScreens: number;
}

export interface ScreenRow {
  rowName: string;
  type: 'executive' | 'club' | 'recliner';
  seatsCount: number;
  aisleAfter: number[];
}

export interface Screen {
  _id: string;
  cinema: string | Cinema;
  screenNumber: number;
  screenName: string;
  soundSystem: string;
  projectionType: string;
  totalSeats: number;
  rows: ScreenRow[];
}

export interface ShowtimePricing {
  executive: number;
  club: number;
  recliner: number;
}

export interface Showtime {
  _id: string;
  movie: Movie;
  cinema: Cinema;
  screen: Screen;
  date: string;
  startTime: string;
  format: string;
  language: string;
  pricing: ShowtimePricing;
  bookedSeats: string[];
  isActive: boolean;
}

export interface BookedSeat {
  seatNumber: string;
  row: string;
  type: 'executive' | 'club' | 'recliner';
  price: number;
}

export interface Booking {
  _id: string;
  bookingId: string;
  user: string | User;
  movie: Movie;
  cinema: Cinema;
  screen: Screen;
  showtime: Showtime;
  seats: BookedSeat[];
  seatNumbers: string[];
  ticketQuantity: number;
  subtotal: number;
  convenienceFee: number;
  taxes: number;
  totalAmount: number;
  bookingDate: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  bookingStatus: 'confirmed' | 'cancelled';
  qrCodeDataUrl: string;
  verificationCode: string;
  customerDetails: {
    name: string;
    email: string;
    mobile: string;
  };
  cancellation?: {
    cancelledAt: string;
    reason: string;
    refundAmount: number;
  };
}
