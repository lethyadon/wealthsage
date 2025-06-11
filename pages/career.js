// pages/career.js
import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import app from "../firebase";
import axios from "axios";
import emailjs from "@emailjs/browser";

export default function Career() {
  const [cvScore, setCvScore] = useState(85);
  const [aiTip, setAiTip] = useState("Your CV could benefit from adding role-specific keywords.");
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [liveJobs, setLiveJobs] = useState([]);
  const [filters, setFilters] = useState({ query: "remote", location: "United Kingdom", minSalary: 0 });
  const [cvVersions, setCvVersions] = useState([]);
  const [highlightedMatches, setHighlightedMatches] = useState({});

  useEffect(() => {
    const db = getFirestore(app);
    const ref = doc(db, "users", "demoUser");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setJobs(data.jobs || []);
        setSavedJobs(data.savedJobs || []);
      }
    });
    fetchCVVersions();
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchJobListings = async () => {
      const app_id = "ffec525b";
      const app_key = "a1d6d5389f23a7ffaaf5c1b7f24333f2";
      const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1`;

      try {
        const res = await axios.get(url, {
          params: {
            app_id,
            app_key,
            what: filters.query,
            where: filters.location,
            salary_min: filters.minSalary,
            results_per_page: 10,
            content_type: "application/json",
          },
        });

        const results = res.data.results.map((job) => ({
          title: job.title,
          company: job.company.display_name,
          location: job.location.display_name,
          url: job.redirect_url,
          description: job.description,
        }));

        setLiveJobs(results);
        generateHighlights(results);
        checkForEmailAlerts(results);
      } catch (error) {
        console.error("Job fetch error:", error.message);
      }
    };

    fetchJobListings();
  }, [filters]);

  const fetchCVVersions = async () => {
    const storage = getStorage(app);
    const listRef = ref(storage, "cvs/");
    const res = await listAll(listRef);
    const urls = await Promise.all(res.items.map(item => getDownloadURL(item)));
    setCvVersions(urls);
  };

  const checkForEmailAlerts = (newJobs) => {
    const matched = newJobs.filter(job => filters.query && job.title.toLowerCase().includes(filters.query.toLowerCase()));
    if (matched.length > 0) {
      sendEmailAlert(matched);
    }
  };

  const sendEmailAlert = (jobsMatched) => {
    const templateParams = {
      to_name: "User",
      job_list: jobsMatched.map(j => `${j.title} @ ${j.company}`).join("\n"),
      user_email: "demo@example.com"
    };

    emailjs.send("service_xxx", "template_yyy", templateParams, "user_public_key")
      .then((res) => {
        console.log("📨 Email sent successfully:", res.status);
      })
      .catch((err) => console.error("❌ Failed to send email:", err));
  };

  const generateHighlights = (jobs) => {
    const keywords = ["developer", "budget", "finance", "remote", "manager"];
    const highlightData = {};
    jobs.forEach((job, index) => {
      const matches = keywords.filter(k => job.description.toLowerCase().includes(k));
      if (matches.length > 0) {
        highlightData[index] = matches;
      }
    });
    setHighlightedMatches(highlightData);
  };

  const handleStatusChange = async (index, newStatus) => {
    const updatedJobs = [...jobs];
    updatedJobs[index].status = newStatus;
    setJobs(updatedJobs);
    const db = getFirestore(app);
    const ref = doc(db, "users", "demoUser");
    await setDoc(ref, { jobs: updatedJobs }, { merge: true });
  };

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const storage = getStorage(app);
      const storageRef = ref(storage, `cvs/demoUser-${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      console.log("Uploaded CV URL:", url);
      setTimeout(() => {
        setCvScore(prev => Math.min(100, prev + Math.floor(Math.random() * 8 + 4)));
        setAiTip("Your CV is well-structured. Consider targeting roles using specific keywords.");
        setUploading(false);
        setFilters({ ...filters, query: "developer" });
        fetchCVVersions();
      }, 2000);
    }
  };

  const handleSaveJob = async (job) => {
    const updatedSaved = [...savedJobs, job];
    setSavedJobs(updatedSaved);
    const db = getFirestore(app);
    const ref = doc(db, "users", "demoUser");
    await setDoc(ref, { savedJobs: updatedSaved }, { merge: true });
  };

  const handleApplyJob = async (job) => {
    const newJob = { role: job.title, company: job.company, status: "Applied", appliedAt: new Date().toISOString() };
    const updatedJobs = [...jobs, newJob];
    setJobs(updatedJobs);
    const db = getFirestore(app);
    const ref = doc(db, "users", "demoUser");
    await setDoc(ref, { jobs: updatedJobs }, { merge: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <NavBar />
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-green-700">Career Centre</h1>

        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">📄 Your Uploaded CVs</h2>
          <ul className="list-disc ml-5 space-y-1">
            {cvVersions.map((url, i) => (
              <li key={i} className="text-blue-600 underline">
                <a href={url} target="_blank" rel="noopener noreferrer">CV Version {i + 1}</a>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white p-4 rounded shadow animate-fade-in transition-all duration-500 ease-in-out">
          <h2 className="text-lg font-semibold">🧠 CV Score & Tip</h2>
          <p className="text-green-800 font-bold text-xl animate-pulse">CV Score: {cvScore}%</p>
          <p className="text-sm italic">💡 {aiTip}</p>
        </section>

        <section className="bg-white p-4 rounded shadow space-y-3">
          <h2 className="text-xl font-semibold">🌍 Live Job Listings</h2>
          <ul className="space-y-2">
            {liveJobs.map((job, i) => (
              <li key={i} className="p-3 border rounded bg-gray-100">
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="font-medium text-green-700 hover:underline">
                  {job.title} @ {job.company}
                </a>
                <p className="text-xs text-gray-500">{job.location}</p>
                {highlightedMatches[i] && (
                  <p className="text-sm text-green-700">Matched Keywords: {highlightedMatches[i].join(", ")}</p>
                )}
                <div className="mt-2 space-x-2">
                  <button onClick={() => handleApplyJob(job)} className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Apply Now</button>
                  <button onClick={() => handleSaveJob(job)} className="text-sm px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Save</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">📬 Application Timeline</h2>
          <ul className="list-disc ml-5 space-y-1">
            {jobs.map((job, i) => (
              <li key={i}>
                {job.role} @ {job.company} – <span className="text-green-600">{job.status}</span> <span className="text-xs text-gray-500">({new Date(job.appliedAt).toLocaleDateString()})</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
