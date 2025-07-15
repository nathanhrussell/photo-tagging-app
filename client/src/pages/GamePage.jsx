// src/pages/GamePage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function GamePage() {
  const { levelId } = useParams();
  const [levelData, setLevelData] = useState(null);

  useEffect(() => {

    if (levelId === "1") {
      setLevelData({
        name: "Test Level 1",
        image: "level1.png"
      });
    } else {
      setLevelData(null);
    }
  }, [levelId]);

  if (!levelData) return <div className="text-white p-4">Loading level...</div>;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between text-white z-10 text-lg font-semibold">
        <div>⏱ Timer: 00:00</div>
        <div>🏆 Score: 0</div>
        <div>✅ Found: 0</div>
      </div>

      <img
        src={`http://localhost:3000/images/${levelData.image}`}
        alt={levelData.name}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
