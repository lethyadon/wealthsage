// components/NavBar.js
import Link from "next/link";

export default function NavBar({ logoSrc = "/wealthsagelogo.png" }) {
  return (
    <header className="bg-green-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src={logoSrc} alt="WealthSage Logo" className="h-10 w-auto" />
          <span className="text-xl font-bold tracking-tight">WealthSage</span>
        </div>
        <nav className="space-x-4 text-sm md:text-base">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/jobs" className="hover:underline">Jobs</Link>
          <Link href="/career" className="hover:underline">Career</Link>
          <Link href="/assistant" className="hover:underline">AI Assistant</Link>
          <Link href="/login" className="hover:underline">Login / Sign Up</Link>
        </nav>
      </div>
    </header>
  );
}
