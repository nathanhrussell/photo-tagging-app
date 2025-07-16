import React, { useState } from "react";

export default function PlaygroundTarget() {
  const [circles, setCircles] = useState([]);

  const getClickCoords = (event) => {
    const svg = event.target;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return [x, y];
  };

  const addCircle = (event) => {
    let [x, y] = getClickCoords(event);
    let newCircle = (
      <circle
        key={circles.length + 1}
        cx={x}
        cy={y}
        r="20"
        stroke="red"
        strokeWidth="3"
        fill="rgba(255,0,0,0.2)"
      />
    );
    setCircles([newCircle]);
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
        onClick={addCircle}
      >
        {circles}
      </svg>
    </div>
  );
}
