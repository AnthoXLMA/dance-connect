const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Ta clé secrète Stripe dans .env
const { authenticateToken } = require("../middlewares/auth"); // si tu utilises un middleware d’auth

// Map des abonnements avec leurs prix Stripe (price IDs)
const priceIds = {
  free: null, // pas de paiement pour free
  connect: "price_xxx_connect",       // Remplace par ton Price ID Stripe
  pro: "price_xxx_pro",
  organisateur: "price_xxx_organisateur",
};

router.post("/create-session", authenticateToken, async (req, res) => {
  const { subscriptionId } = req.body;
  const user = req.user;

  if (!subscriptionId || !(subscriptionId in priceIds)) {
    return res.status(400).json({ error: "Abonnement invalide." });
  }

  const priceId = priceIds[subscriptionId];

  if (!priceId) {
    // Abonnement gratuit, on peut directement mettre à jour la DB ici si besoin
    return res.json({ url: null, message: "Abonnement Free activé." });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: user.email, // ou crée un customer Stripe et passe son id ici
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscriptions`,
      metadata: {
        userId: user.id.toString(),
        subscriptionId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Erreur création session Stripe:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
