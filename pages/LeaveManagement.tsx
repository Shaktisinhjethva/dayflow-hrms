
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { UserRole, LeaveStatus, LeaveRequest } from '../types';

const LeaveManagement: React.FC = () => {
  const { currentUser, leaves, addLeave, updateLeaveStatus, employees } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newLeave, setNewLeave] = useState<Partial<LeaveRequest>>({
    type: 'Paid',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) return;
    
    const leave: LeaveRequest = {
      id: `leave_${Date.now()}`,
      employeeId: currentUser!.id,
      type: newLeave.type as any,
      startDate: newLeave.startDate!,
      endDate: newLeave.endDate!,
      reason: newLeave.reason!,
      status: LeaveStatus.PENDING
    };
    addLeave(leave);
    setIsModalOpen(false);
    setNewLeave({ type: 'Paid', startDate: '', endDate: '', reason: '' });
  };

  const filteredLeaves = currentUser?.role === UserRole.ADMIN 
    ? leaves 
    : leaves.filter(l => l.employeeId === currentUser?.id);

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startOffset = firstDayOfMonth(year, month);
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentDate]);

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + direction)));
  };

  const getLeavesForDate = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return filteredLeaves.filter(l => dStr >= l.startDate && dStr <= l.endDate);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Dynamic Header */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-40 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Time-Off Protocols</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            Institutional Scheduling & Absence Ledger
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative z-10">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex-1 sm:flex-none px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Matrix
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`flex-1 sm:flex-none px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Calendar
            </button>
          </div>

          {currentUser?.role === UserRole.EMPLOYEE && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 text-white bg-slate-900 rounded-2xl shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Apply Protocol
            </button>
          )}
        </div>
      </header>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLeaves.length > 0 ? (
            filteredLeaves.map((leave) => {
              const emp = employees.find(e => e.id === leave.employeeId);
              const statusColors = {
                [LeaveStatus.PENDING]: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-50',
                [LeaveStatus.APPROVED]: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50',
                [LeaveStatus.REJECTED]: 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-50'
              };

              return (
                <div key={leave.id} className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={emp?.profilePicture} className="w-12 h-12 rounded-2xl object-cover bg-slate-100 border border-slate-200" alt="" />
                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${leave.status === LeaveStatus.APPROVED ? 'bg-emerald-500' : leave.status === LeaveStatus.PENDING ? 'bg-amber-400' : 'bg-rose-500'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{emp?.name}</p>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{leave.type} Leave</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8 flex-1">
                    <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-3xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Span</span>
                        <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusColors[leave.status]}`}>
                          {leave.status}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs font-black text-slate-900">
                        <span className="font-mono">{leave.startDate}</span>
                        <div className="flex-1 h-px bg-slate-200 mx-4 relative">
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 bg-white border border-slate-100 rounded-full">
                              <svg className="w-2.5 h-2.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7" /></svg>
                           </div>
                        </div>
                        <span className="font-mono">{leave.endDate}</span>
                      </div>
                    </div>

                    <div className="p-5 border border-indigo-50 bg-indigo-50/10 rounded-3xl min-h-[80px]">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                        Request Context
                      </p>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{leave.reason}"</p>
                    </div>
                  </div>

                  {currentUser?.role === UserRole.ADMIN && leave.status === LeaveStatus.PENDING && (
                    <div className="flex gap-3 pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => updateLeaveStatus(leave.id, LeaveStatus.APPROVED)}
                        className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-emerald-500 rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                      >
                        Authorize
                      </button>
                      <button 
                        onClick={() => updateLeaveStatus(leave.id, LeaveStatus.REJECTED)}
                        className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-rose-500 rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 active:scale-95"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  {leave.adminComment && (
                    <div className="mt-4 p-3 bg-slate-50 border-l-4 border-indigo-500 rounded-r-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Admin Feedback</p>
                      <p className="text-[11px] text-slate-600 font-bold mt-1">{leave.adminComment}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-24 text-center">
               <div className="inline-block p-8 bg-slate-50 rounded-[3rem] border border-slate-100 mb-6">
                  <svg className="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Zero Active Absence Logs</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="p-6 md:p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {currentDate.toLocaleString('default', { month: 'long' })} <span className="text-indigo-600">{currentDate.getFullYear()}</span>
              </h3>
              <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200">
                <button onClick={() => navigateMonth(-1)} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => navigateMonth(1)} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
               {[
                 { label: 'Authorized', color: 'bg-emerald-500' },
                 { label: 'Pending', color: 'bg-amber-400' },
                 { label: 'Declined', color: 'bg-rose-500' }
               ].map(dot => (
                 <div key={dot.label} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl">
                    <div className={`w-2 h-2 rounded-full ${dot.color}`} />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{dot.label}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/20">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {calendarDays.map((date, idx) => {
                  if (!date) return <div key={idx} className="h-32 md:h-44 border-b border-r border-slate-50 bg-slate-50/5" />;
                  const dayLeaves = getLeavesForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <div key={idx} className={`h-32 md:h-44 p-3 border-b border-r border-slate-100 transition-all hover:bg-indigo-50/30 ${isToday ? 'bg-indigo-50/20' : ''}`}>
                      <span className={`text-xs font-black ${isToday ? 'bg-indigo-600 text-white w-7 h-7 flex items-center justify-center rounded-lg shadow-lg' : 'text-slate-400'}`}>
                        {date.getDate()}
                      </span>
                      <div className="mt-3 space-y-1 overflow-y-auto no-scrollbar h-[calc(100%-2rem)]">
                        {dayLeaves.map((l, lIdx) => {
                          const emp = employees.find(e => e.id === l.employeeId);
                          const colorClass = l.status === LeaveStatus.APPROVED ? 'bg-emerald-500' : l.status === LeaveStatus.PENDING ? 'bg-amber-400' : 'bg-rose-500';
                          return (
                            <div key={lIdx} className={`p-2 rounded-xl text-[9px] font-black text-white shadow-sm flex items-center gap-2 truncate ${colorClass} animate-in slide-in-from-right-2 duration-300`}>
                               <img src={emp?.profilePicture} className="w-4 h-4 rounded-full border border-white/20 shrink-0" alt="" />
                               <span className="truncate">{emp?.name || 'User'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="lg:hidden p-4 bg-slate-50/80 text-center border-t border-slate-100">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                Swipe Horizontally for Protocol Timeline
             </p>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
          <div className="w-full max-w-lg bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-950 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Request Temporal Leave</h3>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Institutional Absence Protocol</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors border border-white/10">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification Type</label>
                <div className="grid grid-cols-3 gap-2">
                   {['Paid', 'Sick', 'Unpaid'].map((t) => (
                     <button
                        key={t}
                        type="button"
                        onClick={() => setNewLeave({...newLeave, type: t as any})}
                        className={`py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all ${newLeave.type === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                     >
                       {t}
                     </button>
                   ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Commencement Date</label>
                  <input 
                    type="date" required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all"
                    value={newLeave.startDate}
                    onChange={e => setNewLeave({...newLeave, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Conclusion Date</label>
                  <input 
                    type="date" required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all"
                    value={newLeave.endDate}
                    onChange={e => setNewLeave({...newLeave, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deployment Context (Reason)</label>
                <textarea 
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-medium text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                  rows={4}
                  placeholder="Provide detailed reasoning for system audit..."
                  required
                  value={newLeave.reason}
                  onChange={e => setNewLeave({...newLeave, reason: e.target.value})}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                >
                  Discard Request
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95"
                >
                  Broadcast Protocol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
