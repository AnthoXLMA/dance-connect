import React from "react";
import { Link } from "react-router-dom";

export default function TopNavbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="text-lg font-bold">Dance Connect</div>
      <div>
        <Link
          to="/liked-events"
          className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-200 transition"
        >
          ❤️ Événements likés
        </Link>
      </div>
    </nav>
  );
}
