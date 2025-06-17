// pages/dashboard.js
import NavBar from "../components/NavBar";
import { useState } from "react";
import Papa from "papaparse";
import { Doughnut } from "react-chartjs-2";
import { AiOutlineRobot, AiOutlineBank } from "react-icons/ai";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { pdfjs } from "react-pdf";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [income, setIncome] = useState(0);
  const [goalAmount, setGoalAmount] = useState(0);
  const [goalDeadline, setGoalDeadline] = useState("");
  const [savingsMode, setSavingsMode] = useState("Low");
  const [files, setFiles] = useState([]);
  const [categorized, setCategorized] = useState({});
  const [aiTips, setAiTips] = useState([]);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState("");

  const handleApply = async () => {
    setError("");

    if (files.length === 0) {
      setError("Please upload at least one bank statement.");
      return;
    }

    let allTransactions = [];

    for (let file of files) {
      if (file.type === "text/csv") {
        const text = await file.text();
        const parsed = Papa.parse(text, { header: true }).data;
        allTransactions = allTransactions.concat(parsed);
      } else if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = async () => {
          const typedarray = new Uint8Array(reader.result);
          const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(" ");
          }
          const lines = text.split("\n").filter(Boolean);
          const parsed = lines.map(line => ({
            Description: line,
            Amount: line.match(/-?\d+(\.\d{2})?/)?.[0] || "0"
          }));
          allTransactions = allTransactions.concat(parsed);
          categorize(allTransactions);
        };
        reader.readAsArrayBuffer(file);
      }
    }

    categorize(allTransactions);
    setStreak(streak + 1);
  };

  const categorize = (transactions) => {
    const cats = {};
    const tips = [];

    transactions.forEach(({ Description = "", Amount = "0" }) => {
      let category = "Other";
      const desc = Description.toLowerCase();
      const val = Math.abs(parseFloat(Amount)) || 0;

      if (desc.includes("tesco") || desc.includes("asda")) category = "Groceries";
      else if (desc.includes("uber") || desc.includes("train")) category = "Transport";
      else if (desc.includes("netflix") || desc.includes("spotify")) category = "Entertainment";
      else if (desc.includes("rent") || desc.includes("mortgage")) category = "Housing";
      else if (desc.includes("gym") || desc.includes("fitness")) category = "Health";

      cats[category] = (cats[category] || 0) + val;
    });

    for (const [cat, amt] of Object.entries(cats)) {
      const ratio = income > 0 ? amt / income : 0;
      const level = ratio > 0.3 ? "🔴 High" : ratio > 0.15 ? "🟠 Medium" : "🟢 Low";
      tips.push(`${level} spend on ${cat} (£${amt.toFixed(2)})`);
    }

    if (savingsMode === "High") tips.push("💡 Suggest cancelling 1–2 subscriptions, cooking meals, reducing luxury spend.");
    else if (savingsMode === "Medium") tips.push("💡 Look at groceries, transport or cheaper utility providers.");
    else tips.push("💡 Consider modest cutbacks or weekend spending reviews.");

    setCategorized(cats);
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

  const monthlyTarget = goalAmount && goalDeadline
    ? (() => {
        const end = new Date(goalDeadline);
        const now = new Date();
        const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
        return months > 0 ? (goalAmount / months).toFixed(2) : 0;
      })()
    : "";

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <NavBar />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm">Savings Mode:</label>
            <select value={savingsMode} onChange={e => setSavingsMode(e.target.value)} className="border rounded w-full p-2">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="text-sm">Income (£)</label>
            <input type="number" value={income} onChange={e => setIncome(+e.target.value)} className="border p-2 rounded w-full" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm">Goal Amount (£)</label>
            <input type="number" value={goalAmount} onChange={e => setGoalAmount(+e.target.value)} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="text-sm">Deadline</label>
            <input type="date" value={goalDeadline} onChange={e => setGoalDeadline(e.target.value)} className="border p-2 rounded w-full" />
          </div>
        </div>

        {monthlyTarget && (
          <p className="text-green-700 mb-4">You need to save: <strong>£{monthlyTarget}</strong> per month</p>
        )}

        <div className="mb-4">
          <label className="block font-medium">Upload Bank Statement(s) (PDF or CSV, up to 3)</label>
          <input type="file" accept=".csv,.pdf" multiple onChange={e => setFiles(Array.from(e.target.files).slice(0, 3))} />
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>

        <button onClick={handleApply} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-6">Apply</button>

        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-bold mb-2">Spending Overview</h2>
          {Object.keys(categorized).length > 0 ? (
            <Doughnut data={doughnutData} />
          ) : (
            <p className="text-gray-500">Upload a statement to view your insights.</p>
          )}
        </div>

        {aiTips.length > 0 && (
          <div className="bg-yellow-50 p-4 rounded shadow mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2"><AiOutlineRobot /> AI Tips</h3>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              {aiTips.map((tip, idx) => <li key={idx}>{tip}</li>)}
            </ul>
          </div>
        )}

        <div className="text-sm text-gray-600 flex items-center gap-2 mt-2">
          <span>🔥 Goal Streak: {streak} day(s)</span>
        </div>

        <div className="bg-blue-50 mt-4 p-4 rounded shadow text-sm flex gap-2 items-center">
          <AiOutlineBank className="text-blue-500" />
          <span><strong>Open Banking Sync</strong> (Coming soon) Toggle will allow real-time data updates.</span>
        </div>
      </main>
    </div>
  );
}
