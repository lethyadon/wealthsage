import Link from "next/link";
import Image from "next/image"; // Add this line

export default function NavBar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center font-sans">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.png" alt="Wealth Sage Logo" width={36} height={36} />
        <span className="font-bold text-xl">WealthSage</span>
      </Link>
      <div className="space-x-4">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/ai">AI</Link>
        <Link href="/jobs">Jobs</Link>
        <Link href="/upgrade">Upgrade</Link>
      </div>
    </nav>
  );
}
