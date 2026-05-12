import React from 'react';

// ENSURE THIS LINE STARTS WITH "export const"
export const RecentActivity = () => {
  const activities = [
    { id: 'HT-8820', customer: 'BuildCorp Industries', status: 'Active', date: 'Oct 24, 2023', value: '$1,200.00', color: 'bg-green-100 text-green-700' },
    { id: 'CR-1044', customer: 'Metro Developments', status: 'Returned', date: 'Oct 24, 2023', value: '$850.00', color: 'bg-slate-100 text-slate-600' },
    { id: 'EX-204', customer: 'Apex Construction', status: 'Maintenance', date: 'Oct 23, 2023', value: '--', color: 'bg-red-100 text-red-700' },
    { id: 'LD-991', customer: 'Summit Properties', status: 'Active', date: 'Oct 23, 2023', value: '$3,400.00', color: 'bg-green-100 text-green-700' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-900">Recent Activity</h3>
        <button className="text-[#0047AB] text-xs font-bold hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Asset ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {activities.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">{row.id}</td>
                <td className="px-6 py-4 text-slate-600">{row.customer}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${row.color}`}>
                    <span className={`w-1 h-1 rounded-full ${row.color.split(' ')[1].replace('text', 'bg')}`}></span>
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{row.date}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};