import NavBar from "../components/NavBar";
import { useState } from "react";
import Link from "next/link";

export default function AIPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi! Let's tackle your finances. What’s your #1 money goal right now—debt, savings, job, or something else?" },
  ]);
  const [memory, setMemory] = useState({ goal: "", cvUploaded: false, bankUploaded: false });

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    setTimeout(() => {
      const userInput = input.toLowerCase();
      let aiResponse = "Got it. I'm here to help. Want tailored advice on cutting expenses, finding a job, or reducing your monthly bills?";
      let updatedMemory = { ...memory };

      if (userInput.includes("job")) {
        aiResponse = `Here are a few options:\n🔎 Browse our job listings [here](/jobs).\n📄 Upload your CV to get smart job matches.\n💡 Tip: Premium members can filter by pay, location, and company ratings.`;
        updatedMemory.goal = "job";
      } else if (userInput.includes("debt") || userInput.includes("bank")) {
        aiResponse = `To reduce debt, start with:\n1. Uploading your bank statement for analysis\n2. Identifying recurring payments to cut\n3. Creating a snowball plan\n\n🧮 Premium unlocks visual debt tracking + reminders.`;
        updatedMemory.goal = "debt";
      } else if (userInput.includes("cv")) {
        aiResponse = `Upload your CV so we can:\n✅ Match roles to your skills\n✅ Filter based on your preferences\n✅ Highlight high-scoring job matches\n\nPremium members get priority matching.`;
        updatedMemory.cvUploaded = true;
      } else if (userInput.includes("cancel") || userInput.includes("subscription")) {
        aiResponse = `Here’s a sample cancellation letter you can use:\n\n---\nDear [Provider],\n\nPlease cancel my subscription to [Service Name] effective immediately.\n\nSincerely,\n[Your Name]\n---\n\n📌 Premium users can automate this process.`;
      } else if (userInput.includes("premium")) {
        aiResponse = `Here’s what Premium gets you:\n✨ AI-crafted cancellation letters\n📊 Visual debt breakdowns from bank data\n📎 Smart CV-to-job matching + filters\n🧠 Financial goal reminders + advice\n🚀 Priority assistant upgrades\n\n[Upgrade Now](/upgrade)`;
      } else if (userInput.includes("save") || userInput.includes("savings")) {
        aiResponse = `💰 Let’s boost your savings!\n1. Set an auto-transfer every payday\n2. Cut unnecessary subscriptions\n3. Use high-interest savings accounts\n\nPremium helps track this in real time.`;
        updatedMemory.goal = "savings";
      } else if (userInput.includes("upload")) {
        if (userInput.includes("bank")) {
          updatedMemory.bankUploaded = true;
          aiResponse = `Thanks! I'll scan your statement to summarize:\n- Recurring expenses to cancel\n- Total interest paid monthly\n- Potential savings areas\n\nPremium members get automated categorization.`;
        } else if (userInput.includes("cv")) {
          updatedMemory.cvUploaded = true;
          aiResponse = `CV received. I’ll now match your skills with open jobs and prioritize high-score roles. Filter options are [here](/jobs).`;
        }
      } else {
        if (memory.goal === "debt" && memory.bankUploaded) {
          aiResponse = `Now that I have your bank data, let’s break it down:\n- Top 3 recurring payments\n- Total discretionary spend\n- Suggested areas to cut\n\nType 'cancel Netflix' or 'reduce groceries' for help.`;
        } else if (memory.goal === "debt") {
          aiResponse = `Let’s reduce more debt. Want to cancel unused services like streaming subscriptions? I can help draft letters.`;
        } else if (memory.goal === "job" && memory.cvUploaded) {
          aiResponse = `I’ll now match your CV with top job listings. You can filter by salary, region, and rating [here](/jobs).`;
        } else {
          aiResponse = `Thanks for sharing. You can:\n- Upload your bank statement\n- Explore job options\n- Ask for cancellation letters\n\nOr type 'premium' to see all advanced tools.`;
        }
      }

      setMemory(updatedMemory);
      setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }]);
    }, 600);
  };

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto p-6 font-sans mt-10">
        <h1 className="text-2xl font-bold mb-6 text-green-800">💬 Wealth Sage Assistant</h1>
        <div className="space-y-2 bg-gray-50 p-4 rounded border h-80 overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${msg.sender === "ai" ? "bg-green-100 text-left" : "bg-blue-100 text-right"}`}
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
      </main>
    </>
  );
}
