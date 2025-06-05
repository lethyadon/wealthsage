import NavBar from "../components/NavBar";
import { useState } from "react";

export default function Dashboard() {
  const [progress, setProgress] = useState(60); // editable percentage

  return (
    <>
      <NavBar />
      <main className="max-w-3xl mx-auto p-6 font-sans text-center">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">📊 Dashboard</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Goal Progress</h2>
          <div className="relative w-40 h-40 mx-auto">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path
                className="text-gray-300"
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                className="text-green-500"
                strokeDasharray={`${progress}, 100`}
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <text x="18" y="20.35" className="fill-current text-black text-sm" textAnchor="middle">
                {progress}%
              </text>
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <p>💡 Update this manually for now or integrate a form later.</p>
          <button
            onClick={() => setProgress((prev) => (prev < 100 ? prev + 10 : 100))}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Increase Progress
          </button>
        </div>
      </main>
    </>
  );
}
