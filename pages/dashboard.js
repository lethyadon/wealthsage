
// pages/dashboard.js
import NavBar from "../components/NavBar";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import pdfjsLib from "pdfjs-dist";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [categorized, setCategorized] = useState({});
  const [income, setIncome] = useState(0);
  const [goalAmount, setGoalAmount] = useState(1000);
  const [targetDate, setTargetDate] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file.type === "text/csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => categorizeSpending(results.data)
      });
    } else if (file.type === "application/pdf") {
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        const typedArray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((s) => s.str).join(" ");
        }
        // crude extraction example
        const lines = text.split(/\n|\r/);
        const data = lines.map((l) => ({ Description: l, Amount: "0" }));
        categorizeSpending(data);
      };
      fileReader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a CSV or PDF file.");
    }
  };

  const categorizeSpending = (transactions) => {
    const categories = {};
    transactions.forEach(({ Description = "Other", Amount = 0 }) => {
      let category = "Other";
      const desc = Description.toLowerCase();
      const value = Math.abs(parseFloat(Amount)) || 0;

      if (desc.includes("tesco") || desc.includes("asda")) category = "Groceries";
      else if (desc.includes("uber") || desc.includes("train")) category = "Transport";
      else if (desc.includes("netflix") || desc.includes("spotify")) category = "Entertainment";
      else if (desc.includes("rent") || desc.includes("mortgage")) category = "Housing";
      else if (desc.includes("gym") || desc.includes("fitness")) category = "Health";

      categories[category] = (categories[category] || 0) + value;
    });

    setCategorized(categories);
  };

  const chartData = {
    labels: Object.keys(categorized),
    datasets: [
      {
        label: "Spending by Category",
        data: Object.values(categorized),
        backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#FF5722", "#9C27B0"]
      }
    ]
  };

  const calculateMonthlySaving = () => {
    if (!income || !goalAmount || !targetDate) return 0;
    const monthsToGo = (new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30);
    return monthsToGo > 0 ? (goalAmount / monthsToGo).toFixed(2) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6">
      <NavBar />
      <main className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-green-700">Dashboard</h1>

        <section className="bg-white p-4 rounded shadow">
          <label className="block mb-2">Upload Statement (CSV or PDF)</label>
          <input type="file" accept=".csv,.pdf" onChange={handleFileUpload} className="mb-4" />
        </section>

        <section className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">Monthly Income (£)</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1">Saving Goal (£)</label>
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1">Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </section>

        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Spending by Category</h2>
          <Doughnut data={chartData} />
        </section>

        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">💡 Monthly Saving Target</h2>
          <p className="text-green-700 font-bold text-xl">£{calculateMonthlySaving()}</p>
        </section>
      </main>
    </div>
  );
}
