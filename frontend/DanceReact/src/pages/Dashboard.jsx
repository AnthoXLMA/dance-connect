import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ⚠️ Configuration des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

// ✅ Icône rouge pour les événements
const redIcon = new L.Icon({
  iconUrl: "/images/marker-icon-red.png", // place ce fichier dans public/images/
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const Dashboard = () => {
  const [position, setPosition] = useState([48.8566, 2.3522]); // Paris par défaut
  const [nearbyDancers, setNearbyDancers] = useState([]);
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);

  // Nouveaux états pour le filtre d'affichage
  const [showEvents, setShowEvents] = useState(true);
  const [showDancers, setShowDancers] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();
        setUser(data);

        if (data.lat && data.lng) {
          setPosition([data.lat, data.lng]);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur :", err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const loadNearby = async () => {
      try {
        const dancersRes = await fetch("/api/users/nearby");
        const dancersData = await dancersRes.json();

        if (Array.isArray(dancersData)) {
          const filtered = dancersData.filter(
            (d) => typeof d.lat === "number" && typeof d.lng === "number"
          );
          setNearbyDancers(filtered);

          if (filtered.length > 0 && (!user?.lat || !user?.lng)) {
            setPosition([filtered[0].lat, filtered[0].lng]);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des danseurs proches :", error);
      }
    };

    loadNearby();
  }, [user]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();

        const filtered = data.filter(
          (e) => typeof e.lat === "number" && typeof e.lng === "number"
        );
        setEvents(filtered);
      } catch (err) {
        console.error("Erreur lors du chargement des événements :", err);
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    if (!user || user.lat || user.lng) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const res = await fetch("/api/users/me", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              lat: latitude,
              lng: longitude,
            }),
          });

          const updated = await res.json();
          setUser(updated);
          setPosition([latitude, longitude]);
        } catch (err) {
          console.error("Erreur lors de la mise à jour de la position :", err);
        }
      },
      (err) => {
        console.warn("Impossible d'obtenir la géolocalisation :", err);
      }
    );
  }, [user]);

  return (
    <div>
      <h2>Carte des danseurs et événements</h2>

      {/* Filtre affichage */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: 20 }}>
          <input
            type="checkbox"
            checked={showEvents}
            onChange={() => setShowEvents(!showEvents)}
          />{" "}
          Afficher les événements
        </label>
        <label>
          <input
            type="checkbox"
            checked={showDancers}
            onChange={() => setShowDancers(!showDancers)}
          />{" "}
          Afficher les danseurs
        </label>
      </div>

      <MapContainer
        center={[46.603354, 1.888334]} // Centre géographique de la France
        zoom={6}                       // Zoom plus large pour voir toute la France
        style={{ height: "80vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {showDancers &&
          nearbyDancers.map((dancer) => (
            <Marker key={`dancer-${dancer.id}`} position={[dancer.lat, dancer.lng]}>
              <Popup>
                <strong>{dancer.username || `${dancer.firstName} ${dancer.lastName}`}</strong>
                <br />
                {dancer.bio}
                <br />
                Danse(s): {Array.isArray(dancer.dances) ? dancer.dances.join(", ") : ""}
                <br />
                Niveau: {JSON.stringify(dancer.levels)}
              </Popup>
            </Marker>
          ))}

        {showEvents &&
          events.map((event) => (
            <Marker
              key={`event-${event.id}`}
              position={[event.lat, event.lng]}
              icon={redIcon}
            >
              <Popup>
                <strong>{event.name}</strong>
                <br />
                {event.description}
                <br />
                {event.date && new Date(event.date).toLocaleString()}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default Dashboard;
