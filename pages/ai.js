// pages/ai.js
import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import app from "../firebase";

export default function AiAssistant() {
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem("chatHistory");
    return stored ? JSON.parse(stored) : [
      { role: "assistant", content: "Hi there! What’s your main financial goal right now?" }
    ];
  });
  const [input, setInput] = useState("");
  const [userPlan, setUserPlan] = useState(null);
  const [trialUsed, setTrialUsed] = useState(false);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserPlan(data.plan || "starter");
          setTrialUsed(data.trialUsed || false);
        }
      }
    });
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    if (userPlan !== "premium" && trialUsed) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ You’ve used your free trial. Upgrade to continue chatting." }]);
      return;
    }

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages })
    });

    const data = await res.json();
    setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);

    if (userPlan !== "premium") {
      const aiCount = newMessages.filter(msg => msg.role === "assistant").length;
      if (aiCount >= 3) setTrialUsed(true);
    }
  };

  const examplePrompts = [
    "How can I start saving more money each month?",
    "What’s the best way to pay off my credit card debt?",
    "Can you help me plan a budget?",
    "How do I start investing with low income?"
  ];

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto p-4 font-sans">
        <h1 className="text-3xl font-bold mb-4 text-center">💬 AI Financial Assistant</h1>
        <div className="bg-gray-100 p-4 rounded-lg shadow-md h-[500px] overflow-y-auto space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`text-left p-2 rounded-md ${msg.role === "assistant" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
            >
              <strong>{msg.role === "assistant" ? "AI:" : "You:"}</strong> {msg.content}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded p-2"
            value={input}
            placeholder="Type your question or reply..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Send
          </button>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p className="mb-2">Try asking:</p>
          <ul className="list-disc ml-6">
            {examplePrompts.map((prompt, idx) => (
              <li key={idx}>{prompt}</li>
            ))}
          </ul>
        </div>
        {userPlan !== "premium" && trialUsed && (
          <div className="mt-6 text-center">
            <p className="text-red-600">You’ve reached the end of your free trial.</p>
            <a href="/upgrade" className="text-blue-600 underline">Upgrade to Premium</a>
          </div>
        )}
      </main>
    </>
  );
}

// pages/upgrade-success.js
import NavBar from "../components/NavBar";

export default function UpgradeSuccess() {
  return (
    <>
      <NavBar />
      <main className="max-w-xl mx-auto p-6 text-center font-sans">
        <h1 className="text-3xl font-bold mb-4 text-green-700">🎉 Upgrade Successful!</h1>
        <p className="text-lg">Thank you for upgrading to Premium. You now have unlimited access to the AI Financial Assistant and more features.</p>
        <a href="/dashboard" className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">Go to Dashboard</a>
      </main>
    </>
  );
}
