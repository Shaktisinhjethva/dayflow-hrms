
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { UserRole } from '../types';

interface NavbarProps {
  onLogout: () => void;
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout, toggleSidebar }) => {
  const { currentUser, notifications, markNotificationsRead } = useApp();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);

  // Filter notifications for the current user
  const userNotifications = notifications.filter(n => 
    n.recipientId === currentUser?.id || 
    (currentUser?.role === UserRole.ADMIN && n.recipientId === 'ADMIN_ALL')
  );

  const unreadCount = userNotifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotif = () => {
    if (!isNotifOpen) {
      markNotificationsRead();
    }
    setIsNotifOpen(!isNotifOpen);
  };

  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 transition-colors rounded-md hover:bg-slate-100 lg:hidden"
        >
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <h1 className="text-xl font-black tracking-tighter text-indigo-600">Dayflow</h1>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Notifications */}
        <div className="relative" ref={trayRef}>
          <button 
            onClick={handleToggleNotif}
            className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">System Alerts</span>
                <span className="text-[10px] text-indigo-600 font-bold">Email Sync Active</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {userNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-xs text-slate-400 italic">No new notifications.</p>
                  </div>
                ) : (
                  userNotifications.map((notif) => (
                    <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-indigo-50/20' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg mt-0.5 ${
                          notif.type === 'security' ? 'bg-rose-100 text-rose-600' :
                          notif.type === 'payroll' ? 'bg-emerald-100 text-emerald-600' :
                          notif.type === 'leave' ? 'bg-indigo-100 text-indigo-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {notif.type === 'security' && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                          {notif.type === 'payroll' && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                          {notif.type === 'leave' && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-900">{notif.subject}</p>
                          <p className="text-[10px] text-slate-500 leading-relaxed mt-1">{notif.body}</p>
                          <p className="text-[9px] text-slate-400 mt-2 font-mono">{notif.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                 <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">View All Notifications</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-bold text-slate-900">{currentUser?.name}</p>
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{currentUser?.role}</p>
          </div>
          <div className="relative">
            <img 
              src={currentUser?.profilePicture || 'https://picsum.photos/40/40'} 
              alt="Profile" 
              className="w-10 h-10 border-2 border-indigo-50 rounded-xl shadow-sm object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <button 
            onClick={onLogout}
            className="ml-2 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            title="Secure Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
