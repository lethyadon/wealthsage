// pages/ai.js
import NavBar from "../components/NavBar";
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

export default function AIPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hi! Let's tackle your finances. What’s your #1 money goal right now—debt, savings, job, or something else?",
    },
  ]);
  const [memory, setMemory] = useState({ goal: "", cvUploaded: false, bankUploaded: false });

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    const userInput = input.toLowerCase();
    let aiResponse = "Got it. I'm here to help. Want tailored advice on cutting expenses, finding a job, or reducing your monthly bills?";
    let updatedMemory = { ...memory };

    try {
      const { data } = await axios.post("/api/ask", { input });
      if (data?.response) {
        aiResponse = data.response;
      }
    } catch (err) {
      console.error("OpenAI fallback failed:", err);
    }

    if (userInput.includes("job")) {
      aiResponse = `Here are a few options:
🔎 Browse our job listings [here](/jobs).
📄 Upload your CV to get smart job matches.
💡 Tip: Premium members can filter by pay, location, and company ratings.`;
      updatedMemory.goal = "job";
    } else if (userInput.includes("debt") || userInput.includes("bank")) {
      aiResponse = `To reduce debt, start with:
1. Uploading your bank statement for analysis
2. Identifying recurring payments to cut
3. Creating a snowball plan

🧮 Premium unlocks visual debt tracking + reminders.`;
      updatedMemory.goal = "debt";
    } else if (userInput.includes("cv")) {
      aiResponse = `Upload your CV so we can:
✅ Match roles to your skills
✅ Filter based on your preferences
✅ Highlight high-scoring job matches

Premium members get priority matching.`;
      updatedMemory.cvUploaded = true;
    } else if (userInput.includes("cancel") || userInput.includes("subscription") || userInput.includes("netflix") || userInput.includes("amazon")) {
      aiResponse = `Here’s a sample cancellation letter you can use:

---
Dear [Provider],

Please cancel my subscription to [Service Name] effective immediately. This helps me reallocate funds toward urgent financial goals.

Sincerely,
[Your Name]
---

📌 Premium users can automate this process.`;
    } else if (userInput.includes("premium")) {
      aiResponse = `Here’s what Premium gets you:
✨ AI-crafted cancellation letters
📊 Visual debt breakdowns from bank data
📎 Smart CV-to-job matching + filters
🧠 Financial goal reminders + advice
🚀 Priority assistant upgrades

[Upgrade Now](/upgrade)`;
    } else if (userInput.includes("savings") || userInput.includes("save")) {
      aiResponse = `💰 Let’s boost your savings!
1. Set an auto-transfer every payday
2. Cut unnecessary subscriptions
3. Use high-interest savings accounts

Premium helps track this in real time.`;
      updatedMemory.goal = "savings";
    } else if (userInput.includes("upload")) {
      if (userInput.includes("bank")) {
        updatedMemory.bankUploaded = true;
        aiResponse = `Thanks! I'll scan your statement to summarize:
- Recurring expenses to cancel
- Total interest paid monthly
- Potential savings areas

Premium members get automated categorization.`;
      } else if (userInput.includes("cv")) {
        updatedMemory.cvUploaded = true;
        aiResponse = `CV received. I’ll now match your skills with open jobs and prioritize high-score roles. Filter options are [here](/jobs).`;
      }
    }

    setMemory(updatedMemory);
    setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }]);
  };

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto p-6 font-sans mt-10">
        <h1 className="text-2xl font-bold mb-6 text-green-800">
          💬 Wealth Sage Assistant
        </h1>
        <div className="space-y-2 bg-gray-50 p-4 rounded border h-80 overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${
                msg.sender === "ai"
                  ? "bg-green-100 text-left"
                  : "bg-blue-100 text-right"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="flex mt-4 space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your assistant..."
            className="flex-grow p-2 border rounded"
          />
          <button
            onClick={handleSend}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
          >
            Send
          </button>
        </div>
 <p className="text-xs text-gray-500 mt-4">
  Want more features?{" "}
  <Link href="/upgrade" className="text-blue-600 underline">
    Upgrade to Premium
  </Link>{" "}
  to unlock smart job matching, debt analyzers, cancellation letters, and more.
</p>

