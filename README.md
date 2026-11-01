# IMovies – Movie Ticket Booking Made Simple

A full-stack production-style movie ticket booking web application built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js) with Tailwind CSS, atomic seat reservation locking, demo payment gateway simulation, verifiable QR-code digital e-tickets, comprehensive user dashboard, and an administrative control panel.

---

## 1. Project Overview

**IMovies** provides an online cinema ticketing experience with real-time seat availability, live countdown locks, and verified admissions.

Key highlights:
- **Real-Time Interactive Auditorium Layout**: Visual seating tiers (Executive, Club, Recliner) with aisle spaces and curved cinema screen indicator.
- **Race-Condition & Double-Booking Prevention**: Atomic 8-minute temporary seat holds with TTL expiry backed by MongoDB.
- **Academic Demo Payment Gateway**: Multi-mode payment simulator (UPI, Debit/Credit Card, Box Office Counter) with success/failure toggles for testing.
- **Verifiable Digital E-Tickets**: Instant client-rendered QR codes with booking metadata, security tokens, and printable boarding passes.
- **Self-Contained MongoDB Engine**: Automatically provisions a local high-performance MongoDB instance in memory or connects to remote `MONGODB_URI` (e.g. MongoDB Atlas).
- **Automated Cinema Seeding**: Pre-loaded with 12 blockbuster movies (Bollywood & Hollywood), 3 premier multiplexes (Mumbai, Delhi NCR, Bengaluru), multiple screens, schedules, and test accounts.

---

## 2. Technology Stack

### Frontend
- **React 19** (Functional components, hooks, custom context)
- **Tailwind CSS 4** (Cinematic dark theme, zero-pill discipline, smooth animations)
- **Lucide Icons** (Consistent iconography)
- **Context API** (Global authentication and user session management)
- **QRCode** (Client/server verified QR code generation)

### Backend
- **Node.js & Express.js** (REST API architecture)
- **MongoDB & Mongoose ODM** (Document models, indexes, atomic operators)
- **JWT (JSON Web Tokens)** (Stateless authorization with Bearer tokens)
- **bcryptjs** (Password salt and hash encryption)
- **CORS & Middleware** (Input validation, role-based route protection)

---

## 3. Demo Credentials

For quick evaluation and testing, the application includes pre-seeded credentials:

| Role | Email | Password | Pre-seeded Features |
| :--- | :--- | :--- | :--- |
| **Chief Admin** | `admin@imovies.com` | `AdminPassword123!` | Access to Admin Management Center, Movie CRUD, Showtime creation, Analytics |
| **Demo User** | `demo@imovies.com` | `DemoUser123!` | Active confirmed booking for *Fighter* at PVR INOX with viewable QR e-ticket |

*The Sign In modal also includes one-click autofill buttons for these credentials.*

---

## 4. Key Features & User Journey

1. **Movie Exploration & Catalog**:
   - Filter by **Now Showing** and **Coming Soon**.
   - Multi-attribute search by title, cast, and director.
   - Filter by genre (Action, Sci-Fi, Drama, Comedy, Thriller, etc.) and language (Hindi, English, Telugu, Tamil).
   - Sort by rating and release date.

2. **Movie Details & Showtimes**:
   - High-definition backdrop, official trailers via YouTube modal.
   - 4-day interactive date selector (Today, Tomorrow, Day 3, Day 4).
   - Multiplex listings with amenities (IMAX Laser, Dolby Atmos, 4DX, Recliners).

3. **Visual Interactive Seat Selection**:
   - Screen curvature with ambient lighting glow.
   - Color-coded seating status: Available (Green), Selected (Crimson Red), Held by another user (Amber lock), Booked (Grey disabled).
   - Real-time 8-minute countdown timer with automatic seat release upon timeout.
   - Dynamic price calculation based on row tier (Executive, Club, Recliner VIP).

4. **Demo Payment Gateway**:
   - Supports UPI (instant demo autofill), Cards (with test card generator), and Counter reservation.
   - **Simulation Toggle**: Test both **Successful Payment** and **Failed Payment** paths.
   - On failure: seats are released back to the auditorium immediately.
   - On success: permanent seat reservation is committed to MongoDB and digital e-ticket is issued.

5. **Digital E-Ticket**:
   - Perforated cinema boarding pass aesthetic.
   - Embedded QR code verified with booking ID, customer info, and unique security token.
   - Print / Save as PDF functionality.

6. **User Dashboard & Cancellation**:
   - Profile overview and active passes count.
   - Tabs for Confirmed and Cancelled tickets.
   - Transparent cancellation workflow: releases seats back to the auditorium in MongoDB and processes 80% demo refund.

7. **Admin Control Center**:
   - Key metrics: Total Revenue, Total Tickets Sold, Active Movies, Registered Users.
   - Movie management: Add, edit, and delete movie entries.
   - Showtime scheduler: Assign movies to screens, configure timings and tier pricing.
   - Bookings audit log and registered user list.
   - Database Reset & Re-seed button.

---

## 5. MongoDB Database Collections

The application uses 8 distinct Mongoose schemas:

1. `Users`: Name, email (unique), mobile, password (bcrypt hashed), role (`user` | `admin`).
2. `Movies`: Title, poster, banner, description, genre, duration, releaseDate, language, director, cast, rating, certificate, trailerUrl, status (`now_showing` | `coming_soon`).
3. `Cinemas`: Name, city, address, facilities, totalScreens.
4. `Screens`: Cinema ref, screenNumber, screenName, soundSystem, projectionType, rows layout configuration.
5. `Showtimes`: Movie ref, cinema ref, screen ref, date, startTime, format, pricing tiers, bookedSeats array.
6. `SeatHolds`: Showtime ref, sessionId, seats array, TTL expiration timestamp (`expires: '0s'`).
7. `Bookings`: Unique bookingId, user ref, movie ref, cinema ref, screen ref, showtime ref, seat breakdown, amounts, QR data URL, verificationCode, cancellation audit.
8. `Payments`: PaymentId, bookingId, user ref, amount, method, status, details, transactionTimestamp.

---

## 6. REST API Endpoints

### Authentication
- `POST /api/auth/register` – Register new user account.
- `POST /api/auth/login` – Login and obtain JWT token.
- `GET /api/auth/me` – Retrieve current profile (Protected).
- `PUT /api/auth/profile` – Update profile details (Protected).

### Movies
- `GET /api/movies` – List movies with filtering (status, genre, language, search, sort).
- `GET /api/movies/:id` – Retrieve movie details.
- `POST /api/movies` – Add movie (Admin only).
- `PUT /api/movies/:id` – Update movie (Admin only).
- `DELETE /api/movies/:id` – Delete movie (Admin only).

### Cinemas & Screens
- `GET /api/cinemas` – List all multiplexes (optional `city` filter).
- `GET /api/cinemas/:id` – Retrieve cinema and associated auditoriums.
- `GET /api/screens/:id` – Retrieve screen seating layout.

### Showtimes
- `GET /api/showtimes` – Query showtimes by `movieId`, `cinemaId`, `date`.
- `GET /api/showtimes/:id` – Retrieve showtime details.
- `POST /api/showtimes` – Schedule new screening (Admin only).

### Seats & Temporary Holds
- `GET /api/seats/:id/seats` – Real-time seat availability and active holds for a showtime.
- `POST /api/seats/hold` – Atomically hold selected seats for 8 minutes.
- `DELETE /api/seats/hold/:sessionId/:showtimeId` – Release seat hold early.

### Bookings & Tickets
- `POST /api/bookings` – Execute booking, record payment, and generate QR e-ticket.
- `GET /api/bookings/my-bookings` – Retrieve bookings for logged-in user.
- `GET /api/bookings/:id` – Retrieve booking details.
- `PUT /api/bookings/:id/cancel` – Cancel booking and release seats back to showtime.

### Payments
- `POST /api/payments/demo` – Simulate demo payment transaction.
- `GET /api/payments/:id` – Retrieve payment record.

### Admin
- `GET /api/admin/dashboard` – Overall analytics (revenue, tickets, active movies, users).
- `GET /api/admin/bookings` – All platform bookings.
- `GET /api/admin/users` – List registered user accounts.
- `POST /api/admin/reseed` – Reset and re-seed database.

---

## 7. How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/IMovies.git
cd IMovies

# Install dependencies
npm install
```

### Environment Variables (.env)
```env
PORT=3000
JWT_SECRET=imovies_ultra_secure_jwt_secret_token_2026

# Optional: Remote MongoDB connection string.
# If omitted or unavailable, an in-memory MongoDB instance runs automatically.
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/imovies
```

### Running the Application
```bash
# Start development server (serves Express backend + Vite frontend on port 3000)
npm run dev
```

Open your browser at `http://localhost:3000`.
