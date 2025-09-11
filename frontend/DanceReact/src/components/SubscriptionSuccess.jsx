import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [message, setMessage] = useState("Chargement des informations de votre abonnement...");

  useEffect(() => {
    if (!sessionId) {
      setMessage("Aucune session trouvée.");
      return;
    }

    // Optionnel : appeler une API backend pour valider ou récupérer les détails de la session Stripe
    // Exemple :
    // fetch(`/api/checkout/session/${sessionId}`)
    //   .then(res => res.json())
    //   .then(data => setMessage(`Abonnement réussi ! Merci ${data.customer_email}`))
    //   .catch(() => setMessage("Erreur lors de la récupération des infos d'abonnement."));
  }, [sessionId]);

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", padding: 20, textAlign: "center" }}>
      <h1>Merci pour votre abonnement ! 🎉</h1>
      <p>{message}</p>
      <Link to="/" style={{ marginTop: 20, display: "inline-block", color: "#0070f3" }}>
        Retour à l’accueil
      </Link>
    </div>
  );
}
