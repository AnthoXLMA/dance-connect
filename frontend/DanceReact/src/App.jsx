import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import UserProfileForm from "./components/UserProfileForm";
import BottomNavBar from "./components/BottomNavBar";
import Swipe from "./components/Swipe";
import SwipeEvent from "./components/SwipeEvent";
import MyEventsLiked from "./pages/MyEventsLiked";
import TopNavbar from "./components/TopNavbar";  // <-- import TopNavbar


// 🔐 Route protégée
function ProtectedRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/login" />;
}

// ⚙️ Redirection conditionnelle vers formulaire si profil incomplet
function ProfileWrapper({ profile, setProfile }) {
  const navigate = useNavigate();
  const isProfileComplete = profile && Object.keys(profile).length > 1;

  const handleProfileSaved = (data) => {
    setProfile(data);
    navigate("/dashboard");
  };

  if (!isProfileComplete) {
    return <UserProfileForm onProfileSaved={handleProfileSaved} />;
  }

  return <Navigate to="/dashboard" />;
}

// 🌐 Layout avec navigation et déconnexion + TopNavbar en haut
function PrivateLayout({ profile, handleLogout }) {
  const location = useLocation();
  const showNavbar = !["/login", "/signup"].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen pb-20 relative">
      {/* Top Navbar visible si pas sur login/signup */}
      {showNavbar && <TopNavbar />}

      <div className="flex-grow">
        <Routes>
          <Route path="/dashboard" element={<Dashboard profile={profile} />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/swipe" element={<Swipe />} />
          <Route path="/swipe-events" element={<SwipeEvent />} />
          <Route path="/mes-evenements-likes" element={<MyEventsLiked />} />
        </Routes>

        <div className="text-center my-4">
          <button onClick={handleLogout}>Se déconnecter</button>
        </div>
      </div>

      {/* Bottom Navbar */}
      {showNavbar && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomNavBar />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoadingProfile(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Token invalide");

        const data = await res.json();
        setIsLoggedIn(true);
        setProfile(data);
      } catch (err) {
        console.error("Erreur lors du chargement du profil :", err.message);
        setIsLoggedIn(false);
        setProfile(null);
        localStorage.removeItem("token");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setProfile(null);
  };

  if (loadingProfile) {
    return <div className="text-center mt-20">Chargement du profil...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              profile && Object.keys(profile).length > 1 ? (
                <Navigate to="/dashboard" />
              ) : (
                <Navigate to="/profile-form" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/login"
          element={<Login onLogin={() => setIsLoggedIn(true)} />}
        />

        <Route
          path="/signup"
          element={<Signup onSignup={() => setIsLoggedIn(true)} />}
        />

        <Route
          path="/profile-form"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <ProfileWrapper profile={profile} setProfile={setProfile} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/*"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <PrivateLayout profile={profile} handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
