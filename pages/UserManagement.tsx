import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { UserRole, Employee } from '../types';

type SortField = 'name' | 'employeeId' | 'email' | 'role' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const UserManagement: React.FC = () => {
  const { currentUser, employees, addEmployee, deleteEmployee, updateEmployee } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Filtering, Sorting, & Pagination State
  const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'DISABLED'>('ALL');
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    email: '',
    password: '',
    role: UserRole.EMPLOYEE,
    employeeId: '',
    jobTitle: '',
    department: 'Engineering',
    status: 'ACTIVE',
    salary: 5000,
    phone: '',
    address: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const handleOpenCreate = () => {
    if (!isAdmin) return;
    setEditingEmp(null);
    setShowPassword(false);
    setFormError(null);
    setFormData({
      name: '',
      email: '',
      password: 'password123',
      role: UserRole.EMPLOYEE,
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      jobTitle: '',
      department: 'Engineering',
      status: 'ACTIVE',
      salary: 5000,
      phone: '',
      address: '',
      joinDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    if (!isAdmin) return;
    setEditingEmp(emp);
    setFormData(emp);
    setShowPassword(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleApprove = (emp: Employee) => {
    if (!isAdmin) return;
    handleOpenEdit({ ...emp, status: 'ACTIVE' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setFormError(null);

    const idRegex = /^EMP-\d{4}$/;
    if (!idRegex.test(formData.employeeId || '')) {
      setFormError('Identity Protocol Violation: ID must follow the EMP-#### format.');
      return;
    }
    
    if (editingEmp) {
      updateEmployee({ ...editingEmp, ...formData } as Employee);
    } else {
      const newEmp: Employee = {
        ...formData,
        id: `emp_${Date.now()}`,
        createdAt: new Date().toLocaleString(),
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
      } as Employee;
      addEmployee(newEmp);
    }
    setIsModalOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterRole('ALL');
    setFilterStatus('ALL');
    setCurrentPage(1);
  };

  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    if (!isAdmin) {
      result = result.filter(emp => emp.status === 'ACTIVE');
    } else {
      if (filterRole !== 'ALL') {
        result = result.filter(emp => emp.role === filterRole);
      }
      if (filterStatus !== 'ALL') {
        result = result.filter(emp => emp.status === filterStatus);
      }
    }

    // Refined case-insensitive dynamic search: matches Name, ID, or Email
    const cleanSearch = searchTerm.trim().toLowerCase();
    if (cleanSearch) {
      result = result.filter(emp => {
        const name = (emp.name || '').toLowerCase();
        const empId = (emp.employeeId || '').toLowerCase();
        const email = (emp.email || '').toLowerCase();
        
        return name.includes(cleanSearch) || 
               empId.includes(cleanSearch) || 
               email.includes(cleanSearch);
      });
    }

    result.sort((a, b) => {
      let valA = (a[sortBy] || '').toString().toLowerCase();
      let valB = (b[sortBy] || '').toString().toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [employees, filterRole, filterStatus, sortBy, sortDirection, searchTerm, isAdmin]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <svg className="w-3 h-3 ml-1 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path d="M5 10l5 5 5-5H5z" /></svg>;
    return sortDirection === 'asc' 
      ? <svg className="w-3 h-3 ml-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 15l5-5 5 5H5z" /></svg>
      : <svg className="w-3 h-3 ml-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 5l5 5 5-5H5z" /></svg>;
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header Deck */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between bg-slate-900 p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-4 bg-indigo-500/10 border border-white/10 rounded-3xl shadow-inner backdrop-blur-md">
             <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
             </svg>
          </div>
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter truncate">{isAdmin ? 'Identity Vault' : 'Personnel Connect'}</h2>
            <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mt-2">Personnel Ledger v2.4.1</p>
          </div>
        </div>
        {isAdmin && (
          <button 
            onClick={handleOpenCreate}
            className="w-full lg:w-auto px-10 py-5 text-white bg-indigo-600 rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-indigo-950/50 hover:bg-indigo-700 transition-all font-black flex items-center justify-center gap-3 group active:scale-95 relative z-10 text-xs uppercase tracking-widest border border-indigo-400/30"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Provision Entity
          </button>
        )}
      </div>

      {/* Filter Hub */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm overflow-hidden">
        <div className="p-6 md:p-10 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            {/* Search Input */}
            <div className="flex-1 max-w-full lg:max-w-md space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Matrix</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                  type="text"
                  placeholder="Identify by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-sm transition-all shadow-inner"
                />
                {(searchTerm || filterRole !== 'ALL' || filterStatus !== 'ALL') && (
                  <button 
                    onClick={clearFilters}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-rose-500 transition-colors"
                    title="Clear All Protocols"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            </div>
            
            {isAdmin && (
              <div className="flex flex-wrap items-center gap-6 md:gap-8">
                {/* Role Toggle */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Tier</label>
                  <div className="flex bg-slate-100 p-1.5 border border-slate-200 rounded-2xl">
                    {['ALL', UserRole.ADMIN, UserRole.EMPLOYEE].map(r => (
                      <button 
                        key={r}
                        onClick={() => { setFilterRole(r as any); setCurrentPage(1); }}
                        className={`px-4 md:px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filterRole === r ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {r === 'ALL' ? 'Any' : r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Validation Status</label>
                  <div className="relative">
                    <select 
                      value={filterStatus}
                      onChange={(e) => { setFilterStatus(e.target.value as any); setCurrentPage(1); }}
                      className="bg-white border border-slate-200 rounded-2xl pl-5 pr-12 py-3.5 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none cursor-pointer w-full sm:w-48 shadow-sm"
                    >
                      <option value="ALL">Any Status</option>
                      <option value="ACTIVE">Verified Active</option>
                      <option value="PENDING">Pending Auth</option>
                      <option value="DISABLED">Node Disabled</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Directory Matrix */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-10 py-6 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('name')}>
                  <div className="flex items-center">Entity Identity <SortIcon field="name" /></div>
                </th>
                <th className="px-10 py-6 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('employeeId')}>
                  <div className="flex items-center">Asset ID <SortIcon field="employeeId" /></div>
                </th>
                <th className="px-10 py-6 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('email')}>
                  <div className="flex items-center">Mail Protocol <SortIcon field="email" /></div>
                </th>
                <th className="px-10 py-6 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('role')}>
                  <div className="flex items-center">Access Tier <SortIcon field="role" /></div>
                </th>
                {isAdmin && (
                  <>
                    <th className="px-10 py-6 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('status')}>
                      <div className="flex items-center">Status <SortIcon field="status" /></div>
                    </th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <img src={emp.profilePicture} className="w-12 h-12 rounded-2xl object-cover bg-slate-100 border border-slate-200 shadow-sm shrink-0" alt="" />
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate tracking-tight">{emp.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{emp.jobTitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                       <p className="text-[11px] font-mono font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 inline-block">
                         {emp.employeeId}
                       </p>
                    </td>
                    <td className="px-10 py-6">
                       <p className="text-xs font-bold text-slate-600 truncate">{emp.email}</p>
                    </td>
                    <td className="px-10 py-6">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border shadow-sm ${emp.role === UserRole.ADMIN ? 'bg-slate-900 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                         {emp.role}
                       </span>
                    </td>
                    {isAdmin && (
                      <>
                        <td className="px-10 py-6">
                           <span className={`px-4 py-2 text-[9px] font-black rounded-xl uppercase tracking-widest border shadow-sm shrink-0 ${
                             emp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                             emp.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                             'bg-slate-100 text-slate-600 border-slate-200'
                           }`}>
                             {emp.status}
                           </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            {emp.status === 'PENDING' && (
                              <button 
                                onClick={() => handleApprove(emp)}
                                className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all border border-transparent hover:border-emerald-100"
                                title="Authorize Node"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                              </button>
                            )}
                            <button 
                              onClick={() => handleOpenEdit(emp)}
                              className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100"
                              title="Modify Identity"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button 
                              onClick={() => { if(window.confirm('Executing Identity Purge... Confirm?')) deleteEmployee(emp.id); }}
                              className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                              title="Purge Identity"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 6 : 4} className="px-10 py-32 text-center">
                    <div className="inline-block p-10 bg-slate-50 rounded-[3rem] border border-slate-100 mb-6">
                       <svg className="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Vault Is Empty For This Search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredEmployees.length > itemsPerPage && (
          <div className="p-8 md:p-10 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredEmployees.length)}</span> of <span className="text-indigo-600">{filteredEmployees.length}</span> Entities
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-xl disabled:opacity-30 transition-all hover:bg-slate-100"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 text-[10px] font-black rounded-xl transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-200 hover:border-indigo-300'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-xl disabled:opacity-30 transition-all hover:bg-slate-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Identity Provisioning Modal */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
          <div className="w-full max-w-4xl bg-white rounded-[3rem] md:rounded-[4rem] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="bg-slate-950 p-10 text-white relative shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tighter">{editingEmp ? 'Identity Modification' : 'Identity Provisioning'}</h3>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Administrative Verification Access</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white/10 rounded-full transition-colors border border-white/10">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white overflow-y-auto no-scrollbar flex-1">
              {formError && (
                <div className="p-5 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-4 animate-in shake duration-300">
                  <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Identity Name</label>
                  <input type="text" required className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.75rem] outline-none font-bold text-slate-900 transition-all focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 shadow-inner" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee ID Protocol</label>
                  <input type="text" required className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.75rem] outline-none font-mono font-black text-indigo-600 shadow-inner" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value.toUpperCase()})} placeholder="EMP-1234" />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mail protocol</label>
                  <input type="email" required className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.75rem] outline-none font-bold text-slate-900 shadow-inner" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Passkey</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.75rem] outline-none font-bold text-slate-900 shadow-inner pr-16" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-all">
                      {showPassword ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L1 1m11.88 11.88L23 23" /></svg>}
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Tier</label>
                  <select className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.75rem] outline-none font-black text-slate-900 shadow-inner appearance-none cursor-pointer" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                    <option value={UserRole.EMPLOYEE}>Standard Node</option>
                    <option value={UserRole.ADMIN}>Admin Primary</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                  <input type="text" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.75rem] outline-none font-bold text-slate-900 shadow-inner" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Designation</label>
                  <input type="text" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.75rem] outline-none font-bold text-slate-900 shadow-inner" value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Protocol</label>
                  <select className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.75rem] outline-none font-black text-slate-900 shadow-inner appearance-none cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-6 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-900 transition-all">Discard Protocol</button>
                <button type="submit" className="flex-[2] py-6 bg-slate-900 text-white font-black rounded-[2.5rem] shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95 uppercase tracking-widest text-sm">
                  {editingEmp ? 'Sync Matrix Update' : 'Initialize Provisioning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;