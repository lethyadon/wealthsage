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

// pages/login.js (Replaces Settings Page)
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) {
      alert(`Registering ${email}`);
    } else {
      alert(`Logging in as ${email}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-green-700 mb-6">
          {isRegistering ? 'Create Account' : 'Login'}
        </h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-2 border rounded"
          required
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
  );
}
