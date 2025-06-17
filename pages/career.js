// pages/career.js
import NavBar from "../components/NavBar";
import { useState, useEffect } from "react";
import { AiOutlineFileSearch, AiOutlineCheckCircle } from "react-icons/ai";
import axios from "axios";

export default function Career() {
  const [cvText, setCvText] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [score, setScore] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyzeCV = async () => {
    setLoading(true);
    const sampleKeywords = ["communication", "teamwork", "leadership", "sales", "strategy"];
    const cvLower = cvText.toLowerCase();
    const matched = sampleKeywords.filter(k => cvLower.includes(k));
    const missing = sampleKeywords.filter(k => !cvLower.includes(k));
    setScore(Math.round((matched.length / sampleKeywords.length) * 100));
    const tips = [];
    if (missing.length > 0) tips.push(`Consider including keywords like: ${missing.join(", ")}`);
    if (cvText.length < 500) tips.push("Try expanding your CV with more details about achievements.");
    if (matched.length > 2) tips.push("✅ Great! You've included strong skills relevant to many roles.");
    setFeedback(tips);
    setLoading(false);
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get("https://api.adzuna.com/v1/api/jobs/gb/search/1", {
        params: {
          app_id: "ffec525b",
          app_key: "a1d6d5389f23a7ffaaf5c1b7f24333f2",
          what: "customer service",
          where: "Northampton",
          content_type: "application/json"
        }
      });
      setJobs(response.data.results.slice(0, 5));
    } catch (err) {
      console.error("Job API error", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <NavBar />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Career Helper</h1>

        <div className="mb-6">
          <label className="font-semibold">Paste your CV below for AI analysis:</label>
          <textarea
            rows={6}
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            className="w-full border p-2 rounded mt-2"
            placeholder="Paste your CV here..."
          />
          <button
            onClick={analyzeCV}
            disabled={loading || !cvText.trim()}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            {loading ? "Analyzing..." : "Analyze CV"}
          </button>
        </div>

        {score !== null && (
          <div className="bg-white rounded shadow p-4 mb-6">
            <h3 className="font-semibold text-lg mb-2">CV Score: <span className="text-green-700">{score}%</span></h3>
            <ul className="list-disc ml-5 text-sm">
              {feedback.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <section className="bg-white p-4 rounded shadow space-y-3">
          <h2 className="text-xl font-semibold">🌍 Live Job Listings</h2>
          <ul className="space-y-2">
            {jobs.map((job, i) => (
              <li key={i} className="p-2 border rounded bg-gray-100">
                <a
                  href={job.redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-green-700 hover:underline"
                >
                  {job.title} @ {job.company.display_name}
                </a>
                <p className="text-xs text-gray-500">{job.location.display_name}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
