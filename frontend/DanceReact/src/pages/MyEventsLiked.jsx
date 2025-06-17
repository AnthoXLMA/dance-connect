// src/pages/MyEventsLiked.jsx
import React, { useEffect, useState } from "react";

export default function MyEventsLiked() {
  const [likedEvents, setLikedEvents] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLikedEvents = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/events/liked", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setLikedEvents(data);
      } catch (err) {
        console.error("Erreur lors du chargement des événements likés", err);
      }
    };

    fetchLikedEvents();
  }, []);

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
            <p className="text-gray-600">{event.date}</p>
            <p>{event.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
