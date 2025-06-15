const express = require("express");
const router = express.Router();

router.get("/profile", (req, res) => {
  // ici ta logique pour renvoyer le profil utilisateur
  res.json({ email: "exemple@exemple.com", name: "Anthony" });
});

module.exports = router;
