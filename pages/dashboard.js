// pages/dashboard.js
import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import app from "../firebase";
import { Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

export default function Dashboard() {
  const [categories, setCategories] = useState({});
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState([]);
  const [monthlyGoal, setMonthlyGoal] = useState(500);
  const [savedAmount, setSavedAmount] = useState(300);
  const [cvScore, setCvScore] = useState(85);
  const [aiTip, setAiTip] = useState("Consider optimizing your CV keywords for higher job matches.");

  useEffect(() => {
    const db = getFirestore(app);
    const ref = doc(db, "users", "demoUser");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCategories(data.categories || {});
        setHistory(data.history || []);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const totalSpending = Object.values(categories).reduce(
      (sum, cat) => sum + (cat.total || 0),
      0
    );
    setTotal(totalSpending);
  }, [categories]);

  const handleEdit = async (catName, subName, newVal) => {
    const updated = { ...categories };
    updated[catName].subcategories[subName] = Number(newVal);
    updated[catName].total = Object.values(updated[catName].subcategories).reduce((sum, val) => sum + val, 0);
    setCategories(updated);
    const db = getFirestore(app);
    const ref = doc(db, "users", "demoUser");
    await setDoc(ref, { categories: updated }, { merge: true });
  };

  const categoryData = {
    labels: Object.keys(categories),
    datasets: [
      {
        label: "Spending by Category",
        data: Object.values(categories).map(cat => cat.total),
        backgroundColor: ["#4ade80", "#facc15", "#60a5fa", "#f87171", "#c084fc"],
        hoverOffset: 10,
      }
    ]
  };

  const chartOptions = {
    plugins: {
      tooltip: { enabled: true },
      legend: {
        display: true,
        position: "bottom",
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  const lineChartData = {
    labels: history.map(h => h.month),
    datasets: [
      {
        label: 'Total Spending Over Time',
        data: history.map(h => h.total),
        fill: false,
        borderColor: '#4ade80',
        tension: 0.1
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <NavBar />
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-green-700">Welcome Back</h1>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="italic text-sm text-gray-600">“A goal without a plan is just a wish.” – Antoine de Saint-Exupéry</p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Your Budget Breakdown</h2>
            <Doughnut data={categoryData} options={chartOptions} />
            <p className="text-center text-sm mt-4">Total: £{total.toLocaleString()}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Subcategory Breakdown</h2>
            <ul className="text-sm space-y-4">
              {Object.entries(categories).map(([name, cat]) => {
                const subData = {
                  labels: Object.keys(cat.subcategories || {}),
                  datasets: [
                    {
                      label: `${name} Subcategories`,
                      data: Object.values(cat.subcategories || {}),
                      backgroundColor: ["#86efac", "#fde68a", "#93c5fd", "#fca5a5", "#d8b4fe"],
                      hoverOffset: 8,
                    }
                  ]
                };

                return (
                  <li key={name} className="border-b pb-3">
                    <span className="font-medium text-gray-700">{name}:</span>
                    <div className="my-2 w-40">
                      <Doughnut data={subData} options={chartOptions} />
                    </div>
                    <ul className="ml-4 mt-2 space-y-1 text-gray-600">
                      {cat.subcategories && Object.entries(cat.subcategories).map(([sub, val]) => (
                        <li key={sub} className="flex items-center gap-2">
                          • {sub}: £
                          <input
                            type="number"
                            defaultValue={val}
                            className="border p-1 text-sm rounded w-20"
                            onBlur={(e) => handleEdit(name, sub, e.target.value)}
                          />
                          <span className="text-xs text-gray-500">({((val / cat.total) * 100).toFixed(1)}%)</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {history.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Spending Trend</h2>
            <Line data={lineChartData} options={lineOptions} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Savings Goal</h2>
            <p>Goal: £{monthlyGoal}</p>
            <p>Saved: £{savedAmount}</p>
            <div className="h-4 w-full bg-gray-200 rounded-full mt-2">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${(savedAmount / monthlyGoal) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">CV Score</h2>
            <p className="text-4xl font-bold text-green-600">{cvScore}%</p>
            <p className="text-sm mt-2 text-gray-600">{aiTip}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
