import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import { AuthContext } from '../context/AuthContext';
import Dropdown from './Dropdown';

const Header = () => {
    const { user, logout } = useContext(AuthContext);

    console.log("User logged in:", user); // Debug: Check the user state
    const navigate = useNavigate();
    

  const loginOptions = [
    { label: 'Log in', action: () => navigate('/login') },
    { label: 'Register', action: () => navigate('/register') }
];

const userOptions = [
    { label: 'Swipe', action: () => navigate('/swiping') },
    { label: 'Matches', action: () => navigate('/matches') },
    { label: 'Profile', action: () => navigate('/profile') },
    { label: 'Log out', action: logout }
];


    return (
      <header className="header">
      {/* Wrap your logo (here represented as text) with Link */}
      <Link to="/" className="logo-link">
        <h1>Logo Here</h1>
      </Link>
            <div className="header-right">
              <Dropdown options={user ? userOptions : loginOptions} />
            </div>
        </header>
    );
};

export default Header;
