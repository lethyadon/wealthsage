// pages/dashboard.js
import NavBar from "../components/NavBar";
import { useState } from "react";

export default function Dashboard() {
  const [progress, setProgress] = useState(60); // editable percentage
  const [reminders, setReminders] = useState([
    { id: 1, text: "Review monthly budget" },
    { id: 2, text: "Pay credit card bill" },
  ]);
  const [transactions, setTransactions] = useState([
    { id: 1, date: "2025-06-01", item: "Groceries", amount: "-£40" },
    { id: 2, date: "2025-06-02", item: "Freelance Income", amount: "+£250" },
  ]);

  return (
    <>
      <NavBar />
      <main className="max-w-5xl mx-auto p-6 font-sans">
        <h1 className="text-3xl font-bold mb-6 text-green-800 text-center">📊 Dashboard</h1>

        {/* Goal Progress Section */}
        <section className="mb-10 text-center">
          <h2 className="text-xl font-semibold mb-2 text-green-700">Goal Progress</h2>
          <div className="relative w-40 h-40 mx-auto">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path
                className="text-gray-300"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                className="text-green-500"
                strokeDasharray={`${progress}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <text x="18" y="20.35" className="fill-current text-black text-sm" textAnchor="middle">
                {progress}%
              </text>
            </svg>
          </div>
          <button
            onClick={() => setProgress((prev) => (prev < 100 ? prev + 10 : 100))}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Increase Progress
          </button>
        </section>

        {/* Reminders Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2 text-green-700">Reminders</h2>
          <ul className="list-disc pl-5">
            {reminders.map(reminder => (
              <li key={reminder.id}>{reminder.text}</li>
            ))}
          </ul>
        </section>

        {/* Transactions Section */}
        <section>
          <h2 className="text-xl font-semibold mb-2 text-green-700">Recent Transactions</h2>
          <table className="w-full border">
            <thead>
              <tr className="bg-green-100">
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Item</th>
                <th className="p-2 border">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className="border-t">
                  <td className="p-2 border">{tx.date}</td>
                  <td className="p-2 border">{tx.item}</td>
                  <td className="p-2 border">{tx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
