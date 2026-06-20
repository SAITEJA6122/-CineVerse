const mongoose = require('mongoose');
const Movie = require('./models/Movie');
const Theater = require('./models/Theater');
const Show = require('./models/Show');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sampleMovies = [
  {
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    genre: ["Action", "Sci-Fi", "Thriller"],
    language: "English",
    duration: 148,
    releaseDate: new Date("2010-07-16"),
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page"],
    trailer: "https://www.youtube.com/embed/YoHD9XEInc0",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
    rating: 8.8,
    isTrending: true,
    isUpcoming: false,
    isComingSoon: false
  },
  {
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    genre: ["Action", "Crime", "Drama"],
    language: "English",
    duration: 152,
    releaseDate: new Date("2008-07-18"),
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
    trailer: "https://www.youtube.com/embed/EXeTwQWrcwY",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
    rating: 9.0,
    isTrending: true,
    isUpcoming: false,
    isComingSoon: false
  },
  {
    title: "Avatar 3",
    description: "The next installment in the Avatar franchise, continuing the story of the Na'vi and their fight against human invaders.",
    genre: ["Action", "Adventure", "Fantasy"],
    language: "English",
    duration: 190,
    releaseDate: new Date("2025-12-19"),
    cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"],
    trailer: "https://www.youtube.com/embed/d9MyW72ELq0",
    poster: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop",
    rating: 7.5,
    isTrending: false,
    isUpcoming: true,
    isComingSoon: true,
    comingSoonDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Interstellar",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    genre: ["Adventure", "Drama", "Sci-Fi"],
    language: "English",
    duration: 169,
    releaseDate: new Date("2014-11-07"),
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    trailer: "https://www.youtube.com/embed/zSWdZVtXT7E",
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop",
    rating: 8.7,
    isTrending: true,
    isUpcoming: false,
    isComingSoon: false
  },
  {
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    genre: ["Action", "Adventure", "Sci-Fi"],
    language: "English",
    duration: 166,
    releaseDate: new Date("2024-03-01"),
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
    trailer: "https://www.youtube.com/embed/Way9Dexny3w",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    rating: 8.8,
    isTrending: true,
    isUpcoming: false,
    isComingSoon: false
  },
  {
    title: "Avengers: Secret Wars",
    description: "The Avengers face their greatest challenge yet when multiversal threats converge on Earth.",
    genre: ["Action", "Adventure", "Sci-Fi"],
    language: "English",
    duration: 180,
    releaseDate: new Date("2026-05-01"),
    cast: ["Robert Downey Jr.", "Chris Evans", "Scarlett Johansson"],
    trailer: "https://www.youtube.com/embed/eOrNdBpGMv8",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    rating: 8.5,
    isTrending: false,
    isUpcoming: true,
    isComingSoon: true,
    comingSoonDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  }
];

const sampleTheaters = [
  {
    name: "CineVerse Downtown",
    location: "123 Main St, Downtown",
    screens: [
      { name: "Screen 1", capacity: 150, seatLayout: { rows: 15, seatsPerRow: 10 } },
      { name: "Screen 2", capacity: 100, seatLayout: { rows: 10, seatsPerRow: 10 } }
    ]
  },
  {
    name: "CineVerse Mall",
    location: "456 Shopping Mall Rd",
    screens: [
      { name: "Screen A", capacity: 200, seatLayout: { rows: 20, seatsPerRow: 10 } }
    ]
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding!');

    // Clear existing data
    await Movie.deleteMany({});
    await Theater.deleteMany({});
    await Show.deleteMany({});
    await User.deleteMany({});

    console.log('Cleared existing data');

    // Insert movies
    const movies = await Movie.insertMany(sampleMovies);
    console.log('Inserted movies');

    // Insert theaters
    const theaters = await Theater.insertMany(sampleTheaters);
    console.log('Inserted theaters');

    // Create sample shows
    const shows = [];
    const times = ["10:00 AM", "2:00 PM", "6:00 PM", "9:30 PM"];
    const prices = [250, 350, 450];

    movies.forEach(movie => {
      theaters.forEach(theater => {
        theater.screens.forEach(screen => {
          for (let i = 0; i < 3; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);

            times.forEach(time => {
              // Generate available seats
              const availableSeats = [];
              for (let r = 0; r < screen.seatLayout.rows; r++) {
                const row = [];
                for (let s = 0; s < screen.seatLayout.seatsPerRow; s++) {
                  row.push(true);
                }
                availableSeats.push(row);
              }

              shows.push({
                movie: movie._id,
                theater: theater._id,
                screen: screen._id,
                date: date,
                time: time,
                price: prices[Math.floor(Math.random() * prices.length)],
                availableSeats: availableSeats
              });
            });
          }
        });
      });
    });

    await Show.insertMany(shows);
    console.log('Inserted shows');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@cineverse.com",
      password: hashedPassword,
      role: "admin"
    });
    console.log('Created admin user');

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const regularUser = await User.create({
      name: "Test User",
      email: "user@cineverse.com",
      password: userPassword,
      role: "user"
    });
    console.log('Created test user');

    console.log('Database seeded successfully!');
    console.log('Admin login: admin@cineverse.com / admin123');
    console.log('User login: user@cineverse.com / user123');
    process.exit(0);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
