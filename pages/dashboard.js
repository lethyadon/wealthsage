// pages/dashboard.js
import NavBar from "../components/NavBar";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Doughnut } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { pdfjs } from "react-pdf";
import { AiOutlineRobot } from "react-icons/ai";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [income, setIncome] = useState(0);
  const [goalAmount, setGoalAmount] = useState(0);
  const [goalDeadline, setGoalDeadline] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [categorized, setCategorized] = useState({});
  const [aiTips, setAiTips] = useState([]);
  const [fileName, setFileName] = useState("");
  const [uploadError, setUploadError] = useState(null);
  const [streak, setStreak] = useState(0);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedData(results.data);
          categorizeSpending(results.data);
          setStreak(prev => prev + 1);
        }
      });
      setUploadError(null);
    } else {
      setUploadError("Only CSV files are supported for now.");
    }
  };

  const categorizeSpending = (transactions) => {
    const categories = {};
    const tips = [];
    transactions.forEach(({ Description = "Other", Amount = 0 }) => {
      let category = "Other";
      const desc = Description.toLowerCase();
      const value = Math.abs(parseFloat(Amount));
      if (desc.includes("tesco") || desc.includes("asda")) category = "Groceries";
      else if (desc.includes("uber") || desc.includes("train")) category = "Transport";
      else if (desc.includes("netflix") || desc.includes("spotify")) category = "Entertainment";
      else if (desc.includes("rent") || desc.includes("mortgage")) category = "Housing";
      else if (desc.includes("gym") || desc.includes("fitness")) category = "Health";
      categories[category] = (categories[category] || 0) + value;
    });
    for (let [cat, amt] of Object.entries(categories)) {
      if (amt > income * 0.2) {
        tips.push(`⚠️ High spend on ${cat}`);
      }
    }
    setCategorized(categories);
    setAiTips(tips);
  };

  const doughnutData = {
    labels: Object.keys(categorized),
    datasets: [
      {
        data: Object.values(categorized),
        backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#FF5722", "#9C27B0"]
      }
    ]
  };

  const monthlyTarget = goalAmount && goalDeadline ? (() => {
    const end = new Date(goalDeadline);
    const now = new Date();
    const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
    return months > 0 ? (goalAmount / months).toFixed(2) : 0;
  })() : 0;

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <NavBar />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Dashboard</h1>

        <div className="mb-4">
          <label className="block text-sm">Income (£)</label>
          <input type="number" value={income} onChange={e => setIncome(parseFloat(e.target.value))} className="border p-2 rounded w-full" />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm">Goal Amount (£)</label>
            <input type="number" value={goalAmount} onChange={e => setGoalAmount(parseFloat(e.target.value))} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm">Deadline</label>
            <input type="date" value={goalDeadline} onChange={e => setGoalDeadline(e.target.value)} className="border p-2 rounded w-full" />
          </div>
        </div>

        <p className="text-green-700 mb-4">You need to save: <strong>£{monthlyTarget}</strong> per month</p>

        <div className="mb-6">
          <input type="file" accept=".csv" onChange={handleCSVUpload} className="mb-2" />
          {uploadError && <p className="text-red-600 text-sm">{uploadError}</p>}
          {fileName && <p className="text-sm">Uploaded: {fileName}</p>}
        </div>

        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Spending Overview</h2>
          <Doughnut data={doughnutData} />
        </div>

        {aiTips.length > 0 && (
          <div className="bg-yellow-100 p-4 rounded shadow mb-6">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><AiOutlineRobot /> AI Suggestions</h3>
            <ul className="list-disc ml-6">
              {aiTips.map((tip, idx) => <li key={idx}>{tip}</li>)}
            </ul>
          </div>
        )}

        <div className="text-sm text-gray-600">📅 Goal Streak: {streak} days in a row</div>
      </main>
    </div>
  );
}
