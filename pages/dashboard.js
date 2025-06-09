// pages/dashboard.js
import NavBar from "../components/NavBar";
import { useState } from "react";
import Papa from "papaparse";
import { Pie } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [debts, setDebts] = useState([{ name: "", amount: "" }]);
  const [income, setIncome] = useState(0);
  const [targetMonths, setTargetMonths] = useState(12);
  const [savings, setSavings] = useState([]);
  const [tasks, setTasks] = useState([
    "Upload bank statement",
    "Review subscriptions",
    "Set monthly savings goal"
  ]);
  const [fileName, setFileName] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [categorized, setCategorized] = useState({});
  const [aiTips, setAiTips] = useState([]);
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [rewardMessage, setRewardMessage] = useState("");
  const [sagePoints, setSagePoints] = useState(0);
  const [showStore, setShowStore] = useState(false);
  const [claimedRewards, setClaimedRewards] = useState([]);

  const addDebt = () => {
    setDebts([...debts, { name: "", amount: "" }]);
  };

  const updateDebt = (index, field, value) => {
    const newDebts = [...debts];
    newDebts[index][field] = value;
    setDebts(newDebts);
  };

  const addSavings = (note) => {
    setSavings([...savings, note]);
    updateChallengeProgress();
  };

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
          updateChallengeProgress();
        }
      });
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const categorizeSpending = (transactions) => {
    const categories = {};
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

      categories[category] = (categories[category] || 0) + value;
    });

    for (let [cat, amt] of Object.entries(categories)) {
      if (amt > income * 0.2) {
        tips.push(`⚠️ You're spending a lot on ${cat}. Consider trimming this to save more.`);
      }
    }

    setCategorized(categories);
    setAiTips(tips);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Spending Summary", 14, 20);
    const rows = Object.entries(categorized).map(([cat, amt]) => [cat, `£${amt.toFixed(2)}`]);
    autoTable(doc, {
      startY: 30,
      head: [["Category", "Amount"]],
      body: rows
    });
    doc.save("spending_summary.pdf");
  };

  const totalDebt = debts.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
  const monthlyTarget = targetMonths > 0 ? (totalDebt / targetMonths).toFixed(2) : 0;

  const chartData = {
    labels: Object.keys(categorized),
    datasets: [
      {
        label: "Spending by Category",
        data: Object.values(categorized),
        backgroundColor: [
          "#4CAF50",
          "#2196F3",
          "#FFC107",
          "#FF5722",
          "#9C27B0",
          "#795548"
        ]
      }
    ]
  };

  const suggestedBudgets = Object.fromEntries(
    Object.entries(categorized).map(([cat, amt]) => [cat, `£${(amt * 0.9).toFixed(2)}`])
  );

  const updateChallengeProgress = () => {
    const totalSteps = 3;
    let progress = 0;
    if (fileName) progress++;
    if (savings.length > 0) progress++;
    if (Object.keys(categorized).length > 0) progress++;
    const newProgress = (progress / totalSteps) * 100;
    setChallengeProgress(newProgress);
    if (progress === totalSteps) {
      setChallengeComplete(true);
      setStreak(streak + 1);
      setRewardMessage("🔥 Daily Streak Achieved! +10 Sage Points");
      setSagePoints(sagePoints + 10);
    }
  };

  return (
    <>
      <NavBar />
      <main className="max-w-4xl mx-auto p-6 font-sans">
        <div className="text-center py-8 bg-gradient-to-r from-green-100 to-green-50 shadow rounded mb-8">
          <h1 className="text-3xl font-extrabold text-green-900">Welcome to WealthSage</h1>
          <p className="mt-2 text-gray-600">Smarter money habits start here – track, save, and grow.</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-green-800">📊 Your Financial Overview</h2>
          <div className="text-lg text-green-700">🌟 Sage Points: {sagePoints}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="border p-4 rounded bg-white shadow">
            <h3 className="text-xl font-bold mb-2 text-green-700">Where to Grow Your Money</h3>
            <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
              <li>High-Interest Savings Accounts – low risk, flexible access</li>
              <li>Cash ISAs (UK) – tax-free savings growth</li>
              <li>Stocks & Shares ISAs – invest in ETFs or index funds</li>
              <li>Employer Pensions – matched contributions</li>
              <li>Robo-Advisors (e.g. Nutmeg, Moneybox)</li>
              <li>Premium Bonds – safe NS&I lottery-style returns</li>
            </ul>
            <p className="text-xs text-gray-400 mt-2">Always do your own research or consult a financial advisor.</p>
          </div>

          <div className="border p-4 rounded bg-white shadow">
            <h3 className="text-xl font-bold mb-2 text-green-700">💡 Investment Tips</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>Automate your savings on payday</li>
              <li>Track spending monthly and trim low-value subs</li>
              <li>Consider diversified funds over individual stocks</li>
            </ul>
          </div>
        </div>

        {/* Continue rendering existing dashboard features... */}
      </main>
    </>
  );
}
