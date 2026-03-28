"use client";

import { Trash2, GripVertical, List, Settings2 } from "lucide-react";
import { FormField, FieldType } from "@/lib/types/form";
import OptionEditor from "./OptionEditor";

interface Props {
  field: FormField;
  onChange: (field: FormField) => void;
  onRemove: () => void;
}

const FIELD_TYPES: FieldType[] = [
  "text",
  "number",
  "email",
  "textarea",
  "select",
  "radio",
  "checkbox",
];

export default function FieldEditor({ field, onChange, onRemove }: Props) {
  // Helper to update specific keys
  const update = (key: keyof FormField, value: unknown) =>
    onChange({ ...field, [key]: value } as FormField);

  const needsOptions = ["select", "radio", "checkbox"].includes(field.type);

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500/50 transition-all duration-200 overflow-hidden">
      {/* --- TOP DRAG & ACTIONS BAR --- */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-gray-400">
          <GripVertical size={18} className="cursor-grab active:cursor-grabbing" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Field Configuration
          </span>
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* --- MAIN INPUTS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">
              Label Name
            </label>
            <input
              placeholder="e.g. Your Full Name"
              value={field.label}
              onChange={(e) => update("label", e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">
              Place Holder Text
            </label>
            <input
              placeholder="017xxxxxxxxxx"
              value={field.placeholder || ""}
              onChange={(e) => update("placeholder", e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-mono"
            />
          </div>
        </div>

        {/* --- TYPE & SETTINGS --- */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={field.type}
                onChange={(e) => update("type", e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium border border-blue-100 dark:border-blue-800 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
              <Settings2
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer group/toggle">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => update("required", e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Required</span>
            </label>
          </div>
        </div>

        {/* --- CONDITIONAL OPTIONS SECTION --- */}
        {needsOptions && (
          <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-300">
              <List size={16} className="text-blue-500" />
              <h4 className="text-sm font-bold">Configure Options</h4>
            </div>
            <OptionEditor
              options={field.options || []}
              onChange={(opts) => update("options", opts)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
