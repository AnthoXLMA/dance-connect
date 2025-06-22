import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function Signup({ onSignup }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await fetch("http://localhost:3001/api/users/signup", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error = await res.json();
          throw new Error(error.error || "Erreur inscription");
        } else {
          const text = await res.text();
          throw new Error(`Erreur inscription: ${text}`);
        }
      }

      const loginRes = await fetch("http://localhost:3001/api/users/login", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(loginData.error || "Erreur de connexion après inscription");
      }

      localStorage.setItem("token", loginData.token);

      if (onSignup) onSignup();
      navigate("/profile-form");

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
