/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  Share2,
  Layers,
  AlertCircle,
} from "lucide-react";
import { defaultState, IHomePageData } from "@/lib/types/homePage";

export default function HomePageEditor({ initialData }: { initialData?: Partial<IHomePageData> }) {
  // Merge initial data with defaults
  const [formData, setFormData] = useState<IHomePageData>({ ...defaultState, ...initialData });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // --- Handlers ---

  // 1. Generic Deep Update Handler (for nested objects like heroSection.stats)
  const updateField = (path: string, value: unknown) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const keys = path.split(".");
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;

      return newData;
    });
  };

  // 2. Array Handlers (for featuredData)
  const addArrayItem = (category: keyof IHomePageData["featuredData"]) => {
    setFormData((prev) => ({
      ...prev,
      featuredData: {
        ...prev.featuredData,
        [category]: [...prev.featuredData[category], ""],
      },
    }));
  };

  const removeArrayItem = (category: keyof IHomePageData["featuredData"], index: number) => {
    setFormData((prev) => ({
      ...prev,
      featuredData: {
        ...prev.featuredData,
        [category]: prev.featuredData[category].filter((_, i) => i !== index),
      },
    }));
  };

  const updateArrayItem = (
    category: keyof IHomePageData["featuredData"],
    index: number,
    value: string
  ) => {
    const newArray = [...formData.featuredData[category]];
    newArray[index] = value;
    setFormData((prev) => ({
      ...prev,
      featuredData: { ...prev.featuredData, [category]: newArray },
    }));
  };

  // 3. Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Replace with your actual Server Action or API call
      console.log("Saving Payload:", JSON.stringify(formData, null, 2));

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage({ type: "success", text: "Homepage updated successfully!" });
    } catch (error: unknown) {
      setMessage({ type: "error", text: "Failed to update homepage." });
      console.log("error: ", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Reusable UI Components ---

  const SectionHeader = ({ icon: Icon, title, color = "text-slate-800" }: any) => (
    <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
      <Icon className={`w-5 h-5 ${color}`} />
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
    </div>
  );

  const InputGroup = ({ label, path, placeholder, type = "text", multiline = false }: any) => {
    const value = path.split(".").reduce((o: any, i: string) => o?.[i], formData);
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
          {label}
        </label>
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => updateField(path, e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) =>
              updateField(path, type === "number" ? Number(e.target.value) : e.target.value)
            }
            placeholder={placeholder}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
          />
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">CMS Editor</h1>
          <p className="text-xs text-slate-500">Manage Home Page Content</p>
        </div>
        <div className="flex items-center gap-4">
          {message && (
            <span
              className={`text-sm font-medium ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message.text}
            </span>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? <span className="animate-spin">⏳</span> : <Save size={18} />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* SECTION 1: HERO */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <SectionHeader icon={LayoutDashboard} title="Hero Section" color="text-blue-600" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <InputGroup
              label="Main Title"
              path="heroSection.title"
              placeholder="e.g. MEC Computer Club"
            />
            <InputGroup
              label="Subtitle"
              path="heroSection.subtitle"
              placeholder="e.g. Innovate. Build. Inspire."
            />
            <div className="md:col-span-2">
              <InputGroup
                label="Background Image URL"
                path="heroSection.bgImgUrl"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Nested: Stats */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Users size={16} /> Impact Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InputGroup label="Members" path="heroSection.stats.members" type="number" />
              <InputGroup label="Projects" path="heroSection.stats.totalProjects" type="number" />
              <InputGroup label="Total Events" path="heroSection.stats.totalEvents" type="number" />
              <InputGroup
                label="Events/Year"
                path="heroSection.stats.eventsPerYear"
                type="number"
              />
            </div>
          </div>

          {/* Nested: Links */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <LinkIcon size={16} /> Call to Action Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup
                label="'Join' Button URL"
                path="heroSection.links.join"
                placeholder="/join"
              />
              <InputGroup
                label="'Events' Button URL"
                path="heroSection.links.events"
                placeholder="/events"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: INTRO */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <SectionHeader icon={FileText} title="Introduction Section" color="text-indigo-600" />
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup
                label="Section Label"
                path="introSection.label"
                placeholder="e.g. Who We Are"
              />
              <InputGroup
                label="Main Heading"
                path="introSection.title"
                placeholder="e.g. A Community of Developers"
              />
            </div>
            <InputGroup
              label="Description Text"
              path="introSection.description"
              multiline
              placeholder="Write a short paragraph..."
            />
            <InputGroup
              label="Side Image URL"
              path="introSection.imgUrl"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* SECTION 3: FEATURED DATA (Dynamic Arrays) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <SectionHeader
            icon={Layers}
            title="Featured Content References"
            color="text-purple-600"
          />
          <p className="text-sm text-slate-500 mb-6 bg-blue-50 p-3 rounded border border-blue-100 flex items-start gap-2">
            <AlertCircle size={16} className="text-blue-600 mt-0.5" />
            Manage the content displayed on the home page by pasting the{" "}
            <strong>MongoDB Object IDs</strong> of the respective items below.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Reusable List Builder for each Category */}
            {[
              { key: "events", label: "Featured Events", icon: LayoutDashboard },
              { key: "projects", label: "Top Projects", icon: Layers },
              { key: "blogs", label: "Latest Blogs", icon: FileText },
              { key: "gallery", label: "Gallery Highlights", icon: ImageIcon },
              { key: "sponsors", label: "Our Sponsors", icon: Share2 },
            ].map((section) => (
              <div key={section.key} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 capitalize">
                    <section.icon size={16} /> {section.label}
                  </h3>
                  <button
                    type="button"
                    onClick={() => addArrayItem(section.key as any)}
                    className="text-xs bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-2 py-1 rounded shadow-sm flex items-center gap-1 transition"
                  >
                    <Plus size={12} /> Add ID
                  </button>
                </div>

                <div className="space-y-2">
                  {(
                    formData.featuredData[section.key as keyof typeof formData.featuredData] || []
                  ).map((id, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={id}
                        onChange={(e) => updateArrayItem(section.key as any, index, e.target.value)}
                        placeholder={`Paste ${section.label.slice(0, -1)} ID...`}
                        className="flex-1 text-xs font-mono p-2 rounded border border-slate-300 focus:border-blue-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem(section.key as any, index)}
                        className="text-slate-400 hover:text-red-500 p-1.5 transition"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {formData.featuredData[section.key as keyof typeof formData.featuredData]
                    .length === 0 && (
                    <div className="text-xs text-slate-400 italic text-center py-2 border border-dashed border-slate-300 rounded">
                      No items added yet.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
