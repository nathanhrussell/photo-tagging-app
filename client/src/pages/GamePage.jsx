import React, { useRef, useState } from "react";

// Use the actual size of your image
const IMAGE_SRC = "http://localhost:3000/images/level1.png";
const SVG_WIDTH = 1152;
const SVG_HEIGHT = 768;
const characters = ["Waldo", "Sunhat Girl", "Stroller Baby"];

export default function PlaygroundTarget() {
  const svgRef = useRef(null);
  const [circle, setCircle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState({});

  const handleImageClick = (e) => {
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

    const xPercent = (svgPoint.x / SVG_WIDTH) * 100;
    const yPercent = (svgPoint.y / SVG_HEIGHT) * 100;

    console.log("🎯 Raw SVG coords:", svgPoint);
    console.log("📐 Normalised (%):", {
      x: xPercent.toFixed(2),
      y: yPercent.toFixed(2),
    });

    setCircle({ x: svgPoint.x, y: svgPoint.y });
    setShowModal(true);
    setSelected({});
  };


  const handleCheckboxChange = (name) => {
    setSelected((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-xl font-bold mb-2">AI Slop Challenge: Find The Characters</h1>
      <div
        className="w-full"
        style={{
          maxWidth: "900px",
          aspectRatio: `${SVG_WIDTH} / ${SVG_HEIGHT}`,
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          width="100%"
          height="100%"
          style={{
            display: "block",
            backgroundImage: `url("${IMAGE_SRC}")`,
            backgroundSize: "contain", // <- this ensures NO cropping!
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            cursor: "crosshair",
            borderRadius: "1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            width: "100%",
            height: "100%",
            aspectRatio: `${SVG_WIDTH}/${SVG_HEIGHT}`, // CSS fallback
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
