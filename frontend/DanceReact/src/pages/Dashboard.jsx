import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    // Ne changer la vue que si la position est différente (évite les sauts inutiles)
    const currentCenter = map.getCenter();
    if (
      currentCenter.lat !== center[0] ||
      currentCenter.lng !== center[1]
    ) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

const eventIcon = L.divIcon({
  className: "custom-icon",
  html: `<div style="background:#e74c3c;width:24px;height:24px;border-radius:4px;text-align:center;line-height:24px;color:#fff;font-size:16px;">E</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});
const dancerIcon = L.divIcon({
  className: "custom-icon",
  html: `<div style="background:#27ae60;width:24px;height:24px;border-radius:4px;text-align:center;line-height:24px;color:#fff;font-size:16px;">D</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [position, setPosition] = useState([48.8566, 2.3522]);
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [nearbyDancers, setNearbyDancers] = useState([]);
  const [selectedDances, setSelectedDances] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const token = localStorage.getItem("token");

  const danceStyles = [
    { value: "salsa", label: "Salsa" },
    { value: "bachata", label: "Bachata" },
    { value: "kizomba", label: "Kizomba" },
    { value: "kompa", label: "Kompa" },
    { value: "westcoastswing", label: "West Coast Swing" },
    { value: "rock", label: "Rock" },
    { value: "tango", label: "Tango" },
  ];

  // Chargement du profil une fois au montage
  useEffect(() => {
    async function fetchProfile() {
      if (!token) return;
      try {
        const resp = await fetch("http://localhost:3001/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await resp.json();
        setProfile(data);
        console.log("Profil reçu:", data);

        if (
          typeof data.lat === "number" && !isNaN(data.lat) &&
          typeof data.lng === "number" && !isNaN(data.lng)
        ) {
          setPosition([data.lat, data.lng]);
        } else {
          navigator.geolocation.getCurrentPosition(
            (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
            () => console.warn("Géoloc non disponible, position par défaut utilisée")
          );
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchProfile();
  }, [token]);

  // Chargement des événements et danseurs proches dès que la position est valide
  useEffect(() => {
    if (!token || !position || !Array.isArray(position)) return;

    const [lat, lng] = position;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.warn("Position invalide, pas de chargement nearby.");
      return;
    }

    async function loadNearby() {
      try {
        console.log("Chargement nearby à partir de :", lat, lng);

        const [eventsRes, dancersRes] = await Promise.all([
          fetch("http://localhost:3001/api/events", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:3001/api/users/nearby?lat=${lat}&lng=${lng}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!eventsRes.ok) {
          const errData = await eventsRes.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Erreur HTTP ${eventsRes.status} lors du chargement des événements`
          );
        }

        if (!dancersRes.ok) {
          const errData = await dancersRes.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Erreur HTTP ${dancersRes.status} lors du chargement des danseurs`
          );
        }

        const eventsData = await eventsRes.json();
        const dancersData = await dancersRes.json();

        console.log("Events reçus:", eventsData);
        console.log("Danseurs reçus:", dancersData);

        setNearbyEvents(Array.isArray(eventsData) ? eventsData : []);
        setNearbyDancers(Array.isArray(dancersData) ? dancersData : []);
      } catch (err) {
        console.error("Erreur loading nearby:", err.message);
      }
    }

    loadNearby();
  }, [position, token]);

  // Toggle sélection danse par 'value'
  const toggleDance = (danceValue) => {
    setSelectedDances((prev) =>
      prev.includes(danceValue) ? prev.filter((d) => d !== danceValue) : [...prev, danceValue]
    );
  };

  // Filtrage des événements et danseurs selon selectedDances (par valeurs)
  const filteredEvents = nearbyEvents.filter(
    (ev) =>
      selectedDances.length === 0 ||
      (ev.dances && ev.dances.some((d) => selectedDances.includes(d)))
  );
  const filteredDancers = nearbyDancers.filter(
    (us) =>
      selectedDances.length === 0 ||
      (us.dances && us.dances.some((d) => selectedDances.includes(d)))
  );

  console.log("profile:", profile);

  if (!profile) return <p>Chargement du profil...</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Bienvenue, {profile.firstName} !
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2 bg-white p-4 rounded shadow flex flex-col md:h-[500px]">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            Carte des événements et danseurs proches
          </h3>
          <div className="mb-4 flex flex-wrap gap-3 items-center">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => {
                navigator.geolocation.getCurrentPosition(
                  (pos) =>
                    setPosition([pos.coords.latitude, pos.coords.longitude]),
                  () => alert("Impossible d'obtenir votre position.")
                );
              }}
            >
              Ma position
            </button>
            {danceStyles.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedDances.includes(value)}
                  onChange={() => toggleDance(value)}
                />
                {label}
              </label>
            ))}
          </div>
          <div className="flex gap-6 text-sm mb-4">
            <div className="flex items-center gap-2">
              <div
                style={{ background: "#e74c3c", width: 16, height: 16 }}
              />
              Événement
            </div>
            <div className="flex items-center gap-2">
              <div
                style={{ background: "#27ae60", width: 16, height: 16 }}
              />
              Danseur
            </div>
          </div>
          <div className="flex-grow">
            <MapContainer
              center={position}
              zoom={6}
              style={{ height: 400, width: "100%" }}
              scrollWheelZoom={false}
            >
              <ChangeMapView center={position} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Circle center={position} radius={30000} color="blue" />
              {filteredEvents
                .filter(
                  (ev) =>
                    typeof ev.lat === "number" &&
                    typeof ev.lng === "number" &&
                    !isNaN(ev.lat) &&
                    !isNaN(ev.lng)
                )
                .map(({ id, name, lat, lng }) => (
                  <Marker key={id} position={[lat, lng]} icon={eventIcon}>
                    <Popup>{name}</Popup>
                  </Marker>
                ))}
              {filteredDancers
                .filter(
                  (us) =>
                    typeof us.lat === "number" &&
                    typeof us.lng === "number" &&
                    !isNaN(us.lat) &&
                    !isNaN(us.lng)
                )
                .map(({ id, firstName, lat, lng, email }) => (
                  <Marker
                    key={id}
                    position={[lat, lng]}
                    icon={dancerIcon}
                    eventHandlers={{
                      click: () =>
                        setChatUser({ id, name: firstName, email }),
                    }}
                  >
                    <Popup>{firstName}</Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </section>
        <section className="md:col-span-1 bg-white p-4 rounded shadow sticky top-4">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            Votre profil
          </h3>
          <p>
            <strong>Danses :</strong>{" "}
            {(profile.dances || [])
              .map((danceValue) => {
                const found = danceStyles.find((d) => d.value === danceValue);
                return found ? found.label : danceValue;
              })
              .join(", ") || "Non renseigné"}
          </p>
          <p>
            <strong>Ville :</strong> {profile.location || "Non renseigné"}
          </p>
          <p>
            <strong>Bio :</strong> {profile.bio || "Non renseigné"}
          </p>
        </section>
      </div>

      {chatUser && (
        <section className="mt-8 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">
            Chat avec {chatUser.name}
          </h3>
          {/* implémente ton chat ici */}
        </section>
      )}
    </div>
  );
}
