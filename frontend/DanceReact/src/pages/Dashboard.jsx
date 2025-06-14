import React, { useState, useEffect } from "react";
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

// Composant pour changer la vue de la carte
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

// Icônes personnalisées
const eventIcon = L.divIcon({
  className: "custom-icon",
  html: `<div style="
    background-color: #e74c3c;
    width: 24px; height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    font-size: 18px;
    user-select:none;
  ">🟥</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const dancerIcon = L.divIcon({
  className: "custom-icon",
  html: `<div style="
    background-color: #27ae60;
    width: 24px; height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    font-size: 18px;
    user-select:none;
  ">🟩</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

export default function Dashboard({ profile }) {
  // États
  const [position, setPosition] = useState([48.8566, 2.3522]); // Paris par défaut
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [nearbyDancers, setNearbyDancers] = useState([]);
  const [selectedDances, setSelectedDances] = useState([]);
  const [selectedUserToMessage, setSelectedUserToMessage] = useState(null);
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [chatInput, setChatInput] = useState("");

  const allDances = [
    "Salsa",
    "Bachata",
    "Kizomba",
    "Kompa",
    "West Coast Swing",
    "Rock",
    "Tango",
  ];

  // Charger les messages reçus au montage
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/messages/received",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok)
          throw new Error("Erreur lors du chargement des messages");

        const data = await response.json();
        setReceivedMessages(data);
      } catch (error) {
        console.error(error);
        alert("Impossible de charger les messages reçus.");
      }
    };

    fetchMessages();
  }, []);

  // Initialiser position, événements et danseurs à partir du profil
  useEffect(() => {
    if (profile?.geoLocation?.lat && profile?.geoLocation?.lng) {
      setPosition([profile.geoLocation.lat, profile.geoLocation.lng]);
    }

    // Données statiques (exemple)
    setNearbyEvents([
      {
        id: 1,
        name: "Soirée Salsa Paris",
        lat: 48.8584,
        lng: 2.2945,
        dances: ["Salsa"],
      },
      {
        id: 2,
        name: "Bachata Lyon",
        lat: 45.758,
        lng: 4.8006,
        dances: ["Bachata"],
      },
      {
        id: 3,
        name: "Kizomba Marseille",
        lat: 43.2965,
        lng: 5.3698,
        dances: ["Kizomba"],
      },
    ]);
    setNearbyDancers([
      {
        id: 101,
        name: "Sophie",
        lat: 48.8606,
        lng: 2.3376,
        dances: ["Salsa"],
        email: "sophie@example.com",
      },
      {
        id: 102,
        name: "Karim",
        lat: 48.85,
        lng: 2.37,
        dances: ["Kizomba", "Bachata"],
        email: "karim@example.com",
      },
      {
        id: 103,
        name: "Lina",
        lat: 48.87,
        lng: 2.32,
        dances: ["Salsa"],
        email: "lina@example.com",
      },
    ]);
  }, [profile]);

  // Fonction pour charger chat avec un utilisateur
  const loadChatWithUser = async (userEmail) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/messages/chat?with=${userEmail}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!response.ok) throw new Error("Erreur chargement chat");
      const data = await response.json();
      setChatMessages(data);
    } catch (error) {
      alert("Erreur lors du chargement des messages");
      console.error(error);
    }
  };

  // Gestion sélection danses
  const toggleDance = (dance) => {
    setSelectedDances((prev) =>
      prev.includes(dance) ? prev.filter((d) => d !== dance) : [...prev, dance]
    );
  };

  // Filtrage des événements et danseurs selon danses sélectionnées
  const filteredEvents = nearbyEvents.filter(
    (event) =>
      selectedDances.length === 0 ||
      event.dances.some((dance) => selectedDances.includes(dance))
  );

  const filteredDancers = nearbyDancers.filter(
    (dancer) =>
      selectedDances.length === 0 ||
      dancer.dances.some((dance) => selectedDances.includes(dance))
  );

  if (!profile) return <p>Chargement du profil...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Titre */}
      <h2 className="text-2xl font-bold mb-4">Bienvenue, {profile.email} !</h2>

      {/* Profil */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Votre profil</h3>
        <p>
          <strong>Danses pratiquées :</strong>{" "}
          {profile.dances?.map((d) => d.label).join(", ") || "Non renseigné"}
        </p>
        <p>
          <strong>Niveaux :</strong>
        </p>
        {profile.levels && Object.entries(profile.levels).length > 0 ? (
          <ul className="list-disc list-inside mb-2">
            {Object.entries(profile.levels).map(([dance, level]) => (
              <li key={dance}>
                {dance.charAt(0).toUpperCase() + dance.slice(1)} :{" "}
                {level?.label || level}
              </li>
            ))}
          </ul>
        ) : (
          <p>Non renseigné</p>
        )}
        <p>
          <strong>Ville :</strong> {profile.location || "Non renseigné"}
        </p>
        <p>
          <strong>Bio :</strong> {profile.bio || "Non renseigné"}
        </p>
        <p>
          <strong>Disponibilités :</strong> {profile.availability || "Non renseigné"}
        </p>
      </section>

      {/* Carte */}
      <section>
        <h3 className="text-xl font-semibold mb-2">
          Carte des événements et danseurs proches
        </h3>

        {/* Bouton géoloc */}
        <button
          className="bg-green-600 text-white px-4 py-2 rounded mb-4"
          onClick={() => {
            if (!navigator.geolocation) {
              alert("La géolocalisation n'est pas prise en charge par ce navigateur.");
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
              },
              () => alert("Impossible d'obtenir votre position.")
            );
          }}
        >
          Utiliser ma position actuelle
        </button>

        {/* Filtre danses */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold">Filtrer par danse :</h4>
          <div className="flex flex-wrap gap-3 mt-2">
            {allDances.map((dance) => (
              <label
                key={dance}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  value={dance}
                  checked={selectedDances.includes(dance)}
                  onChange={() => toggleDance(dance)}
                />
                {dance}
              </label>
            ))}
          </div>
        </div>

        {/* Légende */}
        <div className="mt-4 flex gap-6 text-sm select-none">
          <div className="flex items-center gap-2">
            <div
              style={{
                backgroundColor: "#e74c3c",
                width: 16,
                height: 16,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: 14,
                userSelect: "none",
              }}
            >
              🟥
            </div>
            <span>Événement</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              style={{
                backgroundColor: "#27ae60",
                width: 16,
                height: 16,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: 14,
                userSelect: "none",
              }}
            >
              🟩
            </div>
            <span>Danseur</span>
          </div>
        </div>

        {/* Carte Leaflet */}
        <MapContainer
          center={position}
          zoom={6}
          style={{ height: 400, width: "100%" }}
          scrollWheelZoom={false}
        >
          <ChangeMapView center={position} />
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Position utilisateur */}
          <Marker position={position}>
            <Popup>Vous êtes ici</Popup>
          </Marker>

          {/* Cercle de proximité */}
          <Circle center={position} radius={50000} color="blue" />

          {/* Événements */}
          {filteredEvents.map((event) => (
            <Marker
              key={event.id}
              position={[event.lat, event.lng]}
              icon={eventIcon}
            >
              <Popup>
                <strong>{event.name}</strong>
                <br />
                Danse(s) : {event.dances.join(", ")}
              </Popup>
            </Marker>
          ))}

          {/* Danseurs */}
          {filteredDancers.map((dancer) => (
            <Marker
              key={dancer.id}
              position={[dancer.lat, dancer.lng]}
              icon={dancerIcon}
            >
              <Popup>
                <strong>{dancer.name}</strong>
                <br />
                Danse(s) : {dancer.dances.join(", ")}
                <br />
                <button
                  onClick={() => {
                    setChatUser(dancer);
                    loadChatWithUser(dancer.email);
                  }}
                  className="mt-2 bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Discuter
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>

      {/* Messagerie */}
      <section className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Envoyer un message</h3>
        <div>
          <label className="block mb-1">Sélectionnez un danseur :</label>
          <select
            value={selectedUserToMessage?.email || ""}
            onChange={(e) => {
              const user = nearbyDancers.find(
                (d) => d.email === e.target.value
              );
              setSelectedUserToMessage(user || null);
            }}
            className="border rounded px-2 py-1 w-full max-w-xs mb-2"
          >
            <option value="">-- Choisir --</option>
            {nearbyDancers.map((d) => (
              <option key={d.email} value={d.email}>
                {d.name} ({d.email})
              </option>
            ))}
          </select>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Votre message"
            rows={3}
            className="border rounded w-full max-w-xs mb-2 p-2"
          />

          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={async () => {
              if (!selectedUserToMessage || !message.trim()) {
                alert("Veuillez choisir un destinataire et écrire un message.");
                return;
              }

              try {
                const response = await fetch(
                  "http://localhost:3001/api/messages/send",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                      recipient: selectedUserToMessage.email,
                      content: message.trim(),
                    }),
                  }
                );

                if (!response.ok)
                  throw new Error("Erreur lors de l'envoi du message");

                alert("Message envoyé !");
                setMessage("");
                setSelectedUserToMessage(null);
              } catch (error) {
                alert("Erreur lors de l'envoi du message");
                console.error(error);
              }
            }}
          >
            Envoyer
          </button>
        </div>
      </section>

      {/* Messages reçus */}
      <section className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Messages reçus</h3>
        {receivedMessages.length === 0 ? (
          <p>Aucun message reçu.</p>
        ) : (
          <ul className="max-w-xl space-y-3">
            {receivedMessages.map((msg) => (
              <li
                key={msg.id}
                className="border rounded p-3 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setChatUser({
                    name: msg.senderName,
                    email: msg.senderEmail,
                  });
                  loadChatWithUser(msg.senderEmail);
                }}
              >
                <p>
                  <strong>De :</strong> {msg.senderName}
                </p>
                <p>
                  <strong>Message :</strong>{" "}
                  {msg.content.length > 60
                    ? msg.content.slice(0, 60) + "..."
                    : msg.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Chat en temps réel */}
      {chatUser && (
        <section className="mt-8 border rounded p-4 max-w-xl">
          <h3 className="text-xl font-semibold mb-2">
            Conversation avec {chatUser.name}
          </h3>
          <div
            style={{
              height: 200,
              overflowY: "auto",
              border: "1px solid #ccc",
              padding: 8,
              marginBottom: 8,
              backgroundColor: "#fafafa",
            }}
          >
            {chatMessages.length === 0 ? (
              <p>Aucun message dans cette conversation.</p>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 p-2 rounded ${
                    msg.senderEmail === profile.email
                      ? "bg-blue-200 text-right"
                      : "bg-gray-300 text-left"
                  }`}
                >
                  <p>{msg.content}</p>
                  <small className="text-xs text-gray-600">
                    {new Date(msg.createdAt).toLocaleString()}
                  </small>
                </div>
              ))
            )}
          </div>

          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            rows={3}
            placeholder="Écrire un message..."
            className="border rounded w-full p-2 mb-2"
          />

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={async () => {
              if (!chatInput.trim()) return alert("Écrivez un message.");

              try {
                const response = await fetch(
                  "http://localhost:3001/api/messages/send",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                      recipient: chatUser.email,
                      content: chatInput.trim(),
                    }),
                  }
                );

                if (!response.ok)
                  throw new Error("Erreur lors de l'envoi du message");

                // Ajouter message au chat localement
                setChatMessages((prev) => [
                  ...prev,
                  {
                    id: Date.now(),
                    senderEmail: profile.email,
                    content: chatInput.trim(),
                    createdAt: new Date().toISOString(),
                  },
                ]);
                setChatInput("");
              } catch (error) {
                alert("Erreur lors de l'envoi du message");
                console.error(error);
              }
            }}
          >
            Envoyer
          </button>

          <button
            className="mt-2 text-sm text-red-600 underline"
            onClick={() => {
              setChatUser(null);
              setChatMessages([]);
            }}
          >
            Fermer la conversation
          </button>
        </section>
      )}
    </div>
  );
}
