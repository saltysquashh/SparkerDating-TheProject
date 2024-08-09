import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import '../styles/Header.css'; 
import { AuthContext } from '../context/AuthContext';
import Dropdown from './Dropdown';
import logoImage from '../images/LogoV2.png'; 

const Header = () => {
    const { user, logout } = useContext(AuthContext);

    console.log("User logged in:", user);
    const navigate = useNavigate();
    
  //   const navigateToProfile = () => {
  //     navigate('/profile'); // For React Router v6
  // };

  const loginOptions = [
    { label: 'Log in', action: () => navigate('/login') },
    { label: 'Register', action: () => navigate('/register') }
];

const userOptions = [
    { label: 'Swipe', action: () => navigate('/swiping') },
    { label: 'Matches', action: () => navigate('/matches') },
    { label: 'Swipe history', action: () => navigate('/swipehistory') },
    { label: 'Profile', action: () => navigate('/profile') },
    { label: 'Admin panel', action: () => navigate('/adminpanel') },
    { label: 'Log out', action: logout }
];


return (
  <header className="header">
      <Link to="/" className="logo-link">
      <div className="sparker-title">
          <h1>Sparker </h1>
          </div>
          <img src="/images/LogoV2.png" alt="Logo" className="header-logo" />
      </Link>
      <div className="header-right">
          <Dropdown options={user ? userOptions : loginOptions} />
      </div>
  </header>
);
};

export default Header;
