// pages/upgrade.js
import NavBar from "../components/NavBar";

export default function UpgradePage() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <NavBar />
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Upgrade to Premium</h1>
        <div className="bg-white p-6 border rounded shadow">
          <p className="mb-4 text-gray-700">Unlock the full WealthSage experience with powerful tools to manage your finances and reach your goals faster.</p>
          <ul className="list-disc list-inside text-sm text-gray-800 mb-6">
            <li>Advanced budget breakdowns and saving suggestions</li>
            <li>Visual debt payoff tracker with progress rings</li>
            <li>Tailored saving missions with motivational streaks</li>
            <li>Cancel subscriptions with AI-generated letters</li>
            <li>Smart job matching and CV-enhanced applications</li>
            <li>Access to exclusive rewards and Sage Store perks</li>
          </ul>
          <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Upgrade Now
          </button>
        </div>
      </main>
    </div>
  );
}
