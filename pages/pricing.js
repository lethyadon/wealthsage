// pages/pricing.js
import NavBar from "../components/NavBar";

export default function Pricing() {
  return (
    <>
      <NavBar />
      <main className="max-w-xl mx-auto p-6 font-sans text-center">
        <h1 className="text-3xl font-bold mb-4 text-purple-800">💎 Premium Plans</h1>
        <p className="mb-6">Choose a plan that suits your financial goals.</p>
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-xl font-semibold">Pro Plan</h2>
          <p className="text-sm text-gray-600 mb-2">Full access to all AI tools, job tracking, and reminders.</p>
          <p className="text-2xl font-bold text-purple-700">$9.99/mo</p>
        </div>
      </main>
    </>
  );
}
