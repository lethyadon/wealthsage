// pages/career.js
import { useState } from 'react';
import NavBar from '../components/NavBar';
import { pdfjs } from 'react-pdf';
import axios from 'axios';

export default function Career() {
  const [cvFile, setCvFile] = useState(null);
  const [cvText, setCvText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCvUpload = async (e) => {
    const file = e.target.files[0];
    setCvFile(file);
    setLoading(true);
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async function () {
        const typedarray = new Uint8Array(reader.result);
        const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item) => item.str).join(' ');
          text += strings + '\n';
        }
        setCvText(text);
        generateFeedback(text);
        fetchJobSuggestions(text);
      };
      reader.readAsArrayBuffer(file);
    }
    setLoading(false);
  };

  const generateFeedback = (text) => {
    let tips = [];
    if (!text.toLowerCase().includes('team')) tips.push('Mention teamwork experience.');
    if (!text.toLowerCase().includes('communication')) tips.push('Highlight communication skills.');
    if (!text.toLowerCase().includes('sales') && !text.toLowerCase().includes('marketing')) tips.push('Add more relevant industry keywords.');
    setFeedback(tips.length ? tips.join(' ') : 'Strong CV structure detected.');
  };

  const fetchJobSuggestions = async (cvText) => {
    const query = cvText.split(' ').slice(0, 10).join(' ');
    try {
      const response = await axios.get(`https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=ffec525b&app_key=a1d6d5389f23a7ffaaf5c1b7f24333f2&results_per_page=5&what=${encodeURIComponent(query)}`);
      setJobs(response.data.results || []);
    } catch (error) {
      console.error('Job fetch error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <NavBar />
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Career Assistant</h1>

        <div className="mb-4">
          <label className="block font-semibold">Upload Your CV (PDF)</label>
          <input type="file" accept=".pdf" onChange={handleCvUpload} className="mt-2 border p-2 rounded w-full" />
        </div>

        {loading && <p className="text-sm text-blue-600">Analyzing CV...</p>}

        {feedback && (
          <div className="bg-yellow-100 p-4 rounded shadow mb-6">
            <h2 className="font-semibold text-lg mb-2">AI Feedback</h2>
            <p>{feedback}</p>
          </div>
        )}

        {jobs.length > 0 && (
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-bold mb-3">Suggested Jobs</h2>
            <ul className="list-disc ml-5 space-y-2">
              {jobs.map((job, i) => (
                <li key={i}>
                  <a href={job.redirect_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {job.title} - {job.location.display_name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
