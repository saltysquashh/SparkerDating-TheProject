import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import Header from './components/Header';
import HomePage from './components/HomePage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import { AuthProvider } from './context/AuthContext';
import ProfilePage from './components/ProfilePage';
import UserInfoPage from './components/UserInfoPage';
import PreferencePage from './components/PreferencePage';
import { setAuthToken, getAuthToken } from './utilities/authToken';
import SwipingPage from './components/SwipingPage';
import CustomizationPage from './components/CustomizationPage';
import MatchesPage from './components/MatchesPage';
import MatchDetailsPage from './components/MatchDetailsPage';
import { ChakraProvider } from '@chakra-ui/react';
import MatchChatPage from './components/MatchChatPage';
import SwipeHistoryPage from './components/SwipeHistoryPage';
import SwipeDetailsPage from './components/SwipeDetailsPage';
import AdminPanelPage from './components/AdminPanelPage';

function App() {

  const token = getAuthToken();
  if (token) {
    setAuthToken(token); //make sure that the the token is set in Axios headers
  }

  return (
    <ChakraProvider>
    <AuthProvider>
      <Header /> {/* Include your Header component here */}
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Set HomePage as the root route */}
        <Route path="/register" element={<RegisterPage />} /> {/* Add this line */}
        <Route path="/login" element={<LoginPage />} /> {/* Add this line */}
        <Route path="/profile" element={<ProfilePage />}> 
                    <Route path="userinfo" element={<UserInfoPage />} />
                    <Route path="preferences" element={<PreferencePage />} />
                    <Route path="Customization" element={<CustomizationPage />} />
                </Route>
        <Route path="/swiping" element={<SwipingPage />} /> {/* Add this line */}
        <Route path="/matches" element={<MatchesPage />} /> {/* MatchesPage as a separate route */}
        <Route path="/matches/match/:matchId/:matchUserId" element={<MatchDetailsPage />} /> {/* MatchDetailsPage as a separate route */}
        <Route path="/matches/match/:matchId/chat/:matchUserId" element={<MatchChatPage />} /> {/* MatchDetailsPage as a separate route */}
        <Route path="/swipehistory" element={<SwipeHistoryPage />} /> {/* Add this line */}
        <Route path="/swipehistory/swipedetails/:swipeId/:swipeUserId" element={<SwipeDetailsPage />} /> {/* MatchDetailsPage as a separate route */}
        <Route path="/adminpanel" element={<AdminPanelPage />} /> {/* Add this line */}
      </Routes>
    </AuthProvider>
    </ChakraProvider>
  );
}




export default App;

