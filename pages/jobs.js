// pages/jobs.js
import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch("https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=ffec525b&app_key=a1d6d5389f23a7ffaaf5c1b7f24333f2&results_per_page=10&what=finance&content-type=application/json")
      .then(res => res.json())
      .then(data => {
        if (data.results) setJobs(data.results);
      });
  }, []);

  return (
    <>
      <NavBar />
      <main className="max-w-4xl mx-auto p-6 font-sans">
        <h1 className="text-2xl font-bold mb-4 text-green-800">📌 Job Listings</h1>
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="p-4 border rounded shadow">
              <h2 className="text-lg font-semibold text-green-700">{job.title}</h2>
              <p>{job.description?.substring(0, 150)}...</p>
              <p className="text-sm text-gray-600">Location: {job.location.display_name}</p>
              <a href={job.redirect_url} className="text-blue-600 underline" target="_blank">View Job</a>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
