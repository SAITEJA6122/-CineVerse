import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ToastContext from './ToastContext';
import API_BASE from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useContext(ToastContext);

  // Custom setUser that updates state and localStorage
  const setUser = (newUser) => {
    if (newUser && newUser !== undefined) {
      localStorage.setItem('userInfo', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
    }
    setUserState(newUser);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    if (token && userInfo && userInfo !== 'undefined') {
      try {
        const parsedUser = JSON.parse(userInfo);
        setUserState(parsedUser);
      } catch (error) {
        console.error('Failed to parse user info:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
      }
    } else if (userInfo === 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_BASE}/users/login`, { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUserState(data);
      showToast('Login successful!', 'success');
      return data;
    } catch (error) {
      showToast(error.response?.data?.message || 'Login failed', 'error');
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await axios.post(`${API_BASE}/users/register`, { name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUserState(data);
      showToast('Registration successful!', 'success');
      return data;
    } catch (error) {
      showToast(error.response?.data?.message || 'Registration failed', 'error');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUserState(null);
    showToast('Logged out successfully!', 'info');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getAuthHeaders, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
