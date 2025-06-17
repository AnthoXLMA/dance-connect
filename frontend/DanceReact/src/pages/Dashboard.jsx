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

// Icônes personnalisées (inchangés)
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
  // États (inchangés)
  const [position, setPosition] = useState([48.8566, 2.3522]);
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

  // useEffect pour fetch messages, initialization, etc. (inchangés)
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

  useEffect(() => {
    if (profile?.geoLocation?.lat && profile?.geoLocation?.lng) {
      setPosition([profile.geoLocation.lat, profile.geoLocation.lng]);
    }

    setNearbyEvents([
      { id: 1, name: "Soirée Salsa Paris", lat: 48.8584, lng: 2.2945, dances: ["Salsa"] },
      { id: 2, name: "Bachata Lyon", lat: 45.758, lng: 4.8006, dances: ["Bachata"] },
      { id: 3, name: "Kizomba Marseille", lat: 43.2965, lng: 5.3698, dances: ["Kizomba"] },
    ]);
    setNearbyDancers([
  { id: 101, name: "Sophie", lat: 48.8606, lng: 2.3376, dances: ["Salsa"], email: "sophie@example.com" },
  { id: 102, name: "Karim", lat: 43.6045, lng: 1.444, dances: ["Kizomba", "Bachata"], email: "karim@example.com" },        // Toulouse
  { id: 103, name: "Lina", lat: 45.764, lng: 4.8357, dances: ["Salsa"], email: "lina@example.com" },                      // Lyon
  { id: 104, name: "Élodie", lat: 43.2965, lng: 5.3698, dances: ["Kompa", "Salsa"], email: "elodie@example.com" },       // Marseille
  { id: 105, name: "Marc", lat: 44.8378, lng: -0.5792, dances: ["West Coast Swing", "Rock"], email: "marc@example.com" },// Bordeaux
  { id: 106, name: "Claire", lat: 50.6292, lng: 3.0573, dances: ["Tango", "Rock"], email: "claire@example.com" },          // Lille
  { id: 107, name: "Julien", lat: 48.5734, lng: 7.7521, dances: ["Kompa", "West Coast Swing"], email: "julien@example.com" }, // Strasbourg
  { id: 108, name: "Amélie", lat: 43.6047, lng: 1.4442, dances: ["Tango"], email: "amelie@example.com" },                  // Toulouse (again)
  { id: 109, name: "Antoine", lat: 45.1885, lng: 5.7245, dances: ["Rock", "Salsa"], email: "antoine@example.com" },         // Grenoble
  { id: 110, name: "Nina", lat: 43.6108, lng: 3.8767, dances: ["West Coast Swing", "Kompa"], email: "nina@example.com" },   // Montpellier
  { id: 111, name: "Thomas", lat: 48.573, lng: 7.752, dances: ["Rock", "Tango"], email: "thomas@example.com" },            // Strasbourg
  { id: 112, name: "Laura", lat: 47.2184, lng: -1.5536, dances: ["Salsa", "Bachata"], email: "laura@example.com" },        // Nantes
  { id: 113, name: "Olivier", lat: 49.2583, lng: 4.0317, dances: ["Kompa"], email: "olivier@example.com" },                // Reims
  { id: 114, name: "Isabelle", lat: 45.7823, lng: 4.8655, dances: ["West Coast Swing"], email: "isabelle@example.com" },  // Villeurbanne (Lyon area)
  { id: 115, name: "David", lat: 48.4034, lng: -4.4984, dances: ["Tango", "Rock"], email: "david@example.com" },            // Brest
  { id: 116, name: "Julie", lat: 50.9503, lng: 1.8587, dances: ["Kompa", "Bachata"], email: "julie@example.com" },         // Calais
  { id: 117, name: "Romain", lat: 44.9333, lng: 0.6667, dances: ["Salsa", "Rock"], email: "romain@example.com" },          // Périgueux
  { id: 118, name: "Mélanie", lat: 44.8378, lng: -0.5792, dances: ["Tango"], email: "melanie@example.com" },               // Bordeaux
  { id: 119, name: "Nicolas", lat: 48.8566, lng: 2.3522, dances: ["West Coast Swing"], email: "nicolas@example.com" },     // Paris
  { id: 120, name: "Caroline", lat: 43.6109, lng: 3.8772, dances: ["Kompa", "Salsa"], email: "caroline@example.com" },    // Montpellier
  { id: 121, name: "Patrick", lat: 43.2965, lng: 5.3698, dances: ["Rock", "West Coast Swing"], email: "patrick@example.com" }, // Marseille
  { id: 122, name: "Sandrine", lat: 47.4731, lng: 0.5512, dances: ["Tango", "Kompa"], email: "sandrine@example.com" },    // Tours
  { id: 123, name: "Jean", lat: 49.4431, lng: 1.0993, dances: ["Rock"], email: "jean@example.com" },                       // Rouen
  { id: 124, name: "Laetitia", lat: 44.6454, lng: 0.6154, dances: ["Bachata", "Salsa"], email: "laetitia@example.com" },   // Agen
  { id: 125, name: "Benoît", lat: 45.7600, lng: 4.8414, dances: ["Kompa"], email: "benoit@example.com" },                   // Lyon
  { id: 126, name: "Valérie", lat: 43.7000, lng: 7.2500, dances: ["West Coast Swing", "Tango"], email: "valerie@example.com" }, // Nice
  { id: 127, name: "Eric", lat: 45.1885, lng: 5.7245, dances: ["Salsa", "Kompa"], email: "eric@example.com" },             // Grenoble
  { id: 128, name: "Marine", lat: 48.5839, lng: 7.7455, dances: ["Rock"], email: "marine@example.com" },                   // Strasbourg
  { id: 129, name: "Mathieu", lat: 48.8566, lng: 2.3522, dances: ["West Coast Swing"], email: "mathieu@example.com" },    // Paris
  { id: 130, name: "Charlotte", lat: 44.8378, lng: -0.5792, dances: ["Tango", "Salsa"], email: "charlotte@example.com" }, // Bordeaux
  { id: 131, name: "Guillaume", lat: 50.6292, lng: 3.0573, dances: ["Kompa"], email: "guillaume@example.com" },            // Lille
  { id: 132, name: "Amélie", lat: 48.5734, lng: 7.7521, dances: ["Rock", "Bachata"], email: "amelie2@example.com" },      // Strasbourg
  { id: 133, name: "Vincent", lat: 45.764, lng: 4.8357, dances: ["Salsa", "West Coast Swing"], email: "vincent@example.com" }, // Lyon
  { id: 134, name: "Fanny", lat: 47.9029, lng: 1.9093, dances: ["Tango"], email: "fanny@example.com" },                   // Orléans
  { id: 135, name: "Pascal", lat: 48.5734, lng: 7.7521, dances: ["Kompa"], email: "pascal@example.com" },                 // Strasbourg
  { id: 136, name: "Hélène", lat: 43.2965, lng: 5.3698, dances: ["Bachata", "Rock"], email: "helene@example.com" },       // Marseille
  { id: 137, name: "Laurent", lat: 48.8566, lng: 2.3522, dances: ["Tango", "Kompa"], email: "laurent@example.com" },      // Paris
  { id: 138, name: "Sabrina", lat: 44.8378, lng: -0.5792, dances: ["West Coast Swing"], email: "sabrina@example.com" },   // Bordeaux
  { id: 139, name: "Alexandre", lat: 48.8566, lng: 2.3522, dances: ["Rock"], email: "alexandre@example.com" },             // Paris
  { id: 140, name: "Delphine", lat: 43.6108, lng: 3.8767, dances: ["Salsa", "Kompa"], email: "delphine@example.com" },    // Montpellier
  { id: 141, name: "Jean-Marc", lat: 43.2965, lng: 5.3698, dances: ["West Coast Swing", "Tango"], email: "jeanmarc@example.com" }, // Marseille
  { id: 142, name: "Elise", lat: 45.764, lng: 4.8357, dances: ["Rock"], email: "elise@example.com" },                     // Lyon
  { id: 143, name: "Baptiste", lat: 48.8566, lng: 2.3522, dances: ["Kompa", "Salsa"], email: "baptiste@example.com" },   // Paris
  { id: 144, name: "Amandine", lat: 48.5734, lng: 7.7521, dances: ["Tango"], email: "amandine@example.com" },             // Strasbourg
  { id: 145, name: "Jérôme", lat: 44.8378, lng: -0.5792, dances: ["Rock", "West Coast Swing"], email: "jerome@example.com" }, // Bordeaux
  { id: 146, name: "Céline", lat: 50.6292, lng: 3.0573, dances: ["Kompa"], email: "celine@example.com" },                 // Lille
  { id: 147, name: "Pascaline", lat: 43.6108, lng: 3.8767, dances: ["Salsa"], email: "pascaline@example.com" },           // Montpellier
  { id: 148, name: "Damien", lat: 47.2184, lng: -1.5536, dances: ["Bachata", "Rock"], email: "damien@example.com" },      // Nantes
  { id: 149, name: "Véronique", lat: 48.8566, lng: 2.3522, dances: ["Tango", "Kompa"], email: "veronique@example.com" }, // Paris
  { id: 150, name: "Sébastien", lat: 45.764, lng: 4.8357, dances: ["West Coast Swing", "Salsa"], email: "sebastien@example.com" }, // Lyon
  ]);
    }, [profile]);

  // Fonctions (inchangées)
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

  const toggleDance = (dance) => {
    setSelectedDances((prev) =>
      prev.includes(dance) ? prev.filter((d) => d !== dance) : [...prev, dance]
    );
  };

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
  <div className="max-w-6xl mx-auto p-4">
    <h2 className="text-3xl font-bold mb-6 text-center">
      Bienvenue, {profile.email} !
    </h2>

    {/* Grid principal */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Carte en premier sur mobile, ordre 2 en desktop */}
      <section className="md:col-span-2 bg-white p-4 rounded shadow flex flex-col md:order-2 md:h-[500px]">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">
          Carte des événements et danseurs proches
        </h3>

        {/* Filtres et géoloc */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded mb-4 sm:mb-0 self-start"
            onClick={() => {
              if (!navigator.geolocation) {
                alert(
                  "La géolocalisation n'est pas prise en charge par ce navigateur."
                );
                return;
              }
              navigator.geolocation.getCurrentPosition(
                (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
                () => alert("Impossible d'obtenir votre position.")
              );
            }}
          >
            Ma position
          </button>

          <div>
            <h4 className="text-lg font-semibold mb-1">Filtrer par danse :</h4>
            <div className="flex flex-wrap gap-3">
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
        </div>

        {/* Légende */}
        <div className="mt-2 flex gap-6 text-sm select-none mb-4">
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

        {/* Carte */}
        <div className="flex-grow">
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

            <Circle center={position} radius={30000} color="blue" />

            {filteredEvents.map(({ id, name, lat, lng }) => (
              <Marker key={id} position={[lat, lng]} icon={eventIcon}>
                <Popup>{name}</Popup>
              </Marker>
            ))}

            {filteredDancers.map(({ id, name, lat, lng }) => (
              <Marker
                key={id}
                position={[lat, lng]}
                icon={dancerIcon}
                eventHandlers={{
                  click: () =>
                    setSelectedUserToMessage({
                      id,
                      name,
                      email: filteredDancers.find((d) => d.id === id).email,
                    }),
                }}
              >
                <Popup>{name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </section>

      {/* Profil en second sur mobile, ordre 1 en desktop */}
      <section className="md:col-span-1 bg-white p-4 rounded shadow sticky top-4 md:order-1">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">
          Votre profil
        </h3>
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
    </div>

    {/* Messagerie en bas sur toute la largeur */}
    <section className="mt-8 bg-white p-4 rounded shadow max-w-full">
      {/* ... contenu messagerie inchangé ... */}
    </section>
  </div>
);

}
