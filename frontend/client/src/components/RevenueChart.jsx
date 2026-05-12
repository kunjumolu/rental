import React from 'react';
import { MoreHorizontal } from 'lucide-react';

// ENSURE THIS LINE STARTS WITH "export const"
export const RevenueChart = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="flex justify-between items-center mb-10">
        <h3 className="font-bold text-slate-900">Revenue vs Time</h3>
        <MoreHorizontal size={18} className="text-slate-300 cursor-pointer" />
      </div>
      <div className="h-64 w-full relative">
        {/* Simple SVG Chart */}
        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,35 L15,30 L30,33 L45,25 L60,20 L75,22 L90,10 L100,8 L100,40 L0,40 Z" fill="url(#chartGradient)" />
          <path d="M0,35 L15,30 L30,33 L45,25 L60,20 L75,22 L90,10 L100,8" fill="none" stroke="#94A3B8" strokeWidth="0.5" />
          {[15, 45, 60, 90].map((x, i) => (
            <circle key={i} cx={x} cy={[30, 25, 20, 10][i]} r="0.8" fill="black" />
          ))}
        </svg>
        <div className="flex justify-between mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>
    </div>
  );
};