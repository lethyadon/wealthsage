// pages/dashboard.js
import NavBar from "../components/NavBar";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Doughnut, Line } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { pdfjs } from "react-pdf";
import { getDocument } from "pdfjs-dist/legacy/build/pdf";
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
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
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const groceryAlternatives = {
  "semi skimmed milk": "Aldi Cowbelle Semi Skimmed (£1.15)",
  "free range eggs": "Lidl Oaklands 6 Pack (£1.29)",
  "cheddar cheese": "Tesco Everyday Value Cheddar (£2.50)"
};

export default function Dashboard() {
  // === State Hooks ===
  const [income, setIncome] = useState(0);
  const [incomeFrequency, setIncomeFrequency] = useState("monthly");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const [files, setFiles] = useState([]);
  const [categorized, setCategorized] = useState({});
  const [subcategories, setSubcategories] = useState({});
  const [recurring, setRecurring] = useState([]);
  const [totalSpend, setTotalSpend] = useState(0);

  const [history, setHistory] = useState([]);
  const [weeklyAdvice, setWeeklyAdvice] = useState("");
  const [alert, setAlert] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [daysLeft, setDaysLeft] = useState(null);

  const [newEntry, setNewEntry] = useState({
    category: "",
    subcategory: "",
    amount: ""
  });
  const [excludedMerchants, setExcludedMerchants] = useState([]);
  const [newExclude, setNewExclude] = useState("");

  const subscriptionKeywords = [
    "netflix","spotify","tinder","prime","hulu","disney","deliveroo","ubereats"
  ];

  // === Effects ===
  // Deadline countdown
  useEffect(() => {
    if (!deadline) return;
    const diff = Math.ceil(
      (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)
    );
    setDaysLeft(diff > 0 ? diff : 0);
  }, [deadline]);

  // === File Input Handlers ===
  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files));
  };
  const handleApply = async () => {
    if (files.length === 0) {
      alert("Please select at least one CSV or PDF file.");
      return;
    }
    await processFiles(files);
  };

  // === CSV & PDF Parsing ===
  async function processFiles(list) {
    let txns = [];
    for (const f of list) {
      // CSV
      if (f.type === "text/csv" || f.name.toLowerCase().endsWith(".csv")) {
        const text = await f.text();
        const { data } = Papa.parse(text, {
          header: true,
          skipEmptyLines: true
        });
        txns.push(...data);
      }
      // PDF
      else if (
        f.type === "application/pdf" ||
        f.name.toLowerCase().endsWith(".pdf")
      ) {
        const buf = await f.arrayBuffer();
        const pdf = await getDocument({ data: buf }).promise;
        let txt = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          txt += content.items.map((item) => item.str).join(" ") + "\n";
        }
        // simple regex: description + amount £xx.xx
        txt.split(/\r?\n/).forEach((line) => {
          const m = line.match(/(.+?)\s+£?(\d+(?:[.,]\d{2}))/);
          if (m) {
            txns.push({
              Description: m[1].trim(),
              Amount: parseFloat(m[2].replace(",", "."))
            });
          }
        });
      }
    }
    analyze(txns);
  }

  // === Manual Entry & Exclusion ===
  const addEntry = (e) => {
    e.preventDefault();
    const { category, subcategory, amount } = newEntry;
    if (!category || !amount) return;
    const val = parseFloat(amount);
    setCategorized((prev) => ({
      ...prev,
      [category]: (prev[category] || 0) + val
    }));
    setSubcategories((prev) => ({
      ...prev,
      [`${category}-${subcategory}`]: (prev[`${category}-${subcategory}`] || 0) + val
    }));
    setNewEntry({ category: "", subcategory: "", amount: "" });
  };

  const addExclude = () => {
    const m = newExclude.trim();
    if (m && !excludedMerchants.includes(m)) {
      setExcludedMerchants((prev) => [...prev, m]);
    }
    setNewExclude("");
  };

  // === Core Analysis ===
  function analyze(data) {
    let cats = {},
      subs = {},
      count = {};
    let groceryHints = [];

    data.forEach(({ Description = "", Amount = 0 }) => {
      const desc = Description.toLowerCase();
      if (excludedMerchants.some((ex) => desc.includes(ex.toLowerCase()))) return;
      const val = Math.abs(parseFloat(Amount) || 0);
      count[desc] = (count[desc] || 0) + 1;

      let cat = "Other";
      if (/tesco|asda|aldi/.test(desc)) {
        cat = "Groceries";
        Object.keys(groceryAlternatives).forEach((k) => {
          if (desc.includes(k))
            groceryHints.push(`🛒 ${k} → ${groceryAlternatives[k]}`);
        });
      } else if (/uber|train|taxi/.test(desc)) cat = "Transport";
      else if (subscriptionKeywords.some((k) => desc.includes(k)))
        cat = "Subscriptions";
      else if (/rent|mortgage/.test(desc)) cat = "Housing";

      cats[cat] = (cats[cat] || 0) + val;
      subs[`${cat}-${desc}`] = (subs[`${cat}-${desc}`] || 0) + val;
    });

    setCategorized(cats);
    setSubcategories(subs);
    const spend = Object.values(cats).reduce((a, b) => a + b, 0);
    setTotalSpend(spend);
    setHistory((prev) => [...prev, { date: new Date().toISOString(), spend }]);

    // recurring
    const recList = Object.entries(count)
      .filter(
        ([d, c]) =>
          c > 1 || subscriptionKeywords.some((k) => d.includes(k))
      )
      .map(([d]) => d);
    setRecurring(recList);

    // top 3
    const top3 = Object.entries(cats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([k, v]) => `${k}: £${v.toFixed(2)}`);
    setWeeklyAdvice(`🔍 Top spend: ${top3.join(", ")}`);

    // overspend
    const monthlyInc =
      incomeFrequency === "weekly"
        ? income * 4.33
        : incomeFrequency === "yearly"
        ? income / 12
        : income;
    const diff = monthlyInc - spend;
    setAlert(diff < 0 ? `⚠️ Overspent £${Math.abs(diff).toFixed(2)}` : "");

    // recos
    let recs = [];
    if (cats["Subscriptions"])
      recs.push(
        `• Subscriptions (£${cats["Subscriptions"].toFixed(0)}): cancel unused to save £20–£40.`
      );
    if (recList.filter((r) => /deliveroo|ubereats/.test(r)).length > 2)
      recs.push("• Limit food delivery to save ~£70/mo.");
    if (cats["Transport"])
      recs.push("• Use public transit or walk to save £30–£50.");
    if (cats["Groceries"])
      recs.push(`• Try cheaper: ${groceryHints[0] || "own-brand products"}`);
    recs.push("• Reallocate savings: high-yield savings, index ETFs, ISA.");
    setRecommendations(recs);
  }

  // === PDF Export ===
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Spending Report", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Category", "Amount"]],
      body: Object.entries(categorized).map(([c, a]) => [
        c,
        `£${a.toFixed(2)}`
      ])
    });
    doc.save("report.pdf");
  };

  // === Helpers ===
  const pct = (cat) =>
    goalAmount
      ? ((categorized[cat] || 0 / goalAmount) * 100).toFixed(1)
      : "0";

  // === Render ===
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />

      <main className="flex-grow max-w-4xl mx-auto p-6 space-y-6">
        {/* Settings */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white p-4 rounded shadow gap-4">
          <div>
            <label className="block text-sm">Income (£)</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(+e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Frequency</label>
            <select
              value={incomeFrequency}
              onChange={(e) => setIncomeFrequency(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Goal Name</label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Goal Amount (£)</label>
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(+e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex items-center mt-2 sm:mt-0">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={showSuggestions}
                onChange={(e) => setShowSuggestions(e.target.checked)}
                className="form-checkbox"
              />
              <span className="ml-2 text-sm">Auto-suggest</span>
            </label>
          </div>
        </section>

        {/* File Upload / Manual Entry */}
        <section className="bg-white p-4 rounded shadow space-y-4">
          <input
            type="file"
            accept=".csv,application/pdf"
            multiple
            onChange={handleFiles}
            className="w-full border p-2 rounded"
          />
          <button
            onClick={handleApply}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Apply
          </button>

          <form onSubmit={addEntry} className="flex gap-2 flex-wrap">
            <input
              placeholder="Category"
              value={newEntry.category}
              onChange={(e) =>
                setNewEntry({ ...newEntry, category: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              placeholder="Subcategory"
              value={newEntry.subcategory}
              onChange={(e) =>
                setNewEntry({ ...newEntry, subcategory: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Amount (£)"
              value={newEntry.amount}
              onChange={(e) =>
                setNewEntry({ ...newEntry, amount: e.target.value })
              }
              className="border p-2 w-24 rounded"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Entry
            </button>
          </form>

          <div className="flex gap-2">
            <input
              placeholder="Exclude Merchant"
              value={newExclude}
              onChange={(e) => setNewExclude(e.target.value)}
              className="border p-2 rounded flex-grow"
            />
            <button
              onClick={addExclude}
              className="bg-gray-700 text-white px-4 py-2 rounded"
            >
              Exclude
            </button>
          </div>

          <button
            onClick={exportPDF}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Export PDF
          </button>

          {daysLeft !== null && (
            <p className="text-sm">⏳ {daysLeft} days until deadline.</p>
          )}
        </section>

        {/* Main Goal Bubble */}
        <section className="bg-white p-4 rounded shadow text-center space-y-2">
          <h2 className="text-lg font-semibold">
            🎯 {goalName || "Main Goal"}
          </h2>
          <div className="relative mx-auto w-32 h-32">
            <svg viewBox="0 0 36 36" className="-rotate-90 w-full h-full">
              <circle
                cx="18"
                cy="18"
                r="15.9155"
                stroke="#eee"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="18"
                cy="18"
                r="15.9155"
                stroke="#2196F3"
                strokeWidth="4"
                strokeDasharray={`${
                  goalAmount ? ((totalSpend / goalAmount) * 100).toFixed(1) : 0
                },100`}
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
              {goalAmount
                ? ((totalSpend / goalAmount) * 100).toFixed(1)
                : "0"}
              %
            </div>
          </div>
          <p>
            £{totalSpend.toFixed(2)} / £{goalAmount.toFixed(2)}
          </p>
        </section>

        {/* Category Progress Bubbles */}
        <section className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Category Progress</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Groceries",
              "Transport",
              "Subscriptions",
              "Housing",
              "Other",
            ].map((cat) => {
              const p = pct(cat);
              return (
                <div key={cat} className="text-center">
                  <p className="font-medium text-sm">{cat}</p>
                  <div className="relative mx-auto w-20 h-20">
                    <svg
                      viewBox="0 0 36 36"
                      className="-rotate-90 w-full h-full"
                    >
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9155"
                        stroke="#eee"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9155"
                        stroke="#4CAF50"
                        strokeWidth="4"
                        strokeDasharray={`${p},100`}
                        fill="none"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                      {p}%
                    </div>
                  </div>
                  <p className="text-xs">
                    £{(categorized[cat] || 0).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Spending Overview & Trend */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow">
