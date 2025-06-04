// pages/dashboard.js
import NavBar from "../components/NavBar";

export default function Dashboard() {
  return (
    <>
      <NavBar />
      <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>Welcome to WealthSage 🎯</h1>
        <p>This is your dashboard view. Here you’ll track goals, debts, and insights.</p>
      </main>
    </>
  );
}
