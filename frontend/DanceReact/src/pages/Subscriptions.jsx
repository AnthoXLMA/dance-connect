import React from "react";
import { Link } from "react-router-dom";

const subscriptions = [
  {
    name: "Free",
    price: "0 € / mois",
    description: "Idéal pour découvrir et swiper quelques profils.",
  },
  {
    name: "Connect",
    price: "4,99 € / mois",
    description: "Pour les danseurs actifs avec des fonctionnalités avancées.",
  },
  {
    name: "Pro",
    price: "9,99 € / mois",
    description: "Pour les danseurs avancés et professeurs avec outils pro.",
  },
  {
    name: "Organisateur",
    price: "14,99 € / mois",
    description: "Pour les gérant(e)s d’événements, gestion complète.",
  },
];

export default function Subscriptions() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Nos offres d’abonnement</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {subscriptions.map(({ name, price, description }) => (
          <div
            key={name}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">{name}</h2>
            <p className="text-blue-600 font-bold mb-2">{price}</p>
            <p>{description}</p>
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => alert(`Souscrire à l’offre ${name} (à implémenter)`)}
            >
              Souscrire
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
