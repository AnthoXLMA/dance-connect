import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Swipe() {
  const [allUsers, setAllUsers] = useState([]); // tous les utilisateurs récupérés
  const [swipedUserIds, setSwipedUserIds] = useState([]); // ids déjà swipés
  const [index, setIndex] = useState(0); // index du profil actuel
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const [resSwiped, resUsers] = await Promise.all([
          axios.get("/api/swipes/liked", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/users/nearby", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const swipedIds = resSwiped.data;
        const usersData = resUsers.data;

        setSwipedUserIds(swipedIds);
        // On filtre les users non swipés pour swiper un par un
        setAllUsers(usersData.filter(u => !swipedIds.includes(u.id)));
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSwipe = async (liked) => {
    if (index >= allUsers.length) return;
    const user = allUsers[index];
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token manquant");
      return;
    }

    try {
      await axios.post(
        "/api/swipes",
        { swipedId: user.id, liked },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(
        liked
          ? `Tu es intéressé par ${user.username || user.firstName}!`
          : `Pas intéressé par ${user.username || user.firstName}.`
      );

      // Ajouter cet ID à la liste des swipés
      setSwipedUserIds(prev => [...prev, user.id]);

      // Passer au profil suivant
      setIndex(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Erreur lors du swipe");
    }
  };

  if (loading) return <div className="text-center mt-20">Chargement des profils...</div>;
  if (error) return <div className="text-center mt-20 text-red-600">Erreur : {error}</div>;
  if (index >= allUsers.length)
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <p className="text-lg font-semibold">Tu as vu tous les profils.</p>
        <p className="mt-2">{message}</p>
      </div>
    );

  const user = allUsers[index];

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
