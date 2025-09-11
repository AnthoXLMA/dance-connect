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
          <div
            key={event.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#fff",
            }}
          >
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.name}
                style={{
                  width: "100%",
                  height: 160,
                  objectFit: "cover",
                  borderRadius: "6px",
                  marginBottom: 12,
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 160,
                  backgroundColor: "#ccc",
                  borderRadius: "6px",
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#666",
                  fontWeight: "bold",
                }}
              >
                Pas d’image
              </div>
            )}

            <h3 style={{ margin: "0 0 8px", fontWeight: "700", fontSize: 20 }}>
              {event.name}
            </h3>
            <p style={{ flexGrow: 1, color: "#555", marginBottom: 12 }}>
              {event.description || "Pas de description disponible."}
            </p>

            <button
              onClick={() => handleAttend(event.id)}
              style={{
                backgroundColor: "#22c55e",
                color: "white",
                padding: "10px 0",
                borderRadius: 6,
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#16a34a")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#22c55e")}
            >
              J’y vais
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
