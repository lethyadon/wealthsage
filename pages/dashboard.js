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

  const subscriptionKeywords = [
    "netflix","spotify","tinder","prime","hulu","disney","deliveroo","ubereats",
  ];

  useEffect(() => {
    if (!deadline) return;
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    setDaysLeft(diff > 0 ? diff : 0);
  }, [deadline]);

  const handleFiles = (e) => setFiles(Array.from(e.target.files));
  const handleApply = () => processFiles(files);

  async function processFiles(list) {
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
    analyze(txns);
  }

  const addEntry = (e) => {
    e.preventDefault();
    const { category, subcategory, amount } = newEntry;
    if (!category || !amount) return;
    const val = parseFloat(amount);
    setCategorized(prev => ({ ...prev, [category]: (prev[category] || 0) + val }));
    setNewEntry({ category: '', subcategory: '', amount: '' });
  };

  const addExclude = () => {
    if (newExclude && !excluded.includes(newExclude)) {
      setExcluded(prev => [...prev, newExclude]);
    }
    setNewExclude('');
  };

  function analyze(data) {
    const cats = {};
    const count = {};
    data.forEach(({ Description = '', Amount = 0 }) => {
      const desc = Description.toLowerCase();
      if (excluded.some(ex => desc.includes(ex))) return;
      const val = Math.abs(parseFloat(Amount) || 0);
      count[desc] = (count[desc] || 0) + 1;
      let category = 'Other';
      if (/tesco|asda|aldi/.test(desc)) category = 'Groceries';
      else if (/uber|train|taxi/.test(desc)) category = 'Transport';
      else if (subscriptionKeywords.some(k => desc.includes(k))) category = 'Subscriptions';
      else if (/rent|mortgage/.test(desc)) category = 'Housing';
      cats[category] = (cats[category] || 0) + val;
    });
    setCategorized(cats);
    const spend = Object.values(cats).reduce((a, b) => a + b, 0);
    setHistory(prev => [...prev, { date: new Date().toISOString(), spend }]);
    const top3 = Object.entries(cats)
      .sort(([,a],[,b]) => b - a)
      .slice(0,3)
      .map(([k,v]) => `${k}: £${v.toFixed(2)}`);
    setWeeklyAdvice(`Top: ${top3.join(', ')}`);
    const monthlyInc = incomeFrequency==='weekly'?income*4.33:incomeFrequency==='yearly'?income/12:income;
    const diff = monthlyInc - spend;
    setAlert(diff<0?`Overspent £${Math.abs(diff).toFixed(2)}`:'');
    const recs = [];
    if (cats['Subscriptions']) recs.push(`Cancel unused subs: £${cats['Subscriptions'].toFixed(0)}`);
    if (cats['Transport']) recs.push('Use cheaper transport');
    if (cats['Groceries']) recs.push('Plan meals & bulk buy');
    setRecommendations(recs);
  }

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Spending Report', 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [['Category','Amount']],
      body: Object.entries(categorized).map(([c,a]) => [c, `£${a.toFixed(2)}`])
    });
    doc.save('report.pdf');
  };

  const pct = (cat) => goalAmount ? ((categorized[cat] || 0) / goalAmount * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Settings */}
        <section className="grid grid-cols-2 gap-4 bg-white p-4 rounded shadow">
          <input type="number" value={income} onChange={e => setIncome(+e.target.value)} placeholder="Income (£)" className="border p-2 rounded" />
          <select value={incomeFrequency} onChange={e => setIncomeFrequency(e.target.value)} className="border p-2 rounded">
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input type="text" value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="Goal Name" className="border p-2 rounded" />
          <input type="number" value={goalAmount} onChange={e => setGoalAmount(+e.target.value)} placeholder="Goal Amount (£)" className="border p-2 rounded" />
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="border p-2 rounded" />
          <label className="flex items-center space-x-2"><input type="checkbox" checked={showSuggestions} onChange={e => setShowSuggestions(e.target.checked)} /><span>Auto-suggest</span></label>
        </section>
        {/* Upload & Entry */}
        <section className="bg-white p-4 rounded shadow space-y-4">
          <input type="file" multiple accept=".csv,.pdf" onChange={handleFiles} className="w-full border p-2 rounded" />
          <button onClick={handleApply} className="bg-green-600 text-white px-4 py-2 rounded">Apply</button>
          <form onSubmit={addEntry} className="flex gap-2 flex-wrap">
            <input placeholder="Category" value={newEntry.category} onChange={e => setNewEntry({ ...newEntry, category: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Subcategory" value={newEntry.subcategory} onChange={e => setNewEntry({ ...newEntry, subcategory: e.target.value })} className="border p-2 rounded" />
            <input type="number" placeholder="Amount (£)" value={newEntry.amount} onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })} className="border p-2 w-24 rounded" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Entry</button>
          </form>
          <div className="flex gap-2">
            <input placeholder="Exclude Merchant" value={newExclude} onChange={e => setNewExclude(e.target.value)} className="border p-2 rounded flex-grow" />
            <button onClick={addExclude} className="bg-gray-700 text-white px-4 py-2 rounded">Exclude</button>
          </div>
          <button onClick={exportPDF} className="bg-indigo-600 text-white px-4 py-2 rounded">Export PDF</button>
          {daysLeft !== null && <p className="text-sm">⏳ {daysLeft} days left</p>}
        </section>
        {/* Overview */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Spending Overview</h3>
            <Doughnut data={{ labels: Object.keys(categorized), datasets: [{ data: Object.values(categorized), backgroundColor: ['#4CAF50','#2196F3','#FFC107','#FF5722','#9C27B0','#607D8B'] }] }} />
            {alert && <p className="mt-2 text-red-600">{alert}</p>}
            {showSuggestions && <p className="mt-2">{weeklyAdvice}</p>}
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Trend</h3>
            <Line data={{ labels: history.map(h => new Date(h.date).toLocaleDateString()), datasets: [{ label: 'Spend', data: history.map(h => h.spend) }] }} />
          </div>
        </section>
      </main>
    </div>
  );
}
