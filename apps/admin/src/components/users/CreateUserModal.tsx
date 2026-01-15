"use client";
import { DATABASE_ID, databases, functions, TABLES } from "@/lib/appwrite";
import { ID } from "appwrite";
import React, { useState } from "react";

// Environment variable for the Cloud Function ID
const CREATE_USER_FUNCTION_ID =
  process.env.NEXT_PUBLIC_CREATE_USER_FUNCTION_ID || "create-user";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // user or admin
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useCloudFunction, setUseCloudFunction] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (useCloudFunction) {
        // ============ CLOUD FUNCTION APPROACH ============
        // This calls the 'create-user' Cloud Function which uses Server SDK
        // to properly create users with authentication credentials

        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters");
        }

        const execution = await functions.createExecution(
          CREATE_USER_FUNCTION_ID,
          JSON.stringify({
            email,
            password,
            name,
            role,
          }),
          false, // async = false (wait for response)
          "/", // path
          "POST", // method
        );

        if (execution.status !== "completed") {
          throw new Error(
            `Function execution failed: ${execution.responseBody}`,
          );
        }

        const result = JSON.parse(execution.responseBody);

        if (!result.success) {
          throw new Error(result.error || "Failed to create user");
        }
      } else {
        // ============ FALLBACK: Database-only approach ============
        // Creates a profile without auth credentials (user must register themselves)
        const userId = ID.unique();
        await databases.createDocument(DATABASE_ID, TABLES.USERS, userId, {
          name,
          email,
          role: role,
          onboardingComplete: false,
        });
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      console.error("Error creating user:", err);
      setError(err.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          Invite User
        </h2>

        {/* Warning about Client-Side limitation */}
        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <strong>Important:</strong> This creates a profile invitation. The
          user must register with this email to activate their account. For full
          user creation with login credentials, implement a Cloud Function.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-hidden focus:ring-1 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-hidden focus:ring-1 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-hidden focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-500 hover:bg-brand-600 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
