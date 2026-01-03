
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { UserRole, LeaveStatus, DashboardWidget } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const Dashboard: React.FC = () => {
  const { currentUser, attendance, leaves, employees, dashboardConfigs, updateDashboardConfig, notifications } = useApp();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configRole, setConfigRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [pulseTime, setPulseTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setPulseTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const currentRoleConfig = dashboardConfigs.find(c => c.role === currentUser?.role);
  const visibleWidgets = currentRoleConfig?.visibleWidgets || [];

  const userAttendance = attendance.filter(a => a.employeeId === currentUser?.id);
  const userLeaves = leaves.filter(l => l.employeeId === currentUser?.id);
  
  const stats = [
    { 
      id: 'streak',
      label: 'Engagement Streak', 
      value: `${userAttendance.length} Days`, 
      color: 'from-emerald-400 to-teal-600',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    },
    { 
      id: 'leaves',
      label: 'Pending Protocols', 
      value: userLeaves.filter(l => l.status === 'Pending').length, 
      color: 'from-indigo-400 to-blue-600',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    },
    { 
      id: 'balance',
      label: 'Leave Pool', 
      value: '14 Units', 
      color: 'from-amber-400 to-orange-600',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    },
    { 
      id: 'team',
      label: 'System Assets', 
      value: employees.length, 
      color: 'from-rose-400 to-pink-600',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    },
  ];

  const chartData = [
    { name: 'Mon', hours: 8 },
    { name: 'Tue', hours: 9 },
    { name: 'Wed', hours: 7.5 },
    { name: 'Thu', hours: 8.5 },
    { name: 'Fri', hours: 8 },
  ];

  const leaveData = [
    { name: 'Approved', value: userLeaves.filter(l => l.status === LeaveStatus.APPROVED).length || 5 },
    { name: 'Pending', value: userLeaves.filter(l => l.status === LeaveStatus.PENDING).length || 2 },
    { name: 'Rejected', value: userLeaves.filter(l => l.status === LeaveStatus.REJECTED).length || 1 },
  ];
  const COLORS = ['#10b981', '#6366f1', '#f43f5e'];

  // Admin specific data
  const recentProvisions = [...employees].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const pendingApprovals = leaves.filter(l => l.status === LeaveStatus.PENDING).slice(0, 5);
  const alertSummary = {
    security: notifications.filter(n => n.type === 'security').length,
    payroll: notifications.filter(n => n.type === 'payroll').length,
    leave: notifications.filter(n => n.type === 'leave').length,
    system: notifications.filter(n => n.type === 'system').length
  };

  const allPossibleWidgets: { id: DashboardWidget; name: string; adminOnly?: boolean }[] = [
    { id: 'streak', name: 'Engagement Analytics' },
    { id: 'leaves', name: 'Protocol Queue' },
    { id: 'balance', name: 'Balance Ledger' },
    { id: 'team', name: 'System Assets' },
    { id: 'hours', name: 'Time Cycle Matrix' },
    { id: 'summary', name: 'Leave Architecture' },
    { id: 'activity', name: 'Real-time Telemetry' },
    { id: 'provisions', name: 'Recent User Provisions', adminOnly: true },
    { id: 'approvals', name: 'Pending Approvals', adminOnly: true },
    { id: 'alerts', name: 'System Alerts Summary', adminOnly: true }
  ];

  const handleToggleWidget = (widgetId: DashboardWidget) => {
    const currentConfig = dashboardConfigs.find(c => c.role === configRole);
    if (!currentConfig) return;
    const newWidgets = currentConfig.visibleWidgets.includes(widgetId)
      ? currentConfig.visibleWidgets.filter(id => id !== widgetId)
      : [...currentConfig.visibleWidgets, widgetId];
    updateDashboardConfig(configRole, newWidgets);
  };

  const isWidgetVisible = (id: DashboardWidget) => visibleWidgets.includes(id);

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between bg-slate-900 p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="px-4 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Security Node: Active</span>
             </div>
             <div className="px-4 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Live Sync</span>
             </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">System Pulse</h2>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-2">{pulseTime.toLocaleTimeString()} // ID: {currentUser?.employeeId}</p>
        </div>
        
        <div className="flex items-center gap-4 relative z-10 mt-6 lg:mt-0">
          {isAdmin && (
            <button 
              onClick={() => {
                setConfigRole(currentUser.role);
                setIsConfigOpen(true);
              }}
              className="p-4 bg-white/5 text-slate-300 rounded-[1.5rem] border border-white/10 hover:bg-white/10 hover:text-white transition-all group backdrop-blur-md"
              title="Interface Configuration"
            >
              <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          )}
          <button className="px-10 py-5 bg-white text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:bg-indigo-400 hover:text-white transition-all active:scale-95">
            Initialise Ops
          </button>
        </div>
      </header>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.filter(stat => isWidgetVisible(stat.id as DashboardWidget)).map((stat, idx) => (
          <div key={idx} className="group relative p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden flex flex-col justify-between h-56">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="flex items-center justify-between">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg shadow-indigo-100`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {stat.icon}
                </svg>
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">v1.4</span>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h3>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Alerts Summary Grid */}
      {isAdmin && isWidgetVisible('alerts') && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Security Node Threats</p>
            <p className="text-2xl font-black text-rose-600">{alertSummary.security}</p>
          </div>
          <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Payroll Cycles Processed</p>
            <p className="text-2xl font-black text-emerald-600">{alertSummary.payroll}</p>
          </div>
          <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Leave Protocols Logged</p>
            <p className="text-2xl font-black text-indigo-600">{alertSummary.leave}</p>
          </div>
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System Core Events</p>
            <p className="text-2xl font-black text-white">{alertSummary.system}</p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {isWidgetVisible('hours') && (
          <div className={`${isWidgetVisible('summary') ? 'lg:col-span-2' : 'lg:col-span-3'} p-10 bg-white border border-slate-200 rounded-[3rem] shadow-sm`}>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Temporal Flux Matrix</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Weekly Operational Load</p>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                <div className="w-3 h-3 rounded-full bg-slate-200" />
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dx={-15} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px', fontWeight: 800}}
                  />
                  <Bar dataKey="hours" fill="url(#barGradient)" radius={[12, 12, 12, 12]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {isWidgetVisible('summary') && (
          <div className={`${isWidgetVisible('hours') ? 'lg:col-span-1' : 'lg:col-span-3'} p-10 bg-slate-950 border border-slate-800 rounded-[3rem] shadow-2xl flex flex-col text-white relative overflow-hidden`}>
            <div className="absolute bottom-0 left-0 w-full h-full bg-indigo-600/5 blur-[80px] rounded-full pointer-events-none" />
            <h3 className="text-2xl font-black text-white tracking-tight mb-2 text-center relative z-10">Protocol Pool</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-center mb-8 relative z-10">Institutional Allocation</p>
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
               <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={leaveData}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={105}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                    >
                      {leaveData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="grid grid-cols-1 gap-3 w-full mt-10">
                  {leaveData.map((d, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]" style={{backgroundColor: COLORS[i], color: COLORS[i]}} />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.name}</span>
                        </div>
                        <span className="text-xs font-black text-white">{d.value} Units</span>
                     </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin Specific Row: Provisions & Approvals */}
      {isAdmin && (isWidgetVisible('provisions') || isWidgetVisible('approvals')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {isWidgetVisible('provisions') && (
            <div className="p-10 bg-white border border-slate-200 rounded-[3rem] shadow-sm animate-in fade-in duration-500">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent User Provisions</h3>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">New Entities</span>
               </div>
               <div className="space-y-4">
                  {recentProvisions.map((emp, i) => (
                    <div key={emp.id} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-indigo-200 transition-all group">
                       <div className="flex items-center gap-4">
                          <img src={emp.profilePicture} className="w-10 h-10 rounded-xl bg-white border border-slate-200 object-cover" alt="" />
                          <div>
                            <p className="text-xs font-black text-slate-900 uppercase">{emp.name}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{emp.jobTitle}</p>
                          </div>
                       </div>
                       <p className="text-[9px] font-mono font-black text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-slate-100">{emp.employeeId}</p>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {isWidgetVisible('approvals') && (
            <div className="p-10 bg-white border border-slate-200 rounded-[3rem] shadow-sm animate-in fade-in duration-500">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Pending Approvals</h3>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">Action Required</span>
               </div>
               <div className="space-y-4">
                  {pendingApprovals.length > 0 ? pendingApprovals.map((leave, i) => {
                    const emp = employees.find(e => e.id === leave.employeeId);
                    return (
                      <div key={leave.id} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-amber-200 transition-all group">
                         <div className="flex items-center gap-4">
                            <img src={emp?.profilePicture} className="w-10 h-10 rounded-xl bg-white border border-slate-200 object-cover" alt="" />
                            <div>
                              <p className="text-xs font-black text-slate-900 uppercase">{emp?.name}</p>
                              <p className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">{leave.type} Leave Protocol</p>
                            </div>
                         </div>
                         <div className="text-right">
                           <p className="text-[10px] font-black text-slate-900 mb-1">{leave.startDate}</p>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Awaiting Verification</p>
                         </div>
                      </div>
                    );
                  }) : (
                    <div className="p-10 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Queue Clear</p>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      )}

      {/* Real-time Telemetry (Activity Feed) */}
      {isWidgetVisible('activity') && (
        <div className="p-10 bg-white border border-slate-200 rounded-[3rem] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Live Telemetry Feed
            </h3>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
               Real-time
            </span>
          </div>
          <div className="space-y-4">
            {attendance.slice(0, 5).map((record, i) => {
              const emp = employees.find(e => e.id === record.employeeId);
              return (
                <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] hover:bg-indigo-50/50 hover:border-indigo-200 transition-all group/item cursor-default animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-5">
                    <img src={emp?.profilePicture} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 object-cover" alt="" />
                    <div>
                      <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{emp?.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{record.date} // {record.checkIn} CHECKED_IN</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-[10px] font-black text-indigo-600 bg-white px-5 py-2.5 rounded-xl uppercase tracking-widest border border-slate-100 shadow-sm">Verified Node</span>
                    <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interface Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-500">
            <div className="bg-slate-950 p-12 text-white relative">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] -mr-32 -mt-32" />
               <div className="flex items-center justify-between mb-10 relative z-10">
                 <div>
                    <h3 className="text-3xl font-black tracking-tighter">Hub Architecture</h3>
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Reconfigure Terminal Matrix</p>
                 </div>
                 <button onClick={() => setIsConfigOpen(false)} className="p-4 hover:bg-white/10 rounded-full transition-colors border border-white/10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
               </div>
               
               <div className="flex gap-3 p-1.5 bg-white/5 rounded-2xl relative z-10 border border-white/10 backdrop-blur-md">
                 <button 
                  onClick={() => setConfigRole(UserRole.EMPLOYEE)}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${configRole === UserRole.EMPLOYEE ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
                 >
                   Standard Node
                 </button>
                 {isAdmin && (
                    <button 
                      onClick={() => setConfigRole(UserRole.ADMIN)}
                      className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${configRole === UserRole.ADMIN ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
                    >
                      Admin Primary
                    </button>
                 )}
               </div>
            </div>

            <div className="p-12 space-y-4 max-h-[45vh] overflow-y-auto no-scrollbar bg-slate-50/50">
              {allPossibleWidgets.filter(w => !w.adminOnly || configRole === UserRole.ADMIN).map((widget) => {
                const isChecked = dashboardConfigs.find(c => c.role === configRole)?.visibleWidgets.includes(widget.id);
                return (
                  <label key={widget.id} className="flex items-center justify-between p-7 bg-white border border-slate-200 rounded-[2.5rem] hover:border-indigo-400 transition-all cursor-pointer shadow-sm active:scale-[0.98] group">
                    <div className="flex items-center gap-6">
                      <div className={`w-3.5 h-3.5 rounded-full transition-all ${isChecked ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.6)]' : 'bg-slate-200'}`} />
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{widget.name}</span>
                        {widget.adminOnly && <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Admin Exclusive</span>}
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={isChecked}
                        onChange={() => handleToggleWidget(widget.id)}
                      />
                      <div className="w-16 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-8 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="p-12 bg-white border-t border-slate-100 flex">
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="w-full py-7 bg-slate-900 text-white font-black rounded-[2.5rem] shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-sm"
              >
                Apply Reconfiguration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;