import NavBar from "../components/NavBar";

export default function Upgrade() {
  return (
    <>
      <NavBar />
      <main className="max-w-xl mx-auto p-6 text-center font-sans">
        <h1 className="text-3xl font-bold mb-4 text-purple-700">✨ Premium Access</h1>
        <p className="text-lg mb-6">Unlock unlimited AI chats, progress tracking, and more.</p>
        <a
          href="/api/checkout"
          className="inline-block px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Upgrade for £5/month
        </a>
      </main>
    </>
  );
}
