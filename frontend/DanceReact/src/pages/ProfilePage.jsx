// src/pages/ProfilePage.jsx
import React from "react";

export default function ProfilePage({ profile }) {
  if (!profile) return <p>Chargement du profil...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Mon Profil</h2>
      <p><strong>Email :</strong> {profile.email}</p>
      {profile.name && <p><strong>Nom :</strong> {profile.name}</p>}
      {profile.city && <p><strong>Ville :</strong> {profile.city}</p>}
      {/* Ajoute d'autres champs selon ton modèle */}
    </div>
  );
}
