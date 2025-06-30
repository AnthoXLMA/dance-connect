import React, { useState, useEffect } from "react";

// Utilitaire de distance
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function SwipeEvent() {
  const [token, setToken] = useState(null);
  const [index, setIndex] = useState(0);
  const [events, setEvents] = useState([]);
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState(null);
  const [likedEventIds, setLikedEventIds] = useState([]);

  // Récupérer token au montage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // Charger les IDs des événements likés
  useEffect(() => {
    if (!token) return;

    async function fetchLikedEvents() {
      try {
        const res = await fetch("http://localhost:3001/api/events/liked", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erreur récupération likés");
        const data = await res.json();
        setLikedEventIds(data.map((e) => e.id));
      } catch (error) {
        console.error("Erreur chargement des événements likés :", error);
      }
    }
    fetchLikedEvents();
  }, [token]);

  // Demander la localisation utilisateur
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Géolocalisation non supportée par ce navigateur.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.warn("Erreur localisation :", err.message);
        setGeoError("Impossible d’obtenir la localisation.");
      }
    );
  }, []);

  // Récupérer tous les événements (une fois)
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3001/api/events");
        if (!res.ok) throw new Error("Erreur lors du chargement des événements");
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error(error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Filtrer événements proches et non likés
  useEffect(() => {
    if (events.length === 0) return;

    if (userLocation) {
      const filtered = events.filter((event) => {
        if (event.lat == null || event.lng == null) return false;
        if (likedEventIds.includes(event.id)) return false; // Exclure likés

        const dist = getDistanceKm(userLocation.lat, userLocation.lng, event.lat, event.lng);
        return dist <= 1000;
      });
      setNearbyEvents(filtered);
    } else {
      const filtered = events.filter((event) => !likedEventIds.includes(event.id));
      setNearbyEvents(filtered);
    }
    setIndex(0);
  }, [userLocation, events, likedEventIds]);

  if (loading) {
    return <div className="text-center mt-20">Chargement des événements...</div>;
  }

  if (geoError) {
    console.warn(geoError);
  }

  if (nearbyEvents.length === 0) {
    return (
      <div className="text-center mt-20">
        Aucun événement à proximité {userLocation ? "🥲" : "(localisation non disponible)"}
      </div>
    );
  }

  const event = nearbyEvents[index % nearbyEvents.length];

  const handleLike = async (eventId) => {
    if (!token) {
      alert("Vous devez être connecté pour liker un événement.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/api/events/${eventId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

      // Met à jour la liste des likés pour filtrer immédiatement
      setLikedEventIds((prev) => [...prev, eventId]);

      // Supprimer l'événement liké de la liste affichée
      setNearbyEvents((prev) => prev.filter((e) => e.id !== eventId));
      setIndex(0);
    } catch (error) {
      console.error("Erreur lors du like :", error);
    }
  };

  const handleIgnore = async (eventId) => {
    if (!token) {
      alert("Vous devez être connecté pour ignorer un événement.");
      return;
    }
    try {
      await fetch(`http://localhost:3001/api/events/${eventId}/ignore`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Erreur ignore :", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-10">
      <div className="relative z-10 bg-white border border-gray-200 rounded-2xl shadow-lg w-full max-w-md p-6 transition-shadow hover:shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{event.name}</h2>
        <p className="text-gray-500 mb-2">
          📅{" "}
          {event.date
            ? new Date(event.date).toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Date non définie"}
        </p>
        <p className="text-gray-700 text-sm mb-4">{event.description || "Pas de description"}</p>

        <div className="flex justify-around mt-6">
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-full shadow-md transition"
            onClick={() => handleLike(event.id)}
          >
            ❤️ Like
          </button>
          <button
            className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-full shadow-md transition"
            onClick={() => handleIgnore(event.id)}
          >
            ❌ Ignorer
          </button>
        </div>
      </div>
    </div>
  );
}
