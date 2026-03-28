"use client";

import { Plus, Save, FormInput, Info, Calendar, XOctagonIcon, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { FormField } from "@/lib/types/form";
import FieldEditor from "./FieldEditor";
import axios from "axios";
import { useRouter } from "next/navigation";

const initialForm = {
  title: "",
  description: "",
  eventId: "",
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
};

export default function FormBuilder() {
  const router = useRouter();
  const [formInfo, setFormInfo] = useState(initialForm);
  const [fields, setFields] = useState<FormField[]>([]);
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    // Fetch existing events for association
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events`, {
          withCredentials: true,
        });
        setEvents(res.data.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);
  const addField = () =>
    setFields([...fields, { label: "", name: "", placeholder: "", type: "text", required: false }]);

  const handleChange = (updated: FormField, i: number) => {
    setFields(fields.map((x, idx) => (idx === i ? updated : x)));
  };
  const handleDiscard = () => {
    setFormInfo(initialForm);
    setFields([]);
  };

  const handleCancelFormCreation = () => {
    router.push("/dashboard/manage-events");
  };

  const submit = async () => {
    let res;
    try {
      const nameCount: Record<string, number> = {};
      const updatedFields = fields.map((field) => {
        if (!field.name && field.label) {
          const count = nameCount[field.label] || 0;
          nameCount[field.label] = count + 1;
          const fieldName =
            count === 0
              ? `${field.label.replaceAll(" ", "_").toLowerCase()}`
              : `${field.label.replaceAll(" ", "_").toLowerCase()}_${count + 1}`;
          return { ...field, name: fieldName };
        }
        return field;
      });
      setFields(updatedFields);
      const formData = { ...formInfo, fields: updatedFields };

      // console.log("Submitting form data:", formData);

      res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/forms`, formData, {
        withCredentials: true,
      });
      console.log("Form saved successfully!", res.data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
              <FormInput className="text-blue-600" />
              Form Builder
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Design and deploy custom registration forms.
            </p>
          </div>
          <button
            onClick={submit}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Save size={18} />
            Save Form
          </button>
        </div>

        {/* --- CONFIGURATION CARD --- */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Info size={14} /> Form Title
              </label>
              <input
                placeholder="e.g., Workshop Registration"
                value={formInfo.title}
                onChange={(e) => setFormInfo({ ...formInfo, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar size={14} /> Associated Event ID
              </label>
              <select
                value={formInfo.eventId}
                onChange={(e) => setFormInfo({ ...formInfo, eventId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="">Select an event</option>
                <option value="111111111111111111111111">Independent Form</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title.slice(0, 25)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar size={14} /> Start Date
              </label>
              <input
                type="date"
                value={formInfo.startDate}
                onChange={(e) => setFormInfo({ ...formInfo, startDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar size={14} /> Closing Date
              </label>
              <input
                type="date"
                value={formInfo.endDate}
                onChange={(e) => setFormInfo({ ...formInfo, endDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              placeholder="Tell your attendees what this form is for..."
              value={formInfo.description}
              onChange={(e) => setFormInfo({ ...formInfo, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
            />
          </div>
        </div>

        {/* --- DYNAMIC FIELDS SECTION --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white px-2">Form Fields</h3>

          {fields.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <p className="text-gray-500">
                No fields added yet. Start by clicking Add Field below.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((f, i) => (
                <FieldEditor
                  key={i}
                  field={f}
                  onChange={(updated) => handleChange(updated, i)}
                  onRemove={() => setFields(fields.filter((_, idx) => idx !== i))}
                />
              ))}
            </div>
          )}

          <button
            onClick={addField}
            className="w-full py-4 border-2 border-dashed border-blue-200 dark:border-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 font-medium flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
          >
            <Plus size={20} />
            Add New Form Field
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={submit}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Save size={18} />
            Save Form
          </button>
          <button
            onClick={handleDiscard}
            className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/20 active:scale-95"
          >
            <RotateCcw size={18} />
            Discard Changes
          </button>
          <button
            onClick={handleCancelFormCreation}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-red-500/20 active:scale-95"
          >
            <XOctagonIcon size={18} />
            Cancel Form Creation
          </button>
        </div>
      </div>
    </div>
  );
}
