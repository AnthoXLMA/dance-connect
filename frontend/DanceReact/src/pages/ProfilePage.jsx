import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token"); // ✅ Ajout ici

    if (!token) {
      setError("Utilisateur non connecté.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:3001/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => {
        console.error("Erreur lors du chargement du profil :", err);
        setError("Impossible de charger le profil.");
      })
      .finally(() => setLoading(false));
  }, []);

  const formatLabel = (key) => {
    const labels = {
      email: "Email",
      firstName: "Prénom",
      lastName: "Nom",
      bio: "Biographie",
      location: "Ville",
      geoLocation: "Position géographique",
      dances: "Danses pratiquées",
      levels: "Niveaux",
      availability: "Disponibilité",
      username: "Nom d'utilisateur",
      avatarUrl: "Avatar",
    };
    return labels[key] || key;
  };

  if (loading) return <p className="p-4">Chargement du profil...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!user) return <p className="p-4 text-red-500">Profil non disponible.</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Mon Profil</h2>

      {user.avatarUrl && (
        <img
          src={user.avatarUrl}
          alt="Avatar"
          className="w-32 h-32 rounded-full mb-4 object-cover"
        />
      )}

      {Object.entries(user).map(([key, value]) => {
        if (["id", "createdAt", "updatedAt", "password"].includes(key)) return null;

        if (key === "dances" && Array.isArray(value)) {
          return (
            <p key={key}>
              <strong>{formatLabel(key)} :</strong> {value.join(", ")}
            </p>
          );
        }

        if (key === "levels" && value && typeof value === "object") {
          return (
            <div key={key}>
              <strong>{formatLabel(key)} :</strong>
              <ul className="ml-4 list-disc">
                {Object.entries(value).map(([dance, level]) => (
                  <li key={dance}>
                    {dance} : {level}
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        if (key === "geoLocation" && value && typeof value === "object") {
          return (
            <p key={key}>
              <strong>{formatLabel(key)} :</strong> lat: {value.lat}, lng: {value.lng}
            </p>
          );
        }

        return (
          <p key={key}>
            <strong>{formatLabel(key)} :</strong> {String(value)}
          </p>
        );
      })}

      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => navigate("/user-profile-form")}
      >
        Éditez votre profil
      </button>
    </div>
  );
}
