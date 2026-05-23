import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
          // Verify user still exists in mock storage and update state
          const freshUser = await userService.getUser(storedUser.id);
          setUser(freshUser);
        }
      } catch (err) {
        console.warn('Failed to restore auth session:', err);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      showToast(`Welcome back, ${loggedUser.displayName}!`, 'success');
      return loggedUser;
    } catch (error) {
      showToast(error.message || 'Login failed', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const registeredUser = await authService.register(userData);
      setUser(registeredUser);
      showToast('Registration successful! Welcome to CampusConnect.', 'success');
      return registeredUser;
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      showToast('Logged out successfully', 'info');
    } catch (error) {
      showToast('Logout failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    if (!user) throw new Error('No user logged in');
    try {
      const updatedUser = await userService.updateProfile(user.id, data);
      setUser(updatedUser);
      showToast('Profile updated successfully', 'success');
      return updatedUser;
    } catch (error) {
      showToast(error.message || 'Failed to update profile', 'error');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
