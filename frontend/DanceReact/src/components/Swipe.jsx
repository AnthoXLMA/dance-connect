import React, { useState, useEffect } from "react";

export default function Swipe() {
  const [users, setUsers] = useState([]);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:3001/api/users/nearby"); // adapte l’URL backend
        if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleSwipe = (direction) => {
    if (index >= users.length) return;
    const user = users[index];
    setMessage(
      direction === "right"
        ? `Tu es intéressé par ${user.name} !`
        : `Pas intéressé par ${user.name}.`
    );
    if (index < users.length - 1) {
      setIndex((prev) => prev + 1);
    } else {
      setIndex(users.length); // fin des profils
    }
  };

  if (loading)
    return <div className="text-center mt-20">Chargement des profils...</div>;

  if (error)
    return (
      <div className="text-center mt-20 text-red-600">
        Erreur : {error}
      </div>
    );

  if (index >= users.length)
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <p className="text-lg font-semibold">Tu as vu tous les profils.</p>
        <p className="mt-2">{message}</p>
      </div>
    );

  const user = users[index];
  console.log("User courant :", user);

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
            onClick={() => handleSwipe("left")}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
          >
            Pas intéressé
          </button>
          <button
            onClick={() => handleSwipe("right")}
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
