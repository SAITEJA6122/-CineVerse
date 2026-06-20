import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import BookingConfirmation from './pages/BookingConfirmation';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ThemeContext from './context/ThemeContext';

function App() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? '#0f0f23' : '#f8f9fa';
    document.body.style.color = theme === 'dark' ? '#f0f0f0' : '#333';
  }, [theme]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/book/:showId" element={<SeatSelection />} />
            <Route path="/confirmation/:bookingId" element={<BookingConfirmation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
