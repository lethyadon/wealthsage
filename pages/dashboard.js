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

  const totalSpend = Object.values(categorized).reduce((a, b) => a + b, 0);
  const remaining = income - totalSpend;
  const progress = goalAmount > 0 ? ((income - remaining) / goalAmount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <NavBar />
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">📊 Dashboard Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h4 className="text-sm font-semibold">Total Spend</h4>
            <p className="text-lg font-bold text-red-600">£{totalSpend.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h4 className="text-sm font-semibold">Remaining Income</h4>
            <p className="text-lg font-bold text-green-600">£{remaining.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h4 className="text-sm font-semibold">Goal Progress</h4>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
              <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${progress.toFixed(1)}%` }}></div>
            </div>
            <p className="text-xs mt-1 text-gray-600">{progress.toFixed(1)}%</p>
          </div>
        </div>

        {/* Keep existing components: chart, subcategories, tips, etc. */}
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
