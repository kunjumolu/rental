import React from 'react';
import { Calendar, MoreHorizontal } from 'lucide-react';
import { OverviewCards } from '../components/OverviewCards';
import { RevenueChart } from '../components/RevenueChart';
import { AttentionRequired } from '../components/AttentionRequired';
import { RecentActivity } from '../components/RecentActivity'; // Assuming you have this component

export const Dashboard = () => {
  return (
    <div className="p-4 md:p-8 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time metrics and asset performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm text-slate-700">
            <Calendar size={16} className="text-slate-400" /> Last 30 Days
          </button>
          <button className="bg-white border border-slate-200 p-2 rounded-lg shadow-sm">
            <MoreHorizontal size={18} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* 1. Overview Cards Component */}
      <OverviewCards />

      {/* 2. Middle Grid: Chart and Attention Box */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <AttentionRequired />
        </div>
      </div>

      {/* 3. Recent Activity Component */}
      <RecentActivity />
    </div>
  );
};
export default Dashboard;