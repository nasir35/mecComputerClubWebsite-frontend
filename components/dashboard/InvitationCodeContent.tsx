"use client";

import React, { useState } from "react";
import { Mail, Check, Loader2, Settings2 } from "lucide-react";
import CustomInput from "@/components/ui/shared/CustomInput"; // Assuming this is your corrected input
import { handleKeyDown } from "@/lib/utils"; // Assuming handleKeyDown utility is correctly defined
import axios, { AxiosError } from "axios";
import CountdownTimer from "../ui/shared/CountdownTimer";

// Define the valid roles based on your model interface
type Role = "guest" | "member" | "moderator" | "admin" | "alumni";
const AVAILABLE_ROLES: Role[] = ["member", "guest", "moderator", "admin", "alumni"];

interface InvitationCode {
  email: string;
  code: string;
  expiresAt: string;
  role?: Role; // Added role to the client interface for display
}

// Helper function to capitalize the first letter (used for display)
const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const InvitationCodeContent = () => {
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [invitationResult, setInvitationResult] = useState<InvitationCode | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null); // 🚩 NEW STATE for Admin Controls
  const [isRoleSelectionEnabled, setIsRoleSelectionEnabled] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("member");
  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleInviteSubmit = async () => {
    setEmailError(null);
    setInvitationResult(null);

    if (!isValidEmail(inviteEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setInviteError(null); // Determine the role to send: only send 'role' if the selection is enabled

      const payload = {
        email: inviteEmail,
        role: isRoleSelectionEnabled ? selectedRole : undefined,
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/invite/create`,
        payload,
        { withCredentials: true }
      ); // Assuming API returns the created invite object

      setInvitationResult(res.data.invite);
    } catch (error: unknown) {
      console.error("Error inviting user:", error); // Display error right next to input (if it's an email validation error)
      if (error instanceof AxiosError && error.response?.data?.message.includes("Email")) {
        setEmailError(error.response.data.message);
      } else if (error instanceof AxiosError) {
        setInviteError(error.response?.data?.message || "An unexpected error occurred.");
      } else {
        setInviteError("An unexpected error occurred.");
      } // Assuming you use a toast notification for general errors // toast.error(error.response?.data?.message || "Invitation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewInvite = () => {
    setInvitationResult(null);
    setInviteEmail("");
    setEmailError(null);
    setInviteError(null);
    setSelectedRole("member"); // Reset role to default
    setIsRoleSelectionEnabled(false); // Reset toggle
  };

  return (
    <div className="space-y-6">
      {invitationResult ? (
        // --- Success State: Display Code and Countdown ---
        <div className="bg-green-50 dark:bg-green-900/50 p-8 rounded-xl shadow-lg border border-green-300 dark:border-green-600 text-center space-y-4">
          <Check className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto" />

          <h4 className="text-2xl font-bold text-green-700 dark:text-green-300">
            Invitation Code Generated!
          </h4>

          {invitationResult.role && (
            <p className="text-sm font-semibold text-green-700 dark:text-green-300">
              Role Assigned:{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {capitalizeFirstLetter(invitationResult.role)}
              </span>
            </p>
          )}

          <div className="inline-block p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-green-500">
            <code className="text-3xl font-mono text-gray-900 dark:text-white select-all">
              {invitationResult.code}
            </code>
          </div>
          <CountdownTimer expiresAt={invitationResult.expiresAt} />
          <button
            onClick={handleCreateNewInvite}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center mx-auto mt-4 shadow-md"
            disabled={loading}
          >
            <Mail className="w-5 h-5 mr-2" /> Create Another Invitation
          </button>
        </div>
      ) : (
        // --- Input State: Email and Options ---
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 space-y-6">
          {/* 1. Description and Toggle */}
          <div className="flex justify-between items-center border-b pb-4 border-gray-100 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Configure the invitation link details below.
            </p>
            {/* Role Selection Toggle */}
            <div className="flex items-center space-x-2">
              <Settings2 className="w-5 h-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Set Role?
              </label>

              <button
                onClick={() => setIsRoleSelectionEnabled((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isRoleSelectionEnabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
                }`}
                disabled={loading}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isRoleSelectionEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
          {/* 2. Main Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Input Section */}
            <div className="space-y-2">
              <label
                htmlFor="invite-email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Target Email Address
              </label>

              <CustomInput
                id="invite-email"
                type="email"
                placeholder="Enter member email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className={`w-full border p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition shadow-sm
              ${emailError ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
              `}
                disabled={loading}
                onKeyDown={(e) => handleKeyDown(e, handleInviteSubmit)} // Changed to handleInviteSubmit
              />

              {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
            </div>
            {/* Role Selection Dropdown (Conditionally Rendered) */}
            {isRoleSelectionEnabled && (
              <div className="space-y-2">
                <label
                  htmlFor="role-select"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Assign Role
                </label>

                <select
                  id="role-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                  disabled={loading}
                  className="w-full border p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm border-gray-300 dark:border-gray-600 appearance-none"
                >
                  {AVAILABLE_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {capitalizeFirstLetter(role)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {/* Global Error Message (Separate from Input Error) */}
          {inviteError && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-300 dark:border-red-600">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">{inviteError}</p>
            </div>
          )}
          {/* 3. Action Button (Bottom) */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
            <button
              onClick={handleInviteSubmit}
              disabled={loading || !inviteEmail}
              className="w-full max-w-sm bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Mail className="w-5 h-5 mr-2" />
              )}
              Generate Invitation Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationCodeContent;
