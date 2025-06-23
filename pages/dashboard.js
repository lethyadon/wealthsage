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

export default function Dashboard() {
  // State
  const [income, setIncome] = useState(0);
  const [incomeFrequency, setIncomeFrequency] = useState("monthly");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [files, setFiles] = useState([]);
  const [categorized, setCategorized] = useState({});
  const [history, setHistory] = useState([]);
  const [weeklyAdvice, setWeeklyAdvice] = useState("");
  const [alert, setAlert] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [daysLeft, setDaysLeft] = useState(null);
  const [newEntry, setNewEntry] = useState({ category: "", subcategory: "", amount: "" });
  const [excluded, setExcluded] = useState([]);
  const [newExclude, setNewExclude] = useState("");

  // total spend calculation
  const totalSpend = Object.values(categorized).reduce((a, b) => a + b, 0);

  const subscriptionKeywords = [
    "netflix", "spotify", "tinder", "prime", "hulu", "disney", "deliveroo", "ubereats",
  ];

  // Deadline countdown
  useEffect(() => {
    if (!deadline) return;
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    setDaysLeft(diff > 0 ? diff : 0);
  }, [deadline]);

  // File handlers
  const handleFiles = (e) => {
    const arr = Array.from(e.target.files);
    console.log("Files selected:", arr.map(f => f.name));
    setFiles(arr);
  };
  const handleApply = () => processFiles(files);

  // Process files and log
  async function processFiles(list) {
    console.log("processFiles got:", list);
    let txns = [];
    for (const f of list) {
      if (f.name.toLowerCase().endsWith('.csv')) {
        const text = await f.text();
        const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
        txns.push(...data);
      } else if (f.name.toLowerCase().endsWith('.pdf')) {
        const buf = await f.arrayBuffer();
        const pdf = await getDocument({ data: buf }).promise;
        let txt = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          txt += content.items.map(item => item.str).join(' ') + '\n';
        }
        txt.split(/\r?\n/).forEach(line => {
          const m = line.match(/(.+?)\s+(\d+(?:\.\d{2}))/);
          if (m) txns.push({ Description: m[1].trim(), Amount: parseFloat(m[2]) });
        });
      }
    }
    console.log("Raw transactions parsed:", txns);
    analyze(txns);
  }

  // Manual entry handler
  const addEntry = (e) => {
    e.preventDefault();
    const { category, subcategory, amount } = newEntry;
    if (!category || !amount) return;
    const val = parseFloat(amount);
    setCategorized(prev => ({ ...prev, [category]: (prev[category] || 0) + val }));
    setNewEntry({ category: '', subcategory: '', amount: '' });
  };

  // Exclude merchant
  const addExclude = () => {
    if (newExclude && !excluded.includes(newExclude)) {
      setExcluded(prev => [...prev, newExclude]);
    }
    setNewExclude('');
  };

  // Analysis
  function analyze(data) {
    const cats = {};
    data.forEach(({ Description = '', Amount = 0 }) => {
      const desc = Description.toLowerCase();
      if (excluded.some(ex => desc.includes(ex))) return;
      const val = Math.abs(parseFloat(Amount) || 0);
      let cat = 'Other';
      if (/tesco|asda|aldi/.test(desc)) cat = 'Groceries';
      else if (/uber|train|taxi/.test(desc)) cat = 'Transport';
      else if (subscriptionKeywords.some(k => desc.includes(k))) cat = 'Subscriptions';
      else if (/rent|mortgage/.test(desc)) cat = 'Housing';
      cats[cat] = (cats[cat] || 0) + val;
    });
    setCategorized(cats);
    console.log("Categorized:", cats);
    const spend = Object.values(cats).reduce((a, b) => a + b, 0);
    setHistory(prev => [...prev, { date: new Date().toISOString(), spend }]);
    const top3 = Object.entries(cats).sort(([, a], [, b]) => b - a).slice(0, 3)
      .map(([k, v]) => `${k}: £${v.toFixed(2)}`);
    setWeeklyAdvice(`Top spend: ${top3.join(', ')}`);
    const mi = incomeFrequency === 'weekly' ? income * 4.33 :
               incomeFrequency === 'yearly' ? income / 12 : income;
    const diff = mi - spend;
    setAlert(diff < 0 ? `Overspent £${Math.abs(diff).toFixed(2)}` : '');
    const recs = [];
    if (cats['Subscriptions']) recs.push(`Cancel unused subs: £${cats['Subscriptions'].toFixed(0)}`);
    if (cats['Transport']) recs.push('Use cheaper transport');
    if (cats['Groceries']) recs.push('Plan meals & bulk buy');
    setRecommendations(recs);
  }

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Spending Report', 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [['Category', 'Amount']],
      body: Object.entries(categorized).map(([c, a]) => [c, `£${a.toFixed(2)}`])
    });
    doc.save('report.pdf');
  };

  // Percentage helper
  const pct = (cat) => goalAmount ? ((categorized[cat] || 0) / goalAmount * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Settings */}
        <section className="grid grid-cols-2 gap-4 bg-white p-4 rounded shadow">
          <div>
            <label className="block font-medium">Net Income (£)</label>
            <input type="number" value={income} onChange={e => setIncome(+e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium">Frequency</label>
            <select value={incomeFrequency} onChange={e => setIncomeFrequency(e.target.value)} className="w-full border p-2 rounded">
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block font-medium">Goal Name</label>
            <input type="text" value={goalName} onChange={e => setGoalName(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium">Goal Amount (£)</label>
            <input type="number" value={goalAmount} onChange={e => setGoalAmount(+e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium">Deadline</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center space-x-2">
              <input type="checkbox" checked={showSuggestions} onChange={e => setShowSuggestions(e.target.checked)} />
              <span className="text-sm">Auto-suggest</span>
            </label>
          </div>
        </section>

        {/* Upload & Manual Entry */}
        <section className="bg-white p-4 rounded shadow space-y-4">
          <div>
            <label className="block font-medium">Upload Bank Statements</label>
            <input type="file" multiple accept=".csv,application/pdf" onChange={handleFiles} className="w-full border p-2 rounded" />
          </div>
          <p className="italic text-sm text-gray-600">No bank statements? No problem! Manually add savings here.</p>
          <form onSubmit={addEntry} className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-medium">Category</label>
              <input placeholder="Category" value={newEntry.category} onChange={e => setNewEntry({...newEntry,category: e.target.value})} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block font-medium">Subcategory</label>
              <input placeholder="Subcategory" value={newEntry.subcategory} onChange={e => setNewEntry({...newEntry,subcategory: e.target.value})} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="
