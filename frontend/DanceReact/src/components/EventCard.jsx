import React from "react";

export default function EventCard({ event }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 overflow-hidden">
      {/* Image (fallback si aucune image disponible) */}
      <div className="h-48 bg-gray-200">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
            Pas d’image
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-xl font-semibold text-gray-800">{event.name}</h3>
        <p className="text-sm text-gray-500">
          📅 {new Date(event.date).toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="text-gray-600 text-sm line-clamp-3">{event.description}</p>

        {/* Lieu (si disponible) */}
        {event.city && (
          <p className="text-sm text-gray-400 italic">📍 {event.city}</p>
        )}
      </div>
    </div>
  );
}
