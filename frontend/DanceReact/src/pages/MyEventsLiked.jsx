import React, { useEffect, useState } from "react";
import EventCard from "../components/EventCard";

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

  // Fonction pour participer à un événement ("J'y vais")
  const handleAttend = async (eventId) => {
    if (!token) {
      alert("Vous devez être connecté pour participer à un événement.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/api/events/${eventId}/attend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la participation.");
      }

      // Retirer l'événement de la liste locale des likés après participation
      setLikedEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error("Erreur participation :", error);
      alert("Erreur lors de la participation à l'événement.");
    }
  };

  if (loading) return <div className="text-center mt-10">Chargement...</div>;
  if (error) return <div className="text-center text-red-600 mt-10">Erreur : {error}</div>;
  if (likedEvents.length === 0)
    return <div className="text-center mt-10">Aucun événement liké pour l’instant.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 text-center">❤️ Mes événements likés</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {likedEvents.map((event) => (
          <EventCard key={event.id} event={event} onAttend={handleAttend} />
        ))}
      </div>
    </div>
  );
}
