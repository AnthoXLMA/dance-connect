import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserProfileForm from "./components/UserProfileForm";
import Dashboard from "./pages/Dashboard";

function ProfileWrapper({ profile, setProfile }) {
  const navigate = useNavigate();

  const isProfileComplete = profile && Object.keys(profile).length > 1; // Ex: vérifier si profil a plus qu’email

  const handleProfileSaved = (data) => {
    setProfile(data);
    navigate("/dashboard");
  };

  if (!isProfileComplete) {
    return <UserProfileForm onProfileSaved={handleProfileSaved} />;
  }

  return <Navigate to="/dashboard" />;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetch("http://localhost:3001/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error("Token invalide ou expiré");
          return res.json();
        })
        .then(data => setProfile(data))
        .catch(() => {
          setIsLoggedIn(false);
          setProfile(null);
          localStorage.removeItem("token");
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setProfile(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/profile" /> : (
              <div>
                <Login onLogin={() => setIsLoggedIn(true)} />
                <Signup onSignup={() => setIsLoggedIn(true)} />
              </div>
            )
          }
        />

        <Route
          path="/profile"
          element={
            isLoggedIn ? (
              <div className="App">
                <h1>Bienvenue sur Dance Connect</h1>
                {profile && <p>Connecté en tant que : {profile.email}</p>}
                <ProfileWrapper profile={profile} setProfile={setProfile} />
                <button onClick={handleLogout}>Se déconnecter</button>
              </div>
            ) : <Navigate to="/" />
          }
        />

        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <div className="App">
                <h1>Bienvenue sur Dance Connect</h1>
                {profile && <p>Connecté en tant que : {profile.email}</p>}
                <Dashboard profile={profile} />
                <button onClick={handleLogout}>Se déconnecter</button>
              </div>
            ) : <Navigate to="/" />
          }
        />
      </Routes>
    </Router>
  );
}
