import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DancesList from './components/DancesList';
import UserProfileForm from './components/UserProfileForm';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      // Appeler la route /api/profile pour récupérer les infos
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
          localStorage.removeItem("token");
        });
    }
  }, []);

  if (!isLoggedIn) {
    return (
      <div>
        <Login onLogin={() => setIsLoggedIn(true)} />
        <Signup />
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Bienvenue sur Dance Connect</h1>
      {profile && <p>Connecté en tant que : {profile.email}</p>}
      <DancesList />
      <UserProfileForm />
      <button onClick={() => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setProfile(null);
      }}>
        Se déconnecter
      </button>
    </div>
  );
}

