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
  // Token stocké en localStorage
  const [token, setToken] = useState(null);
  const [index, setIndex] = useState(0);
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // Récupérer la localisation utilisateur
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.error("Erreur localisation", err);
        setNearbyEvents([]); // fallback si pas de localisation
      }
    );
  }, []);

  // Récupérer les events depuis le backend une fois la localisation connue
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("http://localhost:3001/api/events");
        if (!res.ok) throw new Error("Erreur lors du chargement des événements");
        const events = await res.json();

        if (userLocation) {
          // Filtrer par distance max 1000 km
          const filtered = events.filter((event) => {
            const distance = getDistanceKm(userLocation.lat, userLocation.lng, event.lat, event.lng);
            return distance <= 1000;
          });
          setNearbyEvents(filtered);
        } else {
          setNearbyEvents(events);
        }
      } catch (error) {
        console.error(error);
        setNearbyEvents([]);
      }
    }
    if (userLocation) {
      fetchEvents();
    }
  }, [userLocation]);

  if (!userLocation && nearbyEvents.length === 0) {
    return <div className="text-center mt-20">Recherche d’événements proches...</div>;
  }

  if (nearbyEvents.length === 0) {
    return <div className="text-center mt-20">Aucun événement à proximité 🥲</div>;
  }

  const event = nearbyEvents[index % nearbyEvents.length];

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const handleAttend = async (eventId) => {
    if (!token) {
      alert("Vous devez être connecté pour participer à un événement.");
      return;
    }
    try {
      await fetch(`http://localhost:3001/api/events/${eventId}/attend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      });
      setIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Erreur participation :", error);
    }
  };

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

      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }

      setIndex((prev) => prev + 1);
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
          ...authHeaders,
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
          📅 {new Date(event.date).toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="text-gray-700 text-sm mb-4">{event.description}</p>

        <div className="flex justify-around mt-6">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-full shadow-md transition"
            onClick={() => handleAttend(event.id)}
          >
            ✅ J’y vais
          </button>
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
