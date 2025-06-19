// LikedUsers.jsx
import { useEffect, useState } from "react";
import axios from "axios";

function LikedUsers() {
  const [likedUsers, setLikedUsers] = useState([]);

  useEffect(() => {
    axios.get("/api/swipes/liked") // à créer dans ton backend
      .then(res => setLikedUsers(res.data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Utilisateurs que vous aimez</h2>
      {likedUsers.map(user => (
        <div key={user.id}>{user.firstName} ({user.email})</div>
      ))}
    </div>
  );
}

export default LikedUsers;
