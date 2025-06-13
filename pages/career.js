// pages/career.js
import { useState } from 'react';
import { AiOutlineRobot } from 'react-icons/ai';
import NavBar from '../components/NavBar';

export default function CareerPage() {
  const [cvFile, setCvFile] = useState(null);
  const [cvScore, setCvScore] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [jobs, setJobs] = useState([
    {
      title: 'Marketing Coordinator',
      company: 'Acme Co.',
      location: 'Remote',
      url: '#'
    },
    {
      title: 'Customer Success Manager',
      company: 'Brightpath',
      location: 'London',
      url: '#'
    },
    {
      title: 'Junior Account Executive',
      company: 'Loop Ltd.',
      location: 'Birmingham',
      url: '#'
    }
  ]);

  const handleCVUpload = (e) => {
    const file = e.target.files[0];
    setCvFile(file);
    // Simulated scoring
    setTimeout(() => {
      setCvScore(78);
      setSuggestions([
        '📝 Add quantifiable achievements to work history.',
        '📅 Include most recent role with clear dates.',
        '🔑 Match keywords to job descriptions for better ATS ranking.'
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <NavBar />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Career Helper</h1>

        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold">📄 Upload Your CV</h2>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleCVUpload} className="border p-2 rounded w-full" />
          {cvFile && <p className="text-sm text-gray-600">Uploaded: {cvFile.name}</p>}
        </div>

        {cvScore !== null && (
          <div className="bg-white p-6 rounded shadow space-y-4 animate-fade-in">
            <h2 className="text-xl font-semibold flex items-center gap-2">🎯 CV Score: <span className="text-green-600">{cvScore}%</span></h2>
            <div className="bg-yellow-50 p-4 rounded">
              <h3 className="font-bold mb-2 flex items-center gap-1"><AiOutlineRobot /> Suggestions</h3>
              <ul className="list-disc ml-6 text-sm">
                {suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold">🌍 Matching Job Listings</h2>
          <ul className="space-y-3">
            {jobs.map((job, i) => (
              <li key={i} className="p-4 border rounded bg-gray-100">
                <a href={job.url} className="text-green-700 font-medium hover:underline text-lg">
                  {job.title} @ {job.company}
                </a>
                <p className="text-sm text-gray-500">{job.location}</p>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
