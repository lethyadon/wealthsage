// components/NavBar.js
import Link from 'next/link';

export default function NavBar({ logoSrc = "/wealthsagelogo.png" }) {
  return (
    <nav className="bg-green-800 text-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={logoSrc} alt="WealthSage Logo" className="h-10 w-10" />
          <span className="font-bold text-xl">WealthSage</span>
        </div>
        <div className="flex space-x-6 text-sm font-medium">
          <Link href="/dashboard" className="hover:text-yellow-300 transition">Dashboard</Link>
          <Link href="/jobs" className="hover:text-yellow-300 transition">Jobs</Link>
          <Link href="/ai" className="hover:text-yellow-300 transition">AI Assistant</Link>
          <Link href="/career" className="hover:text-yellow-300 transition">Career</Link>
          <Link href="/login" className="hover:text-yellow-300 transition">Login / Sign Up</Link>
        </div>
      </div>
    </nav>
  );
}
