"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import { Mail, ShieldCheck, AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import axios, { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";
import UnauthorizedPage from "@/components/ui/shared/Unauthorized";

const EmailVerifyForm = () => {
  // States
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [status, setStatus] = useState<"typing" | "verifying" | "success" | "error" | "expired">(
    "typing",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [hasAccess, setHasAccess] = useState(true);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  //validate email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  useEffect(() => {
    if (!email || !isValidEmail(email)) {
      setHasAccess(false);
    }
  }, [email]);

  // OTP Input Handlers
  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value.substring(element.value.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (element.value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData("text");
    // Check if the pasted content is numeric and roughly the right length
    if (!/^\d+$/.test(data)) return;

    const pastedCode = data.slice(0, 6).split("");
    const newOtp = [...otp];

    pastedCode.forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });

    setOtp(newOtp);

    // Focus the last filled input or the last box
    const lastIndex = Math.min(pastedCode.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = otp.join("");
    if (fullCode.length < 6) return;

    setStatus("verifying");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/verify/code`,
        {
          email,
          code: fullCode,
        },
        { withCredentials: true },
      );
      if (res.status === 200) {
        console.log("Email verified successfully");
        setStatus("success");
        console.log(res.data);
      }
    } catch (error: unknown) {
      setStatus("error");
      console.error("Error verifying email:", error);
      const axiosError = error as AxiosError<{ message: string }>;
      setErrorMessage(axiosError.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  if (!hasAccess) {
    return <UnauthorizedPage />;
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8">
        {status !== "success" ? (
          <>
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Verify your email
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                We have sent a 6-digit code to your Email.
              </p>
            </div>

            {/* OTP Box */}
            <div className="flex justify-between gap-1 mb-6">
              {otp.map((data, index) => (
                <input
                  key={index}
                  autoComplete="one-time-code"
                  type="text"
                  maxLength={1}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  value={data}
                  onPaste={handlePaste}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-0 transition-all dark:text-white outline-none"
                />
              ))}
            </div>

            {/* Status Messages */}
            {status === "error" && (
              <div className="flex items-center gap-2 text-red-500 text-sm mb-4 justify-center bg-red-50 dark:bg-red-500/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </div>
            )}

            {status === "expired" && (
              <div className="flex items-center gap-2 text-amber-600 text-sm mb-4 justify-center bg-amber-50 dark:bg-amber-500/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                Your code has expired. Please request a new one.
              </div>
            )}

            {/* Timer & Submit */}
            <div className="text-center mb-8">
              <p className="text-sm text-orange-400">Code will expires in 30 mins</p>
            </div>

            <button
              onClick={handleVerify}
              disabled={status === "verifying" || otp.join("").length < 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {status === "verifying" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Verify Account"
              )}
            </button>
          </>
        ) : (
          /* Success State */
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Email Verified!
            </h1>
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                Your account has been successfully verified and is now{" "}
                <strong>pending admin approval</strong>.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-sm text-left">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="text-slate-500 dark:text-slate-400">
                    An admin will review your registration shortly. You will receive an email
                    notification once your account is activated.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => (window.location.href = "/")}
              className="mt-8 w-full flex items-center justify-center gap-2 text-blue-600 font-semibold hover:underline"
            >
              Return to Home <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const EmailVerifyPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailVerifyForm />
    </Suspense>
  );
};

export default EmailVerifyPage;
