import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    setLevels([
      {
        id: 1,
        name: "Test Level 1",
        image: "level1.png"
      }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-6">🔍 Find The Characters in AI Slop</h1>
      <p className="mb-4">Select a level to start:</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map((level) => (
        <Link
            key={level.id}
            to={`/game/${level.id}`}
            className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition"
        >
            <img
            src={`http://localhost:3000/images/${level.image}`}
            alt={level.name}
            className="w-full h-48 object-cover rounded-lg mb-3"
            />
            <h2 className="text-xl font-semibold">{level.name}</h2>
        </Link>
        ))}
      </div>
    </div>
  );
}
