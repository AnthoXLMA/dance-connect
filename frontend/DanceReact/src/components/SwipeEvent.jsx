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

// Événements fictifs
const sampleEvents = [
  {
    id: 301,
    name: "Soirée Salsa à Lyon",
    lat: 45.75,
    lng: 4.85,
    date: "2025-07-10",
    description: "Ambiance caliente et DJ latino 🎶",
  },
  {
    id: 302,
    name: "West Coast à Toulouse",
    lat: 43.6,
    lng: 1.44,
    date: "2025-07-14",
    description: "Niveau débutant à confirmé 🕺",
  },
  {
    id: 303,
    name: "Bal Tango à Nantes",
    lat: 47.22,
    lng: -1.55,
    date: "2025-07-18",
    description: "Milonga en plein air 💃",
  },
  {
    id: 304,
    name: "Kompa sur la plage à Quiberon",
    lat: 47.4833,
    lng: -3.1167,
    date: "2025-07-22",
    description: "Kompa sunset vibes au bord de la mer 🌅",
  },
  {
    id: 305,
    name: "Kizomba à Vannes",
    lat: 47.6559,
    lng: -2.7603,
    date: "2025-07-25",
    description: "Soirée kizomba avec DJ en direct 🎧",
  },
];

export default function SwipeEvent() {
  const token = localStorage.getItem("token");

  const [index, setIndex] = useState(0);
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const filtered = sampleEvents.filter((event) => {
          const distance = getDistanceKm(latitude, longitude, event.lat, event.lng);
          return distance <= 1000;
        });

        setNearbyEvents(filtered);
      },
      (err) => {
        console.error("Erreur localisation", err);
        setNearbyEvents(sampleEvents); // fallback
      }
    );
  }, []);

  if (!userLocation && nearbyEvents.length === 0) {
    return <div className="text-center mt-20">Recherche d’événements proches...</div>;
  }

  if (nearbyEvents.length === 0) {
    return <div className="text-center mt-20">Aucun événement à proximité 🥲</div>;
  }

  const event = nearbyEvents[index % nearbyEvents.length];

  const handleAttend = async (eventId) => {
    try {
      await fetch(`http://localhost:3001/api/events/${eventId}/attend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Erreur participation :", error);
    }
  };

  const handleLike = async (eventId) => {
    try {
      await fetch(`http://localhost:3001/api/events/${eventId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Erreur like :", error);
    }
  };

  const handleIgnore = async (eventId) => {
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
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="bg-white shadow rounded p-6 max-w-sm w-full text-center">
        <h2 className="text-xl font-bold mb-1">{event.name}</h2>
        <p className="text-gray-600 mb-1">{event.date}</p>
        <p className="mb-4">{event.description}</p>

        <div className="flex justify-around mt-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-full"
            onClick={() => handleAttend(event.id)}
          >
            J’y vais
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-full"
            onClick={() => handleLike(event.id)}
          >
            ❤️ Like
          </button>
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded-full"
            onClick={() => handleIgnore(event.id)}
          >
            Ignorer
          </button>
        </div>
      </div>
    </div>
  );
}
