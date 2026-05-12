import React from 'react';
import { AlertTriangle, Users, FileText } from 'lucide-react';

// Use "export const" here to match the import in Dashboard.jsx
export const AttentionRequired = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900">Attention Required</h3>
          <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
        </div>
      </div>
      <div className="space-y-4">
        {/* Items */}
        <div className="p-3 rounded-lg flex gap-3 border bg-red-50 border-red-100">
          <div className="p-2 h-fit rounded bg-red-100 text-red-600"><AlertTriangle size={16} /></div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Excavator EX-204 Maintenance</h4>
            <p className="text-[11px] text-slate-500 mt-1">Scheduled for Oct 12.</p>
          </div>
        </div>
        {/* Add more items as needed */}
      </div>
    </div>
  );
};