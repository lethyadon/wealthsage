
export default function Dashboard() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard</h1>
      <p>This is your dashboard view. More functionality coming soon.</p>
    </main>
  );
}
// pages/dashboard.js
import NavBar from "../components/NavBar";

export default function Dashboard() {
  return (
    <>
      <NavBar />
      <main style={{ padding: "2rem" }}>
        <h1>Dashboard</h1>
        <p>Here you'll track goals, find jobs, and more.</p>
      </main>
    </>
  );
}
