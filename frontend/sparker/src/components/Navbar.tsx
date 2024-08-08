// Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css'; // Assuming you will create a separate CSS file for Navbar

const Navbar = () => {
  return (
    
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">YourAppLogo</Link>
      </div>
      <div className="navbar-links">
        <Link to="/login">Login</Link>
        <Link to="/signup">Sign Up</Link>
        {/* Add other links as needed */}
      </div>
    </nav>
  );
};



export default Navbar;
