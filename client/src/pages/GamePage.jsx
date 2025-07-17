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
    if (!percentCoords) return;

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
      } else {
        setFeedback("incorrect");
      }

      // Clean up state
      setShowModal(false);
      setCircle(null);
      setSelected({});
      setPercentCoords(null);

      // Hide feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error("❌ Error validating click:", err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-xl font-bold mb-2">AI Slop Challenge: Find The Characters</h1>

      <div
        className="w-full"
        style={{ maxWidth: "900px", aspectRatio: `${SVG_WIDTH} / ${SVG_HEIGHT}` }}
      >
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
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            width: "100%",
            height: "100%",
            aspectRatio: `${SVG_WIDTH}/${SVG_HEIGHT}`
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
              <line x1={circle.x - 15} y1={circle.y} x2={circle.x + 15} y2={circle.y} stroke="red" strokeWidth="2" />
              <line x1={circle.x} y1={circle.y - 15} x2={circle.x} y2={circle.y + 15} stroke="red" strokeWidth="2" />
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

      {showModal && (
        <div className="mt-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200 w-[300px]">
          <h2 className="text-lg font-semibold mb-3">Who did you find?</h2>
          <form>
            {characters.map((char) => (
              <label
                key={char}
                className="flex items-center gap-3 mb-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!selected[char]}
                  disabled={foundCharacters.includes(char)}
                  onChange={() => {
                    if (!foundCharacters.includes(char)) {
                      setSelected({ [char]: true });
                      validateCharacterSelection(char);
                    }
                  }}
                  className="accent-red-500"
                />
                <img
                  src={getCharacterImage(char)}
                  alt={char}
                  className="w-10 h-10 object-contain rounded border"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <span className={foundCharacters.includes(char) ? "line-through text-gray-400" : ""}>
                  {char}
                </span>
              </label>
            ))}
          </form>
          <button
            className="mt-4 px-4 py-1 rounded bg-red-500 text-white font-bold hover:bg-red-600"
            onClick={() => setShowModal(false)}
            type="button"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
