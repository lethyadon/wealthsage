// pages/pricing.js
import NavBar from "../components/NavBar";
import { Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <NavBar />
      <main className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-green-600" />
          <h1 className="text-4xl font-bold text-green-800">Our Plans</h1>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="p-6 border rounded-lg shadow-lg bg-white hover:shadow-xl transition">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Free Plan</h2>
            <ul className="text-sm space-y-2 text-gray-700">
              <li>✔ Track your debts and savings</li>
              <li>✔ Daily task prompts</li>
              <li>✔ Upload and analyze CSV statements</li>
              <li>✔ Basic AI spending insights</li>
            </ul>
          </div>

          <div className="p-6 border-2 border-green-600 rounded-lg shadow-lg bg-white hover:shadow-xl transition relative">
            <div className="absolute top-2 right-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Most Popular</div>
            <h2 className="text-xl font-semibold mb-3 text-green-700">Premium Plan</h2>
            <ul className="text-sm space-y-2 text-gray-700">
              <li>🌱 Full financial dashboard with goal tracking</li>
              <li>💡 Visual debt bubbles and category insights</li>
              <li>🤖 AI-generated savings plans and alerts</li>
              <li>📩 Subscription cancellation letter generator</li>
              <li>🧠 CV/job matching with filtered search & AI scores</li>
              <li>🏆 Priority access to new features and Sage Points store</li>
            </ul>
            <a href="/upgrade">
              <button className="mt-6 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Upgrade to Premium</button>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
