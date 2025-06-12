// pages/index.js
import NavBar from "../components/NavBar";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <NavBar />
      <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "auto" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "#1a202c" }}>Welcome to WealthSage</h1>
        <p style={{ fontSize: "1.2rem", color: "#4a5568" }}>
          Your personal finance assistant. Track your goals, manage debt, get reminders, and explore new jobs – all in one place.
        </p>

        <section style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", color: "#2d3748" }}>Features</h2>
          <ul style={{ lineHeight: "2", fontSize: "1rem", color: "#4a5568" }}>
            <li>✅ Track your financial goals and savings</li>
            <li>📉 Monitor and reduce your debts</li>
            <li>📆 Set up daily or weekly reminders</li>
            <li>💼 Discover job listings that fit your skills</li>
            <li>🧠 Ask AI for budgeting, saving, and investment advice</li>
            <li>🚀 Upgrade to Premium for unlimited AI chat & advanced tracking</li>
          </ul>
        </section>

        <section style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/dashboard" style={{ padding: "0.75rem 1.5rem", backgroundColor: "#3182ce", color: "white", borderRadius: "6px", textDecoration: "none" }}>
            Go to Dashboard
          </Link>
          <Link href="/ai" style={{ padding: "0.75rem 1.5rem", backgroundColor: "#38a169", color: "white", borderRadius: "6px", textDecoration: "none" }}>
            Talk to AI
          </Link>
          <Link href="/pricing" style={{ padding: "0.75rem 1.5rem", backgroundColor: "#805ad5", color: "white", borderRadius: "6px", textDecoration: "none" }}>
            View Premium Options
          </Link>
        </section>
      </main>
    </>
  );
}
// pages/index.js (Landing Page)
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-white flex flex-col items-center justify-center p-8 font-sans">
      <h1 className="text-4xl md:text-5xl font-extrabold text-green-700 mb-6 text-center">
        Welcome to WealthSage
      </h1>
      <p className="text-lg md:text-xl text-gray-700 text-center mb-8 max-w-xl">
        A smarter way to track your finances, set savings goals, and escape debt.
      </p>
      <div className="flex gap-6 flex-wrap justify-center">
        <Link href="/dashboard" legacyBehavior>
          <a className="bg-green-600 hover:bg-green-700 text-white text-lg font-medium py-3 px-6 rounded-xl shadow-lg transition">
            Go to Dashboard
          </a>
        </Link>
        <Link href="/login" legacyBehavior>
          <a className="bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 text-lg font-medium py-3 px-6 rounded-xl shadow-md transition">
            Login / Sign Up
          </a>
        </Link>
      </div>
    </div>
  );
}
