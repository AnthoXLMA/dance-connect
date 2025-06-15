const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/auth");

router.get("/", authenticateToken, (req, res) => {
  // code pour récupérer tous les messages
  res.json({ messages: [] });
});

router.post("/", authenticateToken, (req, res) => {
  // code pour envoyer un message
  res.json({ message: "Message envoyé" });
});


module.exports = router;
