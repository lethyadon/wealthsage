// pages/index.js (Landing Page)
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-white flex flex-col items-center justify-center p-8 font-sans">
      <h1 className="text-4xl md:text-5xl font-extrabold text-green-700 mb-6 text-center">
        Welcome to WealthSage
      </h1>
      <p className="text-lg md:text-xl text-gray-700 text-center mb-8 max-w-xl">
        A smarter way to track your finances, set savings goals, and escape debt.
      </p>
      <div className="flex gap-6 flex-wrap justify-center">
        <Link href="/dashboard" legacyBehavior>
          <a className="bg-green-600 hover:bg-green-700 text-white text-lg font-medium py-3 px-6 rounded-xl shadow-lg transition">
            Go to Dashboard
          </a>
        </Link>
        <Link href="/login" legacyBehavior>
          <a className="bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 text-lg font-medium py-3 px-6 rounded-xl shadow-md transition">
            Login / Sign Up
          </a>
        </Link>
      </div>
    </div>
  );
}
