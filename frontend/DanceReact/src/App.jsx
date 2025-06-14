import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserProfileForm from "./components/UserProfileForm";
import Dashboard from "./pages/Dashboard";
import BottomNavBar from "./components/BottomNavBar";
import MapView from "./pages/MapView";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";

// 🔐 Wrapper pour routes protégées
function ProtectedRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/" />;
}

// ⚙️ Redirection vers formulaire si profil incomplet
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

// 🌐 Layout privé avec navigation et déconnexion
function PrivateLayout({ profile, handleLogout }) {
  return (
    <div className="pb-20"> {/* Espace pour BottomNavBar */}
      <Routes>
        <Route path="/dashboard" element={<Dashboard profile={profile} />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* ⚠️ Ajoute ici toutes les routes accessibles en privé */}
      </Routes>

      <BottomNavBar />
      <div className="text-center my-4">
        <button onClick={handleLogout}>Se déconnecter</button>
      </div>
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState(null);

  // Au montage, si token présent, on set isLoggedIn pour lancer la récupération
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Quand isLoggedIn passe à true, on récupère le profil
  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem("token");
      fetch("http://localhost:3001/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Token invalide ou expiré");
          return res.json();
        })
        .then((data) => setProfile(data))
        .catch(() => {
          setIsLoggedIn(false);
          setProfile(null);
          localStorage.removeItem("token");
        });
    } else {
      setProfile(null); // Nettoie profil si déconnecté
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  console.log("isLoggedIn =", isLoggedIn);
  console.log("profile =", profile);


  return (
    <Router>
      <Routes>
        {/* Page d’accueil : redirige selon état */}
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
        {/* Login / Signup */}
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/signup" element={<Signup onSignup={() => setIsLoggedIn(true)} />} />

        {/* Formulaire profil */}
        <Route
          path="/profile-form"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <ProfileWrapper profile={profile} setProfile={setProfile} />
            </ProtectedRoute>
          }
        />

        {/* Private routes */}
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
