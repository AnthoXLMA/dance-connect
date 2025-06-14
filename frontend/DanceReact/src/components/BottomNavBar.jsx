// src/components/BottomNavBar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { MapPin, MessageCircle, User, Home } from "lucide-react";

export default function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around py-2 z-50">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center ${isActive ? "text-blue-600" : "text-gray-500"}`
        }
      >
        <Home size={24} />
        <span className="text-xs">Accueil</span>
      </NavLink>

      <NavLink
        to="/map"
        className={({ isActive }) =>
          `flex flex-col items-center ${isActive ? "text-blue-600" : "text-gray-500"}`
        }
      >
        <MapPin size={24} />
        <span className="text-xs">Carte</span>
      </NavLink>

      <NavLink
        to="/messages"
        className={({ isActive }) =>
          `flex flex-col items-center ${isActive ? "text-blue-600" : "text-gray-500"}`
        }
      >
        <MessageCircle size={24} />
        <span className="text-xs">Messages</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center ${isActive ? "text-blue-600" : "text-gray-500"}`
        }
      >
        <User size={24} />
        <span className="text-xs">Profil</span>
      </NavLink>
    </nav>
  );
}
