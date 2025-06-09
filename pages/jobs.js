// pages/jobs.js
import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "../firebase";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [minSalary, setMinSalary] = useState(0);
  const [sortOption, setSortOption] = useState("none");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;
  const [savedJobs, setSavedJobs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [autoApply, setAutoApply] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      const db = getFirestore(app);
      const snapshot = await getDocs(collection(db, "jobs"));
      setJobs(snapshot.docs.map(doc => doc.data()));
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs
    .filter(job => {
      const locationMatch = locationFilter ? job.location?.toLowerCase().includes(locationFilter.toLowerCase()) : true;
      const salaryMatch = (job.salary ?? 0) >= minSalary;
      return locationMatch && salaryMatch;
    })
    .sort((a, b) => {
      if (sortOption === "salary") return (b.salary ?? 0) - (a.salary ?? 0);
      if (sortOption === "rating") return (b.companyRating || 0) - (a.companyRating || 0);
      return 0;
    });

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const saveJob = (job) => {
    if (!savedJobs.includes(job)) setSavedJobs([...savedJobs, job]);
  };

  const applyToJob = (job) => {
    if (autoApply) {
      console.log(`Auto-applying to ${job.title}`);
    }
    alert(`Application sent for: ${job.title}`);
  };

  const toggleAlert = (job) => {
    if (!alerts.includes(job.title)) {
      setAlerts([...alerts, job.title]);
      alert(`Alert set for: ${job.title}`);
    }
  };

  return (
    <>
      <NavBar />
      <main className="max-w-4xl mx-auto p-6 font-sans">
        <h1 className="text-2xl font-bold mb-6 text-green-800">💼 Job Listings</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            className="p-2 border rounded"
            type="text"
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
          <select
            className="p-2 border rounded"
            value={minSalary}
            onChange={(e) => setMinSalary(Number(e.target.value))}
          >
            <option value={0}>Minimum salary</option>
            <option value={20000}>£20,000+</option>
            <option value={25000}>£25,000+</option>
            <option value={30000}>£30,000+</option>
            <option value={35000}>£35,000+</option>
            <option value={50000}>£50,000+</option>
          </select>
          <select
            className="p-2 border rounded"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="none">Sort by...</option>
            <option value="salary">Salary</option>
            <option value="rating">Company Rating</option>
          </select>
        </div>

        <ul className="space-y-4">
          {currentJobs.map((job, i) => (
            <li key={i} className="border p-4 rounded shadow bg-white">
              <h2 className="text-xl font-semibold text-blue-700">{job.title}</h2>
              <p className="text-sm text-gray-600">{job.company} - {job.location}</p>
              <p className="text-sm mt-2">Salary: £{job.salary?.toLocaleString()}</p>
              <p className="text-sm">Company Rating: {job.companyRating ?? "N/A"}</p>
              <p className="text-sm">Match Score: {job.cvMatch ?? "N/A"}</p>
              <p className="mt-2">{job.description}</p>
              <div className="flex gap-3 mt-3 flex-wrap">
                <button onClick={() => applyToJob(job)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Apply Now</button>
                <button onClick={() => saveJob(job)} className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300">Save Job</button>
                <button onClick={() => toggleAlert(job)} className="px-4 py-2 bg-yellow-200 text-black rounded hover:bg-yellow-300">Set Alert</button>
              </div>
            </li>
          ))}
        </ul>

        {filteredJobs.length === 0 && <p className="mt-4 text-gray-500">No jobs match your filters.</p>}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-green-600 text-white" : "bg-white"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
