// pages/pricing.js
import NavBar from "../components/NavBar";

export default function PricingPage() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <NavBar />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Pricing</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 border rounded shadow bg-white">
            <h2 className="text-xl font-semibold mb-2">Free Plan</h2>
            <ul className="list-disc list-inside text-sm text-gray-700">
              <li>Track your debts and savings</li>
              <li>Daily task prompts</li>
              <li>Upload and analyze CSV statements</li>
              <li>Basic AI spending insights</li>
            </ul>
          </div>

          <div className="p-6 border-2 border-green-600 rounded shadow bg-white">
            <h2 className="text-xl font-semibold mb-2 text-green-700">Premium Plan</h2>
            <ul className="list-disc list-inside text-sm text-gray-700">
              <li>Full financial dashboard with goal tracking</li>
              <li>Visual debt bubbles and category insights</li>
              <li>AI-generated savings plans and alerts</li>
              <li>Subscription cancellation letter generator</li>
              <li>CV/job matching with filtered search & AI scores</li>
              <li>Priority access to new features and Sage Points store</li>
            </ul>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Upgrade to Premium
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
