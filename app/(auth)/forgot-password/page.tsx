"use client";

import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Head from "next/head";
import axios from "axios";

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Handlers ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/password/request`,
        { email }
      );
      const data = res.data;

      if (res.status !== 200) {
        setError(data.message || "Could not find an account with that email address.");
        setIsLoading(false);
        return;
      }
      setMessage("A reset link has been sent to your email.");
      setIsLoading(false);
      router.push("/reset-password?email=" + encodeURIComponent(email));
    } catch (err) {
      console.error("Error requesting password reset:", err);
      setError("A server error occurred. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    // Global Container: Same styling as login/invite page
    <div
      className="
                min-h-screen flex flex-col items-center justify-center 
                bg-gradient-to-br from-blue-50 to-blue-100 
                dark:from-gray-900 dark:to-gray-800
                px-4 py-8
            "
    >
      <Head>
        <title>Forgot Password | MEC Club</title>
      </Head>

      {/* Request Card */}
      <div
        className="
                    w-full max-w-md 
                    bg-white dark:bg-gray-900 
                    p-8 rounded-xl shadow-xl border 
                    border-gray-200 dark:border-gray-700
                "
      >
        {/* Header Section */}
        <div className="text-center mb-8">
          {/* Placeholder for Logo/Animation */}
          <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-blue-100 dark:bg-gray-700 border-4 border-blue-400 dark:border-blue-600 flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl font-bold">
            📧
          </div>
          <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
            Reset Your Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Enter your email address below and we will send you a password reset link and OTP code.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <p className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-300 dark:border-red-700 text-center">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-sm rounded-lg border border-green-300 dark:border-green-700 text-center">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          {/* Email Input */}
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email Address"
              required
              className="
                                w-full pl-12 pr-4 py-3 border rounded-md
                                bg-gray-50 dark:bg-gray-800 
                                text-gray-900 dark:text-gray-100 
                                border-gray-300 dark:border-gray-600
                                focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 
                                outline-none transition
                            "
            />
          </div>

          {/* Submit Button (Same primary blue style) */}
          <button
            type="submit"
            disabled={isLoading}
            className="
                            bg-blue-600 dark:bg-blue-700 
                            text-white py-2 rounded-md font-semibold
                            hover:bg-blue-700 dark:hover:bg-blue-800 
                            transition
                            disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                        "
          >
            {isLoading ? "Sending Request..." : "Send Reset Link"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <a href="/login" className="text-gray-700 dark:text-gray-300 hover:underline text-sm">
            Remembered your password? Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
