import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";

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

export default function UserProfileForm() {
  const { register, handleSubmit, control, watch } = useForm();
  const [location, setLocation] = useState("");
  const [geoLocation, setGeoLocation] = useState(null);

  const selectedDances = watch("dances") || [];

  const onSubmit = (data) => {
    alert("Formulaire soumis !");
    console.log({
      ...data,
      location,
      geoLocation,
    });
    // Ici, envoie vers le backend
  };

  const handleGetGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setGeoLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold">Créer mon profil</h2>

      {/* Danses pratiquées */}
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

      {/* Niveau par danse */}
      {selectedDances.map((dance) => (
        <div key={dance.value}>
          <label className="block mb-1">
            Niveau pour {dance.label}
          </label>
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

      {/* Localisation manuelle */}
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

      {/* Localisation GPS */}
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

      {/* Disponibilités */}
      <div>
        <label className="block mb-1">Disponibilités</label>
        <textarea
          {...register("availability")}
          className="w-full border p-2 rounded"
          placeholder="Ex: Soirs de semaine, week-ends, etc."
        />
      </div>

      {/* Description personnelle */}
      <div>
        <label className="block mb-1">Description</label>
        <textarea
          {...register("bio")}
          className="w-full border p-2 rounded"
          placeholder="Parlez un peu de vous, vos préférences, votre style de danse..."
        />
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Enregistrer mon profil
      </button>
    </form>
  );
}
