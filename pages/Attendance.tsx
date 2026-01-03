
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { UserRole, AttendanceStatus, AttendanceRecord } from '../types';

const Attendance: React.FC = () => {
  const { currentUser, attendance, updateAttendance, employees } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];
    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      employeeId: currentUser!.id,
      date: today,
      checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkOut: null,
      status: AttendanceStatus.PRESENT
    };
    updateAttendance(newRecord);
  };

  const handleCheckOut = (id: string) => {
    const record = attendance.find(r => r.id === id);
    if (record) {
      updateAttendance({
        ...record,
        checkOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  };

  const currentRecords = currentUser?.role === UserRole.ADMIN 
    ? attendance 
    : attendance.filter(a => a.employeeId === currentUser?.id);

  const isCheckedInToday = attendance.find(a => 
    a.employeeId === currentUser?.id && 
    a.date === new Date().toISOString().split('T')[0] && 
    !a.checkOut
  );

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startOffset = firstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const yearLabel = currentDate.getFullYear();

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + direction)));
  };

  const getAttendanceForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return currentRecords.filter(r => r.date === dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Attendance Insight</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Real-time work-cycle verification and history.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setViewMode('calendar')}
              className={`flex-1 sm:flex-none px-4 md:px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Calendar
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`flex-1 sm:flex-none px-4 md:px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              Directory
            </button>
          </div>

          {!isCheckedInToday ? (
             <button 
              onClick={handleCheckIn}
              className="px-8 py-3.5 text-white bg-indigo-600 rounded-[1.25rem] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-95"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
               Clock-In
             </button>
          ) : (
            <button 
              onClick={() => handleCheckOut(isCheckedInToday.id)}
              className="px-8 py-3.5 text-white bg-rose-500 rounded-[1.25rem] shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-95"
            >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
               Clock-Out
            </button>
          )}
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] md:rounded-[3rem] shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="p-6 md:p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-6">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-center md:text-left">{monthName} <span className="text-indigo-600">{yearLabel}</span></h3>
              <div className="flex items-center justify-center gap-2 bg-white p-1 rounded-2xl border border-slate-200">
                <button onClick={() => navigateMonth(-1)} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-xl transition-all">Today</button>
                <button onClick={() => navigateMonth(1)} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-end gap-3 md:gap-4">
               <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] md:text-[10px] font-black text-emerald-700 uppercase tracking-widest">Present</span>
               </div>
               <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 rounded-xl border border-rose-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="text-[9px] md:text-[10px] font-black text-rose-700 uppercase tracking-widest">Absent</span>
               </div>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-7 border-b border-slate-100">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="py-4 md:py-6 text-center text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/20">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {calendarDays.map((date, idx) => {
                  if (!date) return <div key={`empty-${idx}`} className="h-28 md:h-40 border-b border-r border-slate-50 bg-slate-50/10" />;
                  
                  const dayAttendance = getAttendanceForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const hasAttendance = dayAttendance.length > 0;
                  
                  return (
                    <div key={idx} className={`h-28 md:h-40 p-2 md:p-4 border-b border-r border-slate-100 relative group transition-all hover:bg-indigo-50/30 ${isToday ? 'bg-indigo-50/20' : ''}`}>
                      <span className={`text-xs md:text-sm font-black ${isToday ? 'bg-indigo-600 text-white w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg md:rounded-xl shadow-lg shadow-indigo-100' : 'text-slate-400'}`}>
                        {date.getDate()}
                      </span>
                      
                      <div className="mt-2 md:mt-4 space-y-1 md:space-y-1.5 overflow-y-auto max-h-16 md:max-h-24 no-scrollbar">
                        {dayAttendance.map((rec, rIdx) => {
                          const emp = employees.find(e => e.id === rec.employeeId);
                          return (
                            <div key={rIdx} className="p-1.5 md:p-2 bg-white border border-slate-200 rounded-lg md:rounded-xl shadow-sm text-[9px] md:text-[10px] animate-in slide-in-from-bottom-2">
                              <div className="flex items-center justify-between gap-1">
                                 <span className="font-black text-slate-900 truncate">{emp?.name || 'User'}</span>
                                 <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full shrink-0 ${rec.status === AttendanceStatus.PRESENT ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              </div>
                              <p className="text-slate-400 font-bold mt-0.5 tracking-tight truncate">{rec.checkIn} — {rec.checkOut || 'Active'}</p>
                            </div>
                          );
                        })}
                      </div>
                      
                      {!hasAttendance && !isToday && date < new Date() && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[1px] pointer-events-none">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No Record</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="md:hidden p-4 bg-slate-50/80 text-center border-t border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              Swipe Horizontally for Calendar
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden bg-white border border-slate-200 rounded-[2rem] md:rounded-[3rem] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee Asset</th>
                  <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Date</th>
                  <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clock Entry</th>
                  <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clock Exit</th>
                  <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentRecords.map((record) => {
                  const emp = employees.find(e => e.id === record.employeeId);
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 md:px-8 py-5 md:py-6">
                        <div className="flex items-center gap-3 md:gap-4">
                          <img src={emp?.profilePicture} className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-slate-100 object-cover border border-slate-200" alt="" />
                          <div>
                            <p className="text-xs md:text-sm font-black text-slate-900 tracking-tight">{emp?.name}</p>
                            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">{emp?.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-5 md:py-6 text-[11px] md:text-sm text-slate-600 font-semibold">{record.date}</td>
                      <td className="px-6 md:px-8 py-5 md:py-6 text-[11px] md:text-sm text-indigo-600 font-mono font-bold">{record.checkIn}</td>
                      <td className="px-6 md:px-8 py-5 md:py-6 text-[11px] md:text-sm text-slate-400 font-mono font-bold">{record.checkOut || 'PROTOCOL_ACTIVE'}</td>
                      <td className="px-6 md:px-8 py-5 md:py-6">
                        <span className={`px-2.5 md:px-3 py-1.5 text-[9px] md:text-[10px] font-black rounded-xl uppercase tracking-widest shadow-sm border ${
                          record.status === AttendanceStatus.PRESENT 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
