import React, { useState, useRef } from 'react';
import { useApp } from '../App';
import { UserRole, Employee } from '../types';

const Profile: React.FC = () => {
  const { currentUser, updateEmployee, addNotification } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Employee>(currentUser!);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Password Change State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passData, setPassData] = useState({ current: '', next: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [showPass, setShowPass] = useState({ current: false, next: false });

  if (!currentUser) return null;

  const handleSave = () => {
    updateEmployee(formData);
    setIsEditing(false);
    addNotification({
      recipientId: currentUser.id,
      subject: 'Identity Profile Updated',
      body: 'Your institutional profile attributes have been synchronized with the central ledger.',
      type: 'system'
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File protocol rejected: Size exceeds 2MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetAvatar = () => {
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`;
    setFormData(prev => ({ ...prev, profilePicture: defaultAvatar }));
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (passData.current !== currentUser.password) {
      setPassError('Current system passkey verification failed.');
      return;
    }
    if (passData.next !== passData.confirm) {
      setPassError('New passkey synchronization mismatch.');
      return;
    }
    if (passData.next.length < 6) {
      setPassError('Protocol requirement: Passkey must be at least 6 characters.');
      return;
    }

    updateEmployee({ ...currentUser, password: passData.next });
    addNotification({
      recipientId: currentUser.id,
      subject: 'Security Protocol: Passkey Updated',
      body: 'Your system access passkey has been successfully rotated and encrypted.',
      type: 'security'
    });
    
    setIsPasswordModalOpen(false);
    setPassData({ current: '', next: '', confirm: '' });
  };

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const isEditable = (field: string) => {
    if (isAdmin) return true; // Admins can edit EVERYTHING
    const allowedFields = ['phone', 'address', 'profilePicture'];
    return allowedFields.includes(field);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-sm relative">
        <div className="h-48 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600" />
        
        <div className="px-6 md:px-10 pb-10">
          <div className="relative flex flex-col items-center -mt-24 md:flex-row md:items-end md:gap-8">
            <div className="relative group">
              <img 
                src={formData.profilePicture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'} 
                alt="Profile" 
                className="w-32 h-32 md:w-40 md:h-40 border-[6px] border-white rounded-[2.5rem] shadow-2xl bg-slate-100 object-cover"
              />
              {isEditing && (
                <>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-900/60 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-none p-0"
                  >
                    <svg className="w-8 h-8 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    <span className="text-[10px] text-white font-black uppercase tracking-widest">Update Avatar</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                  <button 
                    onClick={handleResetAvatar}
                    className="absolute -top-3 -right-3 p-2 bg-white border border-slate-200 rounded-full shadow-lg text-slate-400 hover:text-rose-500 transition-all z-10"
                    title="Reset to default avatar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            
            <div className="flex-1 mt-6 text-center md:mt-0 md:text-left mb-4">
              {isEditing && isAdmin ? (
                <input 
                   type="text"
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight bg-slate-50 border-b-2 border-indigo-600 outline-none w-full max-w-md px-2"
                />
              ) : (
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{formData.name}</h2>
              )}
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                 {isEditing && isAdmin ? (
                   <div className="flex flex-wrap justify-center md:justify-start gap-2">
                      <input 
                        type="text" 
                        value={formData.jobTitle} 
                        onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                        className="text-slate-500 font-black uppercase text-xs bg-slate-50 border-b border-indigo-200 outline-none w-24"
                      />
                      <span className="text-slate-300">•</span>
                      <input 
                        type="text" 
                        value={formData.department} 
                        onChange={e => setFormData({...formData, department: e.target.value})}
                        className="text-slate-500 font-black uppercase text-xs bg-slate-50 border-b border-indigo-200 outline-none w-24"
                      />
                   </div>
                 ) : (
                   <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] md:text-[11px]">{formData.jobTitle} <span className="text-slate-200 mx-1">/</span> {formData.department}</p>
                 )}
                 <span className={`px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${formData.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    {formData.status}
                 </span>
              </div>
            </div>

            <div className="mt-8 md:mt-0 md:mb-6">
              {isEditing ? (
                <div className="flex gap-3">
                  <button onClick={() => { setIsEditing(false); setFormData(currentUser); }} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">Discard</button>
                  <button onClick={handleSave} className="px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">Sync Identity</button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-white border-2 border-indigo-100 rounded-2xl shadow-sm hover:border-indigo-600 transition-all active:scale-95 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Modify Attributes
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12 mt-16 lg:grid-cols-2">
            {/* Communication Access */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                 <h3 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Contact Telemetry</h3>
              </div>
              <div className="space-y-6 bg-slate-50/50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
                <div className="space-y-2">
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital Mailbox</label>
                  {isEditing && isAdmin ? (
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                    />
                  ) : <p className="text-slate-900 font-bold text-base md:text-lg px-1 truncate">{formData.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Phone Line</label>
                  {isEditing && isEditable('phone') ? (
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                    />
                  ) : <p className="text-slate-900 font-bold text-base md:text-lg px-1">{formData.phone || 'Unassigned'}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Residence</label>
                  {isEditing && isEditable('address') ? (
                    <textarea 
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                      rows={3}
                    />
                  ) : <p className="text-slate-900 font-bold leading-relaxed px-1 text-sm md:text-base">{formData.address || 'Field Protocol Restricted'}</p>}
                </div>
              </div>

              {/* Security Section */}
              <div className="flex items-center gap-3 pt-4">
                 <div className="w-1.5 h-6 bg-rose-600 rounded-full" />
                 <h3 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Security Protocols</h3>
              </div>
              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group border border-slate-800">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-45 transition-transform duration-700">
                   <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div className="relative z-10">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Credential Management</p>
                   <p className="text-lg font-black tracking-tight mb-2">Access Passkey Renewal</p>
                   <p className="text-[11px] font-medium opacity-60 leading-relaxed mb-6">Regular rotation of your system passkey is mandated by institutional security protocols.</p>
                   <button 
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="px-8 py-3 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                   >
                     Rotate Passkey
                   </button>
                </div>
              </div>
            </section>

            {/* Organizational Signature */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                 <h3 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Institutional Profile</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 bg-slate-50/50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
                <div className="space-y-2">
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Identifier</label>
                  {isEditing && isAdmin ? (
                    <input 
                      type="text" 
                      value={formData.employeeId} 
                      onChange={e => setFormData({...formData, employeeId: e.target.value})}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl font-mono font-black text-indigo-600 outline-none"
                    />
                  ) : <p className="text-indigo-600 font-mono font-black px-1 text-sm md:text-base">{formData.employeeId}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Join Date</label>
                  {isEditing && isAdmin ? (
                    <input 
                      type="date" 
                      value={formData.joinDate} 
                      onChange={e => setFormData({...formData, joinDate: e.target.value})}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                    />
                  ) : <p className="text-slate-900 font-bold px-1 text-sm md:text-base">{formData.joinDate}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Tier</label>
                  <p className="px-1"><span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest">{formData.role} NODE</span></p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Equity Rate ($)</label>
                  {isEditing && isAdmin ? (
                    <input 
                      type="number" 
                      value={formData.salary} 
                      onChange={e => setFormData({...formData, salary: parseInt(e.target.value)})}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl font-black text-emerald-600 outline-none"
                    />
                  ) : <p className="text-emerald-600 font-black text-lg px-1">${formData.salary?.toLocaleString()}</p>}
                </div>
              </div>

              <div className="p-8 mt-4 bg-indigo-600 text-white rounded-[2.5rem] shadow-xl shadow-indigo-100 relative overflow-hidden group border border-indigo-500">
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:rotate-12 transition-transform duration-500">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="relative z-10">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Vault Storage</p>
                   <p className="text-lg font-black tracking-tight mb-1">Administrative Documents</p>
                   <p className="text-[11px] font-medium opacity-80">Download Contracts, Provisioning Guides, and Benefit Matrix.</p>
                   <button className="mt-6 px-6 py-2.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">Access Files</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Password Rotation Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
          <div className="w-full max-w-lg bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-950 p-8 md:p-10 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-white">Rotate Access Passkey</h3>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Securing Institutional Node Access</p>
                </div>
                <button onClick={() => setIsPasswordModalOpen(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors border border-white/10">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="p-8 md:p-10 space-y-6 bg-white">
              {passError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-3 animate-in shake duration-300">
                   <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                   {passError}
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Passkey</label>
                <div className="relative">
                  <input 
                    type={showPass.current ? "text" : "password"} required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all"
                    value={passData.current}
                    onChange={e => setPassData({...passData, current: e.target.value})}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass({...showPass, current: !showPass.current})} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-2">
                    {showPass.current ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L1 1m11.88 11.88L23 23" /></svg>}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Next Passkey Protocol</label>
                <div className="relative">
                  <input 
                    type={showPass.next ? "text" : "password"} required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all"
                    value={passData.next}
                    onChange={e => setPassData({...passData, next: e.target.value})}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass({...showPass, next: !showPass.next})} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-2">
                    {showPass.next ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L1 1m11.88 11.88L23 23" /></svg>}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Protocol Sync</label>
                <input 
                  type="password" required
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all"
                  value={passData.confirm}
                  onChange={e => setPassData({...passData, confirm: e.target.value})}
                  placeholder="••••••••"
                />
              </div>

              <div className="flex flex-col gap-4 pt-6">
                <button 
                  type="submit"
                  className="w-full py-6 bg-slate-900 text-white font-black rounded-[2rem] shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all uppercase tracking-widest text-xs active:scale-[0.98]"
                >
                  Execute Rotation Protocol
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all text-center"
                >
                  Abort Security Operation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-center">
         <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]">Dayflow Identity Ledger • Secure Node v1.4.2</p>
      </div>
    </div>
  );
};

export default Profile;