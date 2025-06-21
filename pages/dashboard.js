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
import dynamic from "next/dynamic";

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
  const [streak, setStreak] = useState(0);
  const [mode, setMode] = useState("Low");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleApply = () => {
    if (!files.length) return setError("Please upload at least one bank statement.");
    setError("");

    let allData = [];
    let processedCount = 0;

    files.forEach((file) => {
      if (file.type === "text/csv") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: ({ data }) => {
            allData.push(...data);
            if (++processedCount === files.length) processTransactions(allData);
          },
        });
      } else if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = async function () {
          try {
            const typedarray = new Uint8Array(reader.result);
            const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              const strings = content.items.map((item) => item.str).join(" ");
              text += strings + "\n";
            }

            const lines = text.split("\n").filter(line => line.trim());

            const transactions = lines
              .filter(line => /\d{2}\/\d{2}\/\d{2}/.test(line))
              .map(line => {
                const amountMatch = line.match(/-?\d{1,3}(,\d{3})*(\.\d{2})?/g);
                const amount = amountMatch ? amountMatch.pop().replace(/,/g, "") : "0";
                return {
                  Description: line,
                  Amount: amount
                };
              });

            allData.push(...transactions);
            if (++processedCount === files.length) processTransactions(allData);
          } catch (err) {
            console.error("PDF parsing error:", err);
            setError("Something went wrong parsing the PDF.");
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        if (++processedCount === files.length) processTransactions(allData);
      }
    });
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

    // AI Tip Generation
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
        <h2 className="text-2xl font-bold mb-4">📊 Spending Overview</h2>
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
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

        <div className="my-4">
          <label className="block font-medium">Upload Bank Statement (CSV or PDF)</label>
          <input type="file" accept=".csv,.pdf" multiple onChange={handleFileChange} />
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        <button onClick={handleApply} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded">
          Apply
        </button>
      </main>
    </div>
  );
}
