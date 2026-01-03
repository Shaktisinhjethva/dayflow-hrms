
import React, { useState } from 'react';
import { UserRole, Employee } from '../types';
import { useApp } from '../App';

interface AuthProps {
  onLogin: (user: Employee) => void;
  employees: Employee[];
}

const Auth: React.FC<AuthProps> = ({ onLogin, employees }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'request' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1); 
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Signup State
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    jobTitle: '',
    department: 'Engineering'
  });

  const { resetPassword, addNotification, addEmployee } = useApp();

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (activeTab === 'signin') {
      const user = employees.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user && user.password === password) {
        if (user.status === 'PENDING') {
          setError('Identity is pending verification. Contact System Admin for clearance.');
          return;
        }
        if (user.status === 'DISABLED') {
          setError('Identity has been suspended. Contact IT.');
          return;
        }
        onLogin(user);
      } else {
        setError('Invalid identifier or passkey. Access denied.');
      }
    } else if (activeTab === 'request') {
      if (!signupData.name || !signupData.email || !signupData.password) {
        setError('Please complete all mandatory protocols.');
        return;
      }
      
      const existing = employees.find(u => u.email.toLowerCase() === signupData.email.toLowerCase());
      if (existing) {
        setError('Identity already exists in system records.');
        return;
      }

      const newEmp: Employee = {
        id: `emp_${Date.now()}`,
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        role: UserRole.EMPLOYEE,
        employeeId: `EXT-${Math.floor(100 + Math.random() * 900)}`,
        jobTitle: signupData.jobTitle || 'System Contributor',
        department: signupData.department,
        joinDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toLocaleString(),
        salary: 4500,
        phone: 'Unassigned',
        address: 'Remote Terminal',
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${signupData.name}`,
        status: 'PENDING'
      };

      addEmployee(newEmp);
      setSuccessMsg('Identity protocol submitted. Waiting for Admin validation.');
      
      addNotification({
        recipientId: 'ADMIN_ALL',
        subject: 'New Identity Request',
        body: `${newEmp.name} has requested access and is waiting for approval.`,
        type: 'security'
      });

      setTimeout(() => {
        setActiveTab('signin');
        setSignupData({ name: '', email: '', password: '', jobTitle: '', department: 'Engineering' });
        setSuccessMsg('');
      }, 3000);
      
    } else if (activeTab === 'forgot') {
      if (resetStep === 1) {
        const user = employees.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          setGeneratedCode(code);
          addNotification({
            recipientId: user.id,
            subject: 'Security: Password Recovery Code',
            body: `Your verification code is ${code}.`,
            type: 'security'
          });
          setResetStep(2);
          setSuccessMsg(`Code sent to registered email!`);
        } else {
          setError('Email entity not found.');
        }
      } else if (resetStep === 2) {
        if (verificationCode === generatedCode) {
          setResetStep(3);
          setSuccessMsg('Verified. Set new passkey.');
        } else {
          setError('Invalid verification code.');
        }
      } else if (resetStep === 3) {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        const success = resetPassword(email, password);
        if (success) {
          setSuccessMsg('Credentials updated. Redirecting...');
          setTimeout(() => setActiveTab('signin'), 2000);
        }
      }
    }
  };

  const renderResetFlow = () => {
    switch (resetStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[1.75rem] font-bold shadow-inner outline-none focus:border-indigo-600"
              placeholder="registered@domain.com"
            />
            <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-indigo-600 transition-all">Send Recovery Code</button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <input 
              type="text" required maxLength={6} value={verificationCode} onChange={e => setVerificationCode(e.target.value)}
              className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[1.75rem] font-mono font-black text-center text-2xl tracking-[0.5em] text-indigo-600 shadow-inner outline-none"
              placeholder="000000"
            />
            <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-indigo-600 transition-all">Verify Protocol</button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[1.75rem] font-bold shadow-inner outline-none focus:border-indigo-600 transition-all"
                placeholder="New Passkey"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L1 1m11.88 11.88L23 23" /></svg>
                )}
              </button>
            </div>
            <input 
              type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[1.75rem] font-bold shadow-inner outline-none"
              placeholder="Confirm Passkey"
            />
            <button type="submit" className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-emerald-700 transition-all">Finalize Reset</button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 mb-4 md:mb-6 bg-white px-5 py-2 rounded-full border border-slate-200 shadow-sm">
             <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
             <span className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Secure Node 01 • Active</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-2">Dayflow</h1>
          <p className="text-indigo-600 font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px] ml-1">Enterprise HROS</p>
        </div>

        <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_48px_100px_-24px_rgba(0,0,0,0.12)] border border-slate-200/50 overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => { setActiveTab('signin'); setError(''); setResetStep(1); setSuccessMsg(''); }}
              className={`flex-1 py-5 md:py-7 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'signin' ? 'text-indigo-600' : 'text-slate-400 bg-slate-50/50'}`}
            >
              Sign In
              {activeTab === 'signin' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 md:w-12 h-1 bg-indigo-600 rounded-full" />}
            </button>
            <button 
              onClick={() => { setActiveTab('request'); setError(''); setResetStep(1); setSuccessMsg(''); }}
              className={`flex-1 py-5 md:py-7 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'request' ? 'text-indigo-600' : 'text-slate-400 bg-slate-50/50'}`}
            >
              Access Request
              {activeTab === 'request' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 md:w-12 h-1 bg-indigo-600 rounded-full" />}
            </button>
          </div>

          <div className="p-8 md:p-12">
            <form onSubmit={handleAuthSubmit} className="space-y-6 md:space-y-8">
              {error && (
                <div className="p-4 md:p-5 bg-rose-50 border border-rose-100 rounded-[1.25rem] md:rounded-[1.5rem] text-rose-600 text-[11px] md:text-xs font-bold flex items-center gap-3 md:gap-4 animate-in fade-in slide-in-from-left-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="p-4 md:p-5 bg-emerald-50 border border-emerald-100 rounded-[1.25rem] md:rounded-[1.5rem] text-emerald-600 text-[11px] md:text-xs font-bold flex items-center gap-3 md:gap-4 animate-in fade-in slide-in-from-top-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  {successMsg}
                </div>
              )}
              
              {activeTab === 'signin' && (
                <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-4">
                  <div className="space-y-2 md:space-y-3">
                    <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">System Identifier</label>
                    <input 
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full px-6 md:px-8 py-4 md:py-5 bg-slate-50 border border-slate-200 rounded-[1.25rem] md:rounded-[1.75rem] focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold text-slate-900 shadow-inner"
                      placeholder="Admin123@gmail.com"
                    />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between px-2">
                       <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Secret Passkey</label>
                       <button type="button" onClick={() => setActiveTab('forgot')} className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase">Forgot Passkey?</button>
                    </div>
                    <div className="relative group">
                      <input 
                        type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full px-6 md:px-8 py-4 md:py-5 bg-slate-50 border border-slate-200 rounded-[1.25rem] md:rounded-[1.75rem] focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold text-slate-900 shadow-inner"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-all p-2"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L1 1m11.88 11.88L23 23" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-5 md:py-6 bg-slate-900 text-white rounded-[1.5rem] md:rounded-[2rem] font-black text-lg md:text-xl hover:bg-indigo-600 transition-all uppercase tracking-widest shadow-2xl shadow-slate-200">Verify Identity</button>
                </div>
              )}

              {activeTab === 'request' && (
                <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-4">
                   <div className="space-y-2">
                      <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Legal Identity Name</label>
                      <input 
                        type="text" required value={signupData.name}
                        onChange={e => setSignupData({...signupData, name: e.target.value})}
                        className="w-full px-6 md:px-8 py-3.5 md:py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] md:rounded-[1.5rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900"
                        placeholder="John Doe"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Digital Mailbox (Email)</label>
                      <input 
                        type="email" required value={signupData.email}
                        onChange={e => setSignupData({...signupData, email: e.target.value})}
                        className="w-full px-6 md:px-8 py-3.5 md:py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] md:rounded-[1.5rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900"
                        placeholder="john@company.com"
                      />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Job Designation</label>
                        <input 
                          type="text" value={signupData.jobTitle}
                          onChange={e => setSignupData({...signupData, jobTitle: e.target.value})}
                          className="w-full px-6 md:px-8 py-3.5 md:py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] md:rounded-[1.5rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900"
                          placeholder="Engineer"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Department</label>
                        <select 
                          value={signupData.department}
                          onChange={e => setSignupData({...signupData, department: e.target.value})}
                          className="w-full px-6 md:px-8 py-3.5 md:py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] md:rounded-[1.5rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900"
                        >
                          <option>Engineering</option>
                          <option>Marketing</option>
                          <option>Human Resources</option>
                          <option>Operations</option>
                        </select>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">New Secure Passkey</label>
                      <div className="relative group">
                        <input 
                          type={showPassword ? "text" : "password"} required value={signupData.password}
                          onChange={e => setSignupData({...signupData, password: e.target.value})}
                          className="w-full px-6 md:px-8 py-3.5 md:py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] md:rounded-[1.5rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-900"
                          placeholder="••••••••"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-all p-2"
                        >
                          {showPassword ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L1 1m11.88 11.88L23 23" /></svg>
                          )}
                        </button>
                      </div>
                   </div>
                   <button type="submit" className="w-full py-5 md:py-6 bg-indigo-600 text-white rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Submit Onboarding Protocol</button>
                </div>
              )}

              {activeTab === 'forgot' && (
                <div className="space-y-6">
                   <div className="flex items-center gap-2 mb-4">
                      <button type="button" onClick={() => setActiveTab('signin')} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                         <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Protocol Recovery</h3>
                   </div>
                   {renderResetFlow()}
                </div>
              )}
            </form>
          </div>
        </div>
        <div className="mt-8 md:mt-12 text-center">
            <p className="text-slate-400 text-[9px] md:text-[10px] uppercase tracking-[0.5em] font-black opacity-50">&copy; 2024 Dayflow System Protocol</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
