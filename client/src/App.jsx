import { useEffect, useState } from "react";

function App() {
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    fetch("/api/levels/1/characters") // adjust levelId as needed
      .then(res => res.json())
      .then(data => setCharacters(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Characters for Level 1</h1>
      <ul className="list-disc pl-5">
        {characters.map(char => (
          <li key={char.id}>
            {char.name} – x: {char.x}%, y: {char.y}%, w: {char.width}%, h: {char.height}%
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
