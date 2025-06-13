// pages/index.js
import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-white flex flex-col items-center justify-center px-4 py-12 text-black font-sans">
      <h1 className="text-4xl sm:text-5xl font-bold text-green-700 mb-4 text-center">Welcome to WealthSage</h1>
      <p className="text-lg text-center max-w-xl mb-8">
        Your intelligent tool for mastering debt, savings, and financial goals — powered by real-time insights and AI coaching.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setShowAuth(true)}
          className="bg-green-600 hover:bg-green-700 transition text-white px-6 py-3 rounded text-lg"
        >
          {isRegistering ? 'Sign Up' : 'Login'}
        </button>

        <Link href="/dashboard">
          <button className="bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 px-6 py-3 rounded text-lg">
            Launch Dashboard
          </button>
        </Link>
      </div>

      {showAuth && (
        <div className="mt-12 w-full max-w-md bg-white p-6 rounded shadow-lg">
          <form className="space-y-4">
            <h2 className="text-2xl font-semibold text-green-700 mb-2 text-center">
              {isRegistering ? 'Create Your Account' : 'Login to WealthSage'}
            </h2>
            <input
              type="email"
              placeholder="Email"
              className="w-full border p-2 rounded"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border p-2 rounded"
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              {isRegistering ? 'Sign Up' : 'Login'}
            </button>
            <p className="mt-4 text-sm text-center text-gray-600">
              {isRegistering ? 'Already have an account?' : 'New to WealthSage?'}{' '}
              <button
                type="button"
                className="text-green-700 underline hover:text-green-900"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering ? 'Login here' : 'Register here'}
              </button>
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
