"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Users,
  Search,
  Plus,
  FilePlus,
  MoreVertical,
  Video,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

export default function EventsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [forms, setForms] = useState<
    { _id: string; title: string; status: string; startDate: string; endDate: string }[]
  >([]);
  const [events, setEvents] = useState<
    {
      title: string;
      _id: string;
      date: string;
      eventTime: string;
      attendees: [];
      isUpcoming: boolean;
      registrationLink: string;
      location: string;
      status: string;
      description: string;
      category: string;
    }[]
  >([]);
  const tabs = ["All", "Events", "Forms", "Content"];

  useEffect(() => {
    // Fetch forms from API (mocked here)
    const fetchForms = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/forms`);
        const data = response.data.data;
        setForms(data);
      } catch (error) {
        console.error("Error fetching forms:", error);
      }
    };
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events`);
        const data = response.data.data;
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
    fetchForms();
  }, []);

  // Filtering Logic
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "All" || activeTab === "Events";
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab, events]);

  const filteredForms = useMemo(() => {
    return forms.filter((f) => {
      const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "All" || activeTab === "Forms";
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab, forms]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Management Portal
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your upcoming events, digital content, and registration forms.
            </p>
          </div>

          <div className="flex items-center gap-2 pb-2 md:pb-0">
            <Link
              href={"/dashboard/manage-events/create-event"}
              className="flex items-center gap-2 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95"
            >
              <Plus size={18} />
              New Event
            </Link>
            <Link
              href={"/dashboard/manage-events/create-form"}
              className="flex items-center gap-2 whitespace-nowrap bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm"
            >
              <FilePlus size={18} />
              Create Form
            </Link>
          </div>
        </div>

        {/* --- FILTERS & SEARCH --- */}
        <div className="flex flex-col md:flex-row lg:items-center justify-between gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl w-fit border border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, date, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* --- EVENTS GRID --- */}
      {(activeTab === "All" || activeTab === "Events") && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="text-blue-500" size={22} />
              Active Events
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                {filteredEvents.length}
              </span>
            </h3>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event._id}
                  className="group relative bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="absolute top-4 right-4">
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400">
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  <div>
                    <div className="inline-block px-2 py-1 rounded-md bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider mb-4">
                      {event.status}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {event.title}
                    </h3>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2">
                        <Calendar size={14} />
                        {new Date(event.date).toDateString().split(" ").slice(1).join(" ")}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2">
                        <Users size={14} />
                        <span className="font-medium text-gray-900 dark:text-gray-200">
                          {event.attendees.length}
                        </span>{" "}
                        registered
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                    <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                      Manage <ChevronRight size={16} />
                    </button>
                    <button className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <Search className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No matches found for {searchQuery}</p>
            </div>
          )}
        </section>
      )}
      {/* --- EVENTS GRID --- */}
      {(activeTab === "All" || activeTab === "Forms") && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="text-blue-500" size={22} />
              Active Forms
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                {filteredForms.length}
              </span>
            </h3>
          </div>

          {filteredForms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form) => (
                <div
                  key={form._id}
                  className="group relative bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="absolute top-4 right-4">
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400">
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  <div>
                    <div className="inline-block px-2 py-1 rounded-md bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider mb-4">
                      {form.status}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {form.title}
                    </h3>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2">
                        <Calendar size={14} />
                        {new Date(form.endDate).toDateString().split(" ").slice(1).join(" ")}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2">
                        <Users size={14} />
                        <span className="font-medium text-gray-900 dark:text-gray-200">
                          {/* {form.attendees.length} */}
                        </span>{" "}
                        registered
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                    <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                      Manage <ChevronRight size={16} />
                    </button>
                    <button className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <Search className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No matches found for {searchQuery}</p>
            </div>
          )}
        </section>
      )}

      {/* --- CMS QUICK LINKS --- */}
      <section className="pt-8 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Video className="text-green-500" size={22} />
          Media & Tutorials
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CMSCard
            title="Resource Center"
            desc="Update your documentation and video guides."
            icon={<Video className="text-purple-500" />}
            btnText="Open CMS"
            btnColor="bg-purple-600 hover:bg-purple-700"
          />
          <CMSCard
            title="Media Gallery"
            desc="Manage assets, photos, and branding files."
            icon={<ImageIcon className="text-orange-500" />}
            btnText="Upload Media"
            btnColor="bg-orange-500 hover:bg-orange-600"
          />
        </div>
      </section>
    </div>
  );
}

// Reusable Small Component for CMS Cards
interface CMSCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  btnText: string;
  btnColor: string;
}

function CMSCard({ title, desc, icon, btnText, btnColor }: CMSCardProps) {
  return (
    <div className="flex items-center justify-between p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">{icon}</div>
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white">{title}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
        </div>
      </div>
      <button
        className={`${btnColor} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm`}
      >
        {btnText}
      </button>
    </div>
  );
}
