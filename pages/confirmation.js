import NavBar from "../components/NavBar";

export default function Confirmation() {
  return (
    <>
      <NavBar />
      <main className="max-w-xl mx-auto p-6 font-sans text-center">
        <h1 className="text-2xl font-bold mb-4 text-green-800">✅ You're Upgraded!</h1>
        <p className="mb-6">Thanks for upgrading. You now have full access to Wealth Sage.</p>
        <a href="/dashboard" className="text-blue-600 underline">Go to Dashboard</a>
      </main>
    </>
  );
}
