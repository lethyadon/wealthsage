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
