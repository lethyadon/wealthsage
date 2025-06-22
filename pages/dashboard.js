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
  // State hooks
  const [income, setIncome] = useState(0);
  const [incomeFrequency, setIncomeFrequency] = useState("monthly");
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
  const [newEntry, setNewEntry] = useState({ category: "", subcategory: "", amount: "" });

  const subscriptionKeywords = ["netflix","spotify","tinder","prime","hulu","disney","deliveroo","ubereats"];

  // Deadline countdown
  useEffect(() => {
    if (!deadline) return;
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    setDaysLeft(diff > 0 ? diff : 0);
  }, [deadline]);

  // Handle file uploads
  const handleFiles = (e) => setFiles(Array.from(e.target.files));

  // Apply parsing
  const handleApply = () => processFiles(files);

  // Parse CSV & PDF
  async function processFiles(list) {
    let txns = [];
    for (const f of list) {
      if (f.type === 'text/csv' || f.name.endsWith('.csv')) {
        const text = await f.text();
        const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
        txns.push(...data);
      } else if (f.type === 'application/pdf' || f.name.endsWith('.pdf')) {
        const buf = await f.arrayBuffer();
        const pdf = await getDocument({ data: buf }).promise;
        let txt = '';
        for (let i=1;i<=pdf.numPages;i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          txt += content.items.map(it=>it.str).join(' ') + '\n';
        }
        txt.split(/\r?\n/).forEach(line => {
          const m = line.match(/(.+?)\s+£?(\d{1,3}(?:[.,]\d{2}))/);
          if (m) txns.push({ Description: m[1].trim(), Amount: parseFloat(m[2].replace(',', '.')) });
        });
      }
    }
    analyze(txns);
  }

  // Manual entry
  const addEntry = (e) => {
    e.preventDefault();
    const { category, subcategory, amount } = newEntry;
    if (!category || !amount) return;
    const val = parseFloat(amount);
    setCategorized(prev => ({ ...prev, [category]: (prev[category]||0) + val }));
    setSubcategories(prev => ({ ...prev, [`${category}-${subcategory}`]: (prev[`${category}-${subcategory}`]||0) + val }));
    setNewEntry({ category: '', subcategory: '', amount: '' });
  };

  // Analyze and update all metrics
  function analyze(data) {
    const cats = {}, subs = {}, count = {};
    let groceryHints = [];
    data.forEach(({ Description = '', Amount = 0 }) => {
      const desc = Description.toLowerCase();
      const val = Math.abs(parseFloat(Amount)||0);
      count[desc] = (count[desc]||0)+1;
      let cat='Other';
      if (/tesco|asda|aldi/.test(desc)) { cat='Groceries';
        Object.keys(groceryAlternatives).forEach(k=>{ if(desc.includes(k)) groceryHints.push(`🛒 ${k}→${groceryAlternatives[k]}`); });
      } else if (/uber|train|taxi/.test(desc)) cat='Transport';
      else if (subscriptionKeywords.some(k=>desc.includes(k))) cat='Subscriptions';
      else if (/rent|mortgage/.test(desc)) cat='Housing';
      cats[cat] = (cats[cat]||0)+val;
      subs[`${cat}-${desc}`] = (subs[`${cat}-${desc}`]||0)+val;
    });
    setCategorized(cats);
    setSubcategories(subs);
    const spend = Object.values(cats).reduce((a,b)=>a+b,0);
    setTotalSpend(spend);
    setHistory(prev=>[...prev,{ date:new Date().toISOString(), spend }]);
    // Recurring and advice
    const recList = Object.entries(count).filter(([d,c])=>c>1||subscriptionKeywords.some(k=>d.includes(k))).map(([d])=>d);
    setRecurring(recList);
    const top3=Object.entries(cats).sort(([,a],[,b])=>b-a).slice(0,3).map(([k,v])=>`${k}:£${v.toFixed(2)}`);
    setWeeklyAdvice(`🔍 Top: ${top3.join(', ')}`);
    const mi = incomeFrequency==='weekly'?income*4.33:incomeFrequency==='yearly'?income/12:income;
    const diff=mi-spend; setAlert(diff<0?`⚠️ Overspent £${Math.abs(diff).toFixed(2)}`:'');
    const recs=[];
    if(cats['Subscriptions']) recs.push(`Subs £${cats['Subscriptions'].toFixed(0)}: cancel unused`);
    if(recList.filter(r=>/deliveroo|ubereats/.test(r)).length>2) recs.push('Limit food delivery');
    if(cats['Transport']) recs.push('Use public transport');
    if(cats['Groceries']) recs.push(`Try alternatives: ${groceryHints[0]||'own-brand'}`);
    recs.push('Reallocate to savings/investments');
    setRecommendations(recs);
  }

  // PDF export
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Spending Report',14,20);
    autoTable(doc,{ startY:30, head:[['Category','Amount']], body: Object.entries(categorized).map(([c,a])=>[c,`£${a.toFixed(2)}`]) });
    doc.save('report.pdf');
  };

  // Progress helper
  const pct = cat => goalAmount?((categorized[cat]||0)/goalAmount*100).toFixed(1):0;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Settings */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 bg-white p-4 rounded shadow gap-4">
          <div><label>Income £</label><input type="number" value={income} onChange={e=>setIncome(+e.target.value)} className="w-full border p-2 rounded"/></div>
          <div><label>Frequency</label><select value={incomeFrequency} onChange={e=>setIncomeFrequency(e.target.value)} className="w-full border p-2 rounded"><option>weekly</option><option>monthly</option><option>yearly</option></select></div>
          <div><label>Goal Name</label><input type="text" value={goalName} onChange={e=>setGoalName(e.target.value)} className="w-full border p_2 rounded"/></div>
          <div><label>Goal Amount</label><input type="number" value={goalAmount} onChange={e=>setGoalAmount(+e.target.value)} className="w-full border p-2 rounded"/></div>
          <div><label>Deadline</label><input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} className="w-full border p-2 rounded"/></div>
          <div className="flex items-center"><label><input type="checkbox" checked={showSuggestions} onChange={e=>setShowSuggestions(e.target.checked)}/><span className="ml-2">Auto-suggest</span></label></div>
        </section>

        {/* Upload & Manual Entry */}
        <section className="bg-white p-4 rounded shadow space-y-4">
          <div><input type="file" accept=".csv,application/pdf" multiple onChange={handleFiles} /></div>
          <button onClick={handleApply} className="bg-green-600 text-white px-4 py-2 rounded">Apply</button>
          <form onSubmit={addEntry} className="flex gap-2">
            <input placeholder="Category" value={newEntry.category} onChange={e=>setNewEntry({...newEntry,category:e.target.value})} />
            <input placeholder="Subcategory" value={newEntry.subcategory} onChange={e=>setNewEntry({...newEntry,subcategory:e.target.value})} />
            <input placeholder="Amount" type="number" value={newEntry.amount} onChange={e=>setNewEntry({...newEntry,amount:e.target.value})} />
            <button type="submit">Add</button>
          </form>
          <button onClick={exportPDF} className="bg-blue-600 text-white px-4 py-2 rounded">Export PDF</button>
          {daysLeft!==null&&<p>⏳ {daysLeft} days until goal</p>}
        </section>

        {/* Main & Category Bubbles */}
        <section className="bg-white p-4 rounded shadow text-center space-y-4">
          <div className="w-32 h-32 mx-auto relative">
            <svg viewBox="0 0 36 36" className="-rotate-90 w-full h-full">
              <circle cx="18" cy="18" r="15.9155" stroke="#eee" strokeWidth="4" fill="none" />
              <circle cx="18" cy="18" r="15.9155" stroke="#2196F3" strokeWidth="4" strokeDasharray={`${goalAmount?((totalSpend/goalAmount)*100).toFixed(1):0},100`} fill="none" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">{goalAmount?((totalSpend/goalAmount)*100).toFixed(1):0}%</div>
          </div>
          <p>£{totalSpend.toFixed(2)}/£{goalAmount.toFixed(2)}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(categorized).map(cat=>(<div key={cat} className="text-center"><p>{cat}</p><p>£{categorized[cat].toFixed(2)}</p><p>{pct(cat)}%</p></div>))}
          </div>
        </section>

        {/* Charts & Recommendations */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h3>Spending Overview</h3>
            <Doughnut data={{ labels:Object.keys(categorized), datasets:[{ data:Object.values(categorized), backgroundColor:['#4CAF50','#2196F3','#FFC107','#FF5722','#9C27B0','#607D8B'] }] }} />
            {alert&&<p className="text-red-600 mt-2">{alert}</p>}
            {showSuggestions&&<p className="mt-2">{weeklyAdvice}</p>}
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3>Trend</h3>
            <Line data={{ labels:history.map(h=>new Date(h.date).toLocaleDateString()), datasets:[{ label:'Total Spend', data:history.map(h=>h.spend) }] }} />
          </div>
        </section>

        <section className="bg-white p-4 rounded shadow">
          <h3>Recommendations</h3>
          <ul>{recommendations.map((r,i)=><li key={i}>{r}</li>)}</ul>
        </section>
      </main>
    </div>
  );
}
