// import React, { useEffect, useState } from "react";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   Circle,
//   useMap,
// } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import CreateEvent from "../components/CreateEvent";

// function ChangeMapView({ center }) {
//   const map = useMap();
//   useEffect(() => {
//     const epsilon = 0.00001;
//     const currentCenter = map.getCenter();
//     if (
//       Math.abs(currentCenter.lat - center[0]) > epsilon ||
//       Math.abs(currentCenter.lng - center[1]) > epsilon
//     ) {
//       map.setView(center, map.getZoom(), { animate: true });
//     }
//   }, [center, map]);
//   return null;
// }

// const eventIcon = L.divIcon({
//   className: "custom-icon",
//   html: `<div style="background:#e74c3c;width:24px;height:24px;border-radius:4px;text-align:center;line-height:24px;color:#fff;font-size:16px;">E</div>`,
//   iconSize: [24, 24],
//   iconAnchor: [12, 24],
//   popupAnchor: [0, -24],
// });
// const dancerIcon = L.divIcon({
//   className: "custom-icon",
//   html: `<div style="background:#27ae60;width:24px;height:24px;border-radius:4px;text-align:center;line-height:24px;color:#fff;font-size:16px;">D</div>`,
//   iconSize: [24, 24],
//   iconAnchor: [12, 24],
//   popupAnchor: [0, -24],
// });

// export default function Dashboard() {
//   const [profile, setProfile] = useState(null);
//   const [position, setPosition] = useState([48.8566, 2.3522]);
//   const [nearbyEvents, setNearbyEvents] = useState([]);
//   const [nearbyDancers, setNearbyDancers] = useState([]);
//   const [selectedDances, setSelectedDances] = useState([]);
//   const [chatUser, setChatUser] = useState(null);
//   const token = localStorage.getItem("token");

//   const danceStyles = [
//     { value: "salsa", label: "Salsa" },
//     { value: "bachata", label: "Bachata" },
//     { value: "kizomba", label: "Kizomba" },
//     { value: "kompa", label: "Kompa" },
//     { value: "westcoastswing", label: "West Coast Swing" },
//     { value: "rock", label: "Rock" },
//     { value: "tango", label: "Tango" },
//   ];

//   useEffect(() => {
//     async function fetchProfile() {
//       if (!token) return;
//       try {
//         const resp = await fetch("http://localhost:3001/api/users/me", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await resp.json();
//         setProfile(data);
//         if (
//           typeof data.lat === "number" && !isNaN(data.lat) &&
//           typeof data.lng === "number" && !isNaN(data.lng)
//         ) {
//           setPosition([data.lat, data.lng]);
//         } else {
//           navigator.geolocation.getCurrentPosition(
//             (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
//             (err) => {
//               if (err.code === err.PERMISSION_DENIED) {
//                 alert("Veuillez autoriser l'accès à votre position pour voir les événements proches.");
//               } else {
//                 alert("Impossible d'obtenir votre position.");
//               }
//             }
//           );
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     }
//     fetchProfile();
//   }, [token]);

//   useEffect(() => {
//     if (!token || !position || !profile) return;
//     const [lat, lng] = position;
//     if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

//     async function loadNearby() {
//       try {
//         const [eventsRes, dancersRes] = await Promise.all([
//           fetch("http://localhost:3001/api/events", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           fetch(`http://localhost:3001/api/users/nearby?lat=${lat}&lng=${lng}`, {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//         ]);

//         if (!eventsRes.ok || !dancersRes.ok) throw new Error("Erreur lors du chargement des données.");

//         const eventsData = await eventsRes.json();
//         const dancersData = await dancersRes.json();

//         setNearbyEvents(Array.isArray(eventsData) ? eventsData : []);
//         setNearbyDancers(Array.isArray(dancersData) ? dancersData : []);
//       } catch (err) {
//         console.error("Erreur loading nearby:", err.message);
//       }
//     }

//     loadNearby();
//   }, [position, profile, token]);

//   const toggleDance = (danceValue) => {
//     setSelectedDances((prev) =>
//       prev.includes(danceValue) ? prev.filter((d) => d !== danceValue) : [...prev, danceValue]
//     );
//   };

//   const filteredEvents = nearbyEvents.filter(
//     (ev) =>
//       selectedDances.length === 0 ||
//       (ev.dances && ev.dances.some((d) => selectedDances.includes(d)))
//   );
//   const filteredDancers = nearbyDancers.filter(
//     (us) =>
//       selectedDances.length === 0 ||
//       (us.dances && us.dances.some((d) => selectedDances.includes(d)))
//   );

//   if (!profile) return <p>Chargement du profil...</p>;

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <h2 className="text-3xl font-bold mb-6 text-center">
//         Bienvenue, {profile.firstName} !
//       </h2>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <section className="md:col-span-2 bg-white p-4 rounded shadow flex flex-col md:h-[500px]">
//           <h3 className="text-xl font-semibold mb-4 border-b pb-2">
//             Carte des événements et danseurs proches
//           </h3>
//           <div className="mb-4 flex flex-wrap gap-3 items-center">
//             <button
//               className="bg-green-600 text-white px-4 py-2 rounded"
//               onClick={() => {
//                 navigator.geolocation.getCurrentPosition(
//                   (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
//                   (err) => {
//                     if (err.code === err.PERMISSION_DENIED) {
//                       alert("Veuillez autoriser l'accès à votre position.");
//                     } else {
//                       alert("Impossible d'obtenir votre position.");
//                     }
//                   }
//                 );
//               }}
//             >
//               Ma position
//             </button>
//             {danceStyles.map(({ value, label }) => (
//               <label
//                 key={value}
//                 className="flex items-center gap-2 cursor-pointer select-none"
//               >
//                 <input
//                   type="checkbox"
//                   checked={selectedDances.includes(value)}
//                   onChange={() => toggleDance(value)}
//                 />
//                 {label}
//               </label>
//             ))}
//           </div>
//           <div className="flex gap-6 text-sm mb-4">
//             <div className="flex items-center gap-2">
//               <div style={{ background: "#e74c3c", width: 16, height: 16 }} />
//               Événement
//             </div>
//             <div className="flex items-center gap-2">
//               <div style={{ background: "#27ae60", width: 16, height: 16 }} />
//               Danseur
//             </div>
//           </div>
//           <div className="flex-grow">
//             <MapContainer
//               center={position}
//               zoom={6}
//               style={{ height: 400, width: "100%" }}
//               scrollWheelZoom={false}
//             >
//               <ChangeMapView center={position} />
//               <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//               <Circle center={position} radius={30000} color="blue" />
//               {filteredEvents.map(({ id, name, lat, lng, dances, date }) => (
//                 <Marker key={id} position={[lat, lng]} icon={eventIcon}>
//                   <Popup>
//                     <strong>{name}</strong><br />
//                     Danses : {dances?.join(", ")}<br />
//                     Date : {new Date(date).toLocaleDateString()}
//                   </Popup>
//                 </Marker>
//               ))}
//               {filteredDancers.map(({ id, firstName, lastName, lat, lng, dances }) => (
//                 <Marker key={id} position={[lat, lng]} icon={dancerIcon}>
//                   <Popup>
//                     {firstName} {lastName}<br />
//                     Danses : {dances?.join(", ")}
//                   </Popup>
//                 </Marker>
//               ))}
//             </MapContainer>
//             <div className="mt-4 p-2 bg-gray-100 rounded max-h-48 overflow-auto text-sm">
//               <h4 className="font-semibold mb-2">Liste brute des danseurs proches :</h4>
//               {nearbyDancers.length === 0 && <p>Aucun danseur trouvé.</p>}
//               <ul>
//                 {nearbyDancers.map(({ id, firstName, lastName, lat, lng }) => (
//                   <li key={id}>
//                     {firstName} {lastName} — Lat: {lat}, Lng: {lng}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </section>

//         <section className="md:col-span-1 bg-white p-4 rounded shadow">
//           <h3 className="text-xl font-semibold mb-4 border-b pb-2">
//             Création d'événement
//           </h3>
//           <CreateEvent token={token} />
//         </section>
//       </div>
//     </div>
//   );
// }

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
        center={position}
        zoom={13}
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
