import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <h2>JobPortal</h2>
        </Link>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Home
          </Link>
          <Link to="/jobs" className="navbar-link">
            Jobs
          </Link>
          
          {user ? (
            <>
              <Link to="/applications" className="navbar-link">
                My Applications
              </Link>
              <Link to="/profile" className="navbar-link">
                Profile
              </Link>
              {isAdmin() && (
                <Link to="/admin" className="navbar-link">
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="navbar-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-button">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
