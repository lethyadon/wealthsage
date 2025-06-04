
export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>WealthSage</h1>
      <p>Your financial assistant is live.</p>
      <a href="/dashboard">Go to Dashboard</a>
    </main>
  );
}
// pages/index.js
import NavBar from "../components/NavBar";

export default function Home() {
  return (
    <>
      <NavBar />
      <main style={{ padding: "2rem" }}>
        <h1>Welcome to WealthSage</h1>
        <p>Your financial assistant, all in one place.</p>
      </main>
    </>
  );
}
