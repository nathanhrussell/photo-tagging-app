import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/test")
      .then((res) => {
        console.log("Raw response:", res);
        return res.json();
      })
      .then((data) => {
        console.log("Parsed data:", data);
        setData(data.message);
      })
      .catch((err) => {
        console.error("API error:", err);
        setData("API error");
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Frontend</h1>
      <p className="mt-2 text-green-600">Backend says: {data || "Loading..."}</p>
    </div>
  );
}

export default App;
