import React from "react";
import { Link } from "react-router-dom";

const subscriptions = [
  {
    id: "free",
    name: "Free",
    price: "0 € / mois",
    description: "Idéal pour découvrir et swiper quelques profils.",
  },
  {
    id: "connect",
    name: "Connect",
    price: "4,99 € / mois",
    description: "Pour les danseurs actifs avec des fonctionnalités avancées.",
  },
  {
    id: "pro",
    name: "Pro",
    price: "9,99 € / mois",
    description: "Pour les danseurs avancés et professeurs avec outils pro.",
  },
  {
    id: "organisateur",
    name: "Organisateur",
    price: "14,99 € / mois",
    description: "Pour les gérant(e)s d’événements, gestion complète.",
  },
];

const handleSubscribe = async (subscriptionId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vous devez être connecté pour souscrire.");
      return;
    }
    const res = await fetch("/api/checkout/create-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ subscriptionId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url; // redirige vers Stripe Checkout
    } else {
      alert("Erreur lors de la création de la session de paiement.");
    }
  } catch (error) {
    console.error(error);
    alert("Erreur lors du paiement.");
  }
};

export default function Subscriptions() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold mb-8 text-center">Nos offres d’abonnement</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {subscriptions.map(({ id, name, price, description }) => (
          <div
            key={id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "box-shadow 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
          >
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{name}</h2>
              <p style={{ fontSize: 18, fontWeight: "600", color: "#2563eb", marginBottom: 12 }}>{price}</p>
              <p style={{ color: "#444", lineHeight: 1.4 }}>{description}</p>
            </div>
            <button
              onClick={() => handleSubscribe(id)}
              style={{
                marginTop: 20,
                backgroundColor: "#2563eb",
                color: "white",
                padding: "10px 0",
                borderRadius: 8,
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1e40af")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#2563eb")}
            >
              Souscrire
            </button>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link
          to="/"
          style={{
            display: "inline-block",
            backgroundColor: "#2563eb",
            color: "white",
            padding: "10px 20px",
            borderRadius: 8,
            fontWeight: "600",
            textDecoration: "none",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1e40af")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#2563eb")}
        >
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
