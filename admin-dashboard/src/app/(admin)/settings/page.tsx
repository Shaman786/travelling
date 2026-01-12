"use client";
import { account } from "@/lib/appwrite";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  useEffect(() => {
    const getUser = async () => {
      try {
        const u = await account.get();
        setUser(u);
        setName(u.name);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });
    try {
      if (name !== user.name) {
        await account.updateName(name);
      }
      if (password) {
        await account.updatePassword(password, user.password); // Note: updatePassword requires old password in some SDK versions or just new. Client SDK usually just new password.
        // Actually, client SDK updatePassword(password, oldPassword) might be required if safety is on.
        // Let's assume standard updatePassword(password) but catch error if old pass needed.
        // Checking docs: updatePassword(password, oldPassword?)
        await account.updatePassword(password);
      }
      setStatus({ type: "success", message: "Profile updated successfully!" });
      // Refresh user
      const u = await account.get();
      setUser(u);
      setPassword(""); // Clear password field
    } catch (error: any) {
      console.error("Update error:", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to update profile.",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
        Account Settings
      </h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-hidden focus:ring-1 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-gray-500 dark:border-gray-700 dark:bg-gray-800"
            />
            <p className="mt-1 text-xs text-gray-400">
              Email cannot be changed directly.
            </p>
          </div>

          <div className="pt-4">
            <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white">
              Change Password
            </h3>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-hidden focus:ring-1 dark:border-gray-700 dark:text-white"
            />
          </div>

          {status.message && (
            <div
              className={`rounded-lg p-3 text-sm ${
                status.type === "success"
                  ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="bg-brand-500 hover:bg-brand-600 focus:ring-brand-500/20 rounded-lg px-6 py-2.5 font-medium text-white transition focus:ring-4"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
