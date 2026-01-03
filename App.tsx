
import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Employee, UserRole, AttendanceRecord, LeaveRequest, 
  AttendanceStatus, LeaveStatus, DashboardConfig, DashboardWidget,
  Notification
} from './types';
import { MOCK_EMPLOYEES, MOCK_ATTENDANCE, MOCK_LEAVES } from './constants';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import LeaveManagement from './pages/LeaveManagement';
import Payroll from './pages/Payroll';
import UserManagement from './pages/UserManagement';
import Auth from './pages/Auth';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

interface AppContextType {
  currentUser: Employee | null;
  setCurrentUser: (user: Employee | null) => void;
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  dashboardConfigs: DashboardConfig[];
  notifications: Notification[];
  updateAttendance: (record: AttendanceRecord) => void;
  addLeave: (leave: LeaveRequest) => void;
  updateLeaveStatus: (id: string, status: LeaveStatus, comment?: string) => void;
  updateEmployee: (emp: Employee) => void;
  addEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;
  updateDashboardConfig: (role: UserRole, widgets: DashboardWidget[]) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationsRead: () => void;
  resetPassword: (email: string, newPass: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const DEFAULT_DASHBOARD_CONFIGS: DashboardConfig[] = [
  {
    role: UserRole.ADMIN,
    visibleWidgets: ['streak', 'leaves', 'balance', 'team', 'hours', 'summary', 'activity', 'provisions', 'approvals', 'alerts']
  },
  {
    role: UserRole.EMPLOYEE,
    visibleWidgets: ['streak', 'leaves', 'balance', 'hours', 'summary', 'activity']
  }
];

const App: React.FC = () => {
  // Persistence Loading
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('dayflow_employees');
    return saved ? JSON.parse(saved) : MOCK_EMPLOYEES;
  });
  
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('dayflow_attendance');
    return saved ? JSON.parse(saved) : MOCK_ATTENDANCE;
  });

  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('dayflow_leaves');
    return saved ? JSON.parse(saved) : MOCK_LEAVES;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('dayflow_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  const [dashboardConfigs, setDashboardConfigs] = useState<DashboardConfig[]>(() => {
    const saved = localStorage.getItem('dayflow_dashboard_config');
    return saved ? JSON.parse(saved) : DEFAULT_DASHBOARD_CONFIGS;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Persistence Syncing
  useEffect(() => { localStorage.setItem('dayflow_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('dayflow_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('dayflow_leaves', JSON.stringify(leaves)); }, [leaves]);
  useEffect(() => { localStorage.setItem('dayflow_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('dayflow_dashboard_config', JSON.stringify(dashboardConfigs)); }, [dashboardConfigs]);

  useEffect(() => {
    const savedUser = localStorage.getItem('dayflow_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const found = employees.find(e => e.id === parsed.id);
      if (found) setCurrentUser(found);
    }
  }, [employees]);

  const handleLogin = (user: Employee) => {
    setCurrentUser(user);
    localStorage.setItem('dayflow_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dayflow_user');
  };

  const updateAttendance = (record: AttendanceRecord) => {
    setAttendance(prev => {
      const idx = prev.findIndex(r => r.id === record.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [record, ...prev];
    });
  };

  const addLeave = (leave: LeaveRequest) => {
    setLeaves(prev => [leave, ...prev]);
    addNotification({
      recipientId: 'ADMIN_ALL',
      subject: 'New Leave Request Filed',
      body: `Employee #${leave.employeeId} has requested ${leave.type} leave starting ${leave.startDate}.`,
      type: 'leave'
    });
  };

  const updateLeaveStatus = (id: string, status: LeaveStatus, comment?: string) => {
    setLeaves(prev => prev.map(l => {
      if (l.id === id) {
        addNotification({
          recipientId: l.employeeId,
          subject: `Leave Request ${status}`,
          body: `Your leave request from ${l.startDate} to ${l.endDate} has been ${status.toLowerCase()}${comment ? ': ' + comment : '.'}`,
          type: 'leave'
        });
        return { ...l, status, adminComment: comment };
      }
      return l;
    }));
  };

  const updateEmployee = (emp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
    if (currentUser?.id === emp.id) setCurrentUser(emp);
  };

  const addEmployee = (emp: Employee) => {
    setEmployees(prev => [emp, ...prev]);
    addNotification({
      recipientId: 'ADMIN_ALL',
      subject: 'Security: New User Provisioned',
      body: `${emp.name} (${emp.employeeId}) has been added to the system by IT.`,
      type: 'security'
    });
  };
  
  const deleteEmployee = (id: string) => {
    if (id === currentUser?.id) return;
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const updateDashboardConfig = (role: UserRole, widgets: DashboardWidget[]) => {
    setDashboardConfigs(prev => prev.map(c => c.role === role ? { ...c, visibleWidgets: widgets } : c));
  };

  const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetPassword = (email: string, newPass: string) => {
    const userIndex = employees.findIndex(e => e.email.toLowerCase() === email.toLowerCase());
    if (userIndex > -1) {
      const updatedEmployees = [...employees];
      updatedEmployees[userIndex] = { ...updatedEmployees[userIndex], password: newPass };
      setEmployees(updatedEmployees);
      addNotification({
        recipientId: updatedEmployees[userIndex].id,
        subject: 'Security: Password Reset Successful',
        body: 'Your account password was updated via the recovery portal.',
        type: 'security'
      });
      return true;
    }
    return false;
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, setCurrentUser, employees, attendance, leaves, dashboardConfigs, notifications,
      updateAttendance, addLeave, updateLeaveStatus, updateEmployee,
      addEmployee, deleteEmployee, updateDashboardConfig, addNotification, markNotificationsRead, resetPassword
    }}>
      {!currentUser ? (
        <Auth onLogin={handleLogin} employees={employees} />
      ) : (
        <div className="flex h-screen overflow-hidden bg-slate-50">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOpen={isSidebarOpen}
            setIsOpen={setSidebarOpen}
          />
          <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
            <Navbar onLogout={handleLogout} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
            <main className="p-4 md:p-8 animate-in fade-in duration-500">
              {(() => {
                switch (activeTab) {
                  case 'dashboard': return <Dashboard />;
                  case 'profile': return <Profile />;
                  case 'attendance': return <Attendance />;
                  case 'leaves': return <LeaveManagement />;
                  case 'payroll': return <Payroll />;
                  case 'users': return <UserManagement />;
                  default: return <Dashboard />;
                }
              })()}
            </main>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export default App;