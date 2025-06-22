import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

const danceStyles = [
  { value: "salsa", label: "Salsa" },
  { value: "bachata", label: "Bachata" },
  { value: "kizomba", label: "Kizomba" },
  { value: "rock", label: "Rock" },
  { value: "tango", label: "Tango" },
  { value: "swing", label: "Swing" },
];

const levels = [
  { value: "beginner", label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced", label: "Avancé" },
];

export default function UserProfileForm({ onProfileSaved, defaultValues }) {
  const { register, handleSubmit, control, watch } = useForm({
    defaultValues,
  });

  // Local state pour location, car input non contrôlé par react-hook-form
  const [location, setLocation] = useState(defaultValues?.location || "");
  const [geoLocation, setGeoLocation] = useState(defaultValues?.geoLocation || null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const selectedDances = watch("dances") || [];

  const onSubmit = async (data) => {
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Utilisateur non authentifié.");
      return;
    }

    const dancesValues = (data.dances || []).map((d) => d.value);
    const levelsData = {};
    if (data.levels) {
      Object.entries(data.levels).forEach(([danceKey, levelObj]) => {
        levelsData[danceKey] = levelObj?.value || null;
      });
    }

    const body = {
      ...data,
      dances: dancesValues,
      levels: levelsData,
      location, // valeur locale mise à jour
      geoLocation,
      lat: geoLocation?.lat || null,
      lng: geoLocation?.lng || null,
    };

    try {
      const res = await fetch("http://localhost:3001/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (e) {
          console.error("Erreur parsing JSON:", e);
        }
        setError(errorData?.error || `Erreur ${res.status} lors de l'enregistrement.`);
        return;
      }

      const savedProfile = await res.json();
      if (onProfileSaved) onProfileSaved(savedProfile);

      // FIX 1 : recharge le profil avant navigation
      const freshRes = await fetch("http://localhost:3001/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!freshRes.ok) {
        let errorData;
        try {
          errorData = await freshRes.json();
        } catch (e) {
          console.error("Erreur parsing JSON lors du GET:", e);
        }
        setError(errorData?.error || `Erreur ${freshRes.status} lors du rechargement du profil.`);
        return;
      }

      const freshProfile = await freshRes.json();
      console.log("Profil rechargé :", freshProfile);

      navigate("/dashboard");
    } catch (err) {
      console.error("Erreur réseau/serveur :", err);
      setError(`Erreur réseau ou serveur : ${err.message}`);
    }
  };

  const handleGetGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setGeoLocation(coords);
        },
        () => setError("Impossible d'obtenir la position GPS.")
      );
    } else {
      setError("La géolocalisation n'est pas supportée par ce navigateur.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold">Créer mon profil</h2>

      <div>
        <label className="block mb-1">Prénom</label>
        <input
          type="text"
          {...register("firstName")}
          className="w-full border p-2 rounded"
          placeholder="Votre prénom"
        />
      </div>

      <div>
        <label className="block mb-1">Danses pratiquées</label>
        <Controller
          control={control}
          name="dances"
          render={({ field }) => (
            <Select
              options={danceStyles}
              isMulti
              placeholder="Choisissez vos danses"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {selectedDances.map((dance) => (
        <div key={dance.value}>
          <label className="block mb-1">Niveau pour {dance.label}</label>
          <Controller
            control={control}
            name={`levels.${dance.value}`}
            render={({ field }) => (
              <Select
                options={levels}
                placeholder="Choisissez un niveau"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      ))}

      <div>
        <label className="block mb-1">Ville</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ex: Paris"
        />
      </div>

      <div>
        <button
          type="button"
          className="text-sm text-blue-500 underline"
          onClick={handleGetGPS}
        >
          Utiliser ma position actuelle (GPS)
        </button>
        {geoLocation && (
          <p className="text-sm text-gray-600">
            Position enregistrée: {geoLocation.lat}, {geoLocation.lng}
          </p>
        )}
      </div>

      <div>
        <label className="block mb-1">Disponibilités</label>
        <textarea
          {...register("availability")}
          className="w-full border p-2 rounded"
          placeholder="Ex: Soirs de semaine, week-ends, etc."
        />
      </div>

      <div>
        <label className="block mb-1">Description</label>
        <textarea
          {...register("bio")}
          className="w-full border p-2 rounded"
          placeholder="Parlez un peu de vous, vos préférences, votre style de danse..."
        />
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Enregistrer mon profil
      </button>
    </form>
  );
}
