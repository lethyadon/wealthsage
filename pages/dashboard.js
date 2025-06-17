// pages/dashboard.js
import NavBar from "../components/NavBar";
import { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { pdfjs } from "react-pdf";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [income, setIncome] = useState(0);
  const [goalAmount, setGoalAmount] = useState(0);
  const [goalDeadline, setGoalDeadline] = useState("");
  const [savingsMode, setSavingsMode] = useState("low");
  const [parsedFiles, setParsedFiles] = useState([]);
  const [categorized, setCategorized] = useState({});
  const [aiTips, setAiTips] = useState([]);
  const [fileName, setFileName] = useState("");
  const [uploadError, setUploadError] = useState(null);
  const [streak, setStreak] = useState(0);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const uploads = [];

    for (const file of files) {
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        const content = await file.text();
        uploads.push({ name: file.name, content });
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const content = await extractPdfText(file);
        uploads.push({ name: file.name, content });
      }
    }

    setParsedFiles(uploads);
    setFileName(files.map((f) => f.name).join(", "));
    setUploadError(null);
  };

  const extractPdfText = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = async () => {
        const typedarray = new Uint8Array(reader.result);
        const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item) => item.str).join(" ");
          fullText += strings + "\n";
        }
        resolve(fullText);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleApply = () => {
    if (parsedFiles.length === 0) {
      setUploadError("Please wait until files are fully loaded.");
      return;
    }

    let allTransactions = [];
    parsedFiles.forEach(({ content }) => {
      const lines = content.split("\n").filter((line) => line.trim());
      const transactions = lines.map((line) => ({
        Description: line,
        Amount: parseFloat(line.match(/-?\d+(\.\d{2})?/)?.[0] || 0),
      }));
      allTransactions = allTransactions.concat(transactions);
    });

    categorizeSpending(allTransactions);
    updateSuggestions(allTransactions);
    setStreak((s) => s + 1);
  };

  const categorizeSpending = (transactions) => {
    const categories = {};
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
    setCategorized(categories);
  };

  const updateSuggestions = (transactions) => {
    let totalRecurring = 0;
    const tips = [];

    transactions.forEach(({ Description = "", Amount = 0 }) => {
      const desc = Description.toLowerCase();
      if (
        desc.includes("netflix") ||
        desc.includes("uber") ||
        desc.includes("deliveroo")
      ) {
        totalRecurring += Math.abs(Amount);
        tips.push(`Recurring payment found: ${Description} (£${Amount})`);
      }
    });

    const multiplier =
      savingsMode === "low" ? 0.25 : savingsMode === "medium" ? 0.5 : 0.75;
    const suggestedSavings = (totalRecurring * multiplier).toFixed(2);
    tips.push(`Suggested monthly savings target: £${suggestedSavings}`);
    setAiTips(tips);
  };

  const doughnutData = {
    labels: Object.keys(categorized),
    datasets: [
      {
        data: Object.values(categorized),
        backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#FF5722", "#9C27B0"],
      },
    ],
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
          <label className="block font-medium">Savings Mode:</label>
          <select value={savingsMode} onChange={(e) => setSavingsMode(e.target.value)} className="border rounded px-2 py-1">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm">Income (£)</label>
            <input type="number" value={income} onChange={(e) => setIncome(parseFloat(e.target.value))} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm">Goal Amount (£)</label>
            <input type="number" value={goalAmount} onChange={(e) => setGoalAmount(parseFloat(e.target.value))} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm">Deadline</label>
            <input type="date" value={goalDeadline} onChange={(e) => setGoalDeadline(e.target.value)} className="border p-2 rounded w-full" />
          </div>
        </div>

        <p className="text-green-700 mb-4">
          You need to save: <strong>£{monthlyTarget}</strong> per month
        </p>

        <div className="mb-6">
          <label className="font-medium">Upload Bank Statement(s) (PDF or CSV, up to 3)</label>
          <input type="file" multiple accept=".csv,.pdf" onChange={handleFileUpload} className="block mt-2" />
          {uploadError && <p className="text-red-600 text-sm">{uploadError}</p>}
          {fileName && <p className="text-sm mt-1">Uploaded: {fileName}</p>}
        </div>

        <button
          onClick={handleApply}
          disabled={parsedFiles.length === 0}
          className={`px-4 py-2 rounded transition mb-6 ${
            parsedFiles.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          Apply
        </button>

        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Spending Overview</h2>
          {Object.keys(categorized).length > 0 ? (
            <Doughnut data={doughnutData} />
          ) : (
            <p className="text-gray-600 text-sm">Upload a statement to view your insights.</p>
          )}
        </div>

        {aiTips.length > 0 && (
          <div className="bg-yellow-100 p-4 rounded shadow mb-6">
            <h3 className="text-lg font-bold mb-2">AI Suggestions</h3>
            <ul className="list-disc ml-6">
              {aiTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-sm text-gray-600">📅 Goal Streak: {streak} day(s)</p>

        <div className="bg-blue-50 border p-3 rounded mt-4 text-sm">
          <strong>🔗 Open Banking Sync</strong> (Coming soon) Toggle will allow real-time data updates.
        </div>
      </main>
    </div>
  );
}
