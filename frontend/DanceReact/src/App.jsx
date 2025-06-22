import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
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
import LikedUsers from "./pages/LikedUsers";
import TopNavbar from "./components/TopNavbar";
import ProfileEdit from "./pages/ProfileEdit";

// 🔐 Route protégée
function ProtectedRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/login" />;
}

// ⚙️ Redirection conditionnelle vers formulaire si profil incomplet
function ProfileWrapper({ profile, setProfile }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isProfileComplete = profile && profile.firstName; // adapte selon ta structure

  const handleProfileSaved = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const res = await fetch("http://localhost:3001/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erreur récupération profil");
    const data = await res.json();
    setProfile(data);
    navigate("/dashboard");
  } catch (err) {
    console.error(err);
  }
};


  if (!isProfileComplete) {
    return <UserProfileForm onProfileSaved={handleProfileSaved} />;
  }

  return <Navigate to="/dashboard" />;
}

// Wrapper pour édition de profil avec navigation après sauvegarde
function UserProfileEditWrapper({ profile, setProfile }) {
  const navigate = useNavigate();

  return (
    <UserProfileForm
      defaultValues={profile}
      onProfileSaved={async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
          const res = await fetch("http://localhost:3001/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
            console.log(token);
          if (!res.ok) throw new Error("Erreur récupération profil");
          const data = await res.json();
          setProfile(data);
          navigate("/profile");
        } catch (err) {
          console.error(err);
        }
      }}
    />
  );
}

// 🌐 Layout avec navigation et déconnexion + TopNavbar en haut
function PrivateLayout({ isLoggedIn, profile, setProfile, handleLogout }) {
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
          <Route path="/profile" element={<ProfilePage profile={profile} />} />

          <Route
            path="/profile-edit"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ProfileEdit profile={profile} setProfile={setProfile} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-profile-form"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <UserProfileEditWrapper profile={profile} setProfile={setProfile} />
              </ProtectedRoute>
            }
          />

          <Route path="/swipe" element={<Swipe />} />
          <Route path="/swipe-events" element={<SwipeEvent />} />
          <Route path="/liked-events" element={<MyEventsLiked />} />
          <Route path="/liked-users" element={<LikedUsers />} />
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
        const res = await fetch("http://localhost:3001/api/users/me", {
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
              profile && profile.firstName ? (
                <Navigate to="/dashboard" />
              ) : (
                <Navigate to="/profile-form" />
              )
            ) : (
              <Home />
            )
          }
        />

        <Route
          path="/login"
          element={
            <Login
              onLogin={() => {
                setIsLoggedIn(true);
                // Recharge manuellement le profil ici
                const token = localStorage.getItem("token");
                if (token) {
                  fetch("http://localhost:3001/api/users/me", {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  })
                    .then((res) => {
                      if (!res.ok) throw new Error("Échec du profil");
                      return res.json();
                    })
                    .then((data) => setProfile(data))
                    .catch((err) => {
                      console.error("Erreur après login :", err.message);
                      setIsLoggedIn(false);
                      localStorage.removeItem("token");
                    });
                }
              }}
            />
          }
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
              <PrivateLayout
                isLoggedIn={isLoggedIn}
                profile={profile}
                setProfile={setProfile}
                handleLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
