// src/pages/MyEventsLiked.jsx
import React, { useEffect, useState } from "react";

export default function MyEventsLiked() {
  const [likedEvents, setLikedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLikedEvents = async () => {
      if (!token) {
        setError("Aucun token : vous devez vous connecter.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:3001/api/events/liked", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Erreur de chargement.");
        }

        const data = await res.json();
        setLikedEvents(data);
      } catch (err) {
        console.error("❌ Erreur chargement des événements likés :", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedEvents();
  }, [token]);

  if (loading) return <div className="text-center mt-10">Chargement...</div>;

  if (error) return <div className="text-center text-red-600 mt-10">Erreur : {error}</div>;

  if (likedEvents.length === 0) {
    return <div className="text-center mt-10">Aucun événement liké pour l’instant.</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Mes événements likés ❤️</h2>
      <ul className="space-y-4">
        {likedEvents.map((event) => (
          <li key={event.id} className="p-4 border rounded shadow">
            <h3 className="text-xl font-semibold">{event.name}</h3>
            <p className="text-gray-600">
              {new Date(event.date).toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p>{event.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
