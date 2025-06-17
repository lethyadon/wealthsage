// pages/career.js
import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Career() {
  const [cvText, setCvText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [cvBuilt, setCvBuilt] = useState("");
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(
        `https://api.adzuna.com/v1/api/jobs/gb/search/1`,
        {
          params: {
            app_id: "ffec525b",
            app_key: "a1d6d5389f23a7ffaaf5c1b7f24333f2",
            what: "sales",
            where: "Northampton",
            results_per_page: 5,
          },
        }
      );
      setJobs(response.data.results);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  const analyzeCV = () => {
    if (!cvText.trim()) {
      setFeedback("Please paste your CV first.");
      return;
    }
    const tips = [];
    if (!cvText.toLowerCase().includes("results")) tips.push("Consider highlighting quantifiable achievements.");
    if (!cvText.toLowerCase().includes("manager")) tips.push("Include any leadership or management experience.");
    if (!cvText.toLowerCase().includes("sales")) tips.push("Mention relevant industry keywords like 'sales' or 'client relationships'.");
    setFeedback(tips.length ? tips.join("\n") : "Your CV looks strong! Consider tailoring to each role.");
  };

  const buildCvFromScratch = () => {
    const template = `
John Doe
Email: john.doe@example.com | Phone: 01234 567890
Location: Northampton, UK

Professional Summary:
Highly motivated professional with a strong background in [Industry/Field]. Proven ability to [insert result-driven example] with excellent skills in [list top skills].

Work Experience:
- [Job Title], [Company], [Dates]
  - Achievement 1
  - Achievement 2

Education:
- [Degree], [University], [Graduation Year]

Skills:
- Communication | Team Leadership | Project Management | CRM | Microsoft Office

References available upon request.`;
    setCvBuilt(template);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <NavBar />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Career Helper</h1>

        <label className="block font-medium mb-1">Paste your CV below for AI analysis:</label>
        <textarea
          rows="6"
          value={cvText}
          onChange={(e) => setCvText(e.target.value)}
          className="w-full border p-3 rounded mb-4"
          placeholder="Paste your CV here..."
        />

        <div className="flex gap-4 mb-6">
          <button onClick={analyzeCV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Analyze CV
          </button>
          <button onClick={buildCvFromScratch} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Build CV from Template
          </button>
        </div>

        {feedback && (
          <div className="bg-yellow-100 p-4 rounded shadow mb-6 whitespace-pre-line">
            <h3 className="font-bold mb-2">AI Feedback:</h3>
            {feedback}
          </div>
        )}

        {cvBuilt && (
          <div className="bg-white p-4 rounded shadow whitespace-pre-line">
            <h3 className="font-bold mb-2">Generated CV Template:</h3>
            {cvBuilt}
          </div>
        )}

        <div className="bg-white mt-6 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">🌍 Live Job Listings</h2>
          {jobs.length > 0 ? (
            <ul className="space-y-2">
              {jobs.map((job, index) => (
                <li key={index} className="p-2 border rounded bg-gray-100">
                  <a href={job.redirect_url} target="_blank" rel="noopener noreferrer" className="font-medium text-green-700 hover:underline">
                    {job.title} @ {job.company.display_name}
                  </a>
                  <p className="text-xs text-gray-500">{job.location.display_name}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">Loading jobs...</p>
          )}
        </div>
      </main>
    </div>
  );
}
