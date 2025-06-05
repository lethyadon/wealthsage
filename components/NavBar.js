import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center font-sans">
      <Link href="/" className="font-bold text-xl">WealthSage</Link>
      <div className="space-x-4">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/ai">AI</Link>
        <Link href="/upgrade">Upgrade</Link>
      </div>
    </nav>
  );
}
