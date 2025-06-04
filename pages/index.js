// pages/index.js
import NavBar from "../components/NavBar";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <NavBar />
      <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>Welcome to WealthSage</h1>
        <p>Your financial assistant — all in one place.</p>
        <ul style={{ marginTop: "1.5rem" }}>
          <li><Link href="/dashboard">Go to Dashboard</Link></li>
        </ul>
      </main>
    </>
  );
}
