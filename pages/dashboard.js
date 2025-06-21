// pages/dashboard.js
import NavBar from "../components/NavBar";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Doughnut } from "react-chartjs-2";
import { pdfjs } from "react-pdf";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import Image from "next/image";

let saveAs;
if (typeof window !== "undefined") {
  import("file-saver").then((module) => {
    saveAs = module.saveAs;
  });
}

ChartJS.register(ArcElement, Tooltip, Legend);
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function Dashboard() {
  const [income, setIncome] = useState(0);
  const [incomeFrequency, setIncomeFrequency] = useState("monthly");
  const [goalAmount, setGoalAmount] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [files, setFiles] = useState([]);
  const [categorized, setCategorized] = useState({});
  const [subcategories, setSubcategories] = useState({});
  const [aiTip, setAiTip] = useState("");
  const [mode, setMode] = useState("Low");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleApply = async () => {
    const allData = [];
    for (let file of files) {
      if (file.type === "text/csv") {
        const text = await file.text();
        const parsed = Papa.parse(text, { header: true });
        allData.push(...parsed.data);
      }
    }
    processTransactions(allData);
  };

  const processTransactions = (data) => {
    const cats = {};
    const subs = {};
    const iconMap = {
      netflix: "🎬",
      amazon: "🛒",
      uber: "🚗",
      spotify: "🎧",
      gym: "🏋️",
      mortgage: "🏠",
      rent: "🏠",
    };

    data.forEach(({ Description = "", Amount = 0 }) => {
      let category = "Other";
      let sub = "Other";
      const desc = Description.toLowerCase();
      const val = Math.abs(parseFloat(Amount));

      if (desc.includes("tesco") || desc.includes("asda")) category = "Groceries";
      else if (desc.includes("uber") || desc.includes("train")) category = "Transport";
      else if (desc.includes("netflix") || desc.includes("spotify")) category = "Entertainment";
      else if (desc.includes("rent") || desc.includes("mortgage")) category = "Housing";
      else if (desc.includes("gym") || desc.includes("fitness")) category = "Health";

      cats[category] = (cats[category] || 0) + val;

      for (let key in iconMap) {
        if (desc.includes(key)) {
          subs[category] = subs[category] || [];
          const prev = subs[category].find((i) => i.name === key);
          if (prev) {
            prev.amount += val;
          } else {
            subs[category].push({ name: key, amount: val, icon: iconMap[key] });
          }
        }
      }
    });

    for (let key in subs) {
      const total = cats[key];
      subs[key] = subs[key].map((item) => ({
        ...item,
        percent: ((item.amount / total) * 100).toFixed(1),
      }));
    }

    setCategorized(cats);
    setSubcategories(subs);

    const tips = [];
    for (const [cat, items] of Object.entries(subs)) {
      items.sort((a, b) => b.amount - a.amount);
      const topThree = items.slice(0, 3);
      topThree.forEach((item) => {
        tips.push(`${item.icon} ${item.name.charAt(0).toUpperCase() + item.name.slice(1)} – £${item.amount.toFixed(2)} (${item.percent}%)`);
      });
    }

    const totalSpend = Object.values(cats).reduce((a, b) => a + b, 0);
    setAiTip(`🔍 Top Spending Areas This Month:\n${tips.join("\n")}\n\nTotal Spend Analyzed: £${totalSpend.toFixed(2)}\n🧠 Tip: Review subscriptions you no longer use.`);
  };

  const chartData = {
    labels: Object.keys(categorized),
    datasets: [
      {
        data: Object.values(categorized),
        backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#FF5722", "#9C27B0", "#607D8B"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <NavBar />
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-6 bg-white shadow p-4 rounded">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Savings Mode:</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full border p-2 rounded">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <label className="block mt-4 font-semibold mb-1">Auto-suggest subscription cancellations</label>
              <input type="checkbox" checked={showSuggestions} onChange={(e) => setShowSuggestions(e.target.checked)} />
            </div>
            <div>
              <label className="block font-semibold mb-1">Income (£):</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full border p-2 rounded"
              />
              <label className="block font-semibold mt-2">Income Frequency:</label>
              <select
                value={incomeFrequency}
                onChange={(e) => setIncomeFrequency(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="weekly">Per Week</option>
                <option value="monthly">Per Month</option>
                <option value="yearly">Per Year</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Goal Amount (£):</label>
              <input
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(Number(e.target.value))}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Deadline:</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="font-semibold block mb-1">Upload Bank Statement(s) (CSV or PDF)</label>
            <input type="file" accept=".csv,.pdf" multiple onChange={(e) => setFiles([...e.target.files])} />
          </div>
          <button
            onClick={handleApply}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Apply
          </button>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-4">📊 Spending Overview</h2>
          <Doughnut data={chartData} />
        </div>

        {Object.keys(subcategories).length > 0 && (
          <div className="bg-gray-100 p-4 rounded-lg shadow mb-4">
            <h3 className="font-semibold mb-2">🔍 Subcategory Breakdown</h3>
            {Object.entries(subcategories).map(([category, items]) => (
              <div key={category} className="mb-3">
                <h4 className="text-sm font-bold text-gray-700 mb-1">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {items.map((item, idx) => (
                    <span key={idx} className="inline-block bg-white border text-sm px-2 py-1 rounded shadow">
                      {item.icon} {item.name} – £{item.amount.toFixed(2)} ({item.percent}%)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {aiTip && (
          <div className="bg-yellow-50 p-4 rounded shadow whitespace-pre-line border-l-4 border-yellow-400">
            <h4 className="font-bold text-yellow-700 mb-2">💡 AI Insight</h4>
            <p className="text-sm text-gray-800">{aiTip}</p>
          </div>
        )}
      </main>
    </div>
  );
}
