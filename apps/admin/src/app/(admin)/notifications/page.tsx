"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { databaseService } from "@/lib/databaseService";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "system",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    setFetching(true);
    const data = await databaseService.notifications.list();
    setNotifications(data);
    setFetching(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Send to all users
      await databaseService.notifications.sendToAll(
        formData.title,
        formData.message,
        formData.type as any,
      );
      setSuccess("Notification sent to all users successfully!");
      setFormData({ title: "", message: "", type: "system" });
      fetchNotifications(); // Refresh list
    } catch (err: any) {
      console.error(err);
      setError("Failed to send notification: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadCrumb pageTitle="Notifications" />

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
            Broadcast Notification
          </h2>
          <form onSubmit={handleSend} className="max-w-xl space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-500 bg-green-100 rounded">
                {success}
              </div>
            )}

            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                Title
              </label>
              <input
                type="text"
                placeholder="Notification Title"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                Message
              </label>
              <textarea
                rows={3}
                placeholder="Notification Message"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                Type
              </label>
              <select
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="system">System</option>
                <option value="promo">Promo</option>
                <option value="security">Security</option>
                <option value="booking">Booking</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full justify-center"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send to All Users"}
            </Button>
          </form>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
            Recent Notifications
          </h3>
          <div className="flex flex-col">
            <div className="grid grid-cols-4 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-4">
              <div className="p-2.5 xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Title
                </h5>
              </div>
              <div className="p-2.5 xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Message
                </h5>
              </div>
              <div className="p-2.5 xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Type
                </h5>
              </div>
              <div className="p-2.5 xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Date
                </h5>
              </div>
            </div>

            {fetching ? (
              <div className="p-4 text-center">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications found
              </div>
            ) : (
              notifications.map((item, key) => (
                <div
                  className={`grid grid-cols-4 sm:grid-cols-4 ${
                    key === notifications.length - 1
                      ? ""
                      : "border-b border-stroke dark:border-strokedark"
                  }`}
                  key={key}
                >
                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    <p className="text-black dark:text-white">{item.title}</p>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    <p className="text-black dark:text-white truncate">
                      {item.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    <span
                      className={`inline-block rounded px-2.5 py-0.5 text-sm font-medium ${
                        item.type === "promo"
                          ? "bg-warning/10 text-warning"
                          : item.type === "security"
                          ? "bg-danger/10 text-danger"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    <p className="text-black dark:text-white text-sm">
                      {new Date(item.$createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
