import { useEffect, useState, useRef } from "react";

export default function GamePage() {
  const levelId = "1";
  const [levelData, setLevelData] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (levelId === "1") {
      setLevelData({
        name: "Test Level 1",
        image: "level1.png",
        characters: ["Waldo", "Sunhat Girl", "Stroller Baby"]
      });
    }
  }, [levelId]);

  const handleClick = (e) => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;

    // Clamp the position to stay within the viewport boundaries
    const clampedX = Math.max(0, Math.min(x, window.innerWidth));
    const clampedY = Math.max(0, Math.min(y, window.innerHeight));

    setClickPosition({ x: clampedX, y: clampedY });
    setShowMenu(true);
  };

  const handleCharacterSelect = (name) => {
    console.log("Selected character:", name);
    setShowMenu(false);
  };

  if (!levelData) return <div className="text-white p-4">Loading level...</div>;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* UI HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between text-white z-10 text-lg font-semibold">
        <div>⏱ Timer: 00:00</div>
        <div>🏆 Score: 0</div>
        <div>✅ Found: 0</div>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex justify-center items-center"
        onClick={handleClick}
      >
        <img
          src={`http://localhost:3000/images/${levelData.image}`}
          alt={levelData.name}
          className="max-h-full max-w-full object-contain cursor-crosshair"
        />

        {showMenu && clickPosition && (
          <div
            className="absolute z-20"
            style={{
              left: `${clickPosition.x}px`,
              top: `${clickPosition.y}px`,
              transform: "translate(-50%, -50%)"
            }}
          >
            {/* Targeting circle */}
            <div className="w-16 h-16 border-4 border-red-500 rounded-full absolute -top-8 -left-8 pointer-events-none animate-pulse"></div>

            {/* Dropdown */}
            <div className="mt-4 bg-white text-black rounded shadow-lg p-2 min-w-32">
              {levelData.characters.map((char) => (
                <div
                  key={char}
                  className="cursor-pointer hover:bg-gray-200 px-3 py-2 rounded transition-colors"
                  onClick={() => {
                    handleCharacterSelect(char);
                  }}
                >
                  {char}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
