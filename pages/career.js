// pages/career.js
import NavBar from "../components/NavBar";
import { useState } from "react";

export default function CareerPage() {
  const [cvScore, setCvScore] = useState(85);
  const [aiSuggestions, setAiSuggestions] = useState([
    "Add more action verbs to your experience section.",
    "Include measurable outcomes (e.g., increased sales by 20%).",
    "Tailor your summary to your target role."
  ]);

  const [applications, setApplications] = useState([
    { role: "Marketing Manager", company: "Acme Inc", status: "Applied" },
    { role: "Copywriter", company: "Creative Co", status: "Interview" },
    { role: "Content Strategist", company: "MediaLab", status: "Offer" }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <NavBar />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-green-700">Career & CV Assistant</h1>

        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Your CV Score</h2>
          <p className="text-5xl font-bold text-green-600">{cvScore}%</p>
          <ul className="mt-4 list-disc pl-5 text-sm text-gray-700 space-y-2">
            {aiSuggestions.map((tip, idx) => (
              <li key={idx}>💡 {tip}</li>
            ))}
          </ul>
        </section>

        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Job Applications Tracker</h2>
          <table className="w-full text-sm text-left text-gray-700">
            <thead>
              <tr className="border-b">
                <th className="py-2">Role</th>
                <th className="py-2">Company</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((job, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="py-2">{job.role}</td>
                  <td className="py-2">{job.company}</td>
                  <td className="py-2 font-medium">{job.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
