// pages/settings.js
import NavBar from "../components/NavBar";

export default function Settings() {
  return (
    <>
      <NavBar />
      <main className="max-w-xl mx-auto p-6 font-sans">
        <h1 className="text-2xl font-bold mb-4 text-green-800">Settings</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input type="text" placeholder="Your Name" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input type="email" placeholder="you@example.com" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Notification Preferences</label>
            <select className="w-full p-2 border rounded">
              <option>Email</option>
              <option>SMS</option>
              <option>Push Only</option>
            </select>
          </div>
          <button className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">Save Changes</button>
        </form>
      </main>
    </>
  );
}

// pages/admin.js
import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "../firebase";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore(app);
      const usersSnapshot = await getDocs(collection(db, "users"));
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchUsers();
  }, []);

  return (
    <>
      <NavBar />
      <main className="max-w-4xl mx-auto p-6 font-sans">
        <h1 className="text-2xl font-bold mb-6 text-green-800">Admin Panel</h1>
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-green-100">
              <th className="p-2">User ID</th>
              <th className="p-2">Email</th>
              <th className="p-2">Plan</th>
              <th className="p-2">Trial Used</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.id}</td>
                <td className="p-2">{user.email || "N/A"}</td>
                <td className="p-2">{user.plan || "starter"}</td>
                <td className="p-2">{user.trialUsed ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}

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
