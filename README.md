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
- **Database**: MongoDB (MongoDB Atlas) — required
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
│   ├── seed.js                 # Seeds MongoDB with sample data
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
- A MongoDB database (e.g. a free MongoDB Atlas cluster). There is no mock-data
  mode — the API reads/writes MongoDB.

1. Clone and Set Up Backend
```bash
cd backend
npm install
```

2. Create a `.env` file in the backend directory (see `backend/.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb+srv://<your-username>:<your-password>@cluster0.mongodb.net/movieticketbooking?retryWrites=true&w=majority
JWT_SECRET=your-strong-secret-key-here
NODE_ENV=development
```

Make sure to replace:
- `<your-username>` with your MongoDB Atlas username
- `<your-password>` with your MongoDB Atlas password
- `your-strong-secret-key-here` with a secure JWT secret

3. Seed the database with sample movies (one time):
```bash
npm run seed
```

4. Start the Backend
```bash
npm run dev
```

5. Set Up the Frontend
```bash
cd ../frontend
npm install
```

6. (Optional) point the frontend at a non-default API by creating `frontend/.env`
(see `frontend/.env.example`). It defaults to `http://localhost:5000/api`.

7. Start the Frontend
```bash
npm start
```

The app should now be running at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## ☁️ Deployment

Netlify only hosts the **static frontend**. The backend must be deployed
separately, otherwise the deployed site calls `http://localhost:5000` and every
request fails with a "Network Error".

### 1. Deploy the backend (Render)
This repo includes a `render.yaml` blueprint.
1. In the [Render dashboard](https://dashboard.render.com), choose **New → Blueprint** and select this repo.
2. Render creates the `cineverse-backend` web service. Set its environment variables:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a long random string
3. After it deploys, note the public URL, e.g. `https://cineverse-backend.onrender.com`.
4. Seed the database once (locally, pointing `MONGODB_URI` at Atlas): `cd backend && npm run seed`.

### 2. Point the frontend at the backend (Netlify)
1. In **Netlify → Site settings → Environment variables**, add:
   - `REACT_APP_API_URL = https://cineverse-backend.onrender.com/api` (use your backend URL, include `/api`).
2. Trigger a redeploy so the build picks up the variable.

The "Network Error" messages disappear once the deployed frontend can reach the deployed backend over https.

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

To create an admin user, manually update a user's `role` to `"admin"` in the MongoDB database.

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
Contributions, issues, and feature requests are welcome!

---

Built with ❤️ using the MERN stack
