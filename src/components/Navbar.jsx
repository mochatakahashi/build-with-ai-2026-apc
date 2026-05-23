import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Users, Bell, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getInitials } from '../utils/formatters';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null; // Navbar hidden when logged out

  return (
    <nav className="navbar">
      <div className="navbar__container flex justify-between items-center">
        {/* Left: Brand */}
        <Link to="/feed" className="navbar__brand flex items-center gap-xs">
          <span className="navbar__brand-logo">🎓</span>
          <span className="navbar__brand-text text-gradient">CampusConnect</span>
        </Link>

        {/* Center: Main Links (Desktop) */}
        <div className="navbar__links flex items-center gap-sm">
          <NavLink to="/feed" className={({ isActive }) => `navbar__link flex items-center gap-xs ${isActive ? 'navbar__link--active' : ''}`}>
            <Home size={18} />
            <span>Feed</span>
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `navbar__link flex items-center gap-xs ${isActive ? 'navbar__link--active' : ''}`}>
            <Calendar size={18} />
            <span>Events</span>
          </NavLink>
          <NavLink to="/organizations" className={({ isActive }) => `navbar__link flex items-center gap-xs ${isActive ? 'navbar__link--active' : ''}`}>
            <Users size={18} />
            <span>Clubs</span>
          </NavLink>
        </div>

        {/* Right: User Section */}
        <div className="navbar__user flex items-center gap-md">
          {/* Notification bell */}
          <button className="navbar__action-btn btn btn--icon btn--ghost" title="Notifications">
            <Bell size={18} />
            <span className="navbar__notification-badge"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="navbar__profile" ref={dropdownRef}>
            <button className="navbar__avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)} title="Account menu">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} className="avatar avatar--sm" />
              ) : (
                <div className="avatar avatar--sm avatar--primary">{getInitials(user.displayName)}</div>
              )}
            </button>

            {dropdownOpen && (
              <div className="navbar__dropdown glass-card">
                <div className="navbar__dropdown-header">
                  <p className="navbar__dropdown-name">{user.displayName}</p>
                  <p className="navbar__dropdown-email">{user.email}</p>
                </div>
                <div className="divider" style={{ margin: '8px 0' }}></div>
                <Link to={`/profile/${user.id}`} className="navbar__dropdown-link">
                  <User size={14} />
                  <span>My Profile</span>
                </Link>
                <button onClick={handleLogout} className="navbar__dropdown-link navbar__dropdown-link--logout">
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger toggle */}
          <button className="navbar__mobile-toggle btn btn--icon btn--ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Slide-down menu) */}
      {mobileMenuOpen && (
        <div className="navbar__mobile-drawer glass-card">
          <NavLink to="/feed" className={({ isActive }) => `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`}>
            <Home size={18} />
            <span>Feed</span>
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`}>
            <Calendar size={18} />
            <span>Events</span>
          </NavLink>
          <NavLink to="/organizations" className={({ isActive }) => `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`}>
            <Users size={18} />
            <span>Clubs</span>
          </NavLink>
          <div className="divider" style={{ margin: '8px 0' }}></div>
          <Link to={`/profile/${user.id}`} className="navbar__mobile-link">
            <User size={18} />
            <span>My Profile</span>
          </Link>
          <button onClick={handleLogout} className="navbar__mobile-link navbar__mobile-link--logout">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </nav>
  );
}
