
import React, { useState } from 'react';
import { useApp } from '../App';
import { UserRole } from '../types';

const Payroll: React.FC = () => {
  const { currentUser, employees, addNotification } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  const mockPayroll = [
    { id: '1', employeeId: '1', month: 'May 2024', base: 8500, bonus: 500, tax: 1200, status: 'Paid' },
    { id: '2', employeeId: '2', month: 'May 2024', base: 7200, bonus: 200, tax: 900, status: 'Paid' },
  ];

  const visiblePayroll = currentUser?.role === UserRole.ADMIN 
    ? mockPayroll 
    : mockPayroll.filter(p => p.employeeId === currentUser?.id);

  const handleBatchProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      employees.forEach(emp => {
        addNotification({
          recipientId: emp.id,
          subject: 'Equity Disbursal: May 2024',
          body: `System has successfully processed your equity allocation for the current billing cycle.`,
          type: 'payroll'
        });
      });
      setIsProcessing(false);
      alert('Network sync complete. Payroll processed and notified.');
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-60" />
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Financial Ledger</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
            {currentUser?.role === UserRole.ADMIN 
              ? 'Institutional Equity Management' 
              : 'Personal Asset Distribution Tracking'}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {currentUser?.role === UserRole.EMPLOYEE && (
          <div className="lg:col-span-1 p-10 bg-slate-950 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-slate-800">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all rotate-12">
               <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Net Liquidity (May)</h3>
            <div className="flex items-baseline gap-1 mb-10">
              <span className="text-2xl text-slate-500 font-black">$</span>
              <p className="text-5xl font-black tracking-tighter">6,500<span className="text-lg text-indigo-500/50">.00</span></p>
            </div>
            <div className="space-y-5 pt-8 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base Allocation</span>
                <span className="text-sm font-black text-slate-300">$7,200.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Performance KPI</span>
                <span className="text-sm font-black text-emerald-400">+$200.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tax Provisioning</span>
                <span className="text-sm font-black text-rose-500">-$900.00</span>
              </div>
            </div>
            <button className="w-full mt-12 py-5 bg-white text-slate-950 rounded-3xl font-black text-xs shadow-xl shadow-slate-900/50 hover:bg-slate-50 transition-all active:scale-95 uppercase tracking-widest">
              Secure PDF Export
            </button>
          </div>
        )}

        <div className={`${currentUser?.role === UserRole.ADMIN ? 'lg:col-span-4' : 'lg:col-span-3'} overflow-hidden bg-white border border-slate-200 rounded-[3rem] shadow-sm`}>
           <div className="p-10 border-b border-slate-50 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Transaction Records</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">System-Wide Audit Log Active</p>
              </div>
              {currentUser?.role === UserRole.ADMIN && (
                <button 
                  onClick={handleBatchProcess}
                  disabled={isProcessing}
                  className={`px-10 py-4 text-[10px] font-black uppercase tracking-widest text-white rounded-2xl shadow-2xl transition-all flex items-center gap-3 active:scale-95 ${isProcessing ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
                >
                  {isProcessing ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  )}
                  {isProcessing ? 'Syncing...' : 'Initiate Batch Protocol'}
                </button>
              )}
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-10 py-6">Entity Profile</th>
                    <th className="px-10 py-6">Cycle</th>
                    <th className="px-10 py-6">Disbursement</th>
                    <th className="px-10 py-6">Validation</th>
                    <th className="px-10 py-6 text-right">Records</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {visiblePayroll.map((p) => {
                   const emp = employees.find(e => e.id === p.employeeId);
                   return (
                     <tr key={p.id} className="text-sm group hover:bg-indigo-50/20 transition-all cursor-default">
                        <td className="px-10 py-7">
                           <div className="flex items-center gap-4">
                             <img src={emp?.profilePicture} className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 object-cover shadow-sm group-hover:border-indigo-200 transition-colors" />
                             <div>
                               <p className="font-black text-slate-900 tracking-tight text-base">{emp?.name}</p>
                               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{emp?.employeeId}</p>
                             </div>
                           </div>
                        </td>
                        <td className="px-10 py-7 font-black text-slate-600 uppercase tracking-tighter">{p.month}</td>
                        <td className="px-10 py-7">
                           <div className="flex items-center gap-1">
                             <span className="text-xs text-indigo-400 font-black">$</span>
                             <span className="font-black text-slate-900 text-lg">${(p.base + p.bonus - p.tax).toLocaleString()}</span>
                           </div>
                        </td>
                        <td className="px-10 py-7">
                           <span className="px-5 py-2 text-[10px] font-black bg-emerald-50 text-emerald-700 rounded-2xl uppercase tracking-[0.2em] border border-emerald-100 shadow-sm flex items-center gap-2 w-fit">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             {p.status}
                           </span>
                        </td>
                        <td className="px-10 py-7 text-right">
                           <button className="text-slate-300 hover:text-indigo-600 transition-all p-3 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-indigo-100 border border-transparent hover:border-indigo-100">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                           </button>
                        </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
           {visiblePayroll.length === 0 && (
              <div className="p-20 text-center">
                 <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Financial History Encrypted</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Payroll;
