import React from 'react';
import { Truck, DollarSign, AlertTriangle, FileText, TrendingUp } from 'lucide-react';

// This helper component doesn't need to be exported
const StatCard = ({ title, value, change, icon: Icon, iconBg, trendColor }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
      <div className={`p-2 rounded-lg ${iconBg}`}><Icon size={18} /></div>
    </div>
    <div className="text-3xl font-bold text-slate-900 leading-tight">{value}</div>
    <div className={`flex items-center gap-1 mt-2 text-[11px] font-bold ${trendColor}`}>
      {change.includes('+') && <TrendingUp size={14} />} {change}
    </div>
  </div>
);

// ENSURE THIS LINE HAS "export const"
export const OverviewCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Active Rentals" 
        value="1,248" 
        change="+12%" 
        icon={Truck} 
        iconBg="bg-[#0047AB] text-white" 
        trendColor="text-green-600" 
      />
      <StatCard 
        title="Revenue Today" 
        value="$84.5k" 
        change="+4.2%" 
        icon={DollarSign} 
        iconBg="bg-blue-50 text-[#0047AB]" 
        trendColor="text-green-600" 
      />
      <StatCard 
        title="Overdue Items" 
        value="14" 
        change="+2 this week" 
        icon={AlertTriangle} 
        iconBg="bg-red-50 text-red-600" 
        trendColor="text-red-600" 
      />
      <StatCard 
        title="Pending Invoices" 
        value="86" 
        change="No change" 
        icon={FileText} 
        iconBg="bg-slate-100 text-slate-500" 
        trendColor="text-slate-400" 
      />
    </div>
  );
};