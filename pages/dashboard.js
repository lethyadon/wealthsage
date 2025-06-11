// pages/dashboard.js
import NavBar from "../components/NavBar";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Doughnut, Line } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  ArcElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [categorized, setCategorized] = useState({});
  const [subcategories, setSubcategories] = useState({});
  const [parsedData, setParsedData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [aiTips, setAiTips] = useState([]);
  const [savings, setSavings] = useState([]);
  const [goal, setGoal] = useState(500);
  const [cvScore, setCvScore] = useState(85);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
      setFileName(file.name);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedData(results.data);
          categorizeSpending(results.data);
        }
      });
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const categorizeSpending = (transactions) => {
    const cats = {};
    const subs = {};
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

      cats[category] = (cats[category] || 0) + value;
      subs[`${category}-${Description}`] = (subs[`${category}-${Description}`] || 0) + value;
    });

    for (let [cat, amt] of Object.entries(cats)) {
      if (amt > 200) tips.push(`⚠️ High spending in ${cat}`);
    }

    setCategorized(cats);
    setSubcategories(subs);
    setAiTips(tips);
  };

  const savingsTotal = savings.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="bg-gray-100 min-h-screen">
      <NavBar />
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-green-700">Welcome Back</h1>

        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">➕ Add a Spending Entry</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              const cat = form.category.value;
              const sub = form.subcategory.value;
              const amt = parseFloat(form.amount.value);
              if (!cat || !amt) return;

              setCategorized((prev) => ({ ...prev, [cat]: (prev[cat] || 0) + amt }));
              setSubcategories((prev) => ({
                ...prev,
                [`${cat}-${sub}`]: (prev[`${cat}-${sub}`] || 0) + amt
              }));
              form.reset();
            }}
            className="flex gap-2 flex-wrap"
          >
            <input name="category" placeholder="Category (e.g. Groceries)" className="p-2 border rounded" />
            <input name="subcategory" placeholder="Subcategory (e.g. Tesco)" className="p-2 border rounded" />
            <input name="amount" type="number" step="0.01" placeholder="Amount (£)" className="p-2 border rounded w-32" />
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add</button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Your Budget Breakdown</h3>
            <Doughnut
              data={{
                labels: Object.keys(categorized),
                datasets: [
                  {
                    label: "Spending by Category",
                    data: Object.values(categorized),
                    backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#FF5722", "#9C27B0", "#795548"]
                  }
                ]
              }}
              options={{
                plugins: { tooltip: { enabled: true }, legend: { display: true } },
                animation: { animateRotate: true, animateScale: true }
              }}
            />
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Subcategory Breakdown</h3>
            <Doughnut
              data={{
                labels: Object.keys(subcategories),
                datasets: [
                  {
                    label: "Subcategory Spending",
                    data: Object.values(subcategories),
                    backgroundColor: ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6"]
                  }
                ]
              }}
              options={{
                plugins: { tooltip: { enabled: true }, legend: { display: true } },
                animation: { animateRotate: true, animateScale: true }
              }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="text-lg font-semibold mb-2">📁 Upload Statement (CSV)</h3>
          <input type="file" accept=".csv" onChange={handleFileUpload} className="p-2 border rounded" />
        </div>

        {aiTips.length > 0 && (
          <div className="bg-yellow-100 p-4 rounded shadow mb-6">
            <h3 className="font-semibold mb-2">💡 AI Suggestions</h3>
            <ul className="list-disc ml-5">
              {aiTips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Savings Goal</h3>
            <p>Goal: £{goal}</p>
            <p>Saved: £{savingsTotal}</p>
            <div className="w-full bg-gray-300 h-4 rounded mt-2">
              <div
                className="bg-green-600 h-4 rounded"
                style={{ width: `${(savingsTotal / goal) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">CV Score</h3>
            <p className="text-green-600 text-2xl font-bold">{cvScore}%</p>
            <p className="text-sm">Consider optimizing your CV keywords for higher job matches.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
