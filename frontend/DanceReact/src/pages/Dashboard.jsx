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
    map.setView(center, map.getZoom(), { animate: true });
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
        console.log("Profil reçu:", data); // 👈 Ajoute ceci
        // On positionne la map sur la position du profil si dispo
        if (data?.lat && data?.lng) {
          setPosition([data.lat, data.lng]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchProfile();
  }, [token]);

  // Chargement des événements et danseurs proches dès que le profil est chargé
  useEffect(() => {
    if (!profile) return;
    async function loadNearby() {
      try {
        const [eventsRes, dancersRes] = await Promise.all([
          fetch("http://localhost:3001/api/events", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3001/api/users/nearby", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const eventsData = await eventsRes.json();
        const dancersData = await dancersRes.json();

        console.log("Events reçus:", eventsData);
        console.log("Danseurs reçus:", dancersData);

        setNearbyEvents(eventsData);
        setNearbyDancers(dancersData);
      } catch (err) {
        console.error("Erreur loading nearby:", err);
      }
    }
    loadNearby();
  }, [profile, token]);

  const toggleDance = (dance) => {
    setSelectedDances((prev) =>
      prev.includes(dance) ? prev.filter((d) => d !== dance) : [...prev, dance]
    );
  };

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
            {[
              "Salsa",
              "Bachata",
              "Kizomba",
              "Kompa",
              "West Coast Swing",
              "Rock",
              "Tango",
            ].map((dance) => (
              <label
                key={dance}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedDances.includes(dance)}
                  onChange={() => toggleDance(dance)}
                />
                {dance}
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
            {(profile.dances || []).map((d) => d.label).join(", ") ||
              "Non renseigné"}
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
