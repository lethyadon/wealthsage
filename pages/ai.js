// pages/ai.js
import NavBar from "../components/NavBar";
import { useState } from "react";

export default function AIPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi! What are your top 3 financial goals right now?" },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    setTimeout(() => {
      const userInput = input.toLowerCase();
      let aiResponse = "Thanks! I’ll keep that in mind and check in regularly. Anything urgent today?";

      if (userInput.includes("job")) {
        aiResponse = "Got it. You might want to visit our Jobs page to explore listings that match your profile. Don’t forget to upload your CV for tailored suggestions.";
      } else if (userInput.includes("bank statement") || userInput.includes("debt")) {
        aiResponse = "If you'd like, you can upload your bank statement and I’ll help analyze your recurring expenses to pinpoint where you can reduce debt faster.";
      } else if (userInput.includes("cv")) {
        aiResponse = "You can upload your CV now, and I’ll match it with available job listings based on your skills, experience, and location.";
      } else if (userInput.includes("cancel") || userInput.includes("subscription")) {
        aiResponse = `Here’s a cancellation letter you can use:

Dear [Provider],

I am writing to formally request the cancellation of my subscription to [Service Name] effective immediately. Please cease any further charges to my account. 

This decision supports my financial plan to prioritize essential expenses and reduce non-critical recurring costs.

Thank you.
[Your Name]`;
      }

      setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }]);
    }, 800);
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
              className={`p-3 rounded-lg text-sm ${msg.sender === "ai" ? "bg-green-100 text-left" : "bg-blue-100 text-right"}`}
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
      </main>
    </>
  );
}
