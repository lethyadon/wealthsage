// pages/career.js
npm install axios
import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "../firebase";

export default function Career() {
  const [cvScore, setCvScore] = useState(85);
  const [aiTip, setAiTip] = useState("Your CV could benefit from adding role-specific keywords.");
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [uploading, setUploading] = useState(false);

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
    return () => unsub();
  }, []);

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
      const storageRef = ref(storage, `cvs/demoUser-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      console.log("Uploaded CV URL:", url);
      // Simulate AI feedback
      setTimeout(() => {
        setCvScore(92);
        setAiTip("Your CV is well-structured. Consider targeting roles using specific keywords.");
        setUploading(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <NavBar />
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-green-700">Career Centre</h1>

        <section className="bg-white p-4 rounded shadow space-y-3">
          <h2 className="text-xl font-semibold">📄 CV Analysis</h2>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleCVUpload} disabled={uploading} />
          {uploading && <p className="text-sm italic text-gray-500">Uploading...</p>}
          <p className="text-2xl font-bold text-green-600">CV Score: {cvScore}%</p>
          <p className="text-sm italic text-gray-600">{aiTip}</p>
        </section>

        <section className="bg-white p-4 rounded shadow space-y-3">
          <h2 className="text-xl font-semibold">📌 Tracked Applications</h2>
          <ul className="space-y-2">
            {jobs.map((job, idx) => (
              <li key={idx} className="border p-2 rounded flex justify-between items-center">
                <div>
                  <p className="font-medium">{job.role} @ {job.company}</p>
                  <p className="text-xs text-gray-500">Status: {job.status}</p>
                </div>
                <select
                  className="text-sm border p-1 rounded"
                  value={job.status}
                  onChange={(e) => handleStatusChange(idx, e.target.value)}
                >
                  <option>Saved</option>
                  <option>Applied</option>
                  <option>Interview</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                </select>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">⭐ Saved Job Alerts</h2>
          <ul className="space-y-2">
            {savedJobs.length > 0 ? savedJobs.map((job, i) => (
              <li key={i} className="p-2 border rounded bg-gray-100">
                <p className="font-medium">{job.title} @ {job.company}</p>
                <p className="text-xs text-gray-500">{job.location} – {job.source}</p>
              </li>
            )) : <p className="text-sm text-gray-500">No saved jobs yet.</p>}
          </ul>
        </section>
      </main>
    </div>
  );
}
