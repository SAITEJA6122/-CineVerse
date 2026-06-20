const mockMovies = [];

const mockTheaters = [
  {
    _id: "theater1",
    name: "CineVerse IMAX",
    location: "Downtown",
    screens: 4
  },
  {
    _id: "theater2",
    name: "CineVerse Premium",
    location: "City Center",
    screens: 3
  }
];

const mockShows = [];

const mockUsers = [
  {
    _id: "admin1",
    name: "Admin User",
    email: "admin@cineverse.com",
    password: "admin123",
    role: "admin",
    favorites: [],
    recentlyViewed: [],
    bookingHistory: [],
    loyaltyPoints: 0
  },
  {
    _id: "user1",
    name: "Test User",
    email: "user@cineverse.com",
    password: "user123",
    role: "user",
    favorites: [],
    recentlyViewed: [],
    bookingHistory: [],
    loyaltyPoints: 250
  }
];

const mockBookings = [];

module.exports = { mockMovies, mockTheaters, mockShows, mockUsers, mockBookings };
