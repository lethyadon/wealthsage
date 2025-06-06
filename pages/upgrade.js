// pages/upgrade.js
import NavBar from "../components/NavBar";

export default function Upgrade() {
  return (
    <>
      <NavBar />
      <main className="max-w-xl mx-auto p-6 font-sans">
        <h1 className="text-2xl font-bold mb-4 text-purple-800">💎 Upgrade Your Plan</h1>
        <p className="mb-6">Unlock AI prompts, savings tools, and personalized support with Premium.</p>
        <a
          href="/api/checkout"
          className="bg-purple-700 text-white px-6 py-3 rounded hover:bg-purple-800"
        >
          Upgrade with Stripe
        </a>
      </main>
    </>
  );
}
