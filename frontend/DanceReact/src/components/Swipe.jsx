import React, { useState, useEffect } from "react";

export default function Swipe() {
  const [users, setUsers] = useState([]);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupération users non swipés au montage
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token manquant");
        setLoading(false);
        return;
      }

      try {
        // Récupérer les IDs des users déjà swipés (likés ou ignorés)
        const resSwiped = await fetch("http://localhost:3001/api/swipes/ids", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resSwiped.ok) throw new Error("Erreur récupération swipes");
        const swipedIds = await resSwiped.json();

        // Récupérer les utilisateurs nearby
        const resUsers = await fetch("http://localhost:3001/api/users/nearby", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resUsers.ok) throw new Error("Erreur récupération utilisateurs");
        const usersData = await resUsers.json();

        // Filtrer ceux déjà swipés
        const filteredUsers = usersData.filter((u) => !swipedIds.includes(u.id));
        setUsers(filteredUsers);
      } catch (err) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Fonction centralisée pour gérer le swipe (like ou ignore)
  const handleSwipe = async (liked) => {
    if (index >= users.length) return;
    const user = users[index];

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token manquant");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/swipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          swipedId: user.id,
          liked,
        }),
      });

      if (!res.ok) throw new Error("Erreur lors du swipe");

      // Message selon action
      setMessage(
        liked
          ? `Tu es intéressé par ${user.username || user.firstName}!`
          : `Pas intéressé par ${user.username || user.firstName}.`
      );

      // Supprime le user swipé de la liste pour ne plus le voir
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));

      // Reset index à 0 car on enlève un élément
      setIndex(0);
    } catch (err) {
      setError(err.message || "Erreur lors du swipe");
      console.error(err);
    }
  };

  if (loading) return <div className="text-center mt-20">Chargement des profils...</div>;

  if (error)
    return (
      <div className="text-center mt-20 text-red-600">
        Erreur : {error}
      </div>
    );

  if (users.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <p className="text-lg font-semibold">Tu as vu tous les profils.</p>
        <p className="mt-2">{message}</p>
      </div>
    );

  const user = users[index];

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="bg-white shadow rounded p-6 max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold mb-2">
          {user.username || `${user.firstName} ${user.lastName}` || "Utilisateur anonyme"}
        </h2>
        <p className="mb-2 italic">{user.dances?.join(", ") || "Pas de danses renseignées"}</p>
        <p className="mb-4">{user.bio || "Pas de bio"}</p>
        <div className="flex justify-around">
          <button
            onClick={() => handleSwipe(false)}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
          >
            Pas intéressé
          </button>
          <button
            onClick={() => handleSwipe(true)}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            Intéressé
          </button>
        </div>
        {message && <p className="mt-4 text-gray-700 italic">{message}</p>}
      </div>
    </div>
  );
}
