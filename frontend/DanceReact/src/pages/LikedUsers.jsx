import { useEffect, useState } from "react";
import axios from "axios";

function LikedUsers() {
  const [likedUsers, setLikedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token manquant, veuillez vous connecter.");
      setLoading(false);
      return;
    }

    axios.get("/api/swipes/liked", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setLikedUsers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Erreur lors de la récupération des utilisateurs.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Chargement des utilisateurs aimés...</div>;
  if (error) return <div style={{ color: "red" }}>Erreur : {error}</div>;

  if (likedUsers.length === 0) {
    return <div>Vous n'avez pas encore aimé d'utilisateurs.</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Utilisateurs que vous aimez</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {likedUsers.map(user => (
          <li
            key={user.id}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 15,
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.firstName} avatar`}
                style={{ width: 50, height: 50, borderRadius: "50%", marginRight: 15, objectFit: "cover" }}
              />
            ) : (
              <div style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                backgroundColor: "#ccc",
                marginRight: 15,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#fff",
                fontWeight: "bold",
                fontSize: 18,
                userSelect: "none"
              }}>
                {user.firstName?.[0] || "?"}
              </div>
            )}
            <div>
              <strong>{user.firstName} {user.lastName}</strong> {user.username && `(@${user.username})`}
              <p style={{ margin: 0, fontStyle: "italic", fontSize: 14, color: "#555" }}>
                {user.bio || "Pas de bio"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LikedUsers;
