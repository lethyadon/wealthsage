// pages/career.js
import { useState, useEffect } from 'react';
import { AiOutlineRobot } from 'react-icons/ai';
import NavBar from '../components/NavBar';

export default function CareerPage() {
  const [cvFile, setCvFile] = useState(null);
  const [cvScore, setCvScore] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [jobs, setJobs] = useState([]);

  const handleCVUpload = (e) => {
    const file = e.target.files[0];
    setCvFile(file);
    // Simulated CV scoring logic
    setTimeout(() => {
      setCvScore(85);
      setSuggestions([
        '📝 Add quantifiable achievements to work history.',
        '📅 Include most recent role with clear dates.',
        '🔑 Match keywords to job descriptions for better ATS ranking.'
      ]);
    }, 1000);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(
          `https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=ffec525b&app_key=a1d6d5389f23a7ffaaf5c1b7f24333f2&results_per_page=10&what=marketing&content-type=application/json`
        );
        const data = await res.json();
        const listings = data.results.map(job => ({
          title: job.title,
          company: job.company.display_name,
          location: job.location.display_name,
          url: job.redirect_url
        }));
        setJobs(listings);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <NavBar />
      <main className="max-w-5xl mx-auto p-6 space-y-10">
        <h1 className="text-4xl font-bold text-green-700 mb-4">📈 Career Progress Tracker</h1>

        <section className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold">📄 Upload Your CV</h2>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleCVUpload} className="border p-2 rounded w-full" />
          {cvFile && <p className="text-sm text-gray-600">Uploaded: {cvFile.name}</p>}
        </section>

        {cvScore !== null && (
          <section className="bg-white p-6 rounded shadow space-y-4 animate-fade-in">
            <h2 className="text-xl font-semibold flex items-center gap-2">🎯 CV Score: <span className="text-green-600">{cvScore}%</span></h2>
            <div className="bg-yellow-50 p-4 rounded">
              <h3 className="font-bold mb-2 flex items-center gap-1"><AiOutlineRobot /> Suggestions</h3>
              <ul className="list-disc ml-6 text-sm space-y-1">
                {suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold">🌍 Matching Job Listings</h2>
          <ul className="space-y-3">
            {jobs.map((job, i) => (
              <li key={i} className="p-4 border rounded bg-gray-100">
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-green-700 font-medium hover:underline text-lg">
                  {job.title} @ {job.company}
                </a>
                <p className="text-sm text-gray-500">{job.location}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="bg-green-100 p-6 rounded shadow text-center animate-fade-in">
          <h2 className="text-lg font-semibold text-green-900">✅ Keep going! You're one step closer to landing your dream job.</h2>
        </div>
      </main>
    </div>
  );
}
