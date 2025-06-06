import NavBar from "../components/NavBar";

export default function Upgrade() {
  return (
    <>
      <NavBar />
      <main className="max-w-xl mx-auto p-6 font-sans text-center">
        <h1 className="text-2xl font-bold mb-6 text-green-800">🚀 Upgrade to Premium</h1>
        <p className="mb-6">Get unlimited access to AI tools, job insights, and more.</p>
        <form action="/api/checkout" method="POST">
          <button
            type="submit"
            className="bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800"
          >
            Upgrade for £4.99/month
          </button>
        </form>
      </main>
    </>
  );
}
