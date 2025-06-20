// pages/dashboard.js
import NavBar from "../components/NavBar";
import { useState } from "react";
import Papa from "papaparse";
import { Doughnut } from "react-chartjs-2";
import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import Image from "next/image";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [income, setIncome] = useState(0);
  const [goalAmount, setGoalAmount] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [files, setFiles] = useState([]);
  const [categorized, setCategorized] = useState({});
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
          if (++processedCount === files.length) processTransactions(allData);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      if (++processedCount === files.length) processTransactions(allData);
    }
  });
};
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
            .filter(line => /\d{2}\/\d{2}\/\d{2}/.test(line)) // look for date patterns
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
          },
        });
      } else if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = async function () {
          const typedarray = new Uint8Array(reader.result);
          const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item) => item.str).join(" ");
            text += strings + "\n";
          }
          const lines = text.split("\n").filter((line) => line.trim());
         const transactions = lines
  .filter(line => line.match(/\d{2}\/\d{2}\/\d{2}/)) // Filter for lines with dates
  .map(line => {
    const amountMatch = line.match(/-?\d{1,3}(,\d{3})*(\.\d{2})?/g);
    const amount = amountMatch ? amountMatch[amountMatch.length - 1].replace(/,/g, "") : "0";
    return {
      Description: line,
      Amount: amount
    };
  });

          allData.push(...transactions);
          if (++processedCount === files.length) processTransactions(allData);
        };
        reader.readAsArrayBuffer(file);
      } else {
        if (++processedCount === files.length) processTransactions(allData);
      }
    });
  };

  const processTransactions = (data) => {
    const cats = {};
    data.forEach(({ Description = "", Amount = 0 }) => {
      let category = "Other";
      const desc = Description.toLowerCase();
      const val = Math.abs(parseFloat(Amount));

      if (desc.includes("tesco") || desc.includes("asda")) category = "Groceries";
      else if (desc.includes("uber") || desc.includes("train")) category = "Transport";
      else if (desc.includes("netflix") || desc.includes("spotify")) category = "Entertainment";
      else if (desc.includes("rent") || desc.includes("mortgage")) category = "Housing";
      else if (desc.includes("gym") || desc.includes("fitness")) category = "Health";

      cats[category] = (cats[category] || 0) + val;
    });
    setCategorized(cats);
    generateAITips(cats);
    setStreak((prev) => prev + 1);
  };

  const generateAITips = (cats) => {
    let totalUnnecessary = 0;
    let breakdown = [];

    for (let [category, amount] of Object.entries(cats)) {
      if (["Entertainment", "Transport", "Groceries"].includes(category)) {
        totalUnnecessary += amount;
        breakdown.push({ category, amount });
      }
    }

    const modeMap = { Low: 0.3, Medium: 0.5, High: 0.9 };
    const cutPercent = modeMap[mode];
    const savings = totalUnnecessary * cutPercent;

    let tips = `🧠 Estimated monthly savings in ${mode} mode: £${savings.toFixed(2)}\n`;
    breakdown.forEach(({ category, amount }) => {
      const cut = amount * cutPercent;
      tips += `• ${category}: Save £${cut.toFixed(2)} from £${amount.toFixed(2)}\n`;
    });

    if (goalAmount && deadline) {
      const months = getMonthsUntil(deadline);
      const goalMonthly = goalAmount / months;
      tips += `\n🎯 Required monthly savings for your goal: £${goalMonthly.toFixed(2)}\n`;
      tips += savings >= goalMonthly
        ? `✅ You can reach your savings goal with ${mode} mode.`
        : `⚠️ Consider increasing savings or extending your deadline.`;
    }

    setAiTip(tips);
  };

  const getMonthsUntil = (endDateStr) => {
    const end = new Date(endDateStr);
    const now = new Date();
    return (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
  };

  const calculateTarget = () => {
    if (!deadline) return 0;
    const months = getMonthsUntil(deadline);
    if (!goalAmount || months <= 0) return 0;
    return (goalAmount / months).toFixed(2);
  };

  const chartData = {
    labels: Object.keys(categorized),
    datasets: [
      {
        data: Object.values(categorized),
        backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#FF5722", "#9C27B0"],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <NavBar />
      <main className="max-w-4xl mx-auto p-6">
        <Image src="/wealthsagelogo.png" alt="WealthSage Logo" width={200} height={60} className="mb-4" />
        <h1 className="text-3xl font-bold text-green-700 mb-4">Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label>Savings Mode:</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)} className="border p-2 w-full rounded">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <label>Income (£):</label>
            <input type="number" value={income} onChange={(e) => setIncome(+e.target.value)} className="border p-2 w-full rounded" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label>Goal Amount (£):</label>
            <input type="number" value={goalAmount} onChange={(e) => setGoalAmount(+e.target.value)} className="border p-2 w-full rounded" />
          </div>
          <div>
            <label>Deadline:</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="border p-2 w-full rounded" />
          </div>
        </div>

        <p className="mb-4 text-green-700">
          You need to save: <strong>£{calculateTarget()}</strong> per month
        </p>

        <div className="mb-4">
          <label className="font-medium">Upload Bank Statement(s) (CSV or PDF, up to 3)</label>
          <input type="file" accept=".csv,.pdf" multiple onChange={handleFileChange} className="block mt-2" />
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>

        <button onClick={handleApply} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-6">
          Apply
        </button>

        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="font-semibold text-lg mb-2">Spending Overview</h2>
          {Object.keys(categorized).length ? <Doughnut data={chartData} /> : <p className="text-sm text-gray-600">Upload a statement to view your insights.</p>}
        </div>

        {aiTip && (
          <div className="bg-yellow-100 p-4 rounded shadow mb-4 whitespace-pre-line">
            <h3 className="font-bold mb-2">⚡ AI Tips</h3>
            <p>{aiTip}</p>
          </div>
        )}

        <p className="text-sm text-gray-500">🔥 Goal Streak: {streak} day(s)</p>

        <div className="mt-4 text-sm text-blue-800 bg-blue-50 p-3 rounded border">
          🔒 <strong>Open Banking Sync</strong> (Coming soon) Toggle will allow real-time data updates.
        </div>
      </main>
    </div>
  );
}
