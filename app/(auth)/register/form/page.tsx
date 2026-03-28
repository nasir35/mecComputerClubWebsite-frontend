"use client";
import React, {
  useState,
  ChangeEvent,
  FormEvent,
  ChangeEventHandler,
  useRef,
  useEffect,
  Suspense,
} from "react";
import { User, Facebook, Github, Linkedin } from "lucide-react";
import ToastNotification, { Toast } from "@/components/ui/shared/ToastNotification";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import LoadingScreen from "@/components/ui/shared/LoadingScreen";

// Placeholder Data for Dropdowns
const DEPARTMENTS = ["CSE", "EEE", "CIVIL"];
const BATCHES = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "13th",
  "14th",
  "15th",
  "16th",
  "17th",
];

// Initial state structure for form data
const formDataInitial = {
  email: "",
  password: "",
  fullName: "",
  studentId: "",
  department: "",
  batch: "",
  session: "",
  passingYear: "",
  isGraduated: false,
  contactNumber: "",
  address: "",
  bio: "",
  facebook: "",
  github: "",
  linkedin: "",
};

// Type for field names to ensure type safety in error tracking (keys from formDataInitial)
type FieldName = keyof typeof formDataInitial;

// Type: Includes all form fields plus 'file' for image validation
type FormErrorKeys = FieldName | "file";

function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [formData, setFormData] = useState(formDataInitial);

  // State for submission status and toast notifications
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [validCode, setValidCode] = useState(true);
  const searchParams = useSearchParams();
  const [validationErrors, setValidationErrors] = useState<Partial<Record<FormErrorKeys, string>>>(
    {},
  );

  const router = useRouter();
  const formId = searchParams.get("formId");
  const code = searchParams.get("code");
  const handleToastClose = () => {
    setToast(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      let res1,
        res2,
        combinedData = {};
      try {
        setIsLoading(true);
        if (formId) {
          res1 = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/forms/${formId}`);
          const data = res1.data.data;
          combinedData = { ...combinedData, ...data };
        } else if (code) {
          res2 = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/invite/?code=${code}`);
          const data = res2.data.data;
          if (data.status !== "consumable") {
            setToast({ message: "Invitation code is not valid.", type: "error" });
            setValidCode(false);
          } else {
            combinedData = { ...combinedData, ...data };
            setValidCode(true);
            console.log(data);
          }
          console.log("combined data: ", combinedData);
        } else {
          setToast({ message: "Form ID or invitation code is missing.", type: "error" });
          setValidCode(false);
        }
      } catch (error) {
        console.log("Error fetching form/invite data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [formId, code]);

  // Refs for focusing on fields that fail validation
  const inputRefs = useRef<
    Partial<Record<FieldName, HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>>
  >({});

  // Helper function to set ref for an input
  const setInputRef =
    (name: FieldName) =>
    (element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null) => {
      if (element) {
        inputRefs.current[name] = element;
      } else {
        delete inputRefs.current[name];
      }
    };

  // --- Validation Logic ---
  const validateField = (name: FieldName, value: string | boolean): string | null => {
    // Shared required check
    if (typeof value === "string" && value.trim() === "") {
      // Allow bio, social links, and address to be empty
      if (!["bio", "facebook", "github", "linkedin", "address"].includes(name)) {
        // passingYear is conditionally handled below
        if (name === "passingYear" && !formData.isGraduated) {
          return null;
        }
        return "This field is required.";
      }
    }

    switch (name) {
      case "fullName":
      case "department":
      case "batch":
        return typeof value === "string" && value.trim() === "" ? "This field is required." : null;

      case "studentId":
        // Student ID validation: Must contain only digits
        if (typeof value === "string" && value.trim() !== "" && !/^\d+$/.test(value)) {
          return "Student ID must contain only digits.";
        }
        return null;

      case "session":
        // Session validation: Required, Must contain only digits and hyphens
        if (typeof value === "string" && value.trim() === "") {
          return "This field is required.";
        }
        if (typeof value === "string" && value.trim() !== "" && !/^[\d-]+$/.test(value)) {
          return "Session must contain only digits and hyphens (e.g., 2018-19).";
        }
        return null;

      case "email":
        if (typeof value === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address.";
        }
        return null;

      case "password":
        if (typeof value === "string" && value.length < 8) {
          return "Password must be at least 8 characters long.";
        }
        return null;

      case "contactNumber":
        // Contact Number validation: Allow optional '+' sign and digits
        if (typeof value === "string" && value.trim() !== "") {
          // Allows optional leading '+' followed by one or more digits
          if (!/^\+?\d+$/.test(value)) {
            return 'Contact number must contain only digits and an optional leading "+".';
          }
          // Simple length check (example: 10-15 digits)
          if (value.replace("+", "").length < 10 || value.replace("+", "").length > 15) {
            return 'Contact number should be between 10 and 15 digits (excluding the "+").';
          }
        }
        return null;

      case "passingYear":
        if (formData.isGraduated && (typeof value !== "string" || value.trim() === "")) {
          return "Passing Year is required for graduates.";
        }
        if (
          typeof value === "string" &&
          value.trim() !== "" &&
          (value.length !== 4 || isNaN(parseInt(value)))
        ) {
          return "Please enter a valid 4-digit year.";
        }
        return null;

      case "facebook":
      case "github":
      case "linkedin":
        if (typeof value === "string" && value.trim() !== "" && !/^https?:\/\/.+/.test(value)) {
          return "Must be a valid URL starting with http:// or https://.";
        }
        return null;

      default:
        return null;
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Partial<Record<FieldName, string>> = {};
    let firstErrorField: FieldName | null = null;

    // Determine which fields belong to the current step
    const fieldsToValidate: FieldName[] = [];
    if (step === 1) {
      fieldsToValidate.push("fullName", "email", "password");
    } else if (step === 2) {
      fieldsToValidate.push(
        "studentId",
        "department",
        "batch",
        "session",
        "contactNumber",
        "address",
      );
      if (formData.isGraduated) {
        fieldsToValidate.push("passingYear");
      }
    } else if (step === 3) {
      fieldsToValidate.push("bio", "facebook", "github", "linkedin");
    }

    // Check fields for the current step
    fieldsToValidate.forEach((name) => {
      const error = validateField(name, formData[name as keyof typeof formData]);
      if (error) {
        errors[name] = error;
        if (!firstErrorField) {
          firstErrorField = name;
        }
      }
    });

    // Update errors only for the fields in the current step
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      // Clear errors for fields in the current step that are now valid
      fieldsToValidate.forEach((name) => {
        if (newErrors[name] && !errors[name]) {
          delete newErrors[name];
        }
      });
      // Add new errors
      return { ...newErrors, ...errors };
    });

    // If errors exist, focus on the first erroneous field
    if (firstErrorField) {
      const inputElement = inputRefs.current[firstErrorField] as HTMLInputElement | undefined;
      if (inputElement) {
        inputElement.focus();
      }
      return false;
    }

    return Object.keys(errors).length === 0;
  };

  // Clear error on input change
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const fieldName = name as FieldName;

    if (type === "checkbox" && name === "isGraduated") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        passingYear: checked ? prev.passingYear : "",
      }));
      // Conditional validation clear/add for passingYear
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (!checked) {
          delete newErrors.passingYear;
        } else if (checked && prev.passingYear) {
          // Re-validate if the field exists but is now required
          const error = validateField("passingYear", prev.passingYear);
          if (error) {
            newErrors.passingYear = error;
          } else {
            delete newErrors.passingYear;
          }
        }
        return newErrors;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));

      const error = validateField(fieldName, value);
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }
        return newErrors;
      });
    }
  };

  // --- Step Navigation & Submission ---

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setToast({
        message: "Please correct the highlighted errors before continuing.",
        type: "error",
      });
    }
  };
  const prevStep = () => currentStep > 1 && setCurrentStep((prev) => prev - 1);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setToast(null);
    setIsLoading(true);

    // Final Validation of all steps (1, 2, and 3)
    const isStep1Valid = validateStep(1);
    const isStep2Valid = validateStep(2);
    const isStep3Valid = validateStep(3);

    // Check required image file
    let fileError: string | undefined;
    if (!imageFile) {
      fileError = "Profile photo is required.";
      setValidationErrors((prev) => ({ ...prev, file: fileError }));
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.file;
        return newErrors;
      });
    }

    // Check all general validations and file requirement
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid || fileError) {
      // Find the first step with an error and navigate to it
      if (!isStep1Valid) setCurrentStep(1);
      else if (!isStep2Valid) setCurrentStep(2);
      else setCurrentStep(3);

      setIsLoading(false);
      setToast({
        message: "Please correct the highlighted errors before submitting.",
        type: "error",
      });
      return;
    }
    try {
      const payload = new FormData();

      // Append the stringified JSON data
      payload.append("data", JSON.stringify(formData));

      // Append the image file. Ensure imageFile is of type `File`.
      if (imageFile) {
        payload.append("image", imageFile);
      }

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/register`,
          payload,
          {
            withCredentials: true,
          },
        );

        if (response.status === 201) {
          setToast({ message: "Registration successful!", type: "success" });
          setFormData(formDataInitial);
          setImageFile(null);
          setPreviewUrl(null);
          setCurrentStep(1);
          router.push(`/register/verify-email?email=${formData.email}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setToast({
            message:
              error.response?.data?.message ||
              error.message ||
              "Registration failed. Please try again.",
            type: "error",
          });
          console.error("Registration error:", error?.response?.data?.message || error.message);
          // Access specific error details if your API provides them
          // console.error(error.response?.data);
        } else {
          console.error("An unexpected error occurred:", error);
        }
      }
    } catch (error) {
      setToast({ message: "An unexpected error occurred during submission.", type: "error" });
      console.error("Submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Image Upload Handlers ---

  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      // Clean up previous URL object to prevent memory leaks
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setImageFile(file);
      // Clear file error if successful
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.file;
        return newErrors;
      });
    } else {
      console.error("Please upload a valid image file.");
      setValidationErrors((prev) => ({
        ...prev,
        file: "Please upload a valid image file (PNG, JPG, GIF).",
      }));
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setImageFile(null);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset file input value to allow the same file to be selected again (to trigger onChange)
    e.target.value = "";
  };

  // Cleanup for object URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  // --- Reusable Error Message Component ---
  const ErrorMessage: React.FC<{ field: FormErrorKeys }> = ({ field }) => {
    const message = validationErrors[field];
    return message ? <p className="mt-1 text-xs text-red-600 font-medium">{message}</p> : null;
  };

  const renderStep = () => {
    switch (currentStep) {
      // --- STEP 1: ACCOUNT & CORE IDENTITY ---
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              1. Account Details
            </h2>

            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name (Required)
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                placeholder="As per official records"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`mt-1 w-full p-3 border ${
                  validationErrors.fullName ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-teal-500 focus:border-teal-500`}
                ref={setInputRef("fullName")}
              />
              <ErrorMessage field="fullName" />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address (Required)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 w-full p-3 border ${
                  validationErrors.email ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-teal-500 focus:border-teal-500`}
                ref={setInputRef("email")}
              />
              <ErrorMessage field="email" />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password (Required)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleInputChange}
                className={`mt-1 w-full p-3 border ${
                  validationErrors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-teal-500 focus:border-teal-500`}
                ref={setInputRef("password")}
              />
              <ErrorMessage field="password" />
            </div>

            <button
              type="button"
              onClick={nextStep}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition"
            >
              Next: Academic Info
            </button>
          </div>
        );

      // --- STEP 2: ACADEMIC & CONTACT DETAILS ---
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              2. Academic & Contact
            </h2>

            {/* Student ID Field (Digits Only, Required) */}
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                Student ID (Digits Only, Required)
              </label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                required
                placeholder="e.g., 1801001"
                value={formData.studentId}
                onChange={handleInputChange}
                className={`mt-1 w-full p-3 border ${
                  validationErrors.studentId ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-teal-500 focus:border-teal-500`}
                ref={setInputRef("studentId")}
              />
              <ErrorMessage field="studentId" />
            </div>

            {/* Department, Batch (Responsive Grid) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department (Required)
                </label>
                <select
                  id="department"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`mt-1 w-full p-3 border ${
                    validationErrors.department ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-teal-500 focus:border-teal-500`}
                  ref={setInputRef("department")}
                >
                  <option value="">Select Dept.</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <ErrorMessage field="department" />
              </div>

              <div>
                <label htmlFor="batch" className="block text-sm font-medium text-gray-700">
                  Batch (Required)
                </label>
                <select
                  id="batch"
                  name="batch"
                  required
                  value={formData.batch}
                  onChange={handleInputChange}
                  className={`mt-1 w-full p-3 border ${
                    validationErrors.batch ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-teal-500 focus:border-teal-500`}
                  ref={setInputRef("batch")}
                >
                  <option value="">Select Batch</option>
                  {BATCHES.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
                <ErrorMessage field="batch" />
              </div>
            </div>

            {/* Session & Graduated Checkbox */}
            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                {/* Session is Required and validated for digits and hyphens */}
                <label htmlFor="session" className="block text-sm font-medium text-gray-700">
                  Session (Digits & Hyphen, Required)
                </label>
                <input
                  id="session"
                  name="session"
                  type="text"
                  required
                  placeholder="e.g., 2018-19"
                  value={formData.session}
                  onChange={handleInputChange}
                  className={`mt-1 w-full p-3 border ${
                    validationErrors.session ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-teal-500 focus:border-teal-500`}
                  ref={setInputRef("session")}
                />
                <ErrorMessage field="session" />
              </div>
              <div className="flex items-center h-full">
                <input
                  id="isGraduated"
                  name="isGraduated"
                  type="checkbox"
                  checked={formData.isGraduated}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                />
                <label
                  htmlFor="isGraduated"
                  className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Are you a graduate?
                </label>
              </div>
            </div>

            {/* Conditional Passing Year Field */}
            {formData.isGraduated && (
              <div>
                <label htmlFor="passingYear" className="block text-sm font-medium text-gray-700">
                  Passing Year (Required for Graduates)
                </label>
                <input
                  id="passingYear"
                  name="passingYear"
                  type="number"
                  required={formData.isGraduated}
                  placeholder="e.g., 2023"
                  value={formData.passingYear}
                  onChange={handleInputChange}
                  className={`mt-1 w-full p-3 border ${
                    validationErrors.passingYear ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-teal-500 focus:border-teal-500`}
                  ref={setInputRef("passingYear")}
                />
                <ErrorMessage field="passingYear" />
              </div>
            )}

            {/* Contact Number Field (+ and Digits) */}
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                placeholder="+8801XXXXXXXXX"
                value={formData.contactNumber}
                onChange={handleInputChange}
                className={`mt-1 w-full p-3 border ${
                  validationErrors.contactNumber ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-teal-500 focus:border-teal-500`}
                ref={setInputRef("contactNumber")}
              />
              <ErrorMessage field="contactNumber" />
            </div>

            {/* Address Field */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address (Optional)
              </label>
              <textarea
                id="address"
                name="address"
                rows={2}
                placeholder="Current mailing address"
                value={formData.address}
                onChange={handleInputChange as ChangeEventHandler<HTMLTextAreaElement>}
                className={`mt-1 w-full p-3 border ${
                  validationErrors.address ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-teal-500 focus:border-teal-500`}
                ref={setInputRef("address")}
              />
              <ErrorMessage field="address" />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="py-2 px-4 rounded-lg text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="py-2 px-4 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition"
              >
                Next: Profile
              </button>
            </div>
          </div>
        );

      // --- STEP 3: IMAGE & SOCIAL LINKS ---
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              3. Profile & Social
            </h2>

            {/* Image Upload Component - Drag and Drop Zone (Required Image) */}
            <div
              className={`flex flex-col items-center p-4 rounded-lg bg-gray-50 border-2 border-dashed ${
                validationErrors.file
                  ? "border-red-500"
                  : isDragOver
                    ? "border-indigo-500"
                    : "border-gray-300"
              } relative transition-all duration-200`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Profile Photo is Required */}
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Profile Photo (Required)
              </label>
              {/* Preview Area */}
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center overflow-hidden border-4 ${
                  isDragOver ? "border-indigo-500" : "border-teal-500"
                } shadow-md mb-4 transition-all duration-200`}
              >
                {previewUrl ? (
                  // Using standard <img> tag
                  <Image
                    src={previewUrl}
                    width={128}
                    height={128}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // Lucide User Icon for placeholder
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              {/* Upload/Drag Text */}
              <p className="text-sm text-gray-500 mb-2 text-center">
                {imageFile
                  ? imageFile.name
                  : isDragOver
                    ? "Drop image here..."
                    : "Drag & drop or click to upload"}
              </p>
              {/* Hidden File Input activated by label */}
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-teal-600 hover:bg-gray-50 transition"
              >
                Choose File
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
              <ErrorMessage field="file" /> {/* Custom file error display */}
              {imageFile && (
                <button
                  type="button"
                  onClick={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    setImageFile(null);
                    setValidationErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.file;
                      return newErrors;
                    });
                  }}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 transition"
                >
                  Remove Photo
                </button>
              )}
            </div>

            {/* Bio Field */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio / About Me (Optional)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                placeholder="Tell us a little about yourself (optional)"
                value={formData.bio}
                onChange={handleInputChange as ChangeEventHandler<HTMLTextAreaElement>}
                className={`mt-1 w-full p-3 border ${
                  validationErrors.bio ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-teal-500 focus:border-teal-500`}
                ref={setInputRef("bio")}
              />
              <ErrorMessage field="bio" />
            </div>

            {/* Social Links */}
            <h3 className="text-md font-medium text-gray-800 pt-2">
              Social Links (Optional, Must be valid URLs)
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Facebook className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" />
                <div className="flex-grow">
                  <input
                    type="url"
                    placeholder="Facebook Profile URL"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    className={`p-3 w-full border ${
                      validationErrors.facebook ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-teal-500 focus:border-teal-500`}
                    ref={setInputRef("facebook")}
                  />
                  <ErrorMessage field="facebook" />
                </div>
              </div>
              <div className="flex items-center">
                <Github className="w-5 h-5 mr-3 text-gray-800 flex-shrink-0" />
                <div className="flex-grow">
                  <input
                    type="url"
                    placeholder="GitHub Profile URL"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    className={`p-3 w-full border ${
                      validationErrors.github ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-teal-500 focus:border-teal-500`}
                    ref={setInputRef("github")}
                  />
                  <ErrorMessage field="github" />
                </div>
              </div>
              <div className="flex items-center">
                <Linkedin className="w-5 h-5 mr-3 text-blue-700 flex-shrink-0" />
                <div className="flex-grow">
                  <input
                    type="url"
                    placeholder="LinkedIn Profile URL"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className={`p-3 w-full border ${
                      validationErrors.linkedin ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-teal-500 focus:border-teal-500`}
                    ref={setInputRef("linkedin")}
                  />
                  <ErrorMessage field="linkedin" />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={prevStep}
                disabled={isLoading}
                className="py-2 px-4 rounded-lg text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>

              {/* FINAL SUBMIT BUTTON with Loading State */}
              <button
                type="submit"
                disabled={isLoading}
                className={`py-3 px-4 rounded-lg text-sm font-semibold text-white transition duration-300 shadow-lg ${
                  isLoading
                    ? "bg-teal-400 cursor-not-allowed flex items-center justify-center"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                {isLoading ? "Processing..." : "Complete Registration"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return <LoadingScreen></LoadingScreen>;
  }

  if (!validCode) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-100 p-4">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Invalid Registration Code</h1>
          <p className="mt-2 text-sm text-gray-600 mb-12">
            Please enter a valid registration code.
          </p>
          <div className="flex items-center gap-2 justify-center text-gray-900">
            <Link
              href="/register"
              className="mt-4 inline-block text-white hover:text-gray-100 font-medium px-10 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="mt-4 ml-4 inline-block text-gray-600 hover:text-gray-500 font-medium px-10 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 antialiased">
      {/* Registration Card Container */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 sm:p-10 transition-all duration-300">
        {/* Header and Step Indicator */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Member Registration</h1>
          <p className="mt-2 text-sm text-gray-600">Step {currentStep} of 3</p>
          <div className="mt-4 flex justify-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-1 rounded-full ${
                  currentStep >= step ? "bg-teal-600" : "bg-gray-300"
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Form Container - BINDING THE SUBMIT HANDLER HERE */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {renderStep()}
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already registered?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setToast({ message: "Redirecting to login page...", type: "info" });
              }}
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>

      {toast && (
        <ToastNotification type={toast?.type} message={toast?.message} onClose={handleToastClose} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RegistrationForm />
    </Suspense>
  );
}
