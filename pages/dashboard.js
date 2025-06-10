// pages/dashboard.js
import NavBar from "../components/NavBar";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Pie, Line, Doughnut } from "react-chartjs-2";
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
  const [darkMode, setDarkMode] = useState(false);

  const rewards = [
    { name: "£5 Coffee Card", cost: 25, icon: "☕" },
    { name: "One-on-One Budget Review", cost: 50, icon: "📊" },
    { name: "Amazon Voucher £10", cost: 100, icon: "🛍️" }
  ];

  const claimReward = (reward) => {
    if (sagePoints >= reward.cost) {
      setClaimedRewards([...claimedRewards, reward.name]);
      setSagePoints(sagePoints - reward.cost);
      setRewardMessage(`🎉 You’ve redeemed: ${reward.name}`);
      setTimeout(() => setRewardMessage(""), 4000);
    } else {
      alert("Not enough Sage Points.");
    }
  };

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

  const savingsOverTime = {
    labels: savings.map((s, i) => `Entry ${i + 1}`),
    datasets: [
      {
        label: "Savings Added",
        data: savings.map((_, i) => (i + 1) * 50),
        fill: false,
        borderColor: "#4CAF50",
        tension: 0.1
      }
    ]
  };

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
    <div className={darkMode ? "dark bg-gray-900 text-white min-h-screen" : "bg-gray-50 text-black min-h-screen transition-all duration-300 ease-in-out"}>
      <NavBar />
      <main className="max-w-5xl mx-auto p-6 font-sans">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">WealthSage Dashboard</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 border rounded text-sm text-white bg-gray-700 hover:bg-gray-600"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <div className="mb-6 text-center bg-gradient-to-br from-green-200 via-white to-green-100 p-6 rounded shadow animate-fade-in">
          <h2 className="text-xl font-semibold">Track your savings, analyze your spending, and earn rewards!</h2>
          <p className="text-sm text-gray-700 italic">“A goal without a plan is just a wish.” – Antoine de Saint-Exupéry</p>
        </div>

        {rewardMessage && (
          <div className="mb-4 p-4 text-center text-green-800 bg-green-100 rounded shadow animate-pulse">
            {rewardMessage}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">🎁 Sage Store</h2>
          <div className="flex gap-4 overflow-x-auto">
            {rewards.map((reward, idx) => (
              <div key={idx} className="p-4 min-w-[200px] bg-white border rounded shadow">
                <div className="text-3xl mb-2">{reward.icon}</div>
                <h3 className="font-bold text-lg">{reward.name}</h3>
                <p className="text-sm">Cost: {reward.cost} Sage Points</p>
                <button
                  className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  onClick={() => claimReward(reward)}
                >
                  Redeem
                </button>
              </div>
            ))}
          </div>
        </div>

        {claimedRewards.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold">🎉 Claimed Rewards</h3>
            <ul className="list-disc ml-5">
              {claimedRewards.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
