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
  const [debugInfo, setDebugInfo] = useState(null); // Added for debugging
  
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
  
  // New state for high score modal
  const [showHighScoreModal, setShowHighScoreModal] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // New state for level locking
  const [isLevelLocked, setIsLevelLocked] = useState(false);

  // Function to check if level is unlocked
  const checkLevelUnlocked = (currentLevelId) => {
    const currentLevel = parseInt(currentLevelId);
    
    // Level 1 is always unlocked
    if (currentLevel === 1) {
      return true;
    }
    
    // Check if all previous levels have been completed
    const completedLevels = JSON.parse(sessionStorage.getItem("completedLevels") || "[]");
    
    // Check that all levels from 1 to currentLevel-1 are completed
    for (let i = 1; i < currentLevel; i++) {
      if (!completedLevels.includes(i)) {
        return false;
      }
    }
    
    return true;
  };

  // Function to mark level as completed
  const markLevelCompleted = (levelId) => {
    const completedLevels = JSON.parse(sessionStorage.getItem("completedLevels") || "[]");
    const levelNum = parseInt(levelId);
    
    if (!completedLevels.includes(levelNum)) {
      completedLevels.push(levelNum);
      sessionStorage.setItem("completedLevels", JSON.stringify(completedLevels));
    }
  };

  useEffect(() => {
    const navEntries = performance.getEntriesByType("navigation");
    const isReload = navEntries.length > 0 && navEntries[0].type === "reload";

    if (isReload) {
      sessionStorage.removeItem("totalTime");
      sessionStorage.removeItem("completedLevels");
    }

    const fetchLevel = async () => {
      try {
        console.log(`🔍 Starting fetch for level ${levelId}`);
        
        // Check if level is unlocked first
        const isUnlocked = checkLevelUnlocked(levelId);
        setIsLevelLocked(!isUnlocked);
        console.log(`🔐 Level ${levelId} unlocked: ${isUnlocked}`);
        
        // Construct the URL and log it
        const url = `/api/levels/${levelId}`;
        console.log(`📡 Fetching from: ${url}`);
        
        const res = await fetch(url);
        console.log(`📊 Response status: ${res.status} ${res.statusText}`);
        console.log(`📊 Response headers:`, res.headers);
        console.log(`📊 Response ok: ${res.ok}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status} ${res.statusText}`);
        }
        
        // Get the raw response text first
        const rawText = await res.text();
        console.log(`📄 Raw response length: ${rawText.length}`);
        console.log(`📄 Raw response preview: ${rawText.substring(0, 200)}...`);
        
        // Try to parse the JSON
        let data;
        try {
          data = JSON.parse(rawText);
          console.log(`✅ JSON parsed successfully:`, data);
        } catch (jsonError) {
          console.error(`❌ JSON parse error:`, jsonError);
          console.error(`❌ Raw text that failed to parse:`, rawText);
          setDebugInfo({
            error: 'JSON Parse Error',
            status: res.status,
            rawText: rawText,
            jsonError: jsonError.message
          });
          throw new Error(`Failed to parse JSON: ${jsonError.message}`);
        }
        
        // Validate the data structure
        if (!data || typeof data !== 'object') {
          console.error(`❌ Invalid data structure:`, data);
          throw new Error('Invalid data structure received');
        }
        
        if (!data.characters || !Array.isArray(data.characters)) {
          console.error(`❌ Missing or invalid characters array:`, data);
          throw new Error('Characters data missing or invalid');
        }
        
        console.log(`✅ Level data validated successfully`);
        setLevelData(data);
        setDebugInfo(null); // Clear debug info on success

        if (levelId === "1") {
          sessionStorage.setItem("totalTime", "0");
        }

        const previousTime = levelId !== "1" ? parseInt(sessionStorage.getItem("totalTime") || "0") : 0;
        setElapsed(previousTime);
        
      } catch (err) {
        console.error("❌ Failed to load level or character data", err);
        setDebugInfo({
          error: err.message,
          levelId: levelId,
          timestamp: new Date().toISOString()
        });
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
      
      // Mark current level as completed
      markLevelCompleted(levelId);
      
      // Check if this is the final level (level 5) and show high score modal
      if (parseInt(levelId) === 5) {
        setShowHighScoreModal(true);
      }
    }
    return () => clearInterval(interval);
  }, [gameStarted, timerActive, foundCharacters.length, levelId, elapsed]);

  const getCharacterImage = (index) =>
    `images/characters/level${levelId}char${index + 1}.png`;

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
      console.log(`🎯 Validating character selection:`, payload);
      
      const res = await fetch("/api/validate-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      console.log(`🎯 Validation response status: ${res.status}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const rawText = await res.text();
      console.log(`🎯 Validation raw response: ${rawText}`);
      
      const data = JSON.parse(rawText);
      console.log(`🎯 Validation parsed data:`, data);

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
    if (isLevelLocked) return;
    
    setGameStarted(true);
    const previousTime = levelId !== "1" ? parseInt(sessionStorage.getItem("totalTime") || "0") : 0;
    setElapsed(previousTime);
    setTimerActive(true);
  };

  const goToNextLevel = () => {
    const nextId = parseInt(levelId) + 1;
    navigate(`/game/${nextId}`);
  };

  const handleHighScoreSubmit = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    const scoreData = {
      name: playerName.trim(),
      time: elapsed,
      completedAt: new Date().toISOString()
    };

    console.log("Submitting high score:", scoreData);

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Score submitted successfully:", result);
      
      // Fetch leaderboard data after successful submission
      await fetchLeaderboard();
      setScoreSubmitted(true);
    } catch (error) {
      console.error("Failed to submit score:", error);
      // Still show success screen even if submission failed
      // You could add error handling here if desired
      setScoreSubmitted(true);
    }
  };

  const handleSkipHighScore = async () => {
    // Fetch leaderboard even if they skip submission
    await fetchLeaderboard();
    setScoreSubmitted(true);
  };

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      console.log(`🏆 Fetching leaderboard...`);
      const response = await fetch('/api/scores');
      console.log(`🏆 Leaderboard response status: ${response.status}`);
      
      if (response.ok) {
        const rawText = await response.text();
        console.log(`🏆 Leaderboard raw response: ${rawText}`);
        
        const scores = JSON.parse(rawText);
        console.log(`🏆 Leaderboard parsed scores:`, scores);
        
        // Sort by time (ascending - fastest first) and take top 10
        const sortedScores = scores.sort((a, b) => a.time - b.time).slice(0, 10);
        setLeaderboardData(sortedScores);
      } else {
        console.error("Failed to fetch leaderboard");
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboardData([]);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const resetGameAndGoHome = () => {
    // Clear session storage to reset the game state
    sessionStorage.removeItem("totalTime");
    sessionStorage.removeItem("completedLevels");
    
    // Reset all game state
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
    setPlayerName("");
    
    // Navigate to homepage (assuming it's at "/")
    navigate("/");
  };

  // Show debug info if there's an error
  if (debugInfo) {
    return (
      <div className="text-white p-8 bg-red-900 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">🐛 Debug Information</h1>
        <div className="bg-red-800 p-4 rounded mb-4">
          <h2 className="font-bold mb-2">Error Details:</h2>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Reload Page
        </button>
      </div>
    );
  }

  if (!levelData) return <div className="text-white p-8">Loading level {levelId}...</div>;

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
            backgroundImage: gameStarted ? `url(${levelData.imageUrl})` : "none",
            backgroundColor: gameStarted ? "transparent" : "#f3f4f6",
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
          {!gameStarted && (
            <rect
              x="0"
              y="0"
              width={SVG_WIDTH}
              height={SVG_HEIGHT}
              fill="#f3f4f6"
              rx="16"
            />
          )}
          {!gameStarted && (
            <text
              x={SVG_WIDTH / 2}
              y={SVG_HEIGHT / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="32"
              fill="#6b7280"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="500"
            >
              {isLevelLocked ? "Complete previous levels to unlock" : "Click \"Start Level\" to begin"}
            </text>
          )}
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

      {/* High Score Modal */}
      {showHighScoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
            <div className="px-6 py-6 text-center">
              {!scoreSubmitted ? (
                <>
                  <div className="mb-4">
                    <div className="text-6xl mb-2">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Congratulations!
                    </h2>
                    <p className="text-gray-600 mb-4">
                      You found all 15 characters and completed the AI Slop Challenge!
                    </p>
                    <div className="text-3xl font-mono font-bold text-green-600 mb-6">
                      Final Time: {formatTime(elapsed)}
                    </div>
                  </div>

                  <form onSubmit={handleHighScoreSubmit}>
                    <div className="mb-6">
                      <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
                        Enter your name for the leaderboard:
                      </label>
                      <input
                        type="text"
                        id="playerName"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        placeholder="Your name"
                        maxLength={20}
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleSkipHighScore}
                        className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                      >
                        Skip
                      </button>
                      <button
                        type="submit"
                        disabled={!playerName.trim()}
                        className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors duration-200"
                      >
                        Submit Score
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="text-6xl mb-2">✅</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {playerName.trim() ? "Score Submitted!" : "Thanks for Playing!"}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {playerName.trim() 
                        ? `Good luck ${playerName.trim()}! Your time of ${formatTime(elapsed)} has been recorded.`
                        : `Your final time was ${formatTime(elapsed)}. Challenge your friends to beat it!`
                      }
                    </p>
                  </div>

                  <button
                    onClick={resetGameAndGoHome}
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors duration-200"
                  >
                    🏠 Play Again
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

            {scoreSubmitted && parseInt(levelId) === 5 && (
        <div className="mt-12 w-full max-w-xl text-center">
          <h2 className="text-2xl font-bold mb-4">🏆 Leaderboard</h2>
          {loadingLeaderboard ? (
            <p className="text-gray-600">Loading leaderboard...</p>
          ) : leaderboardData.length === 0 ? (
            <p className="text-gray-600">No scores yet. Be the first to complete the game!</p>
          ) : (
            <table className="w-full text-left border border-gray-300 rounded-xl overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border-b">#</th>
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Time</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((entry, index) => (
                  <tr key={index} className="even:bg-gray-50">
                    <td className="p-3 border-b">{index + 1}</td>
                    <td className="p-3 border-b">{entry.name}</td>
                    <td className="p-3 border-b">{formatTime(entry.time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}


      {/* Character Selection Modal */}
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
              {levelData.characters && [...levelData.characters]
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
                disabled={isLevelLocked}
                className={`w-full py-3 rounded-xl font-medium transition-colors duration-200 ${
                  isLevelLocked
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {isLevelLocked ? "🔒 Level Locked" : "Start Level"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}