import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage({ profile }) {
  const navigate = useNavigate();

  if (!profile) return <p>Vous n'avez pas rempli votre profil!</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Mon Profil</h2>
      <p><strong>Email :</strong> {profile.email}</p>
      {profile.firstName && <p><strong>Nom :</strong> {profile.firstName}</p>}
      {profile.city && <p><strong>Ville :</strong> {profile.city}</p>}

      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => navigate("/user-profile-form")}
      >
        Éditez votre profil
      </button>
    </div>
  );
}
