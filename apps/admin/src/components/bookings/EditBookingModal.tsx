import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { databaseService } from "@/lib/databaseService";
import React, { useEffect, useState } from "react";

interface EditBookingModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function EditBookingModal({
  booking,
  isOpen,
  onClose,
  onRefresh,
}: EditBookingModalProps) {
  const [formData, setFormData] = useState({
    contactName: "",
    travelDate: "",
    assignedTo: "",
    adminNotes: "",
  });
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking) {
      setFormData({
        contactName: booking.contactName || "",
        travelDate: booking.travelDate || "",
        assignedTo: booking.assignedTo || "",
        adminNotes: booking.adminNotes || "",
      });
    }
  }, [booking]);

  useEffect(() => {
    // Fetch experts (admins)
    const fetchExperts = async () => {
      try {
        const admins = await databaseService.admins.list(100);
        setExperts(admins);
      } catch (e) {
        console.error("Failed to fetch experts", e);
      }
    };
    if (isOpen) fetchExperts();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await databaseService.bookings.update(booking.$id, {
        contactName: formData.contactName,
        travelDate: formData.travelDate,
        assignedTo: formData.assignedTo,
        adminNotes: formData.adminNotes,
      });
      onRefresh();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={true}>
      <div className="p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-100">
          Edit Booking
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contact Name
            </label>
            <input
              className="w-full rounded border p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              value={formData.contactName}
              onChange={(e) =>
                setFormData({ ...formData, contactName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Travel Date
            </label>
            <input
              type="date"
              className="w-full rounded border p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              value={formData.travelDate}
              onChange={(e) =>
                setFormData({ ...formData, travelDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Assign Expert
            </label>
            <select
              className="w-full rounded border p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              value={formData.assignedTo}
              onChange={(e) =>
                setFormData({ ...formData, assignedTo: e.target.value })
              }
            >
              <option value="">-- Select Expert --</option>
              {experts.map((expert) => (
                <option key={expert.$id} value={expert.$id}>
                  {expert.name || expert.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Admin Notes
            </label>
            <textarea
              className="min-h-[100px] w-full rounded border p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              value={formData.adminNotes}
              onChange={(e) =>
                setFormData({ ...formData, adminNotes: e.target.value })
              }
              placeholder="Internal notes..."
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
