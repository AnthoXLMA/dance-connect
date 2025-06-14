import React from "react";
import { useForm } from "react-hook-form";

export default function Signup({ onSignup }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      // Étape 1 : inscription
      const res = await fetch("http://localhost:3001/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur inscription");
      }

      // Étape 2 : connexion automatique après inscription
      const loginRes = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(loginData.error || "Erreur de connexion après inscription");
      }

      // Étape 3 : stockage du token et déclenchement de la session
      localStorage.setItem("token", loginData.token);
      if (onSignup) onSignup(); // déclenche setIsLoggedIn(true)

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Créer un compte</h2>

      <div className="mb-4">
        <label>Email</label>
        <input
          {...register("email", { required: true })}
          type="email"
          className="w-full border p-2 rounded"
        />
        {errors.email && <p className="text-red-600">Email requis</p>}
      </div>

      <div className="mb-4">
        <label>Mot de passe</label>
        <input
          {...register("password", { required: true, minLength: 6 })}
          type="password"
          className="w-full border p-2 rounded"
        />
        {errors.password && <p className="text-red-600">Mot de passe requis (6 caractères min.)</p>}
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        S’inscrire
      </button>
    </form>
  );
}
