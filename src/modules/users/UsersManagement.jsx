import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { api } from '../../services/api';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';
import Modal from '../../components/common/Modal';
import './users.css';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Phone,
    CheckCircle,
    XCircle,
    AlertOctagon,
    Trash2,
    Edit,
    Eye,
    EyeOff,
    X,
    ChevronDown,
    Briefcase,
    Lock,
    Link2,
    User,
    Shield
} from 'lucide-react';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [activeActionDropdown, setActiveActionDropdown] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Fetch users from API
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.get('/api/users/');
            
            if (data) {
                const usersList = data.results || (Array.isArray(data) ? data : []);
                const mappedUsers = usersList.map(u => ({
                    id: u.id,
                    name: `${u.first_name} ${u.last_name}`.trim() || u.username,
                    email: u.email,
                    phone: u.phone || "N/A",
                    role: u.groups?.[0]?.name || u.role || "User",
                    status: u.is_active ? 'Active' : 'Inactive',
                    lastLogin: u.last_login ? new Date(u.last_login).toLocaleString() : "Never",
                    avatar: `${u.first_name?.[0] || u.username?.[0]?.toUpperCase()}${u.last_name?.[0] || u.username?.[1]?.toUpperCase()}`.toUpperCase()
                }));
                setUsers(mappedUsers);
            } else {
                setUsers([]);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Failed to load users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Stats Logic
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'Active').length;
    const inactiveUsers = users.filter(u => u.status === 'Inactive').length;
    const suspendedUsers = users.filter(u => u.status === 'Suspended').length;

    const handleAddUser = async (userData) => {
        try {
            setSubmitting(true);
            const payload = {
                username: userData.username || userData.email.split('@')[0],
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                phone: userData.phone,
                password: userData.password,
                confirm_password: userData.confirm_password,
                is_student: userData.is_student || false,
                is_lecturer: userData.is_lecturer || false,
                is_parent: userData.is_parent || false,
                gender: userData.gender || '',
            };
            if (userData.employee_id) payload.employee_id = userData.employee_id;

            await userService.createUser(payload);
            setIsAddUserOpen(false);
            fetchUsers();
            toast.success('User created successfully');
        } catch (error) {
            console.error('Failed to add user:', error);
            const errData = error.data || {};
            // Re-throw with parsed server errors so the dialog can display them inline
            throw { serverErrors: errData };
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            setSubmitting(true);
            await api.delete(`/api/users/${userId}/`);
            alert('User deleted successfully');
            fetchUsers();
            setActiveActionDropdown(null);
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert(error.data?.message || error.message || 'Failed to delete user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            setSubmitting(true);
            await api.post(`/api/users/${userId}/quick_actions/`, { action: 'toggle_active' });
            fetchUsers();
            setActiveActionDropdown(null);
            alert(`User status changed to ${newStatus}`);
        } catch (error) {
            console.error('Failed to change user status:', error);
            alert(error.data?.message || error.message || 'Failed to change user status');
        } finally {
            setSubmitting(false);
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "All" || user.role === roleFilter;
        const matchesStatus = statusFilter === "All" || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <DashboardLayout title="Users Management">
            <div className="users-page-container">
                {loading ? (
                    <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                        <div className="loading-spinner"></div>
                        <p>Loading users...</p>
                    </div>
                ) : error ? (
                    <div className="error-container" style={{ background: '#fee2e2', color: '#991b1b', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
                        <p>{error}</p>
                        <button onClick={fetchUsers} className="btn btn-primary" style={{ marginTop: '1rem' }}>Retry</button>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="users-header-container">
                    <div className="users-title-group">
                        <h1><Users size={28} /> Users Management</h1>
                        <p className="users-subtitle">Manage system users, roles, and permissions</p>
                    </div>
                    <button onClick={() => setIsAddUserOpen(true)} className="btn-add-user">
                        <UserPlus size={20} /> Add User
                    </button>
                </div>

                {/* Stats Cards - Reusing dashboard.css class 'stats-grid' if possible or defining local */}
                <div className="stats-grid" style={{ marginTop: '2rem' }}>
                    <StatCard title="Total Users" value={totalUsers} icon={Users} color="#3f51b5" iconColor="#3f51b5" trend={12} trendLabel="vs last month" />
                    <StatCard title="Active Users" value={activeUsers} icon={CheckCircle} color="#4caf50" iconColor="#4caf50" trend={8} trendLabel="active now" />
                    <StatCard title="Inactive Users" value={inactiveUsers} icon={XCircle} color="#9e9e9e" iconColor="#9e9e9e" trend={-2} trendLabel="decreasing" />
                    <StatCard title="Suspended" value={suspendedUsers} icon={AlertOctagon} color="#f44336" iconColor="#f44336" trend={0} trendLabel="no change" />
                </div>

                {/* Filters */}
                <div className="users-filters-container">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="users-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filters-group">
                        <div className="select-wrapper">
                            <Briefcase className="select-icon" size={16} />
                            <select
                                className="users-select"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="All">All Roles</option>
                                <option value="Admin">Admin</option>
                                <option value="Management">Management</option>
                                <option value="Teacher">Teacher</option>
                                <option value="Finance">Finance</option>
                                <option value="Procurement">Procurement</option>
                                <option value="HR">HR</option>
                                <option value="Parent">Parent</option>
                            </select>
                            <ChevronDown className="select-arrow" size={16} />
                        </div>

                        <div className="select-wrapper">
                            <Filter className="select-icon" size={16} />
                            <select
                                className="users-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                            <ChevronDown className="select-arrow" size={16} />
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="users-table-container">
                    <div className="table-responsive">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Contact</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Last Login</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar-circle">
                                                    {user.avatar}
                                                </div>
                                                <div className="user-details">
                                                    <h4>{user.name}</h4>
                                                    <span className="user-id">ID: #{user.id.toString().padStart(4, '0')}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-cell">
                                                <div className="contact-item">
                                                    <Mail size={14} /> {user.email}
                                                </div>
                                                <div className="contact-item">
                                                    <Phone size={14} /> {user.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-role-${user.role.toLowerCase()}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-status-${user.status.toLowerCase()}`}>
                                                <span className={`status-dot dot-${user.status.toLowerCase()}`}></span>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {user.lastLogin}
                                        </td>
                                        <td style={{ textAlign: 'right', position: 'relative' }}>
                                            <button
                                                onClick={() => setActiveActionDropdown(activeActionDropdown === user.id ? null : user.id)}
                                                className="action-btn"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {activeActionDropdown === user.id && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setActiveActionDropdown(null)}></div>
                                                    <div className="action-dropdown-menu">
                                                        <button className="dropdown-item">
                                                            <Eye size={16} /> View Details
                                                        </button>
                                                        <button className="dropdown-item">
                                                            <Edit size={16} /> Edit User
                                                        </button>
                                                        {user.status !== 'Active' && (
                                                            <button
                                                                onClick={() => handleStatusChange(user.id, 'Active')}
                                                                className="dropdown-item"
                                                                style={{ color: '#16a34a' }}
                                                            >
                                                                <CheckCircle size={16} /> Activate
                                                            </button>
                                                        )}
                                                        {user.status !== 'Suspended' && (
                                                            <button
                                                                onClick={() => handleStatusChange(user.id, 'Suspended')}
                                                                className="dropdown-item"
                                                                style={{ color: '#ea580c' }}
                                                            >
                                                                <AlertOctagon size={16} /> Suspend
                                                            </button>
                                                        )}
                                                        <div className="dropdown-divider"></div>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="dropdown-item danger"
                                                        >
                                                            <Trash2 size={16} /> Delete User
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                                                <Search size={48} style={{ opacity: 0.3 }} />
                                                <p>No users found matching your filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="table-footer">
                        <span>Showing {filteredUsers.length} of {users.length} users</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="pagination-btn" disabled>Previous</button>
                            <button className="pagination-btn" disabled>Next</button>
                        </div>
                    </div>
                </div>

                {/* Add User Modal */}
                {isAddUserOpen && (
                    <AddUserDialog onClose={() => setIsAddUserOpen(false)} onSubmit={handleAddUser} />
                )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

// Reused Stat Card Structure (Similar to DashbaordHome components)
const StatCard = ({ title, value, icon: Icon, color, iconColor, trend, trendLabel }) => (
    <div className="responsive-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>{title}</p>
            </div>
            <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: iconColor
            }}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{value}</h3>
        </div>
        {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                <span style={{
                    color: trend > 0 ? '#16a34a' : '#dc2626',
                    background: trend > 0 ? '#dcfce7' : '#fee2e2',
                    padding: '2px 8px', borderRadius: '12px', fontWeight: 700
                }}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
                <span style={{ color: 'var(--text-muted)' }}>{trendLabel}</span>
            </div>
        )}
    </div>
);

const AddUserDialog = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', username: '',
        phone: '', password: '', confirm_password: '',
        gender: '', is_student: false, is_lecturer: false, is_parent: false,
        employee_id: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverErrors, setServerErrors] = useState({});

    // Employee picker state
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [unlinkedEmployees, setUnlinkedEmployees] = useState([]);
    const [employeeLoading, setEmployeeLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const validate = () => {
        const errs = {};
        if (!formData.first_name.trim()) errs.first_name = 'Required';
        if (!formData.last_name.trim()) errs.last_name = 'Required';
        if (!formData.email.trim()) errs.email = 'Required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email';
        if (!formData.password) errs.password = 'Required';
        else if (formData.password.length < 8) errs.password = 'Minimum 8 characters';
        if (formData.password !== formData.confirm_password) errs.confirm_password = 'Passwords do not match';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        setServerErrors({});
        try {
            await onSubmit(formData);
        } catch (err) {
            if (err?.serverErrors) {
                setServerErrors(err.serverErrors);
                // Also merge into field-level errors for highlighting
                const fieldErrs = {};
                Object.entries(err.serverErrors).forEach(([field, msgs]) => {
                    if (field !== 'success' && field !== 'status' && field !== 'non_field_errors') {
                        fieldErrs[field] = Array.isArray(msgs) ? msgs[0] : msgs;
                    }
                });
                setErrors(prev => ({ ...prev, ...fieldErrs }));
            } else {
                toast.error('Failed to create user');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEmployeeSearch = async (val) => {
        setEmployeeSearch(val);
        if (val.length < 2) { setUnlinkedEmployees([]); return; }
        setEmployeeLoading(true);
        try {
            const data = await userService.getUnlinkedEmployees(val);
            setUnlinkedEmployees(Array.isArray(data) ? data : data.results || []);
        } catch { setUnlinkedEmployees([]); }
        finally { setEmployeeLoading(false); }
    };

    const selectEmployee = (emp) => {
        setSelectedEmployee(emp);
        const genderMap = { male: 'M', female: 'F', other: 'O' };
        setFormData(p => ({
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
        setErrors({});
    };

    const clearEmployee = () => {
        setSelectedEmployee(null);
        setFormData(p => ({ ...p, first_name: '', last_name: '', email: '', phone: '', gender: '', is_lecturer: false, employee_id: null }));
    };

    const inputClass = (field) =>
        `w-full px-4 py-2.5 bg-white border rounded-xl outline-none transition-all text-sm ${errors[field]
            ? 'border-red-300 focus:ring-4 focus:ring-red-500/10 focus:border-red-500'
            : 'border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500'
        }`;

    const userTypes = [
        { key: 'is_student', label: 'Student', icon: '🎓', color: 'emerald' },
        { key: 'is_lecturer', label: 'Teacher / Lecturer', icon: '👨‍🏫', color: 'blue' },
        { key: 'is_parent', label: 'Parent / Guardian', icon: '👤', color: 'amber' },
    ];

    return (
        <Modal isOpen={true} onClose={onClose}
            title="Create New User"
            subtitle="Add a new user account to the system"
            icon={UserPlus} size="lg" accentColor="bg-indigo-500"
            footer={
                <>
                    <Modal.CancelButton onClick={onClose} />
                    <Modal.SubmitButton onClick={handleSubmit} loading={isSubmitting} label="Create User" />
                </>
            }
        >
            <div className="space-y-6">
                {/* ─── Link from HR Employee ─── */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Link2 size={16} className="text-blue-600" />
                        <span className="text-sm font-semibold text-blue-800">Link to HR Employee</span>
                        <span className="text-[10px] font-medium bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Optional</span>
                    </div>
                    <p className="text-xs text-blue-500 mb-3">Select an existing employee to auto-fill details and link their account</p>

                    {selectedEmployee ? (
                        <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-blue-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-sm font-bold text-blue-600">
                                    {(selectedEmployee.first_name?.[0] || '')}{(selectedEmployee.last_name?.[0] || '')}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {selectedEmployee.full_name || `${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {selectedEmployee.employee_no} · {selectedEmployee.email || selectedEmployee.official_email}
                                    </p>
                                </div>
                            </div>
                            <button onClick={clearEmployee} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group">
                                <X size={16} className="text-gray-400 group-hover:text-red-500" />
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm"
                                placeholder="Search employees by name, ID, or email..."
                                value={employeeSearch}
                                onChange={(e) => handleEmployeeSearch(e.target.value)}
                            />
                            {employeeSearch.length >= 2 && (
                                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                                    {employeeLoading ? (
                                        <div className="px-4 py-4 text-sm text-gray-400 text-center">
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                            Searching employees...
                                        </div>
                                    ) : unlinkedEmployees.length === 0 ? (
                                        <div className="px-4 py-4 text-sm text-gray-400 text-center">
                                            <Briefcase size={20} className="mx-auto mb-1 opacity-40" />
                                            No unlinked employees found
                                        </div>
                                    ) : unlinkedEmployees.map(emp => (
                                        <button key={emp.id} onClick={() => selectEmployee(emp)}
                                            className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0">
                                            <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                                                {(emp.first_name?.[0] || '')}{(emp.last_name?.[0] || '')}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {emp.full_name || `${emp.first_name} ${emp.last_name}`}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {emp.employee_no} · {emp.email || emp.official_email}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ─── Personal Information ─── */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <User size={14} /> Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-400">*</span></label>
                            <input className={inputClass('first_name')} value={formData.first_name}
                                onChange={e => { setFormData(p => ({ ...p, first_name: e.target.value })); setErrors(p => ({ ...p, first_name: undefined })); }}
                                placeholder="Jane" />
                            {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-400">*</span></label>
                            <input className={inputClass('last_name')} value={formData.last_name}
                                onChange={e => { setFormData(p => ({ ...p, last_name: e.target.value })); setErrors(p => ({ ...p, last_name: undefined })); }}
                                placeholder="Doe" />
                            {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="email" className={`${inputClass('email')} pl-9`} value={formData.email}
                                    onChange={e => { setFormData(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: undefined })); }}
                                    placeholder="jane@school.com" />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-gray-400 text-xs font-normal">(auto-generated if empty)</span></label>
                            <input className={inputClass('username')} value={formData.username}
                                onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                                placeholder={formData.email ? formData.email.split('@')[0] : 'janedoe'} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select className={inputClass('gender')} value={formData.gender}
                                onChange={e => setFormData(p => ({ ...p, gender: e.target.value }))}>
                                <option value="">Select gender...</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input className={`${inputClass('phone')} pl-9`} value={formData.phone}
                                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                    placeholder="+254 700 000 000" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Security ─── */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Lock size={14} /> Security
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type={showPassword ? 'text' : 'password'}
                                    className={`${inputClass('password')} pl-9 pr-10`} value={formData.password}
                                    onChange={e => { setFormData(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: undefined })); }}
                                    placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type={showConfirmPassword ? 'text' : 'password'}
                                    className={`${inputClass('confirm_password')} pl-9 pr-10`} value={formData.confirm_password}
                                    onChange={e => { setFormData(p => ({ ...p, confirm_password: e.target.value })); setErrors(p => ({ ...p, confirm_password: undefined })); }}
                                    placeholder="••••••••" />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password}</p>}
                        </div>
                    </div>
                    {formData.password && formData.password.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${formData.password.length >= 12 ? 'w-full bg-green-500'
                                    : formData.password.length >= 8 ? 'w-2/3 bg-yellow-500'
                                    : 'w-1/3 bg-red-500'}`} />
                            </div>
                            <span className={`text-xs font-medium ${formData.password.length >= 12 ? 'text-green-600'
                                : formData.password.length >= 8 ? 'text-yellow-600'
                                : 'text-red-600'}`}>
                                {formData.password.length >= 12 ? 'Strong' : formData.password.length >= 8 ? 'Good' : 'Weak'}
                            </span>
                        </div>
                    )}
                    {/* Server-side validation errors */}
                    {(serverErrors.password || serverErrors.non_field_errors) && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <div className="flex items-start gap-2">
                                <AlertOctagon size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                                <div className="space-y-1">
                                    {serverErrors.password && (
                                        (Array.isArray(serverErrors.password) ? serverErrors.password : [serverErrors.password]).map((msg, i) => (
                                            <p key={i} className="text-xs text-red-600">{msg}</p>
                                        ))
                                    )}
                                    {serverErrors.non_field_errors && (
                                        (Array.isArray(serverErrors.non_field_errors) ? serverErrors.non_field_errors : [serverErrors.non_field_errors]).map((msg, i) => (
                                            <p key={`nf-${i}`} className="text-xs text-red-600">{msg}</p>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── User Type ─── */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Shield size={14} /> User Type
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {userTypes.map(type => {
                            const active = formData[type.key];
                            return (
                                <button key={type.key} type="button"
                                    onClick={() => setFormData(p => ({ ...p, [type.key]: !p[type.key] }))}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${active
                                        ? 'border-indigo-400 bg-indigo-50 shadow-sm shadow-indigo-100'
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                    }`}>
                                    <span className="text-lg">{type.icon}</span>
                                    <div>
                                        <p className={`text-sm font-semibold ${active ? 'text-indigo-700' : 'text-gray-700'}`}>{type.label}</p>
                                    </div>
                                    <div className={`ml-auto w-5 h-5 rounded-md flex items-center justify-center ${active
                                        ? 'bg-indigo-600'
                                        : 'border border-gray-300'}`}>
                                        {active && <CheckCircle size={14} className="text-white" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default UsersManagement;
