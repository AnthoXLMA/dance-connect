import React, { useState } from "react";

const usersToSwipe = [
  { id: 201, name: "Alice", dances: ["Salsa", "Kompa"], bio: "Passionnée de danse" },
  { id: 202, name: "Bob", dances: ["Rock", "Tango"], bio: "Danseur amateur" },
  { id: 203, name: "Charlie", dances: ["West Coast Swing"], bio: "Toujours prêt à danser" },
];

export default function Swipe() {
  const [index, setIndex] = useState(0);

  const handleSwipe = (direction) => {
    console.log(`Swiped ${direction} on ${usersToSwipe[index].name}`);
    setIndex((prev) => (prev + 1) % usersToSwipe.length);
  };

  const user = usersToSwipe[index];

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="bg-white shadow rounded p-6 max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
        <p className="mb-2 italic">{user.dances.join(", ")}</p>
        <p className="mb-4">{user.bio}</p>
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
      </div>
    </div>
  );
}
