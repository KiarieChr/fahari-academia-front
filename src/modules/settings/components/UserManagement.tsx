import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, Search, Plus, Edit, Trash2, Shield, ChevronLeft, ChevronRight,
    Check, X, User, Mail, Phone, Calendar, MoreVertical, Power, RefreshCw,
    Eye, EyeOff, AlertCircle, CheckCircle, Clock, Briefcase, Link2
} from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../components/common/Modal';
import { userService } from '../../../services/userService';

const ROLE_COLORS = {
    Admin: 'bg-red-50 text-red-700 border-red-200',
    Teacher: 'bg-blue-50 text-blue-700 border-blue-200',
    Lecturer: 'bg-blue-50 text-blue-700 border-blue-200',
    Student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Parent: 'bg-amber-50 text-amber-700 border-amber-200',
    'Dep Head': 'bg-purple-50 text-purple-700 border-purple-200',
    default: 'bg-gray-50 text-gray-700 border-gray-200',
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [stats, setStats] = useState(null);

    // Modals
    const [roleModalUser, setRoleModalUser] = useState(null);
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [savingRoles, setSavingRoles] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newUser, setNewUser] = useState({
        first_name: '', last_name: '', email: '', username: '',
        password: '', confirm_password: '',
        is_student: false, is_lecturer: false, is_parent: false,
        gender: '', phone: '', employee_id: null
    });

    // Employee picker
    const [unlinkedEmployees, setUnlinkedEmployees] = useState([]);
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [employeeLoading, setEmployeeLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const PAGE_SIZE = 20;

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, page_size: PAGE_SIZE, ordering: '-date_joined' };
            if (search) params.search = search;
            if (statusFilter === 'active') params.is_active = true;
            if (statusFilter === 'inactive') params.is_active = false;
            if (statusFilter === 'pending_setup') params.is_first_login = true;

            const data = await userService.getUsers(params);
            setUsers(data.results || data || []);
            setTotalCount(data.count || 0);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    const fetchRoles = useCallback(async () => {
        try {
            const data = await userService.getRoles();
            setRoles(data.results || data || []);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const data = await userService.getDashboardStats();
            setStats(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);
    useEffect(() => { fetchRoles(); fetchStats(); }, [fetchRoles, fetchStats]);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    // ── Actions ──────────────────────────────────────────────────
    const handleToggleActive = async (user) => {
        try {
            await userService.quickAction(user.id, { action: 'toggle_active' });
            toast.success(`${user.first_name} ${user.is_active ? 'deactivated' : 'activated'}`);
            fetchUsers();
            fetchStats();
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const handleResetSetup = async (user) => {
        try {
            await userService.quickAction(user.id, { action: 'reset_first_login' });
            toast.success(`${user.first_name} will be required to complete setup on next login`);
            fetchUsers();
            fetchStats();
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const openRoleModal = (user) => {
        setRoleModalUser(user);
        setSelectedRoleIds((user.groups || []).map(g => g.id));
    };

    const handleSaveRoles = async () => {
        setSavingRoles(true);
        try {
            await userService.assignRoles(roleModalUser.id, selectedRoleIds);
            toast.success('Roles updated successfully');
            setRoleModalUser(null);
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update roles');
        } finally {
            setSavingRoles(false);
        }
    };

    const toggleRoleSelection = (roleId) => {
        setSelectedRoleIds(prev =>
            prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
        );
    };

    const handleCreateUser = async () => {
        setCreateLoading(true);
        try {
            await userService.createUser(newUser);
            toast.success('User created successfully');
            setCreateModal(false);
            setNewUser({
                first_name: '', last_name: '', email: '', username: '',
                password: '', confirm_password: '',
                is_student: false, is_lecturer: false, is_parent: false,
                gender: '', phone: '', employee_id: null
            });
            setSelectedEmployee(null);
            setEmployeeSearch('');
            fetchUsers();
            fetchStats();
        } catch (err) {
            const errors = err.response?.data?.errors || err.response?.data;
            if (errors && typeof errors === 'object') {
                Object.entries(errors).forEach(([field, msgs]) => {
                    const msg = Array.isArray(msgs) ? msgs[0] : msgs;
                    toast.error(`${field}: ${msg}`);
                });
            } else {
                toast.error('Failed to create user');
            }
        } finally {
            setCreateLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-gray-900 text-sm";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {[
                        { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Students', value: stats.students, icon: User, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Lecturers', value: stats.lecturers, icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Parents', value: stats.parents, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Active', value: stats.active_users, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Inactive', value: stats.inactive_users, icon: Power, color: 'text-red-600', bg: 'bg-red-50' },
                        { label: 'Pending Setup', value: stats.first_login_pending, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                                <stat.icon size={18} className={stat.color} />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-gray-900">{stat.value ?? 0}</p>
                                <p className="text-xs text-gray-500">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 w-full md:w-auto">
                        <div className="relative flex-1 md:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search users..."
                                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-lg overflow-x-auto">
                            {[
                                { value: '', label: 'All' },
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                                { value: 'pending_setup', label: 'Pending Setup' },
                            ].map(opt => (
                                <button key={opt.value} onClick={() => { setStatusFilter(opt.value); setPage(1); }}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${statusFilter === opt.value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => fetchUsers()} className="p-2.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                            <RefreshCw size={16} />
                        </button>
                        <button onClick={() => setCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-sm">
                            <Plus size={16} /> Add User
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/60">
                            <tr>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Roles</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Login</th>
                                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={7} className="py-16 text-center text-sm text-gray-400">Loading users...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={7} className="py-16 text-center text-sm text-gray-400">No users found</td></tr>
                            ) : users.map(user => {
                                const userType = user.is_superuser ? 'Admin' : user.is_lecturer ? 'Lecturer' :
                                    user.is_student ? 'Student' : user.is_parent ? 'Parent' : user.is_dep_head ? 'Dep Head' : 'User';
                                const colorClass = ROLE_COLORS[userType] || ROLE_COLORS.default;

                                return (
                                    <tr key={user.id} className="hover:bg-gray-50/40 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                                                    {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name || user.username}</p>
                                                    <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="text-sm text-gray-600 truncate">{user.email || '—'}</p>
                                            <p className="text-xs text-gray-400">{user.phone || '—'}</p>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${colorClass}`}>
                                                {userType}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex flex-wrap gap-1">
                                                {(user.groups || []).length > 0 ? user.groups.map(g => (
                                                    <span key={g.id} className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                                                        {g.name}
                                                    </span>
                                                )) : (
                                                    <span className="text-xs text-gray-400 italic">No roles</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full w-fit ${user.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                                {user.is_first_login && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-orange-50 text-orange-600 w-fit">
                                                        <Clock size={10} /> Pending Setup
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-500">
                                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : <span className="text-xs text-gray-400 italic">Never</span>}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openRoleModal(user)} title="Manage Roles"
                                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <Shield size={15} />
                                                </button>
                                                <button onClick={() => handleToggleActive(user)} title={user.is_active ? 'Deactivate' : 'Activate'}
                                                    className={`p-1.5 rounded-lg transition-colors ${user.is_active ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                                                    <Power size={15} />
                                                </button>
                                                {!user.is_first_login && (
                                                    <button onClick={() => handleResetSetup(user)} title="Reset First-Time Setup"
                                                        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                                                        <RefreshCw size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/30">
                        <p className="text-xs text-gray-500">
                            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 disabled:opacity-40 hover:bg-white transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                                const p = start + i;
                                if (p > totalPages) return null;
                                return (
                                    <button key={p} onClick={() => setPage(p)}
                                        className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-white'}`}>
                                        {p}
                                    </button>
                                );
                            })}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 disabled:opacity-40 hover:bg-white transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Assign Roles Modal ────────────────────────────── */}
            {roleModalUser && (
                <Modal isOpen={true} onClose={() => setRoleModalUser(null)}
                    title={`Assign Roles — ${roleModalUser.full_name || roleModalUser.username}`}
                    subtitle="Select which roles this user should have"
                    icon={Shield} size="md" accentColor="bg-indigo-500"
                    footer={
                        <>
                            <Modal.CancelButton onClick={() => setRoleModalUser(null)} />
                            <Modal.SubmitButton onClick={handleSaveRoles} loading={savingRoles} label="Save Roles" />
                        </>
                    }
                >
                    <div className="space-y-2">
                        {roles.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                <Shield size={32} className="mx-auto mb-2 opacity-40" />
                                No roles defined yet. Create roles in the Roles tab first.
                            </div>
                        ) : roles.map(role => {
                            const isSelected = selectedRoleIds.includes(role.id);
                            return (
                                <button key={role.id} onClick={() => toggleRoleSelection(role.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${isSelected
                                        ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
                                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            {isSelected ? <Check size={16} /> : <Shield size={14} />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold ${isSelected ? 'text-indigo-900' : 'text-gray-800'}`}>{role.name}</p>
                                            <p className="text-xs text-gray-400">{role.permissions?.length || 0} permissions · {role.user_count || 0} members</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </Modal>
            )}

            {/* ── Create User Modal ────────────────────────────── */}
            {createModal && (
                <Modal isOpen={true} onClose={() => setCreateModal(false)}
                    title="Create New User" subtitle="Add a new user to the system"
                    icon={Plus} size="lg" accentColor="bg-emerald-500"
                    footer={
                        <>
                            <Modal.CancelButton onClick={() => setCreateModal(false)} />
                            <Modal.SubmitButton onClick={handleCreateUser} loading={createLoading} label="Create User" />
                        </>
                    }
                >
                    <div className="space-y-5">
                        {/* Link from HR Employee */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Link2 size={16} className="text-blue-600" />
                                <label className="text-sm font-semibold text-blue-800">Link to HR Employee (Optional)</label>
                            </div>
                            <p className="text-xs text-blue-600 mb-3">Pick an employee from HR to auto-fill details and link accounts</p>
                            {selectedEmployee ? (
                                <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-blue-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Briefcase size={16} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{selectedEmployee.full_name || `${selectedEmployee.first_name} ${selectedEmployee.last_name}`}</p>
                                            <p className="text-xs text-gray-500">{selectedEmployee.employee_no} · {selectedEmployee.email || selectedEmployee.official_email}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => {
                                        setSelectedEmployee(null);
                                        setNewUser(p => ({ ...p, first_name: '', last_name: '', email: '', phone: '', gender: '', employee_id: null }));
                                    }} className="p-1 hover:bg-gray-100 rounded-lg"><X size={16} className="text-gray-400" /></button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm"
                                        placeholder="Search employees by name, ID, or email..."
                                        value={employeeSearch}
                                        onChange={async (e) => {
                                            const val = e.target.value;
                                            setEmployeeSearch(val);
                                            if (val.length >= 2) {
                                                setEmployeeLoading(true);
                                                try {
                                                    const data = await userService.getUnlinkedEmployees(val);
                                                    setUnlinkedEmployees(Array.isArray(data) ? data : data.results || []);
                                                } catch { setUnlinkedEmployees([]); }
                                                finally { setEmployeeLoading(false); }
                                            } else { setUnlinkedEmployees([]); }
                                        }}
                                    />
                                    {employeeSearch.length >= 2 && (
                                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                            {employeeLoading ? (
                                                <div className="px-4 py-3 text-sm text-gray-400 text-center">Searching...</div>
                                            ) : unlinkedEmployees.length === 0 ? (
                                                <div className="px-4 py-3 text-sm text-gray-400 text-center">No unlinked employees found</div>
                                            ) : unlinkedEmployees.map(emp => (
                                                <button key={emp.id} onClick={() => {
                                                    setSelectedEmployee(emp);
                                                    const genderMap = { male: 'M', female: 'F', other: 'O' };
                                                    setNewUser(p => ({
                                                        ...p,
                                                        first_name: emp.first_name || '',
                                                        last_name: emp.last_name || '',
                                                        email: emp.email || emp.official_email || '',
                                                        phone: emp.phone || emp.phone_primary || '',
                                                        gender: genderMap[emp.gender] || '',
                                                        is_lecturer: emp.employee_category === 'teaching',
                                                        employee_id: emp.id,
                                                    }));
                                                    setEmployeeSearch('');
                                                    setUnlinkedEmployees([]);
                                                }} className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 transition-colors">
                                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                                                        {(emp.first_name?.[0] || '')}{(emp.last_name?.[0] || '')}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{emp.full_name || `${emp.first_name} ${emp.last_name}`}</p>
                                                        <p className="text-xs text-gray-500">{emp.employee_no} · {emp.email || emp.official_email}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>First Name *</label>
                                <input className={inputClass} value={newUser.first_name}
                                    onChange={e => setNewUser(p => ({ ...p, first_name: e.target.value }))} placeholder="Jane" />
                            </div>
                            <div>
                                <label className={labelClass}>Last Name *</label>
                                <input className={inputClass} value={newUser.last_name}
                                    onChange={e => setNewUser(p => ({ ...p, last_name: e.target.value }))} placeholder="Doe" />
                            </div>
                            <div>
                                <label className={labelClass}>Email *</label>
                                <input type="email" className={inputClass} value={newUser.email}
                                    onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="jane@school.com" />
                            </div>
                            <div>
                                <label className={labelClass}>Username</label>
                                <input className={inputClass} value={newUser.username}
                                    onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))} placeholder="janedoe" />
                            </div>
                            <div>
                                <label className={labelClass}>Password *</label>
                                <input type="password" className={inputClass} value={newUser.password}
                                    onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
                            </div>
                            <div>
                                <label className={labelClass}>Confirm Password *</label>
                                <input type="password" className={inputClass} value={newUser.confirm_password}
                                    onChange={e => setNewUser(p => ({ ...p, confirm_password: e.target.value }))} placeholder="••••••••" />
                            </div>
                            <div>
                                <label className={labelClass}>Gender</label>
                                <select className={inputClass} value={newUser.gender}
                                    onChange={e => setNewUser(p => ({ ...p, gender: e.target.value }))}>
                                    <option value="">Select...</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Phone</label>
                                <input className={inputClass} value={newUser.phone}
                                    onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))} placeholder="+254..." />
                            </div>
                        </div>

                        {/* User Type */}
                        <div>
                            <label className={labelClass}>User Type</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {[
                                    { key: 'is_student', label: 'Student', color: 'emerald' },
                                    { key: 'is_lecturer', label: 'Teacher/Lecturer', color: 'blue' },
                                    { key: 'is_parent', label: 'Parent', color: 'amber' },
                                ].map(type => (
                                    <button key={type.key}
                                        onClick={() => setNewUser(p => ({ ...p, [type.key]: !p[type.key] }))}
                                        className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${newUser[type.key]
                                            ? `bg-${type.color}-50 border-${type.color}-300 text-${type.color}-700 ring-2 ring-${type.color}-500/20`
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}>
                                        {newUser[type.key] && <Check size={14} className="inline mr-1" />}
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default UserManagement;
