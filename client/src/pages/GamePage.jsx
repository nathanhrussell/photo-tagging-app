import React, { useState } from "react";

const characters = ["Waldo", "Sunhat Girl", "Stroller Baby"];

export default function PlaygroundTarget() {
  const [circle, setCircle] = useState(null); // Only one target at a time
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState({});

  const getClickCoords = (event) => {
    const svg = event.target;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return [x, y];
  };

  const handleImageClick = (event) => {
    const [x, y] = getClickCoords(event);
    setCircle({ x, y });
    setShowModal(true);
    setSelected({}); // Reset selection for new target
  };

  const handleCheckboxChange = (name) => {
    setSelected((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-xl font-bold mb-2">AI Slop Challenge: Find The Characters</h1>
      <svg
        width={500}
        height={500}
        style={{
          backgroundImage: 'url("http://localhost:3000/images/level1.png")',
          backgroundSize: "cover",
          cursor: "crosshair",
          display: "block"
        }}
        onClick={handleImageClick}
      >
        {circle && (
          <>
            <circle
              cx={circle.x}
              cy={circle.y}
              r="20"
              stroke="red"
              strokeWidth="3"
              fill="rgba(255,0,0,0.2)"
            />
            {/* Crosshair lines for clarity */}
            <line
              x1={circle.x - 15}
              y1={circle.y}
              x2={circle.x + 15}
              y2={circle.y}
              stroke="red"
              strokeWidth="2"
            />
            <line
              x1={circle.x}
              y1={circle.y - 15}
              x2={circle.x}
              y2={circle.y + 15}
              stroke="red"
              strokeWidth="2"
            />
          </>
        )}
      </svg>

      {/* Character selection modal */}
      {showModal && (
        <div className="mt-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200 w-[300px]">
          <h2 className="text-lg font-semibold mb-3">Who did you find?</h2>
          <form>
            {characters.map((char) => (
              <label
                key={char}
                className="flex items-center space-x-2 mb-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!selected[char]}
                  onChange={() => handleCheckboxChange(char)}
                  className="accent-red-500"
                />
                <span>{char}</span>
              </label>
            ))}
          </form>
          <button
            className="mt-4 px-4 py-1 rounded bg-red-500 text-white font-bold hover:bg-red-600"
            onClick={() => setShowModal(false)}
            type="button"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
