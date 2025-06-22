import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileEdit({ profile, setProfile }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        email: profile.email || "",
        name: profile.name || "",
        city: profile.city || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/profile", {
        method: "PUT", // ou PATCH selon ton backend
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la mise à jour");
      }

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      alert("Profil mis à jour !");
      navigate("/profile");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <p>Chargement...</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Modifier mon profil</h2>

      <label>Email</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="w-full border p-2 rounded mb-4"
        required
      />

      <label>Nom</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="w-full border p-2 rounded mb-4"
      />

      <label>Ville</label>
      <input
        type="text"
        name="city"
        value={formData.city}
        onChange={handleChange}
        className="w-full border p-2 rounded mb-4"
      />

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
