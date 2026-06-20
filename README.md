# 🎬 CineVerse - Movie Ticket Booking Platform

A full-featured, production-ready movie ticket booking application built with the MERN stack, inspired by BookMyShow.

## ✨ Features

### 👤 User Features
- **Secure Authentication**: JWT-based login and registration
- **Movie Discovery**: Browse trending, upcoming, recommended, and *coming soon* movies
- **Advanced Search & Filtering**: 
  - Search by title
  - Filter by genre
  - Filter by language
  - Filter by minimum/maximum duration
- **Movie Details**: View posters, trailers, ratings, cast, reviews, and similar movies
- **Interactive Seat Selection**:
  - Choose seats with seat tiers (Platinum, Gold, Silver)
  - Real-time availability
  - Different pricing per tier
- **Booking Flow**: Complete ticket booking process
- **Booking History**: View and cancel past bookings
- **Cancellation Policy**: 
  - 48+ hours before: 10% fee
  - 24-48 hours before: 30% fee
  - 6-24 hours before: 50% fee
  - < 6 hours before: No cancellation allowed
- **Loyalty Program**:
  - Earn 10 points per $1 spent
  - Redeem points (100 points = $1 discount)
  - Points returned on cancellation
- **Favorites**: Save movies to your wishlist
- **Countdown Timers**: Coming soon movies show real-time release countdown
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Toast Notifications**: Real-time feedback for actions

### 🔧 Admin Dashboard
- **Secure Admin Login**: Admin-only access to the dashboard
- **Analytics Overview**: Total users, movies, bookings, and revenue statistics
- **Movie Management**: Add, edit, and delete movies
- **Booking Management**: View all bookings and their statuses
- **Theater & Show Management**: Manage theaters and showtimes
- **User Management**: View and manage platform users

## 🛠️ Tech Stack

- **Frontend**: React.js, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (MongoDB Atlas) - OR use MOCK DATA for instant testing
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer (for posters and images)
- **Styling**: Inline styles with theme support

## 📁 Project Structure

```
main/
├── backend/
│   ├── config/
│   │   └── multer.js           # File upload configuration
│   ├── models/
│   │   ├── User.js             # User schema and model
│   │   ├── Movie.js            # Movie schema and model
│   │   ├── Theater.js          # Theater schema and model
│   │   ├── Show.js             # Showtime schema and model
│   │   └── Booking.js          # Booking schema and model
│   ├── controllers/
│   │   ├── userController.js   # User logic and endpoints
│   │   ├── movieController.js  # Movie logic and endpoints
│   │   ├── theaterController.js # Theater logic and endpoints
│   │   ├── showController.js   # Show logic and endpoints
│   │   └── bookingController.js # Booking logic and endpoints
│   ├── routes/
│   │   ├── userRoutes.js       # User API routes
│   │   ├── movieRoutes.js      # Movie API routes
│   │   ├── theaterRoutes.js    # Theater API routes
│   │   ├── showRoutes.js       # Show API routes
│   │   └── bookingRoutes.js    # Booking API routes
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT authentication middleware
│   ├── uploads/                # Uploaded file storage
│   ├── mockData.js             # Mock data for instant testing
│   ├── .env                    # Environment variables (create this)
│   ├── server.js               # Express server entry point
│   └── package.json            # Backend dependencies
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js        # Navigation bar component
    │   │   ├── Footer.js        # Footer component
    │   │   ├── MovieCard.js     # Movie card component
    │   │   └── ToastContainer.js # Toast notification container
    │   ├── pages/
    │   │   ├── Home.js          # Home page with movie discovery
    │   │   ├── Login.js         # Login page
    │   │   ├── Register.js      # Registration page
    │   │   ├── MovieDetails.js  # Movie details page
    │   │   ├── SeatSelection.js # Interactive seat selection
    │   │   ├── BookingConfirmation.js # Booking confirmation
    │   │   ├── Profile.js       # User profile and booking history
    │   │   └── AdminDashboard.js # Admin dashboard
    │   ├── context/
    │   │   ├── AuthContext.js   # Authentication context
    │   │   ├── ThemeContext.js  # Dark/light theme context
    │   │   └── ToastContext.js  # Toast notifications context
    │   ├── App.js               # Main app component
    │   ├── index.js             # React entry point
    │   └── index.css            # Global styles
    └── package.json             # Frontend dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or later)

### Option 1: Quick Start with Mock Data (No MongoDB Required!)
This is the easiest way to see the app in action!

1. Clone and Set Up Backend
```bash
cd backend
npm install
```

2. Start the Backend
```bash
npm run dev
```
The backend will automatically use mock data!

3. Set Up Frontend
```bash
cd ../frontend
npm install
```

4. Start the Frontend
```bash
npm start
```

The app should now be running at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

### Option 2: Using MongoDB Atlas
If you want to use a real database:

1. Clone and Set Up Backend
```bash
cd backend
npm install
```

2. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<your-username>:<your-password>@cluster0.mongodb.net/movieticketbooking?retryWrites=true&w=majority
JWT_SECRET=your-strong-secret-key-here
NODE_ENV=development
USE_MOCK_DATA=false
```

Make sure to replace:
- `<your-username>` with your MongoDB Atlas username
- `<your-password>` with your MongoDB Atlas password
- `your-strong-secret-key-here` with a secure JWT secret
- Set `USE_MOCK_DATA=false` to use real database

3. Start the Backend
```bash
npm run dev
```

4. Set Up Frontend
```bash
cd frontend
npm install
```

5. Start the Frontend
```bash
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Log in a user
- `GET /api/users/profile` - Get user profile (requires authentication)
- `POST /api/users/favorites/:movieId` - Add movie to favorites
- `DELETE /api/users/favorites/:movieId` - Remove from favorites
- `POST /api/users/recently-viewed/:movieId` - Add to recently viewed
- `POST /api/users/redeem-points` - Redeem loyalty points
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Movies
- `GET /api/movies` - Get all movies (with search/filter/pagination options)
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/upcoming` - Get upcoming movies
- `GET /api/movies/coming-soon` - Get coming soon movies
- `GET /api/movies/recommended` - Get recommended movies
- `GET /api/movies/:id` - Get movie details by ID
- `GET /api/movies/:id/similar` - Get similar movies
- `POST /api/movies` - Add new movie (admin only, supports file upload)
- `PUT /api/movies/:id` - Update movie (admin only)
- `DELETE /api/movies/:id` - Delete movie (admin only)
- `POST /api/movies/:id/reviews` - Add a review (authenticated users)

### Theaters
- `GET /api/theaters` - Get all theaters
- `GET /api/theaters/:id` - Get theater details
- `POST /api/theaters` - Add theater (admin only)
- `PUT /api/theaters/:id` - Update theater (admin only)
- `DELETE /api/theaters/:id` - Delete theater (admin only)

### Shows
- `GET /api/shows` - Get all shows (with filters)
- `GET /api/shows/:id` - Get show details
- `POST /api/shows` - Add new show (admin only)
- `PUT /api/shows/:id` - Update show (admin only)
- `DELETE /api/shows/:id` - Delete show (admin only)

### Bookings
- `POST /api/bookings` - Create a new booking (authenticated users)
- `GET /api/bookings/mybookings` - Get user's bookings (authenticated users)
- `GET /api/bookings` - Get all bookings (admin only)
- `GET /api/bookings/analytics` - Get booking analytics (admin only)
- `PUT /api/bookings/:id/cancel` - Cancel booking (authenticated users)

## 🎯 Using the App

### For Users
1. Register for an account or log in
2. Browse movies on the home page (trending, upcoming, coming soon, recommended)
3. Use search and filters to find movies you like
4. Click a movie to view details and shows
5. Select a show and choose seats (supports multiple seats for group bookings)
6. Confirm your booking and earn loyalty points
7. View your bookings and loyalty points in your profile
8. Cancel bookings if needed (fees apply)

### For Admin
1. Log in with an admin account
2. Access the admin dashboard
3. Manage movies, theaters, shows, and users
4. View booking analytics
5. Add/edit movie information

To create an admin user, you can manually update a user's `role` to `"admin"` in the MongoDB database (if not using mock data).

## 📱 Responsive Design

The app is fully responsive:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (up to 767px)

## 🎨 Themes

- **Light Theme**: Clean white background for daytime viewing
- **Dark Theme**: Dark purple background for comfortable night time viewing
- Toggle button in the navbar switches themes

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected routes for authenticated users
- Admin-only routes for management
- CORS enabled for secure cross-origin requests

## 📝 Next Steps for Production

1. Add email confirmation for new users
2. Implement real-time seat updates using WebSockets
3. Add payment gateway integration
4. Add movie review moderation
5. Set up automatic backups for MongoDB
6. Add analytics tracking
7. Optimize images and assets
8. Set up environment-specific configurations
9. Add logging and error tracking
10. Deploy to a hosting provider (Vercel, Netlify, AWS, etc.)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing
Admin : admin@cineverse.com / admin123

Contributions, issues, and feature requests are welcome!

---

Built with ❤️ using the MERN stack
