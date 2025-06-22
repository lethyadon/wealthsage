// pages/dashboard.js
import NavBar from "../components/NavBar";
import { useState } from "react";
import Papa from "papaparse";
import { Doughnut } from "react-chartjs-2";
import { pdfjs } from "react-pdf";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function Dashboard() {
  // Income & settings
  const [income, setIncome] = useState(0);
  const [incomeFrequency, setIncomeFrequency] = useState("monthly");
  const [savingsMode, setSavingsMode] = useState("Low");
  const [showSuggestions, setShowSuggestions] = useState(true);

  // File upload & transactions
  const [files, setFiles] = useState([]);
  const [categorized, setCategorized] = useState({});
  const [recurring, setRecurring] = useState([]);

  // Summary metrics
  const [totalSpend, setTotalSpend] = useState(0);
  const [weeklyAdvice, setWeeklyAdvice] = useState("");
  const [alert, setAlert] = useState("");

  // Exclusions & goal
  const [excludedMerchants, setExcludedMerchants] = useState([]);
  const [newExclude, setNewExclude] = useState("");
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState(0);
  const [deadline, setDeadline] = useState("");

  // Recommendations
  const [recommendations, setRecommendations] = useState([]);

  // Auto-detect keywords
  const subscriptionKeywords = [
    "netflix","spotify","tinder","prime","hulu","disney","deliveroo","ubereats"
  ];

  // Handle file input change
  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // Apply button
  const handleApply = () => {
    processFiles(files);
  };

  // Read CSV/PDF
  const processFiles = async (fileList) => {
    let transactions = [];
    for (let file of fileList) {
      if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
        const text = await file.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        transactions = transactions.concat(parsed.data);
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // TODO: integrate PDF parsing here
        console.warn("PDF parsing not yet implemented for", file.name);
      }
    }
    processTransactions(transactions);
  };

  // Categorize and analyze
  const processTransactions = (data) => {
    const cats = {};
    const count = {};

    data.forEach(({ Description = "", Amount = 0 }) => {
      const desc = Description.toLowerCase().trim();
      if (excludedMerchants.some(ex => desc.includes(ex.toLowerCase()))) return;
      const val = Math.abs(parseFloat(Amount) || 0);
      count[desc] = (count[desc] || 0) + 1;

      let category = "Other";
      if (/tesco|asda|aldi/.test(desc)) category = "Groceries";
      else if (/uber|train|taxi/.test(desc)) category = "Transport";
      else if (subscriptionKeywords.some(k => desc.includes(k))) category = "Subscriptions";
      else if (/rent|mortgage/.test(desc)) category = "Housing";

      cats[category] = (cats[category] || 0) + val;
    });

    setCategorized(cats);
    const spend = Object.values(cats).reduce((a, b) => a + b, 0);
    setTotalSpend(spend);

    // Recurring detection
    const recList = Object.entries(count)
      .filter(([d, times]) => times > 1 || subscriptionKeywords.some(k => d.includes(k)))
      .map(([d]) => d);
    setRecurring(recList);

    // AI Insights
    const top3 = Object.entries(cats)
      .sort(([,a],[,b]) => b - a)
      .slice(0, 3)
      .map(([k,v]) => `${k}: £${v.toFixed(2)}`);
    setWeeklyAdvice(`🔍 Top spend: ${top3.join(", ")}.`);

    // Overspend alert
    const monthlyInc =
      incomeFrequency === "weekly" ? income * 4.33 :
      incomeFrequency === "yearly" ? income / 12 :
      income;
    const rem = monthlyInc - spend;
    setAlert(rem < 0 ? `⚠️ Overspending by £${Math.abs(rem).toFixed(2)}` : "");

    // Recommendations
    const recs = [];
    if (cats["Subscriptions"]) {
      recs.push(
        `• Subscriptions (£${cats["Subscriptions"].toFixed(0)}/mo): cancel or downgrade unused services to save £20–£40.`
      );
    }
    if (recList.filter(r => /deliveroo|ubereats/.test(r)).length > 2) {
      recs.push(
        `• Food Delivery: detected multiple orders—cook at home to save ~£70/month.`
      );
    }
    if (cats["Transport"]) {
      recs.push(
        `• Transport (£${cats["Transport"].toFixed(0)}): swap Ubers/trains for public transport or cycling to save £30–£50.`
      );
    }
    if (cats["Groceries"]) {
      recs.push(
        `• Groceries (£${cats["Groceries"].toFixed(0)}): meal planning & bulk buys can save 10–15%.`
      );
    }
    recs.push(`By trimming these, you could free up ~£130/month.`);
    recs.push(
      `Reallocate savings:\n` +
      `– High-Interest Savings Account: 4–5% APY (emergency fund)\n` +
      `– Index Fund (S&P 500 ETF): 7–10% annual growth\n` +
      `– Stocks/ISA: 8–12%+ for long-term growth`
    );

    setRecommendations(recs);
  };

  // Exclude merchants
  const addExclude = () => {
    const m = newExclude.trim();
    if (m && !excludedMerchants.includes(m)) {
      setExcludedMerchants([...excludedMerchants, m]);
      setNewExclude("");
    }
  };

  // Category progress vs. main goal
  const calculatePct = (cat) => {
    if (!goalAmount) return 0;
    return Math.min(100, (categorized[cat] || 0) / goalAmount * 100).toFixed(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />
      <main className="flex-grow max-w-4xl mx-auto p-4 sm:p-6 space-y-6">

        {/* Settings Form */}
        <section className="bg-white p-4 rounded shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Savings Mode:</label>
              <select
                value={savingsMode}
                onChange={e => setSavingsMode(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Income (£):</label>
              <input
                type="number"
                value={income}
                onChange={e => setIncome(+e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Income Frequency:</label>
              <select
                value={incomeFrequency}
                onChange={e => setIncomeFrequency(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="weekly">Per Week</option>
                <option value="monthly">Per Month</option>
                <option value="yearly">Per Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Goal Amount (£):</label>
              <input
                type="number"
                value={goalAmount}
                onChange={e => setGoalAmount(+e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deadline:</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <div className="flex items-center mt-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={showSuggestions}
                  onChange={e => setShowSuggestions(e.target.checked)}
                  className="form-checkbox"
                />
                <span className="ml-2 text-sm">Auto-suggest subscription cancellations</span>
              </label>
            </div>
          </div>
        </section>

        {/* Upload & Apply */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Upload Bank Statements</h2>
          <input
            type="file"
            accept=".csv,application/pdf"
            multiple
            onChange={handleFiles}
            className="w-full border p-2 rounded mb-3"
          />
          <button
            onClick={handleApply}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Apply
          </button>
          {recurring.length > 0 && (
            <div className="mt-3 text-sm">
              <h3 className="font-medium">Detected Recurring Payments:</h3>
              <ul className="list-disc list-inside">
                {recurring.map((r,i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </section>

        {/* Category Goals */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Category Goals vs Main Goal</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Groceries","Transport","Subscriptions","Housing","Other"].map(cat => {
              const pct = calculatePct(cat);
              return (
                <div key={cat} className="text-center">
                  <h4 className="font-semibold text-sm mb-1">{cat}</h4>
                  <div className="relative mx-auto w-20 h-20">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <circle cx="18" cy="18" r="15.9155" stroke="#eee" strokeWidth="4" fill="none" />
                      <circle
                        cx="18" cy="18" r="15.9155"
                        stroke="#4CAF50" strokeWidth="4"
                        strokeDasharray={`${pct},100`}
                        fill="none"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                      {pct}%
                    </div>
                  </div>
                  <p className="mt-1 text-xs">£{(categorized[cat]||0).toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Exclude Merchants */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Exclude Merchants</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newExclude}
              onChange={e => setNewExclude(e.target.value)}
              placeholder="Merchant keyword"
              className="flex-grow border p-2 rounded"
            />
            <button
              onClick={addExclude}
              className="bg-gray-700 text-white px-4 py-2 rounded"
            >
              Add
            </button>
          </div>
          {excludedMerchants.length > 0 && (
            <p className="mt-2 text-sm">Excluding: {excludedMerchants.join(", ")}</p>
          )}
        </section>

        {/* Recommendations */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Recommendations</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            {recommendations.map((rec,i) => (
              <li key={i} className="whitespace-pre-line">{rec}</li>
            ))}
          </ul>
        </section>

        {/* Spending Overview */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Spending Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm">Total Spend</p>
              <p className="text-xl font-bold">£{totalSpend.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm">Remaining Income</p>
              <p className="text-xl font-bold">
                £{(
                  incomeFrequency === "weekly" ? income * 4.33 :
                  incomeFrequency === "yearly" ? income / 12 :
                  income - totalSpend
                ).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Doughnut
              data={{
                labels: Object.keys(categorized),
                datasets: [{
                  data: Object.values(categorized),
                  backgroundColor: ['#4CAF50','#2196F3','#FFC107','#FF5722','#9C27B0','#607D8B']
                }]
              }}
            />
            {alert && <p className="mt-2 text-red-600">{alert}</p>}
            {showSuggestions && <p className="mt-2 text-gray-700">{weeklyAdvice}</p>}
          </div>
        </section>

      </main>
    </div>
  );
}
