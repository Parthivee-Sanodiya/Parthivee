import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { User } from '../models/User.ts';
import { Movie } from '../models/Movie.ts';
import { Cinema } from '../models/Cinema.ts';
import { Screen } from '../models/Screen.ts';
import { Showtime } from '../models/Showtime.ts';
import { Booking } from '../models/Booking.ts';
import { Payment } from '../models/Payment.ts';

export async function seedDatabase(forceReset = false) {
  try {
    const movieCount = await Movie.countDocuments();
    if (movieCount > 0 && !forceReset) {
      console.log(`Database already contains ${movieCount} movies. Skipping automatic seed.`);
      return;
    }

    console.log('Seeding IMovies database with comprehensive cinema data...');

    if (forceReset) {
      await Booking.deleteMany({});
      await Payment.deleteMany({});
      await Showtime.deleteMany({});
      await Screen.deleteMany({});
      await Cinema.deleteMany({});
      await Movie.deleteMany({});
      await User.deleteMany({});
      console.log('Existing collections cleared.');
    }

    // 1. Seed Users
    const hashedAdminPassword = await bcrypt.hash('AdminPassword123!', 10);
    const hashedUserPassword = await bcrypt.hash('DemoUser123!', 10);

    const adminUser = await User.create({
      name: 'Pravin Sharma (Chief Admin)',
      email: 'admin@imovies.com',
      mobile: '+91 98765 43210',
      password: hashedAdminPassword,
      role: 'admin',
    });

    const demoUser = await User.create({
      name: 'Aditi Varma',
      email: 'demo@imovies.com',
      mobile: '+91 91234 56789',
      password: hashedUserPassword,
      role: 'user',
    });

    // 2. Seed Movies (12 premier blockbusters)
    const moviesData = [
      {
        title: 'Fighter',
        poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=80',
        description: 'An elite Indian Air Force squadron named "Air Dragons" faces extreme aerial combat, personal sacrifice, and unmatched valor in defending the nation against cross-border air strikes.',
        genre: ['Action', 'Thriller', 'Drama'],
        duration: 166,
        releaseDate: '2025-01-25',
        language: ['Hindi', 'Tamil', 'Telugu'],
        director: 'Siddharth Anand',
        cast: ['Hrithik Roshan', 'Deepika Padukone', 'Anil Kapoor', 'Karan Singh Grover'],
        rating: 8.4,
        votes: 42800,
        certificate: 'U/A 13+',
        trailerUrl: 'https://www.youtube.com/watch?v=6amIq_mP4xM',
        status: 'now_showing',
        featured: true,
      },
      {
        title: 'Dune: Part Two',
        poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe.',
        genre: ['Sci-Fi', 'Adventure', 'Action'],
        duration: 166,
        releaseDate: '2025-03-01',
        language: ['English', 'Hindi'],
        director: 'Denis Villeneuve',
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
        rating: 8.8,
        votes: 89400,
        certificate: 'U/A 16+',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        status: 'now_showing',
        featured: true,
      },
      {
        title: 'Kalki 2898 AD',
        poster: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        description: 'In a dystopian post-apocalyptic future in 2898 AD, the immortal warrior Ashwatthama awaits the arrival of Kalki, the final avatar of Lord Vishnu, while opposing Supreme Yaskin’s totalitarian Complex.',
        genre: ['Sci-Fi', 'Mythology', 'Action'],
        duration: 181,
        releaseDate: '2025-06-27',
        language: ['Hindi', 'Telugu', 'Tamil', 'Malayalam'],
        director: 'Nag Ashwin',
        cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone'],
        rating: 8.6,
        votes: 75200,
        certificate: 'U/A 13+',
        trailerUrl: 'https://www.youtube.com/watch?v=y1-w1pU_z1s',
        status: 'now_showing',
        featured: false,
      },
      {
        title: 'Oppenheimer',
        poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project, exploring the moral and political aftermath.',
        genre: ['Biography', 'Drama', 'History'],
        duration: 180,
        releaseDate: '2024-07-21',
        language: ['English', 'Hindi'],
        director: 'Christopher Nolan',
        cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
        rating: 8.9,
        votes: 112000,
        certificate: 'A',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        status: 'now_showing',
        featured: false,
      },
      {
        title: 'Stree 2: Sarkate Ka Aatank',
        poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        description: 'The town of Chanderi is haunted once again, this time by a headless apparition known as "Sarkata". Vicky and his eclectic companions must invoke the spirit of Stree to save the town.',
        genre: ['Comedy', 'Horror'],
        duration: 147,
        releaseDate: '2025-08-15',
        language: ['Hindi'],
        director: 'Amar Kaushik',
        cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi', 'Abhishek Banerjee'],
        rating: 8.1,
        votes: 56000,
        certificate: 'U/A 16+',
        trailerUrl: 'https://www.youtube.com/watch?v=KVnhefcYjSI',
        status: 'now_showing',
        featured: false,
      },
      {
        title: 'Deadpool & Wolverine',
        poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80',
        description: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth, fourth-wall breaking Deadpool. They team up to defeat a common enemy threatening their multiverse.',
        genre: ['Action', 'Comedy', 'Sci-Fi'],
        duration: 128,
        releaseDate: '2025-07-26',
        language: ['English', 'Hindi'],
        director: 'Shawn Levy',
        cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Matthew Macfadyen'],
        rating: 8.3,
        votes: 84000,
        certificate: 'A',
        trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
        status: 'now_showing',
        featured: false,
      },
      {
        title: 'Jawan',
        poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
        description: 'A high-octane emotional journey of a prison warden driven by a personal vendetta to rectify corrupt societal injustice, aided by an all-female squad of vigilantes.',
        genre: ['Action', 'Thriller'],
        duration: 169,
        releaseDate: '2024-09-07',
        language: ['Hindi', 'Tamil', 'Telugu'],
        director: 'Atlee',
        cast: ['Shah Rukh Khan', 'Nayanthara', 'Vijay Sethupathi', 'Deepika Padukone'],
        rating: 8.2,
        votes: 98000,
        certificate: 'U/A 16+',
        trailerUrl: 'https://www.youtube.com/watch?v=MWOlnZSnXWE',
        status: 'now_showing',
        featured: false,
      },
      {
        title: 'Interstellar: 10th Anniversary IMAX Re-Release',
        poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
        description: 'When Earth becomes uninhabitable in the future, a team of explorers undertakes the most vital mission in human history: traveling through a newly opened wormhole to discover habitable planets.',
        genre: ['Sci-Fi', 'Drama', 'Adventure'],
        duration: 169,
        releaseDate: '2025-10-06',
        language: ['English'],
        director: 'Christopher Nolan',
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
        rating: 8.9,
        votes: 140000,
        certificate: 'U/A',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        status: 'now_showing',
        featured: false,
      },
      // Coming Soon Movies
      {
        title: 'Brahmāstra: Part Two – Dev',
        poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
        description: 'The saga of the Astraverse continues as Dev, the formidable wielder of the Agnyastra and master of dark astras, rises to claim supremacy across ancient warrior brotherhoods.',
        genre: ['Action', 'Fantasy', 'Mythology'],
        duration: 175,
        releaseDate: '2026-12-18',
        language: ['Hindi', 'Tamil', 'Telugu'],
        director: 'Ayan Mukerji',
        cast: ['Ranveer Singh', 'Deepika Padukone', 'Ranbir Kapoor', 'Alia Bhatt'],
        rating: 8.7,
        votes: 19500,
        certificate: 'U/A 13+',
        trailerUrl: 'https://www.youtube.com/watch?v=V552A8sV-fA',
        status: 'coming_soon',
        featured: false,
      },
      {
        title: 'Spider-Man: Beyond the Spider-Verse',
        poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
        description: 'Miles Morales traverses catastrophic alternate dimensions to rescue his father and bridge the fractures across the Multiverse against the enigmatic Spot and Earth-42 Miguel O’Hara.',
        genre: ['Animation', 'Action', 'Sci-Fi'],
        duration: 140,
        releaseDate: '2027-01-15',
        language: ['English', 'Hindi'],
        director: 'Joaquim Dos Santos, Kemp Powers',
        cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
        rating: 9.0,
        votes: 31000,
        certificate: 'U',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        status: 'coming_soon',
        featured: false,
      },
      {
        title: 'War 2',
        poster: 'https://images.unsplash.com/photo-1533613220915-609f661a6fe1?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        description: 'Major Kabir Dhaliwal confronts a lethal shadow operative with deep ties to international intelligence syndicates in an adrenaline-pumping espionage showdown.',
        genre: ['Action', 'Thriller'],
        duration: 160,
        releaseDate: '2026-11-20',
        language: ['Hindi', 'Telugu', 'Tamil'],
        director: 'Ayan Mukerji',
        cast: ['Hrithik Roshan', 'N. T. Rama Rao Jr.', 'Kiara Advani', 'John Abraham'],
        rating: 8.5,
        votes: 24000,
        certificate: 'U/A 16+',
        trailerUrl: 'https://www.youtube.com/watch?v=tQ0mzXRk-oM',
        status: 'coming_soon',
        featured: false,
      },
      {
        title: 'Avatar: Fire and Ash',
        poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
        description: 'Jake Sully and Neytiri journey into uncharted volcanic biomes of Pandora, encountering the hostile "Ash People" clan who defy peaceful coexistence.',
        genre: ['Sci-Fi', 'Adventure', 'Action'],
        duration: 190,
        releaseDate: '2026-12-25',
        language: ['English', 'Hindi'],
        director: 'James Cameron',
        cast: ['Sam Worthington', 'Zoe Saldaña', 'Sigourney Weaver', 'Stephen Lang'],
        rating: 8.9,
        votes: 45000,
        certificate: 'U/A 13+',
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        status: 'coming_soon',
        featured: false,
      },
    ];

    const insertedMovies = await Movie.insertMany(moviesData);

    // 3. Seed Cinemas (3 Premier Multiplexes)
    const cinemasData = [
      {
        name: 'PVR INOX: Palladium IMAX',
        city: 'Mumbai',
        address: 'Level 4, High Street Phoenix, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013',
        facilities: ['IMAX with Laser', 'Dolby Atmos', 'Recliner Loungers', 'Gourmet In-Seat Dining', 'Valet Parking'],
        totalScreens: 3,
      },
      {
        name: 'Cinépolis: Grand Central Mall',
        city: 'Delhi NCR',
        address: 'Sector 32, Grand Central Promenade, Golf Course Extension, Gurugram, NCR 122001',
        facilities: ['4DX Motion Seats', 'Dolby Atmos 7.1', 'VIP Lounge', 'Wheelchair Access', 'Café Crème'],
        totalScreens: 2,
      },
      {
        name: 'Miraj Cinemas: Nexus Mall',
        city: 'Bengaluru',
        address: 'Nexus Mall, 21 Hosur Road, Koramangala 7th Block, Bengaluru, Karnataka 560095',
        facilities: ['Dolby Atmos', 'Laser 4K RGB', 'Pushback Velvet Seats', 'F&B Express Counter'],
        totalScreens: 2,
      },
    ];

    const insertedCinemas = await Cinema.insertMany(cinemasData);

    // 4. Seed Screens with authentic seating layouts
    // Standard rows:
    // A, B, C, D: Executive (Silver) - 14 seats each (Seats 1-4, aisle, 5-10, aisle, 11-14)
    // E, F, G: Club (Gold) - 14 seats each
    // H: Recliner (Platinum VIP) - 10 wider luxury recliners
    const rowsConfig = [
      { rowName: 'H', type: 'recliner' as const, seatsCount: 10, aisleAfter: [3, 7] },
      { rowName: 'G', type: 'club' as const, seatsCount: 14, aisleAfter: [4, 10] },
      { rowName: 'F', type: 'club' as const, seatsCount: 14, aisleAfter: [4, 10] },
      { rowName: 'E', type: 'club' as const, seatsCount: 14, aisleAfter: [4, 10] },
      { rowName: 'D', type: 'executive' as const, seatsCount: 14, aisleAfter: [4, 10] },
      { rowName: 'C', type: 'executive' as const, seatsCount: 14, aisleAfter: [4, 10] },
      { rowName: 'B', type: 'executive' as const, seatsCount: 14, aisleAfter: [4, 10] },
      { rowName: 'A', type: 'executive' as const, seatsCount: 14, aisleAfter: [4, 10] },
    ];

    const screensData = [
      {
        cinema: insertedCinemas[0]._id,
        screenNumber: 1,
        screenName: 'Audi 1 - IMAX Laser 3D',
        soundSystem: '12-Channel IMAX Immersive Audio',
        projectionType: 'IMAX 4K Dual Commercial Laser',
        totalSeats: 108,
        rows: rowsConfig,
      },
      {
        cinema: insertedCinemas[0]._id,
        screenNumber: 2,
        screenName: 'Audi 2 - Dolby Atmos Gold Class',
        soundSystem: 'Dolby Atmos 64-Channel',
        projectionType: 'Barco 4K RGB Laser',
        totalSeats: 108,
        rows: rowsConfig,
      },
      {
        cinema: insertedCinemas[1]._id,
        screenNumber: 1,
        screenName: 'Audi 1 - 4DX Sensory Screen',
        soundSystem: 'Dolby Atmos Surround Sound',
        projectionType: 'Christie RealLaser 4K',
        totalSeats: 108,
        rows: rowsConfig,
      },
      {
        cinema: insertedCinemas[2]._id,
        screenNumber: 1,
        screenName: 'Audi 1 - Dolby 7.1 Prime',
        soundSystem: 'Dolby Surround 7.1',
        projectionType: 'Sony 4K Digital Cinema',
        totalSeats: 108,
        rows: rowsConfig,
      },
    ];

    const insertedScreens = await Screen.insertMany(screensData);

    // 5. Seed Showtimes for Today and Next 3 Days
    const today = new Date();
    const dates: string[] = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const showtimesList: any[] = [];
    const nowShowingMovies = insertedMovies.filter((m) => m.status === 'now_showing');

    const timeslots = [
      { time: '10:00 AM', format: '2D Dolby Atmos' },
      { time: '01:30 PM', format: 'IMAX 3D Laser' },
      { time: '05:00 PM', format: 'IMAX 3D Laser' },
      { time: '08:45 PM', format: 'Dolby Atmos 2D' },
      { time: '11:15 PM', format: 'Night Owl 2D' },
    ];

    for (const movie of nowShowingMovies.slice(0, 5)) {
      for (const cinema of insertedCinemas) {
        const matchingScreen = insertedScreens.find(
          (s) => s.cinema.toString() === cinema._id.toString()
        ) || insertedScreens[0];

        for (const date of dates) {
          for (const slot of timeslots.slice(0, 3)) {
            // Some seats already pre-booked to show real status
            const sampleBooked = ['E5', 'E6', 'F7', 'F8'];

            showtimesList.push({
              movie: movie._id,
              cinema: cinema._id,
              screen: matchingScreen._id,
              date: date,
              startTime: slot.time,
              format: slot.format,
              language: movie.language[0] || 'Hindi',
              pricing: {
                executive: slot.format.includes('IMAX') ? 280 : 220,
                club: slot.format.includes('IMAX') ? 420 : 340,
                recliner: slot.format.includes('IMAX') ? 650 : 550,
              },
              bookedSeats: sampleBooked,
              isActive: true,
            });
          }
        }
      }
    }

    const insertedShowtimes = await Showtime.insertMany(showtimesList);

    // 6. Seed a completed Demo Booking for Aditi Varma (demo user)
    const firstShowtime = insertedShowtimes[0];
    const firstMovie = insertedMovies.find((m) => m._id.toString() === firstShowtime.movie.toString())!;
    const firstCinema = insertedCinemas.find((c) => c._id.toString() === firstShowtime.cinema.toString())!;
    const firstScreen = insertedScreens.find((s) => s._id.toString() === firstShowtime.screen.toString())!;

    const bookingId = 'IMV-2026-84920';
    const verificationCode = 'SEC-IMV-9482';
    const qrPayload = JSON.stringify({
      bookingId,
      verificationCode,
      movie: firstMovie.title,
      cinema: firstCinema.name,
      screen: firstScreen.screenName,
      showtime: `${firstShowtime.date} ${firstShowtime.startTime}`,
      seats: ['F7', 'F8'],
      amount: 746,
      status: 'CONFIRMED',
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    const paymentId = 'PAY-DEMO-849201';
    const demoPayment = await Payment.create({
      paymentId,
      bookingId,
      user: demoUser._id,
      amount: 746,
      method: 'upi',
      details: {
        upiId: 'aditi@okhdfcbank',
      },
      status: 'success',
      transactionTimestamp: new Date(),
    });

    await Booking.create({
      bookingId,
      user: demoUser._id,
      movie: firstMovie._id,
      cinema: firstCinema._id,
      screen: firstScreen._id,
      showtime: firstShowtime._id,
      seats: [
        { seatNumber: 'F7', row: 'F', type: 'club', price: 340 },
        { seatNumber: 'F8', row: 'F', type: 'club', price: 340 },
      ],
      seatNumbers: ['F7', 'F8'],
      ticketQuantity: 2,
      subtotal: 680,
      convenienceFee: 46,
      taxes: 20,
      totalAmount: 746,
      bookingDate: new Date(),
      payment: demoPayment._id,
      paymentStatus: 'completed',
      bookingStatus: 'confirmed',
      qrCodeDataUrl,
      verificationCode,
      customerDetails: {
        name: demoUser.name,
        email: demoUser.email,
        mobile: demoUser.mobile,
      },
    });

    console.log('IMovies database successfully seeded!');
    console.log(`- Admin: admin@imovies.com / AdminPassword123!`);
    console.log(`- Demo User: demo@imovies.com / DemoUser123!`);
    console.log(`- Movies seeded: ${insertedMovies.length}`);
    console.log(`- Cinemas seeded: ${insertedCinemas.length}`);
    console.log(`- Showtimes seeded: ${insertedShowtimes.length}`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
