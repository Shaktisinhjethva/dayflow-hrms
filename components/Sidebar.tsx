
import React from 'react';
import { UserRole } from '../types';
import { useApp } from '../App';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { currentUser } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'Command Hub', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )},
    { id: 'profile', label: 'Identity Profile', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'attendance', label: 'Time Ledger', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { id: 'leaves', label: 'Absence protocol', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { id: 'payroll', label: 'Equity Matrix', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )}
  ];

  if (currentUser?.role === UserRole.ADMIN) {
    menuItems.push({ id: 'users', label: 'Identity Vault', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )});
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md lg:hidden transition-all duration-500" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) bg-slate-950 lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0 shadow-[40px_0_80px_rgba(0,0,0,0.5)]' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full border-r border-white/5">
          <div className="flex items-center h-28 px-10 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-indigo-400/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="text-2xl font-black text-white tracking-tighter block leading-none">Dayflow</span>
                <span className="text-[10px] text-indigo-500 font-black tracking-[0.4em] uppercase mt-1 block">Enterprise OS</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-6 space-y-3 overflow-y-auto no-scrollbar">
            <div className="px-6 py-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Operations Center</div>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`
                  flex items-center w-full gap-5 px-6 py-4.5 text-xs font-black transition-all rounded-3xl group relative
                  ${activeTab === item.id 
                    ? 'bg-white/5 text-white border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.2)]' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent'}
                `}
              >
                <div className={`p-2.5 rounded-xl transition-all duration-500 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-slate-900 text-slate-600 group-hover:text-slate-300'}`}>
                  {item.icon}
                </div>
                <span className="uppercase tracking-widest">{item.label}</span>
                {activeTab === item.id && (
                   <div className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(129,140,248,0.8)] animate-pulse" />
                )}
              </button>
            ))}
          </nav>

          <div className="p-8 mt-auto">
            <div className="p-6 bg-slate-900/40 border border-white/5 rounded-[2.5rem] relative overflow-hidden group hover:border-white/10 transition-all">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className={`w-3.5 h-3.5 rounded-full absolute -top-1 -right-1 border-2 border-slate-950 ${currentUser?.role === UserRole.ADMIN ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]'} animate-pulse`} />
                  <img src={currentUser?.profilePicture} className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 object-cover" alt="" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-white truncate uppercase tracking-widest">{currentUser?.role} NODE</p>
                  <p className="text-[9px] text-slate-500 font-black truncate uppercase tracking-tighter mt-1 flex items-center gap-1.5">
                     <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                     Telemetry Encrypted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
