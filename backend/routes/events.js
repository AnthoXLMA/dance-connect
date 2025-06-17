const express = require("express");
const router = express.Router();
const path = require("path");
const { authenticateToken } = require(path.resolve(__dirname, "../middlewares/auth")); // ✅ chemin corrigé

// Stockage temporaire des likes (en mémoire, à remplacer plus tard par MongoDB ou autre)
const userLikes = {}; // { userEmail: Set(eventId, ...) }

// ✅ POST : Liker un événement
router.post("/events/:id/like", authenticateToken, (req, res) => {
  const eventId = req.params.id;
  const userEmail = req.user.email;

    //Temporaire debug
    console.log("🔄 Like reçu :", { userEmail, eventId });


  if (!eventId) {
    return res.status(400).json({ error: "ID d'événement manquant." });
  }

  if (!userLikes[userEmail]) {
    userLikes[userEmail] = new Set();
  }

  userLikes[userEmail].add(eventId);

  console.log(`✅ ${userEmail} a liké l'événement ${eventId}`);

  res.status(200).json({ message: `Évènement ${eventId} liké par utilisateur ${userEmail}` });
});

// ✅ GET : Récupérer les événements likés
router.get("/events/liked", authenticateToken, (req, res) => {
  const userEmail = req.user.email;
  const likedEventIds = userLikes[userEmail] ? Array.from(userLikes[userEmail]) : [];

  res.json({ likedEventIds });
});

module.exports = router;
