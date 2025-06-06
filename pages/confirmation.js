// pages/confirmation.js
import NavBar from "../components/NavBar";

export default function Confirmation() {
  return (
    <>
      <NavBar />
      <main className="max-w-md mx-auto p-6 font-sans text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">✅ Upgrade Successful</h1>
        <p className="mb-4">Thanks for upgrading! You now have full access to all AI tools and financial insights.</p>
        <a href="/dashboard" className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">
          Go to Dashboard
        </a>
      </main>
    </>
  );
}
