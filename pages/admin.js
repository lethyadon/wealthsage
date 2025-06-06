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
