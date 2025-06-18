import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    fetch("http://localhost:3001/api/login", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Erreur connexion");
        }
        return res.json();
      })
      .then(({ token }) => {
        localStorage.setItem("token", token);
        alert("Connexion réussie !");
        if (onLogin) onLogin(); // Déclenche App.jsx → isLoggedIn = true
        navigate("/dashboard");
      })
      .catch((err) => alert(err.message));
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Se connecter</h2>

      <div className="mb-4">
        <label>Email</label>
        <input
          {...register("email", { required: "Email requis" })}
          type="email"
          autoComplete="email"
          className="w-full border p-2 rounded"
        />
        {errors.email && <p className="text-red-600">{errors.email.message}</p>}
      </div>

      <div className="mb-4">
        <label>Mot de passe</label>
        <input
          {...register("password", { required: "Mot de passe requis" })}
          type="password"
          autoComplete="current-password"
          className="w-full border p-2 rounded"
        />
        {errors.password && <p className="text-red-600">{errors.password.message}</p>}
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Se connecter
      </button>
    </form>
  );
}
