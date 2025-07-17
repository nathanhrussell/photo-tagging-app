import React, { useRef, useState } from "react";

const IMAGE_SRC = "http://localhost:3000/images/level1.png";
const SVG_WIDTH = 1152;
const SVG_HEIGHT = 768;
const characters = ["Waldo", "Sunhat Girl", "Stroller Baby"];

export default function GamePage() {
  const svgRef = useRef(null);
  const [circle, setCircle] = useState(null);
  const [percentCoords, setPercentCoords] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [foundCharacters, setFoundCharacters] = useState([]);
  const [foundMarkers, setFoundMarkers] = useState([]); // ✅ New state

  const getCharacterImage = (name) =>
    `http://localhost:3000/images/characters/${name.toLowerCase().replace(/\s+/g, "-")}.png`;

  const handleImageClick = (e) => {
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

    const xPercent = (svgPoint.x / SVG_WIDTH) * 100;
    const yPercent = (svgPoint.y / SVG_HEIGHT) * 100;

    setCircle({ x: svgPoint.x, y: svgPoint.y });
    setPercentCoords({ x: xPercent, y: yPercent });
    setShowModal(true);
    setSelected({});
  };

  const validateCharacterSelection = async (characterName) => {
    if (!percentCoords || !circle) return;

    const payload = {
      levelId: 1,
      character: characterName,
      x: percentCoords.x,
      y: percentCoords.y
    };

    console.log("📤 Sending to backend:", payload);

    try {
      const res = await fetch("http://localhost:3000/api/validate-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("📥 Response from backend:", data);

      if (data.correct) {
        setFeedback("correct");
        setFoundCharacters((prev) => [...prev, characterName]);
        setFoundMarkers((prev) => [...prev, { name: characterName, x: circle.x, y: circle.y }]); // ✅ Store position
      } else {
        setFeedback("incorrect");
      }

      setShowModal(false);
      setCircle(null);
      setSelected({});
      setPercentCoords(null);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error("❌ Error validating click:", err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">AI Slop Challenge: Find The Characters</h1>

      <div className="w-full" style={{ maxWidth: "900px", aspectRatio: `${SVG_WIDTH} / ${SVG_HEIGHT}` }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          width="100%"
          height="100%"
          style={{
            display: "block",
            backgroundImage: `url("${IMAGE_SRC}")`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            cursor: "crosshair",
            borderRadius: "1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
          }}
          onClick={handleImageClick}
        >
          {/* ✅ Permanent green markers */}
          {foundMarkers.map((marker) => (
            <g key={marker.name}>
              <circle
                cx={marker.x}
                cy={marker.y}
                r="20"
                stroke="green"
                strokeWidth="3"
                fill="rgba(0,255,0,0.2)"
              />
              <line
                x1={marker.x - 15}
                y1={marker.y}
                x2={marker.x + 15}
                y2={marker.y}
                stroke="green"
                strokeWidth="2"
              />
              <line
                x1={marker.x}
                y1={marker.y - 15}
                x2={marker.x}
                y2={marker.y + 15}
                stroke="green"
                strokeWidth="2"
              />
            </g>
          ))}

          {/* Temporary red marker */}
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
      </div>

      {feedback && (
        <div
          className={`mt-4 text-lg font-bold px-4 py-2 rounded ${
            feedback === "correct"
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {feedback === "correct" ? "✅ Correct!" : "❌ Not quite. Try again!"}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transition-all duration-300">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 text-center">
                Who did you find?
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {characters.map((char) => {
                  const isFound = foundCharacters.includes(char);
                  const isSelected = selected[char];

                  return (
                    <button
                      key={char}
                      disabled={isFound}
                      onClick={() => {
                        if (!isFound) {
                          setSelected({ [char]: true });
                          validateCharacterSelection(char);
                        }
                      }}
                      className={`
                        relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 
                        ${isFound 
                          ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' 
                          : 'hover:border-red-400 hover:shadow-md cursor-pointer border-gray-200 bg-white hover:bg-red-50'
                        }
                        ${isSelected ? 'border-red-500 bg-red-50' : ''}
                      `}
                    >
                      <div className="relative mb-3">
                        <img
                          src={getCharacterImage(char)}
                          alt={char}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                        {isFound && (
                          <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 text-xl font-bold">✓</span>
                          </div>
                        )}
                      </div>
                      <span className={`text-sm font-medium text-center leading-tight ${
                        isFound ? 'line-through text-gray-400' : 'text-gray-700'
                      }`}>
                        {char}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
