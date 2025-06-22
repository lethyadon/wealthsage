// pages/dashboard.js
import NavBar from "../components/NavBar";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Doughnut } from "react-chartjs-2";
import { pdfjs, getDocument } from "pdfjs-dist";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const groceryAlternatives = {
  "semi skimmed milk": "Aldi Cowbelle Semi Skimmed (£1.15)",
  "free range eggs": "Lidl Oaklands 6 Pack (£1.29)",
  "cheddar cheese": "Tesco Everyday Value Cheddar (£2.50)"
};

export default function Dashboard() {
  // State
  const [income, setIncome] = useState(0);
  const [incomeFrequency, setIncomeFrequency] = useState("monthly");
  const [savingsMode, setSavingsMode] = useState("Low");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [files, setFiles] = useState([]);
  const [categorized, setCategorized] = useState({});
  const [recurring, setRecurring] = useState([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [weeklyAdvice, setWeeklyAdvice] = useState("");
  const [alert, setAlert] = useState("");
  const [excludedMerchants, setExcludedMerchants] = useState([]);
  const [newExclude, setNewExclude] = useState("");
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState([]);
  const [daysLeft, setDaysLeft] = useState(null);

  const subscriptionKeywords = [
    "netflix", "spotify", "tinder", "prime", "hulu", "disney", "deliveroo", "ubereats"
  ];

  // Deadline countdown
  useEffect(() => {
    if (!deadline) return;
    const today = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    setDaysLeft(diff > 0 ? diff : 0);
  }, [deadline]);

  // File handling
  const handleFiles = (e) => setFiles(Array.from(e.target.files));
  const handleApply = () => processFiles(files);

  // Parse files
  const processFiles = async (fileList) => {
    let transactions = [];
    for (let file of fileList) {
      if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
        const text = await file.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        transactions = transactions.concat(parsed.data);
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const data = await file.arrayBuffer();
        const pdf = await getDocument({ data }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          content.items.map(item => item.str).forEach(line => {
            const m = line.match(/\d+\.\d{2}/);
            if (m) transactions.push({ Description: line, Amount: parseFloat(m[0]) });
          });
        }
      }
    }
    processTransactions(transactions);
  };

  // Analyze transactions
  const processTransactions = (data) => {
    const cats = {};
    const count = {};
    let groceryHints = [];
    data.forEach(({ Description = '', Amount = 0 }) => {
      const desc = Description.toLowerCase();
      if (excludedMerchants.some(ex => desc.includes(ex.toLowerCase()))) return;
      const val = Math.abs(parseFloat(Amount) || 0);
      count[desc] = (count[desc] || 0) + 1;
      let category = 'Other';
      if (/tesco|asda|aldi/.test(desc)) {
        category = 'Groceries';
        Object.keys(groceryAlternatives).forEach(key => {
          if (desc.includes(key)) groceryHints.push(`🛒 ${key} → ${groceryAlternatives[key]}`);
        });
      } else if (/uber|train|taxi/.test(desc)) category = 'Transport';
      else if (subscriptionKeywords.some(k => desc.includes(k))) category = 'Subscriptions';
      else if (/rent|mortgage/.test(desc)) category = 'Housing';
      cats[category] = (cats[category] || 0) + val;
    });
    setCategorized(cats);
    const spend = Object.values(cats).reduce((a, b) => a + b, 0);
    setTotalSpend(spend);
    const rec = Object.entries(count)
      .filter(([d, t]) => t > 1 || subscriptionKeywords.some(k => d.includes(k)))
      .map(([d]) => d);
    setRecurring(rec);

    const top3 = Object.entries(cats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([k, v]) => `${k}: £${v.toFixed(2)}`);
    setWeeklyAdvice(`🔍 Top spend: ${top3.join(', ')}`);

    const monthlyInc =
      incomeFrequency === 'weekly' ? income * 4.33 :
      incomeFrequency === 'yearly' ? income / 12 :
      income;
    const rem = monthlyInc - spend;
    setAlert(rem < 0 ? `⚠️ Overspending by £${Math.abs(rem).toFixed(2)}` : '');

    const recs = [];
    if (cats['Subscriptions']) recs.push(`• Subscriptions (£${cats['Subscriptions'].toFixed(0)}/mo): cancel unused to save £20–£40.`);
    if (rec.filter(r => /tinder/.test(r)).length > 2) recs.push(`• Tinder: free version or pause to save £15–£20.`);
    if (rec.filter(r => /deliveroo|ubereats/.test(r)).length > 2) recs.push('• Food Delivery: cook at home 3x/week to save ~£70/mo.');
    if (cats['Transport']) recs.push(`• Transport (£${cats['Transport'].toFixed(0)}): switch to public transit or walk.`);
    if (cats['Groceries']) recs.push(`• Groceries: try Lidl/Aldi. ${groceryHints[0] || 'Switch to own brands.'}`);
    recs.push(`Reallocate: 4–5% savings | S&P500 ETF 7–10% | Stocks ISA 8–12%.`);
    setRecommendations(recs);

    setHistory(prev => [...prev, { date: new Date().toISOString(), spend, categorized: cats }]);
  };

  const addExclude = () => {
    const m = newExclude.trim();
    if (m && !excludedMerchants.includes(m)) {
      setExcludedMerchants([...excludedMerchants, m]);
      setNewExclude('');
    }
  };

  const pct = (cat) => !goalAmount ? 0 : Math.min(100, (categorized[cat] || 0) / goalAmount * 100).toFixed(1);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />
      <main className="flex-grow max-w-4xl mx-auto p-4 sm:p-6 space-y-6">

        {/* Settings */}
        <section className="bg-white p-4 rounded shadow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Income (£)</label>
            <input type="number" value={income} onChange={e => setIncome(+e.target.value)} className="border p-2 w-full rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Frequency</label>
            <select value={incomeFrequency} onChange={e => setIncomeFrequency(e.target.value)} className="border p-2 w-full rounded">
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Goal Name</label>
            <input type="text" value={goalName} onChange={e => setGoalName(e.target.value)} className="border p-2 w-full rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Goal Amount (£)</label>
            <input type="number" value={goalAmount} onChange={e => setGoalAmount(+e.target.value)} className="border p-2 w-full rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deadline</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="border p-2 w-full rounded" />
          </div>
          <div className="flex items-center mt-4 lg:mt-0">
            <label className="inline-flex items-center">
              <input type="checkbox" checked={showSuggestions} onChange={e => setShowSuggestions(e.target.checked)} className="form-checkbox" />
              <span className="ml-2 text-sm">Auto-suggest cancellations</span>
            </label>
          </div>
        </section>

        {/* Upload */}
        <section className="bg-white p-4 rounded shadow">
          <input type="file" accept=".csv,application/pdf" multiple onChange={handleFiles} className="w-full border p-2 rounded mb-3" />
          <button onClick={handleApply} className="bg-blue-600 text-white px-4 py-2 rounded">Apply</button>
          {daysLeft !== null && <p className="mt-2 text-sm">⏳ {daysLeft} days until goal deadline.</p>}
        </section>

        {/* Main Goal Bubble */}
        <section className="bg-white p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-2">🎯 {goalName || 'Main Goal'}</h2>
          <div className="relative mx-auto w-32 h-32">
            <svg viewBox="0 0 36 36" className="transform -rotate-90 w-full h-full">
              <circle cx="18" cy="18" r="15.9155" stroke="#eee" strokeWidth="4" fill="none" />
              <circle cx="18" cy="18" r="15.9155" stroke="#2196F3" strokeWidth="4" strokeDasharray={`${Math.min(100,((totalSpend/goalAmount)*100).toFixed(1))},100`} fill="none" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
              {goalAmount>0?`${Math.min(100,((totalSpend/goalAmount)*100).toFixed(1))}%`:'0%'}
            </div>
          </div>
          <p className="mt-2">£{totalSpend.toFixed(2)} / £{goalAmount.toFixed(2)}</p>
        </section>

        {/* Category Bubbles */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Category Goals vs Main Goal</n
