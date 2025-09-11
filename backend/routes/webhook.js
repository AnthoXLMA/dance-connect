const express = require("express");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log("Paiement réussi pour session:", session.id);
        // TODO : ta logique pour activer abonnement en BDD ici
        break;

      case "customer.subscription.deleted":
        const subscription = event.data.object;
        console.log("Abonnement annulé:", subscription.id);
        // TODO : ta logique pour désactiver abonnement en BDD ici
        break;

      default:
        console.log(`Événement Stripe non géré: ${event.type}`);
    }

    res.json({ received: true });
  }
);

module.exports = router;
