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

  const totalSpend = Object.values(categorized).reduce((a, b) => a + b, 0);
  const subscriptionKeywords = ["netflix","spotify","tinder","prime","hulu","disney","deliveroo","ubereats"];

  useEffect(() => {
    if (!deadline) return;
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    setDaysLeft(diff > 0 ? diff : 0);
  }, [deadline]);

  const handleFiles = (e) => {
    const arr = Array.from(e.target.files);
    console.log("Files selected:", arr.map(f => f.name));
    setFiles(arr);
  };
  const handleApply = () => processFiles(files);

  async function processFiles(list) {
    console.log("processFiles got:", list);
    let txns = [];
    for (const f of list) {
      if (f.name.toLowerCase().endsWith('.csv')) {
        const text = await f.text();
        const { data } = Papa.parse(text,{ header:true, skipEmptyLines:true });
        txns.push(...data);
      } else if (f.name.toLowerCase().endsWith('.pdf')) {
        const buf = await f.arrayBuffer();
        const pdf = await getDocument({ data:buf }).promise;
        let txt = '';
        for (let i=1;i<=pdf.numPages;i++){ const page = await pdf.getPage(i); const content = await page.getTextContent(); txt += content.items.map(item=>item.str).join(' ')+"\n"; }
        txt.split(/\r?\n/).forEach(line => {
          const m = line.match(/(.+?)\s+(\d+(?:\.\d{2}))/);
          if (m) txns.push({ Description:m[1].trim(), Amount:parseFloat(m[2]) });
        });
      }
    }
    console.log("Raw transactions parsed:", txns);
    analyze(txns);
  }

  const addEntry = e => { e.preventDefault(); const { category,subcategory,amount } = newEntry; if(!category||!amount)return; const val=parseFloat(amount); setCategorized(prev=>({...prev,[category]:(prev[category]||0)+val})); setNewEntry({ category:'',subcategory:'',amount:'' }); };
  const addExclude = () => { if(newExclude&&!excluded.includes(newExclude)) setExcluded(prev=>[...prev,newExclude]); setNewExclude(''); };
  function analyze(data){
    const cats = {};
    data.forEach(({ Description='', Amount=0 })=>{
      const desc = Description.toLowerCase(); if(excluded.some(ex=>desc.includes(ex)))return;
      const val=Math.abs(parseFloat(Amount)||0);
      let cat='Other';
      if(/tesco|asda|aldi/.test(desc))cat='Groceries'; else if(/uber|train|taxi/.test(desc))cat='Transport'; else if(subscriptionKeywords.some(k=>desc.includes(k)))cat='Subscriptions'; else if(/rent|mortgage/.test(desc))cat='Housing';
      cats[cat]=(cats[cat]||0)+val;
    });
    setCategorized(cats); console.log("Categorized:",cats);
    const spend=Object.values(cats).reduce((a,b)=>a+b,0);
    setHistory(prev=>[...prev,{date:new Date().toISOString(),spend}]);
    const top3=Object.entries(cats).sort(([,a],[,b])=>b-a).slice(0,3).map(([k,v])=>`${k}: £${v.toFixed(2)}`);
    setWeeklyAdvice(`Top spend: ${top3.join(', ')}`);
    const mi = incomeFrequency==='weekly'?income*4.33:incomeFrequency==='yearly'?income/12:income;
    const diff = mi-spend; setAlert(diff<0?`Overspent £${Math.abs(diff).toFixed(2)}`:'');
    const recs=[]; if(cats['Subscriptions'])recs.push(`Cancel unused subs: £${cats['Subscriptions'].toFixed(0)}`); if(cats['Transport'])recs.push('Use cheaper transport'); if(cats['Groceries'])recs.push('Plan meals & bulk buy'); setRecommendations(recs);
  }
  const exportPDF = ()=>{ const doc=new jsPDF(); doc.text('Spending Report',14,20); autoTable(doc,{ startY:30, head:[['Category','Amount']], body:Object.entries(categorized).map(([c,a])=>[c,`£${a.toFixed(2)}`]) }); doc.save('report.pdf'); };
  const pct=cat=>goalAmount?((categorized[cat]||0)/goalAmount*100).toFixed(1):'0';

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <section className="grid grid-cols-2 gap-4 bg-white p-4 rounded shadow">
          <div><label className="block font-medium">Net Income (£)</label><input type="number" value={income} onChange={e=>setIncome(+e.target.value)} className="w-full border p-2 rounded"/></div>
          <div><label className="block font-medium">Frequency</label><select value={incomeFrequency} onChange={e=>setIncomeFrequency(e.target.value)} className="w-full border p-2 rounded"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></div>
          <div><label className="block font-medium">Goal Name</label><input value={goalName} onChange={e=>setGoalName(e.target.value)} className="w-full border p-2 rounded"/></div>
          <div><label className="block font-medium">Goal Amount (£)</label><input type="number" value={goalAmount} onChange={e=>setGoalAmount(+e.target.value)} className="w-full border p-2 rounded"/></div>
          <div><label className="block font-medium">Deadline</label><input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} className="w-full border p-2 rounded"/></div>
          <div className="flex items-center"><label className="inline-flex items:center space-x-2"><input type="checkbox" checked={showSuggestions} onChange={e=>setShowSuggestions(e.target.checked)}/><span className="text-sm">Auto-suggest</span></label></div>
        </section>
        <section className="bg-white p-4 rounded shadow space-y-4">
          <div><label className="block font-medium">Upload Bank Statements</label><input type="file" multiple accept=".csv,application/pdf" onChange={handleFiles} className="w-full border p-2 rounded"/></div>
          <p className="italic text-sm text-gray-600">No bank statements? No problem! Manually add savings here.</p>
          <form onSubmit={addEntry} className="grid grid-cols-3 gap-2">
            <div><label className="block font-medium">Category</label><input placeholder="Category" value={newEntry.category} onChange={e=>setNewEntry({...newEntry,category:e.target.value})} className="w-full border p-2 rounded"/></div>
            <div><label className="block font-medium">Subcategory</label><input placeholder="Subcategory" value={newEntry.subcategory} onChange={e=>setNewEntry({...newEntry,subcategory:e.target.value})} className="w-full border p-2 rounded"/></div>
            <div><label className="block font-medium">Amount (£)</label><input type="number" placeholder="Amount" value={newEntry.amount} onChange={e=>setNewEntry({...newEntry,amount:e.target.value})} className="w-full border p-2 rounded"/></div>
            <div className="col-span-3 text-right"><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Entry</button></div>
          </form>
          <div className="grid grid-cols-2 gap-2"><div><label className="block font-medium">Exclude Merchant</label><input placeholder="Keyword" value={newExclude} onChange={e=>setNewExclude(e.target.value)} className="w-full border p-2 rounded"/></div><div className="flex items-end"><button onClick={addExclude} className="w-full bg-gray-700 text-white px-4 py-2 rounded">Exclude</button></div></div>
          <div className="flex gap-2"><button onClick={exportPDF} className="bg-indigo-600 text-white px-4 py-2 rounded">Export PDF</button><button onClick={handleApply} className="bg-green-600 text-white px-4 py-2 rounded">Apply</button></div>
          {daysLeft!==null&&<p className="text-sm">⏳ {daysLeft} days left</p>}
        </section>
        <section className="bg-white p-4 rounded shadow"><h3 className="mb-2 font-semibold">🎯 {goalName||'Main Goal'}</h3><div className="relative mx-auto w-40 h-40"><svg viewBox="0 0 36 36" className="transform -rotate-90 w-full h-full"><circle cx="18" cy="18" r="15.9155" stroke="#eee" strokeWidth="4" fill="none"/><circle cx="18" cy="18" r="15.9155" stroke="#2196F3" strokeWidth="4" strokeDasharray={`${(totalSpend/goalAmount*100).toFixed(1)},100`} fill="none"/></svg><div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">{goalAmount?((totalSpend/goalAmount)*100).toFixed(1):'0'}%</div></div><p className="mt-2 text-center">£{totalSpend.toFixed(2)} / £{goalAmount.toFixed(2)}</p></section>
        <section className="bg-white p-4 rounded shadow"><h3 className="mb-2 font-semibold">Category Goals vs Main Goal</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{['Groceries','Transport','Subscriptions','Housing','Other'].map(cat=>(<div key={cat} className="text-center"><h4 className="mb-1 font-medium text-sm">{cat}</h4><div className="relative mx-auto w-20 h-20"><svg viewBox="0 0 36 36" className="transform -rotate-90 w-full h-full"><circle cx="18" cy="18" r="15.9155" stroke="#eee" strokeWidth="4" fill="none"/><circle cx="18" cy="18" r="15.9155" stroke="#4CAF50" strokeWidth="4" strokeDasharray={`${pct(cat)},100`} fill="none"/></svg><div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{pct(cat)}%</div></div><p className="mt-1 text-xs">£{(categorized[cat]||0).toFixed(2)}</p></div>))}</div></section>
        <section className="bg-white p-4 rounded shadow"><h3 className="mb-2 font-semibold">Recommendations</h3><ul className="list-disc list-inside space-y-2 text-sm">{recommendations.map((rec,i)=><li key={i}>{rec}</li>)}</ul></section>
        <section className="grid md:grid-cols-2 gap-6"><div className="bg-white p-4 rounded shadow"><h3 className="mb-2 font-semibold">Spending Overview</h3><Doughnut data={{labels:Object.keys(categorized),datasets:[{data:Object.values(categorized),backgroundColor:['#4CAF50','#2196F3','#FFC107','#FF5722','#9C27B0','#607D8B']}]} }/>{alert&&<p className="mt-2 text-red-600">{alert}</p>}{showSuggestions&&<p className="mt-2 text-sm">{weeklyAdvice}</p>}</div><div className="bg-white p-4 rounded shadow"><h3 className="mb-2 font-semibold">Trend</h3><Line data={{labels:history.map(h=>new Date(h.date).toLocaleDateString()),datasets:[{label:'Spend',data:history.map(h=>h.spend)}]}}/></div></section>
      </main>
    </div>
  );
}
