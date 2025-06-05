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
import React from "react";

export default function GoalTracker({ progress }) {
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#e2e8f0"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#38a169"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference + " " + circumference}
        style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s ease" }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        fontSize="1.2rem"
        fill="#2d3748"
      >
        {progress}%
      </text>
    </svg>
  );
}
