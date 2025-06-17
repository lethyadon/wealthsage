// pages/dashboard.js
import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Papa from 'papaparse';
import { Doughnut } from 'react-chartjs-2';
import { pdfjs } from 'react-pdf';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [income, setIncome] = useState(0);
  const [goalAmount, setGoalAmount] = useState(0);
  const [deadline, setDeadline] = useState('');
  const [files, setFiles] = useState([]);
  const [categorized, setCategorized] = useState({});
  const [aiTips, setAiTips] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [streak, setStreak] = useState(0);
  const [savingsMode, setSavingsMode] = useState('medium');
  const [openBankingSync, setOpenBankingSync] = useState(false);

  const calculateMonthlySavings = () => {
    if (!income || !goalAmount || !deadline) return 0;
    const endDate = new Date(deadline);
    const today = new Date();
    const months = (endDate.getFullYear() - today.getFullYear()) * 12 + (endDate.getMonth() - today.getMonth());
    let base = months > 0 ? Math.ceil(goalAmount / months) : goalAmount;
    if (savingsMode === 'low') return Math.ceil(base * 0.8);
    if (savingsMode === 'high') return Math.ceil(base * 1.2);
    return base;
  };

  const categorizeSpending = (transactions) => {
    const categories = {};
    const tips = [];
    const subscriptions = {};
    let totalLoan = 0;
    let estimatedAPR = 0.15;

    transactions.forEach(({ Description = 'Other', Amount = 0 }) => {
      let category = 'Other';
      const desc = Description.toLowerCase();
      const value = Math.abs(parseFloat(Amount));

      if (desc.includes('loan') || desc.includes('credit') || desc.includes('repayment')) {
        totalLoan += value;
      }

      if (desc.includes('tesco') || desc.includes('asda')) category = 'Groceries';
      else if (desc.includes('uber') || desc.includes('train')) category = 'Transport';
      else if (desc.includes('netflix') || desc.includes('spotify')) {
        category = 'Entertainment';
        subscriptions[desc] = (subscriptions[desc] || 0) + value;
      } else if (desc.includes('rent') || desc.includes('mortgage')) category = 'Housing';
      else if (desc.includes('gym') || desc.includes('fitness')) category = 'Health';

      categories[category] = (categories[category] || 0) + value;
    });

    for (let [cat, amt] of Object.entries(categories)) {
      const ratio = income > 0 ? amt / income : 0;
      let severity = '';
      if (ratio > 0.3) severity = '🔴 High';
      else if (ratio > 0.15) severity = '🟠 Medium';
      else severity = '🟢 Low';
      tips.push(`${severity} spend on ${cat} (£${amt.toFixed(2)})`);
    }

    for (let [sub, val] of Object.entries(subscriptions)) {
      tips.push(`⚠️ Recurring subscription detected: ${sub} (£${val.toFixed(2)})`);
    }

    if (totalLoan > 0) {
      const interest = totalLoan * estimatedAPR;
      const totalPayable = totalLoan + interest;
      tips.push(`💸 Total debt detected: £${totalLoan.toFixed(2)} | Estimated total repayment (APR ${estimatedAPR * 100}%): £${totalPayable.toFixed(2)}`);
      tips.push(`📈 Consider aggressive repayment to reduce total interest.`);
    }

    tips.push(`📊 Investment Tip: With £${income}, consider splitting 10% into low-risk index funds for long-term growth.`);
    tips.push(`🏛️ Check if you're eligible for local government debt relief or hardship grants.`);

    setCategorized(categories);
    setAiTips(tips);
  };

  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files).slice(0, 3);
    setFiles(uploadedFiles);
    setUploadError(null);
    let allTransactions = [];

    for (const file of uploadedFiles) {
      if (file.type === 'text/csv') {
        await new Promise((resolve) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              allTransactions = [...allTransactions, ...results.data];
              resolve();
            }
          });
        });
      } else if (file.type === 'application/pdf') {
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onload = async function () {
            const typedarray = new Uint8Array(reader.result);
            const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              const strings = content.items.map(item => item.str).join(' ');
              text += strings + '\n';
            }
            const lines = text.split('\n').filter(line => line.trim());
            const transactions = lines.map(line => ({
              Description: line,
              Amount: line.match(/-?\d+(\.\d{2})?/)?.[0] || '0'
            }));
            allTransactions = [...allTransactions, ...transactions];
            resolve();
          };
          reader.readAsArrayBuffer(file);
        });
      } else {
        setUploadError('Only CSV and PDF files are supported.');
      }
    }

    if (allTransactions.length > 0) {
      categorizeSpending(allTransactions);
      setStreak((prev) => prev + 1);
    }
  };

  const doughnutData = {
    labels: Object.keys(categorized),
    datasets: [
      {
        data: Object.values(categorized),
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0']
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <NavBar />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-6">Dashboard</h1>

        <div className="mb-4">
          <label className="block font-semibold">Savings Mode:</label>
          <select value={savingsMode} onChange={(e) => setSavingsMode(e.target.value)} className="border rounded p-2 mt-1">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Income (£)</label>
            <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Goal Amount (£)</label>
            <input type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Deadline</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
        </div>

        <p className="text-green-700 font-semibold mb-4">
          You need to save: <span className="font-bold">£{calculateMonthlySavings()}</span> per month
        </p>

        <div className="mb-6">
          <label className="block mb-2 font-medium">📎 Upload Bank Statement(s) (PDF or CSV, up to 3)</label>
          <input type="file" accept=".pdf,.csv" onChange={handleFileUpload} multiple className="border rounded px-3 py-2 w-full" />
          {uploadError && <p className="text-red-600 text-sm mt-2">{uploadError}</p>}
        </div>

        <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded mb-6">Apply</button>

        <div className="bg-white p-6 shadow rounded text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Spending Overview</h2>
          {Object.keys(categorized).length ? <Doughnut data={doughnutData} /> : <p className="text-gray-500">Upload a statement to view your insights.</p>}
        </div>

        {aiTips.length > 0 && (
          <div className="bg-yellow-100 p-4 rounded shadow mt-6">
            <h3 className="text-lg font-bold mb-2">AI Suggestions</h3>
            <ul className="list-disc ml-5">
              {aiTips.map((tip, idx) => <li key={idx}>{tip}</li>)}
            </ul>
          </div>
        )}

        <div className="text-sm text-gray-600 mt-6">📅 Goal Streak: {streak} day(s)</div>

        <div className="mt-8 p-4 border rounded bg-blue-50">
          <h4 className="font-semibold text-blue-700">🔗 Open Banking Sync</h4>
          <p className="text-sm">(Coming soon) Toggle will allow real-time data updates.</p>
        </div>
      </main>
    </div>
  );
}
