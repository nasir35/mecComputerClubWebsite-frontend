"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import inviteAnimation from "@/public/animation/invite.json";
import axios from "axios";

export default function InvitationPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (inviteCode.length !== 6) {
      setError("Invitation code must be 6 characters long.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/invite/verify`,
        { code: inviteCode },
        { withCredentials: true }
      );

      const data = res.data;
      console.log(data);

      if (res.status !== 200) {
        setError(data.message || "Invalid invitation code");
        setLoading(false);
        return;
      }
      //will send formId and code
      router.push("/register/form?formId=" + data.formId + "&code=" + inviteCode);
    } catch (err) {
      console.log("Error verifying invitation code:", err);
      setError("Something went wrong!");
      setLoading(false);
    }
  };

  return (
    <div
      className="
      min-h-screen flex flex-col items-center justify-center 
      bg-gradient-to-br from-blue-50 to-blue-100 
      dark:from-gray-900 dark:to-gray-800
      px-4
    "
    >
      <div
        className="
        w-full max-w-md 
        bg-white dark:bg-gray-900 
        p-8 rounded-xl shadow-xl border 
        border-gray-200 dark:border-gray-700
      "
      >
        {/* Animated Image */}
        <div className="w-48 mx-auto mb-4">
          <Lottie animationData={inviteAnimation} loop />
        </div>

        <h1 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Enter Invitation Code
        </h1>

        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          You need a valid 6-digit invitation code to continue.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            maxLength={6}
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-digit code"
            className="
              border rounded-md px-4 py-2 text-center tracking-widest 
              text-lg font-mono
              bg-gray-50 dark:bg-gray-800 
              text-gray-900 dark:text-gray-100 
              border-gray-300 dark:border-gray-600
              focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 
              outline-none transition
            "
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="
              bg-blue-600 dark:bg-blue-700 
              text-white py-2 rounded-md 
              hover:bg-blue-700 dark:hover:bg-blue-800 
              transition
            "
          >
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <a
            href="/contact-us"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Don’t have an invitation code? Contact us
          </a>
          <br />
          <a href="/login" className="text-gray-700 dark:text-gray-300 hover:underline text-sm">
            Already have an account? Login
          </a>
        </div>
      </div>
    </div>
  );
}
