"use client";
import {
  account,
  BUCKETS,
  DATABASE_ID,
  databases,
  ID,
  storage,
  TABLES,
} from "@/lib/appwrite";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/images/user/owner.jpg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const accountUser = await account.get();
      setUser(accountUser);
      setName(accountUser.name);
      setEmail(accountUser.email);

      // Try to fetch extended profile from database
      try {
        const userDoc = await databases.getDocument(
          DATABASE_ID,
          TABLES.USERS,
          accountUser.$id,
        );
        if (userDoc.avatar) setAvatarUrl(userDoc.avatar);
      } catch (e) {
        // Doc might not exist
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    const fileId = ID.unique();
    setSaving(true);

    try {
      // 1. Upload File
      const uploaded = await storage.createFile(BUCKETS.AVATARS, fileId, file);

      // 2. Get View URL
      const viewUrl = storage.getFileView(BUCKETS.AVATARS, uploaded.$id);

      // 3. Update User Doc
      await databases.updateDocument(DATABASE_ID, TABLES.USERS, user.$id, {
        avatar: viewUrl,
      });

      // 4. Update Local State
      setAvatarUrl(viewUrl);
      alert("Profile picture updated!");
    } catch (error: any) {
      console.error("Avatar upload failed", error);
      alert("Failed to upload avatar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update Name in Auth
      if (name !== user.name) {
        await account.updateName(name);
      }

      // 2. Password Update
      if (newPassword && currentPassword) {
        await account.updatePassword(newPassword, currentPassword);
        alert("Password updated successfully!");
        setNewPassword("");
        setCurrentPassword("");
      } else if (newPassword && !currentPassword) {
        alert("Please enter current password to set a new one.");
        setSaving(false);
        return;
      }

      // 3. Sync Name to Database
      try {
        await databases.updateDocument(DATABASE_ID, TABLES.USERS, user.$id, {
          name: name,
        });
      } catch (dbError) {
        console.error("Error syncing to DB:", dbError);
        // If 404, we might create, but Layout usually handles creation now.
      }

      await fetchProfile(); // Refresh
      alert("Profile updated successfully");
    } catch (error: any) {
      console.error("Update failed:", error);
      alert("Update failed: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-800 dark:text-white">
        My Profile
      </h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column: Avatar & Basic Info */}
        <div className="col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div
              className="group relative mx-auto mb-4 h-32 w-32 cursor-pointer overflow-hidden rounded-full ring-4 ring-gray-100 dark:ring-gray-800"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image
                src={avatarUrl}
                alt="Profile"
                fill
                className="object-cover transition group-hover:opacity-75"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-xs font-medium text-white opacity-0 group-hover:opacity-100">
                Change
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/png, image/jpeg, image/jpg"
            />

            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {user.name}
            </h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-4 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
              Role: Admin
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-6 text-lg font-bold text-gray-800 dark:text-white">
              Edit Details
            </h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="focus:border-brand-500 focus:ring-brand-500 dark:focus:border-brand-500 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-hidden dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Email (Read Only) */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Email cannot be changed directly.
                  </p>
                </div>

                <hr className="my-6 border-gray-200 dark:border-gray-800" />

                <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                  Change Password
                </h4>

                {/* Current Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Required to set new password"
                    className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-hidden dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-hidden dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-brand-500 hover:bg-brand-600 hover:shadow-brand-500/25 rounded-xl px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
