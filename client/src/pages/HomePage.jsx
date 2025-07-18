import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/game/1");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-6">🔍 Find The Characters in AI Slop</h1>
      <p className="mb-6 max-w-xl text-lg">
        Welcome to the AI Slop Challenge! In each level, your task is to locate three hidden characters as quickly as possible. 
        Use your observational skills to find them in chaotic, AI-generated scenes. Click their location, then choose who you think it is.
      </p>
      <button
        onClick={handleStart}
        className="mt-4 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-lg font-semibold shadow-lg"
      >
        Start Level 1
      </button>
    </div>
  );
}
