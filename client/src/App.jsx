import { Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <div className="p-4">
      <nav className="mb-4 flex gap-4">
        <Link to="/" className="text-blue-600">Home</Link>
        <Link to="/game" className="text-blue-600">Game</Link>
      </nav>
      <Routes>
        <Route path="/" element={<h1 className="text-2xl font-bold">Welcome to Waldo!</h1>} />
        <Route path="/game" element={<h1 className="text-2xl font-bold">Start the game</h1>} />
      </Routes>
    </div>
  );
}

export default App;
