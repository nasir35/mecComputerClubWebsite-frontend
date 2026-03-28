"use client";

import { useState, useEffect, Suspense } from "react";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import Head from "next/head";
import axios from "axios";
import ToastNotification, { Toast } from "@/components/ui/shared/ToastNotification";

interface ResetFormState {
  otp: string;
  password: string;
  confirmPassword: string;
}

const ResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  let token = searchParams.get("token");
  const email = searchParams.get("email");
  const [toast, setToast] = useState<Toast | null>(null);
  const [formData, setFormData] = useState<ResetFormState>({
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      setMessage("Please set your new password.");
    }
  }, [token]);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    const verificationCode = token || formData.otp;

    if (formData.password !== formData.confirmPassword) {
      setToast({
        type: "error",
        message: "Passwords do not match.",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setToast({
        type: "error",
        message: "Password must be at least 8 characters long.",
      });
      setIsLoading(false);
      return;
    }
    try {
      if (token === undefined || token === null) {
        token = verificationCode;
      }
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/password/reset`, {
        email: email,
        token: token,
        newPassword: formData.password,
      });
      const data = res.data;
      if (res.status !== 200) {
        setToast({
          type: "error",
          message: data.message || "Failed to reset password. Please try again.",
        });
        setIsLoading(false);
        return;
      }
      setToast({
        type: "success",
        message: "Password reset successful. You can now log in.",
      });
      setIsLoading(false);
      router.push("/login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setToast({
          type: "error",
          message: err.response?.data?.message || "Failed to reset password. Please try again.",
        });
      } else {
        setToast({
          type: "error",
          message: "Failed to reset password. Please try again.",
        });
      }
      console.error("Error resetting password:", err);
      setIsLoading(false);
    }
  };

  // --- Component JSX ---

  return (
    <div
      className="
                min-h-screen flex flex-col items-center justify-center 
                bg-gradient-to-br from-blue-50 to-blue-100 
                dark:from-gray-900 dark:to-gray-800
                px-4 py-8
            "
    >
      <Head>
        <title>New Password | MEC Club</title>
      </Head>

      {/* Reset Password Card */}
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
          <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-blue-100 dark:bg-gray-700 border-4 border-blue-400 dark:border-blue-600 flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl font-bold">
            ⚙️
          </div>
          <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
            Set New Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {token
              ? "Token verified. Enter your new password."
              : "Enter the OTP code and your new password."}
          </p>
        </div>
        {message && (
          <p className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-sm rounded-lg border border-green-300 dark:border-green-700 text-center">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {!token && (
            <input
              type="text"
              id="otp"
              maxLength={6}
              value={formData.otp}
              onChange={handleChange}
              placeholder="Enter 6-digit OTP code"
              required
              className="
                                border rounded-md px-4 py-3 text-center tracking-widest 
                                text-lg font-mono w-full
                                bg-gray-50 dark:bg-gray-800 
                                text-gray-900 dark:text-gray-100 
                                border-gray-300 dark:border-gray-600
                                focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 
                                outline-none transition
                            "
            />
          )}

          {/* New Password Input */}
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="New Password (min 8 chars)"
              value={formData.password}
              onChange={handleChange}
              required
              className="
                                w-full pl-12 pr-12 py-3 border rounded-md
                                bg-gray-50 dark:bg-gray-800 
                                text-gray-900 dark:text-gray-100 
                                border-gray-300 dark:border-gray-600
                                focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 
                                outline-none transition
                            "
            />
            <div
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-500 transition"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="
                                w-full pl-12 pr-12 py-3 border rounded-md
                                bg-gray-50 dark:bg-gray-800 
                                text-gray-900 dark:text-gray-100 
                                border-gray-300 dark:border-gray-600
                                focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 
                                outline-none transition
                            "
            />
          </div>

          {/* Submit Button */}
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
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
      </div>
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

const ResetPassword: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPassword;
