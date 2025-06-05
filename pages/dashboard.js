// pages/dashboard.js
import NavBar from "../components/NavBar";
import GoalTracker from "../components/GoalTracker";

export default function Dashboard() {
  const progress = 64; // You can replace this with dynamic state later

  return (
    <>
      <NavBar />
      <main style={{ padding: "2rem", fontFamily: "sans-serif", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Your Financial Goal Progress</h1>
        <div style={{ margin: "2rem auto", width: "150px" }}>
          <GoalTracker progress={progress} />
        </div>
      </main>
    </>
  );
}
