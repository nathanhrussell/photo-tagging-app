import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const SVG_WIDTH = 1152;
const SVG_HEIGHT = 768;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function GamePage() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const [levelData, setLevelData] = useState(null);
  const [hitboxes, setHitboxes] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [circle, setCircle] = useState(null);
  const [percentCoords, setPercentCoords] = useState(null);
  const [hasClickedOnce, setHasClickedOnce] = useState(false);
  const [selected, setSelected] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [foundCharacters, setFoundCharacters] = useState([]);
  const [foundMarkers, setFoundMarkers] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/levels/${levelId}`);
        const data = await res.json();
        setLevelData(data);

        const charRes = await fetch(`http://localhost:3000/api/levels/${levelId}/characters`);
        const charData = await charRes.json();
        setHitboxes(charData);
        if (levelId === "1") {
          sessionStorage.setItem("totalTime", "0");
        }

        const previousTime = levelId !== "1" ? parseInt(sessionStorage.getItem("totalTime") || "0") : 0;
        setElapsed(previousTime);
      } catch (err) {
        console.error("Failed to load level or character data", err);
      }
    };

    fetchLevel();

    setGameStarted(false);
    setCircle(null);
    setPercentCoords(null);
    setHasClickedOnce(false);
    setSelected({});
    setFeedback(null);
    setFoundCharacters([]);
    setFoundMarkers([]);
    setElapsed(0);
    setTimerActive(false);
  }, [levelId]);

  useEffect(() => {
    let interval;
    if (gameStarted && !timerActive && foundCharacters.length < 3) {
      setTimerActive(true);
    }
    if (timerActive && foundCharacters.length < 3) {
      interval = setInterval(() => setElapsed((t) => t + 1), 1000);
    }
    if (foundCharacters.length === 3 && timerActive) {
      setTimerActive(false);
      sessionStorage.setItem("totalTime", String(elapsed));
    }
    return () => clearInterval(interval);
  }, [gameStarted, timerActive, foundCharacters.length]);

  const getCharacterImage = (index) =>
    `http://localhost:3000/images/characters/level${levelId}char${index + 1}.png`;

  const handleImageClick = (e) => {
    if (foundCharacters.length === 3) return;
    setFeedback(null);

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();

    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    setPercentCoords({ x: xPercent, y: yPercent });

    // Also calculate SVG coordinate for visual red circle
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

    setCircle({ x: svgPoint.x, y: svgPoint.y });
    setSelected({});
    setHasClickedOnce(true);
  };

  const validateCharacterSelection = async (characterName) => {
    if (!percentCoords || !circle) return;

    const payload = {
      levelId: parseInt(levelId),
      character: characterName,
      x: percentCoords.x,
      y: percentCoords.y
    };

    try {
      const res = await fetch("http://localhost:3000/api/validate-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.correct) {
        setFeedback("correct");
        setFoundCharacters((prev) => [...prev, characterName]);
        setFoundMarkers((prev) => [...prev, { name: characterName, x: circle.x, y: circle.y }]);
        setCircle(null);
      } else {
        setFeedback("incorrect");
      }

      setSelected({});
      setPercentCoords(null);
    } catch (err) {
      console.error("❌ Error validating click:", err);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    const previousTime = levelId !== "1" ? parseInt(sessionStorage.getItem("totalTime") || "0") : 0;
    setElapsed(previousTime);
    setTimerActive(true);
  };

  const goToNextLevel = () => {
    const nextId = parseInt(levelId) + 1;
    navigate(`/game/${nextId}`);
  };

  if (!levelData) return <div className="text-white p-8">Loading...</div>;

  const showNextLevel = foundCharacters.length === 3 && parseInt(levelId) < 5;

  return (
    <div className="flex flex-col items-center w-full p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        AI Slop Challenge: {levelData.name}
      </h1>

      <div className="flex justify-center items-center gap-8 w-full max-w-xl mb-4">
        <div className="text-xl font-mono bg-gray-50 rounded-lg px-4 py-2 border shadow text-gray-800">
          Time: {formatTime(elapsed)}
        </div>
        {foundCharacters.length === 3 && (
          <div className="text-green-700 font-semibold text-lg">🎉 Well done!</div>
        )}
      </div>

      {feedback && (
        <div className="fixed top-6 left-0 w-full flex justify-center z-[120] pointer-events-none">
          <div
            className={`text-lg font-bold px-4 py-2 rounded shadow ${
              feedback === "correct"
                ? "bg-green-200 text-green-800"
                : "bg-red-200 text-red-800"
            }`}
          >
            {feedback === "correct" ? "✅ Correct!" : "❌ Not quite. Try again!"}
          </div>
        </div>
      )}

      {showNextLevel && (
        <button
          onClick={goToNextLevel}
          className="mb-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold"
        >
          Next Level →
        </button>
      )}

      <div className="w-full" style={{ maxWidth: "900px", aspectRatio: `${SVG_WIDTH} / ${SVG_HEIGHT}` }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          width="100%"
          height="100%"
          style={{
            display: "block",
            backgroundImage: `url(http://localhost:3000${levelData.imageUrl})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            cursor:
              gameStarted && foundCharacters.length !== 3 ? "crosshair" : "default",
            borderRadius: "1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
          }}
          onClick={gameStarted ? handleImageClick : undefined}
        >
{/*     
          {hitboxes.map((char) => {
            const x = (char.x / 100) * SVG_WIDTH;
            const y = (char.y / 100) * SVG_HEIGHT;
            const width = (char.width / 100) * SVG_WIDTH;
            const height = (char.height / 100) * SVG_HEIGHT;
            return (
              <rect
                key={char.name}
                x={x}
                y={y}
                width={width}
                height={height}
                fill="rgba(0, 0, 255, 0.15)"
                stroke="blue"
                strokeWidth="1"
              />
            );
          })} */}

          {foundMarkers.map((marker) => (
            <g key={marker.name}>
              <circle cx={marker.x} cy={marker.y} r="20" stroke="green" strokeWidth="3" fill="rgba(0,255,0,0.2)" />
              <line x1={marker.x - 15} y1={marker.y} x2={marker.x + 15} y2={marker.y} stroke="green" strokeWidth="2" />
              <line x1={marker.x} y1={marker.y - 15} x2={marker.x} y2={marker.y + 15} stroke="green" strokeWidth="2" />
            </g>
          ))}

          {circle && (
            <>
              <circle cx={circle.x} cy={circle.y} r="20" stroke="red" strokeWidth="3" fill="rgba(255,0,0,0.2)" />
              <line x1={circle.x - 15} y1={circle.y} x2={circle.x + 15} y2={circle.y} stroke="red" strokeWidth="2" />
              <line x1={circle.x} y1={circle.y - 15} x2={circle.x} y2={circle.y + 15} stroke="red" strokeWidth="2" />
            </>
          )}
        </svg>
      </div>

      <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${
        feedback ? "bg-transparent" : "bg-black bg-opacity-50"
      }`}>
        <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transition-all duration-300 ${
          feedback ? "mt-20" : ""
        }`}>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {!gameStarted || !hasClickedOnce ? "Find these characters" : "Who did you find?"}
            </h2>
          </div>
          <div className="p-6">
            <div className="flex justify-center gap-4 flex-wrap max-w-[300px] mx-auto">
              {[...levelData.characters]
                .sort((a, b) => {
                  const aNum = parseInt(a.name.replace(/\D/g, ""));
                  const bNum = parseInt(b.name.replace(/\D/g, ""));
                  return aNum - bNum;
                })
                .map((char, index) => {
                const isFound = foundCharacters.includes(char.name);
                const isSelected = selected[char.name];
                const canClick = gameStarted && hasClickedOnce && !isFound;
                return (
                  <button
                    key={char.name}
                    disabled={!canClick}
                    onClick={() => {
                      if (canClick) {
                        setSelected({ [char.name]: true });
                        validateCharacterSelection(char.name);
                      }
                    }}
                    className={`
                      relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 
                      ${isFound 
                        ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
                        : canClick
                        ? "hover:border-red-400 hover:shadow-md cursor-pointer border-gray-200 bg-white hover:bg-red-50"
                        : "opacity-70 cursor-not-allowed border-gray-200 bg-gray-50"
                      }
                      ${isSelected ? "border-red-500 bg-red-50" : ""}
                    `}
                  >
                    <div className="relative mb-3">
                      <img
                        src={getCharacterImage(index)}
                        alt={char.name}
                        className="w-16 h-16 sm:w-14 sm:h-14 md:w-12 md:h-12 object-cover rounded-md border border-gray-200"
                        style={{ width: "64px", height: "64px" }}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      {isFound && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 text-xl font-bold">✓</span>
                        </div>
                      )}
                    </div>
                    <span className={`text-sm font-medium text-center leading-tight ${
                      isFound ? "line-through text-gray-400" : "text-gray-700"
                    }`}>
                      {char.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100">
            {!gameStarted && (
              <button
                onClick={startGame}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors duration-200"
              >
                Start Level
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
