import React from "react";
import { Link } from "react-router-dom";

export default function TopNavbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="text-lg font-bold">Dance Connect</div>
      <div className="flex items-center space-x-4">
        <Link
          to="/liked-events"
          className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-200 transition"
        >
          Mes Événements
        </Link>
        <Link
          to="/liked-users"
          className="hover:underline"
        >
          Mes Danseurs
        </Link>
        <Link
          to="/subscriptions"
          className="flex items-center space-x-1 hover:underline"
          title="Abonnements"
        >
          <span role="img" aria-label="subscription" className="text-xl">
            💳
          </span>
          <span>Abonnements</span>
        </Link>
      </div>
    </nav>
  );
}
