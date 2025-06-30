// components/CreateEvent.jsx
import React, { useState } from "react";

export default function CreateEvent({ onEventCreated }) {
  const [name, setName] = useState("");
  const [dances, setDances] = useState([]);
  const [position, setPosition] = useState(null);
  const token = localStorage.getItem("token");

  const danceOptions = [
    "salsa", "bachata", "kizomba", "kompa", "rock", "westcoastswing", "tango"
  ];

  const toggleDance = (style) => {
    setDances((prev) =>
      prev.includes(style) ? prev.filter((d) => d !== style) : [...prev, style]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      alert("Veuillez autoriser l'accès à votre position.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          dances,
          lat: position[0],
          lng: position[1],
        }),
      });

      if (!res.ok) throw new Error("Erreur création événement");
      const data = await res.json();
      onEventCreated(data); // Rafraîchir la map
      setName("");
      setDances([]);
    } catch (err) {
      alert(err.message);
    }
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => alert("Impossible d’obtenir votre position.")
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Créer un événement</h3>
      <input
        type="text"
        placeholder="Nom de l’événement"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full"
        required
      />
      <div className="flex flex-wrap gap-2">
        {danceOptions.map((style) => (
          <label key={style} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dances.includes(style)}
              onChange={() => toggleDance(style)}
            />
            {style}
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={getLocation}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        📍 Utiliser ma position
      </button>
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        ➕ Créer
      </button>
    </form>
  );
}
