// pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-gradient-to-br from-purple-900 via-indigo-800 to-pink-600 text-white">
      <h1 className="text-4xl font-extrabold mb-4 tracking-wide text-center">
        🎧 Dance Connect
      </h1>

      <p className="text-lg text-center mb-8 font-light">
        Connecte-toi avec des passionnés de danse urbaine autour de toi.
      </p>

      <div className="w-full flex flex-col gap-4 max-w-xs">
        <Link
          to="/login"
          className="bg-white text-purple-800 font-semibold py-3 rounded-full text-center shadow-md hover:bg-gray-100 transition"
        >
          Se connecter
        </Link>
        <Link
          to="/signup"
          className="bg-pink-500 text-white font-semibold py-3 rounded-full text-center shadow-md hover:bg-pink-600 transition"
        >
          S'inscrire
        </Link>
      </div>

      <footer className="absolute bottom-4 text-sm text-white/70">
        © 2025 Dance Connect
      </footer>
    </div>
  );
}
