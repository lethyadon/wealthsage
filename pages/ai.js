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

    // Fake AI response for now
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Thanks! I’ll keep that in mind and check in regularly. Anything urgent today?" },
      ]);
    }, 800);
  };

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto p-6 font-sans">
        <h1 className="text-2xl font-bold mb-4 text-green-800">💬 Wealth Sage Assistant</h1>
        <div className="space-y-2 bg-gray-50 p-4 rounded border max-h-[400px] overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg ${msg.sender === "ai" ? "bg-green-100 text-left" : "bg-blue-100 text-right"}`}
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
