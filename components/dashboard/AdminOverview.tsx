"use client";
import React, { useEffect } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import {
  Users,
  ClipboardCheck,
  Calendar,
  FileText,
  Zap,
  MessageSquare,
  GalleryHorizontal,
  HardHat,
} from "lucide-react";
import { MOCK_MESSAGES } from "@/lib/data/mockData";
import axios from "axios";
import { useAuth } from "@/lib/context/AuthContext";
import { DashboardStats } from "@/lib/types";
import Link from "next/link";

export default function AdminOverview() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/admin-stats`,
          {
            withCredentials: true,
          }
        );
        setStats(res.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold text-gray-900 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">
        Platform Health Overview
      </h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Members"
          value={stats?.membership.totalMembers}
          icon={Users}
          colorClass="text-blue-500"
          link="members"
        />
        <DashboardCard
          title="Pending Applications"
          value={stats?.membership.pendingApplications}
          icon={ClipboardCheck}
          colorClass="text-red-500"
          link="@/dashboard/members/pending"
        />
        <DashboardCard
          title="Upcoming Events"
          value={stats?.activities.upcomingEvents}
          icon={Calendar}
          colorClass="text-green-500"
          link="events-management"
        />
        <DashboardCard
          title="Total Certificates"
          value={stats?.activities.totalCertificates}
          icon={FileText}
          colorClass="text-yellow-500"
        />
      </div>

      {/* Action Center & Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-600" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition border border-gray-200 dark:border-gray-700">
              <Calendar className="w-6 h-6 text-blue-600 mb-1" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Create Event
              </span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition border border-gray-200 dark:border-gray-700">
              <Users className="w-6 h-6 text-blue-600 mb-1" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Approve Members
              </span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition border border-gray-200 dark:border-gray-700">
              <GalleryHorizontal className="w-6 h-6 text-blue-600 mb-1" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Upload Media
              </span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition border border-gray-200 dark:border-gray-700">
              <HardHat className="w-6 h-6 text-blue-600 mb-1" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Manage Assets
              </span>
            </button>
            <Link
              href={"dashboard/overview/home-page-edit"}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition border border-gray-200 dark:border-gray-700"
            >
              <HardHat className="w-6 h-6 text-blue-600 mb-1" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Home Page Editor
              </span>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-yellow-600" /> Recent Messages
          </h3>
          <ul className="space-y-3">
            {MOCK_MESSAGES.map((msg) => (
              <li
                key={msg.id}
                className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer"
              >
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {msg.subject}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  From: {msg.sender} ({msg.priority})
                </p>
              </li>
            ))}
            <li className="text-center pt-2">
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                View All Messages
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
