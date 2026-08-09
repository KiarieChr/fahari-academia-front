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
    Shield,
    Loader2
} from 'lucide-react';

const UsersManagement = ({ noLayout = false }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [stats, setStats] = useState(null);
    const [roles, setRoles] = useState([]);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    
    // Modals
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [roleModalUser, setRoleModalUser] = useState(null);
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [savingRoles, setSavingRoles] = useState(false);
    const [linkEmployeeModalUser, setLinkEmployeeModalUser] = useState(null);
    
    const [activeActionDropdown, setActiveActionDropdown] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Initial data fetch
    useEffect(() => {
        fetchStats();
        fetchRoles();
    }, []);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage === 1) fetchUsers(1);
            else setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Filter effect
    useEffect(() => {
        if (currentPage === 1) fetchUsers(1);
        else setCurrentPage(1);
    }, [roleFilter, statusFilter]);

    // Page change effect
    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const fetchStats = async () => {
        try {
            const data = await userService.getDashboardStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch user stats:', err);
        }
    };

    const fetchRoles = async () => {
        try {
            const data = await userService.getRoles();
            setRoles(data.results || data || []);
        } catch (err) {
            console.error('Failed to fetch roles:', err);
        }
    };

    const fetchUsers = async (page = currentPage) => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {
                page: page,
                search: searchTerm,
                per_page: perPage
            };
            
            if (roleFilter !== "All") params.role = roleFilter;
            if (statusFilter !== "All") params.status = statusFilter;

            const data = await userService.getUsers(params);
            
            if (data) {
                // Handle paginated response
                const usersList = data.results || (Array.isArray(data) ? data : []);
                const pagination = data.pagination || {};
                
                const mappedUsers = usersList.map(u => ({
                    id: u.id,
                    name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username,
                    email: u.email,
                    phone: u.phone || "N/A",
                    role: u.groups?.[0]?.name || u.role || "User",
                    groups: u.groups || [],
                    status: u.is_active ? 'Active' : 'Inactive',
                    lastLogin: u.last_login ? new Date(u.last_login).toLocaleString() : "Never",
                    avatar: `${u.first_name?.[0] || u.username?.[0]?.toUpperCase() || 'U'}${u.last_name?.[0] || u.username?.[1]?.toUpperCase() || ''}`.toUpperCase(),
                    employee_id: u.employee_id,
                    employee_no: u.employee_no,
                    employee_name: u.employee_name,
                    is_student: u.is_student,
                    is_parent: u.is_parent
                }));
                
                setUsers(mappedUsers);
                setTotalPages(pagination.total_pages || 1);
                setTotalCount(pagination.total_count || mappedUsers.length);
            } else {
                setUsers([]);
                setTotalCount(0);
                setTotalPages(1);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Failed to load users from server');
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
            toast.success('User deleted successfully');
            fetchUsers();
            setActiveActionDropdown(null);
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast.error(error.data?.message || error.message || 'Failed to delete user');
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
            toast.success(`User status changed successfully`);
        } catch (error) {
            console.error('Failed to change user status:', error);
            toast.error(error.data?.message || error.message || 'Failed to change user status');
        } finally {
            setSubmitting(false);
        }
    };

    // Server-side filtered count instead of local subset
    const filteredUsersCount = totalCount;
    
    // We already have the correct users in state from fetchUsers
    const displayUsers = users;

    const content = (
            <div className="users-page-container">
                {loading ? (
                    <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                        <div className="loading-spinner"></div>
                        <p>Loading users...</p>
                    </div>
                ) : error ? (
                    <div className="error-container" style={{ background: '#fee2e2', color: '#991b1b', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
                        <p>{error}</p>
                        <button onClick={() => fetchUsers(currentPage)} className="btn btn-primary" style={{ marginTop: '1rem' }}>Retry</button>
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

                {/* Stats Cards */}
                <div className="stats-grid" style={{ marginTop: '2rem' }}>
                    <StatCard 
                        title="Total Users" 
                        value={stats?.total_users ?? '...'} 
                        icon={Users} 
                        color="#3f51b5" 
                        iconColor="#3f51b5" 
                        trend={12} 
                        trendLabel="vs last month" 
                    />
                    <StatCard 
                        title="Active Users" 
                        value={stats?.active_users ?? '...'} 
                        icon={CheckCircle} 
                        color="#4caf50" 
                        iconColor="#4caf50" 
                        trend={8} 
                        trendLabel="active now" 
                    />
                    <StatCard 
                        title="Inactive Users" 
                        value={stats?.inactive_users ?? '...'} 
                        icon={XCircle} 
                        color="#9e9e9e" 
                        iconColor="#9e9e9e" 
                        trend={-2} 
                        trendLabel="decreasing" 
                    />
                    <StatCard 
                        title="Students" 
                        value={stats?.students ?? '...'} 
                        icon={Shield} 
                        color="#f44336" 
                        iconColor="#f44336" 
                        trend={0} 
                        trendLabel="enrolled" 
                    />
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
                                    <th>HR Profile</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Last Login</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayUsers.length > 0 ? displayUsers.map((user) => (
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
                                            {user.employee_id ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-800">{user.employee_name}</span>
                                                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full self-start mt-1 font-medium">{user.employee_no}</span>
                                                </div>
                                            ) : user.is_student ? (
                                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                                                    Student Profile
                                                </span>
                                            ) : user.is_parent ? (
                                                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
                                                    Parent Profile
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={() => setLinkEmployeeModalUser(user)} 
                                                    className="text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 flex items-center gap-1"
                                                >
                                                    <Link2 size={12} />
                                                    Link Profile
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            <div className="role-badges-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {user.groups && user.groups.length > 0 ? (
                                                    user.groups.map(g => (
                                                        <span key={g.id} className="badge badge-role-generic" style={{ background: '#f0f4ff', color: '#3f51b5', border: '1px solid #d0d7ff' }}>
                                                            {g.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className={`badge badge-role-${user.role.toLowerCase()}`}>
                                                        {user.role}
                                                    </span>
                                                )}
                                            </div>
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
                                                        {(!user.is_student && !user.is_parent) && (
                                                            <button className="dropdown-item" onClick={() => { setActiveActionDropdown(null); setLinkEmployeeModalUser(user); }}>
                                                                <Link2 size={16} /> Link HR Profile
                                                            </button>
                                                        )}
                                                        <button className="dropdown-item" onClick={() => openRoleModal(user)}>
                                                            <Shield size={16} /> Assign Roles
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
                        <span>Showing {displayUsers.length} users on page {currentPage} of {totalPages} (Total: {totalCount})</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                                className="pagination-btn" 
                                disabled={currentPage <= 1 || loading}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                Previous
                            </button>
                            <div className="pagination-pages" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    // Simple windowed pagination
                                    let pageNum;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;
                                    
                                    return (
                                        <button 
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`pagination-page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                            style={{
                                                padding: '0.5rem 0.8rem',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)',
                                                background: currentPage === pageNum ? 'var(--primary-color)' : 'transparent',
                                                color: currentPage === pageNum ? 'white' : 'var(--text-main)',
                                                fontWeight: currentPage === pageNum ? 'bold' : 'normal',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button 
                                className="pagination-btn" 
                                disabled={currentPage >= totalPages || loading}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add User Modal */}
                {isAddUserOpen && (
                    <AddUserDialog onClose={() => setIsAddUserOpen(false)} onSubmit={handleAddUser} />
                )}

                {/* Assign Roles Modal */}
                {roleModalUser && (
                    <Modal isOpen={true} onClose={() => setRoleModalUser(null)}
                        title={`Assign Roles — ${roleModalUser.name}`}
                        subtitle="Manage user permissions by assigning security roles"
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
                                    No roles found in the system.
                                </div>
                            ) : roles.map(role => {
                                const isSelected = selectedRoleIds.includes(role.id);
                                return (
                                    <button key={role.id} onClick={() => toggleRoleSelection(role.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${isSelected
                                            ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
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

                {/* Link HR Employee Modal */}
                {linkEmployeeModalUser && (
                    <LinkEmployeeDialog 
                        user={linkEmployeeModalUser} 
                        onClose={() => setLinkEmployeeModalUser(null)} 
                        onLinked={() => {
                            setLinkEmployeeModalUser(null);
                            fetchUsers();
                        }} 
                    />
                )}
                    </>)
            }
            </div>
    );

    return noLayout ? content : (
        <DashboardLayout title="Users Management">{content}</DashboardLayout>
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
        `w-full px-5 py-4 bg-gray-50/50 hover:bg-gray-50 focus:bg-white border-2 rounded-2xl outline-none transition-all text-[15px] font-semibold text-gray-900 placeholder:text-gray-300 ${errors[field]
            ? 'border-red-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/5 shadow-sm'
            : 'border-gray-50 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 shadow-sm hover:border-gray-200'
        }`;

    const userTypes = [
        { key: 'is_student', label: 'Student', icon: '🎓', color: 'emerald' },
        { key: 'is_lecturer', label: 'Teacher / Lecturer', icon: '👨‍🏫', color: 'blue' },
        { key: 'is_parent', label: 'Parent / Guardian', icon: '👤', color: 'amber' },
    ];

    return (
        <Modal isOpen={true} onClose={onClose}
            title="Create New User"
            subtitle="Securely provision a new account into the school's identity system"
            icon={UserPlus} size="lg" accentColor="bg-indigo-600"
            footer={
                <div className="px-4 w-full flex justify-end gap-3">
                    <Modal.CancelButton onClick={onClose} />
                    <Modal.SubmitButton onClick={handleSubmit} loading={isSubmitting} label="Initialize Account" />
                </div>
            }
        >
            <div className="px-4 py-2 space-y-12">
                {/* ─── Identity Receipt Header ─── */}
                <div className="relative overflow-hidden bg-white rounded-[24px] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex gap-6 items-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-indigo-200">
                                {formData.first_name?.[0] || '?'}{formData.last_name?.[0] || ''}
                            </div>
                            <div className="text-center sm:text-left">
                                <h4 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
                                    {formData.first_name || 'New'} {formData.last_name || 'User'}
                                </h4>
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-base font-medium text-gray-400">
                                    <Mail size={16} className="text-indigo-400" /> {formData.email || 'pending.email@school.com'}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center sm:items-end gap-3">
                            <div className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${formData.password ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {formData.password ? 'Ready for Sync' : 'Configuration Draft'}
                            </div>
                            <span className="text-[11px] font-bold text-gray-300 tracking-[0.2em] uppercase">
                                {selectedEmployee ? 'System Linked' : 'Direct Provision'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ─── Employee Synchronization ─── */}
                <div className="space-y-5 px-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Link2 size={16} />
                        </div>
                        <h5 className="text-[13px] font-black text-gray-400 uppercase tracking-[0.15em]">Employee Synchronization</h5>
                    </div>
                    
                    <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 transition-all">
                        {selectedEmployee ? (
                            <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                                        {selectedEmployee.first_name?.[0]}{selectedEmployee.last_name?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-gray-900">{selectedEmployee.full_name}</p>
                                        <p className="text-sm text-gray-400 font-medium">{selectedEmployee.employee_no} · {selectedEmployee.designation || 'Staff Member'}</p>
                                    </div>
                                </div>
                                <button onClick={clearEmployee} className="p-2.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative group">
                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    className="w-full pl-12 pr-5 py-4 bg-white border-2 border-gray-50 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 rounded-2xl outline-none text-[15px] font-semibold text-gray-900 transition-all shadow-sm placeholder:text-gray-300"
                                    placeholder="Search HR database to link an existing employee..."
                                    value={employeeSearch}
                                    onChange={(e) => handleEmployeeSearch(e.target.value)}
                                />
                                {employeeSearch.length >= 2 && (
                                    <div className="absolute z-20 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                        {employeeLoading ? (
                                            <div className="p-10 text-center"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
                                        ) : unlinkedEmployees.length === 0 ? (
                                            <div className="p-10 text-center text-gray-400 text-base font-medium">No results found in HR registry</div>
                                        ) : unlinkedEmployees.map(emp => (
                                            <button key={emp.id} onClick={() => selectEmployee(emp)}
                                                className="w-full text-left px-7 py-5 hover:bg-indigo-50/50 flex items-center gap-5 border-b border-gray-50 last:border-0 transition-all">
                                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center font-bold text-gray-400 group-hover:bg-white transition-colors">{emp.first_name?.[0]}{emp.last_name?.[0]}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-base font-bold text-gray-900 truncate">{emp.full_name}</p>
                                                    <p className="text-sm text-gray-400 truncate">{emp.employee_no} · {emp.official_email || emp.email}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Profile Identity ─── */}
                <div className="space-y-7 px-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <User size={16} />
                        </div>
                        <h5 className="text-[13px] font-black text-gray-400 uppercase tracking-[0.15em]">Primary Identity</h5>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
                        <div className="space-y-2.5">
                            <label className="text-[12px] font-black text-gray-500 uppercase tracking-widest ml-1">Legal First Name</label>
                            <input className={inputClass('first_name')} value={formData.first_name}
                                onChange={e => { setFormData(p => ({ ...p, first_name: e.target.value })); setErrors(p => ({ ...p, first_name: undefined })); }}
                                placeholder="Timothy" />
                            {errors.first_name && <p className="text-xs text-red-500 font-bold ml-1">{errors.first_name}</p>}
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[12px] font-black text-gray-500 uppercase tracking-widest ml-1">Legal Last Name</label>
                            <input className={inputClass('last_name')} value={formData.last_name}
                                onChange={e => { setFormData(p => ({ ...p, last_name: e.target.value })); setErrors(p => ({ ...p, last_name: undefined })); }}
                                placeholder="Smith" />
                            {errors.last_name && <p className="text-xs text-red-500 font-bold ml-1">{errors.last_name}</p>}
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[12px] font-black text-gray-500 uppercase tracking-widest ml-1">Official Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input type="email" className={`${inputClass('email')} pl-12`} value={formData.email}
                                    onChange={e => { setFormData(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: undefined })); }}
                                    placeholder="tim@school.com" />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 font-bold ml-1">{errors.email}</p>}
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[12px] font-black text-gray-500 uppercase tracking-widest ml-1">System Username</label>
                            <input className={inputClass('username')} value={formData.username}
                                onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                                placeholder={formData.email ? formData.email.split('@')[0] : 'tim.smith'} />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[12px] font-black text-gray-500 uppercase tracking-widest ml-1">Gender Identity</label>
                            <select className={inputClass('gender')} value={formData.gender}
                                onChange={e => setFormData(p => ({ ...p, gender: e.target.value }))}>
                                <option value="">Undisclosed</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[12px] font-black text-gray-500 uppercase tracking-widest ml-1">Mobile Contact</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input className={`${inputClass('phone')} pl-12`} value={formData.phone}
                                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                    placeholder="+254 7..." />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Security Configuration ─── */}
                <div className="space-y-7 px-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Lock size={16} />
                        </div>
                        <h5 className="text-[13px] font-black text-gray-400 uppercase tracking-[0.15em]">Security Protocol</h5>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
                        <div className="space-y-2.5">
                            <label className="text-[12px] font-black text-gray-500 uppercase tracking-widest ml-1">Provision Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input type={showPassword ? 'text' : 'password'}
                                    className={`${inputClass('password')} pl-12 pr-14`} value={formData.password}
                                    onChange={e => { setFormData(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: undefined })); }}
                                    placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-indigo-600 transition-colors">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 font-bold ml-1">{errors.password}</p>}
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[12px] font-black text-gray-500 uppercase tracking-widest ml-1">Verification Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input type={showConfirmPassword ? 'text' : 'password'}
                                    className={`${inputClass('confirm_password')} pl-12 pr-14`} value={formData.confirm_password}
                                    onChange={e => { setFormData(p => ({ ...p, confirm_password: e.target.value })); setErrors(p => ({ ...p, confirm_password: undefined })); }}
                                    placeholder="••••••••" />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-indigo-600 transition-colors">
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.confirm_password && <p className="text-xs text-red-500 font-bold ml-1">{errors.confirm_password}</p>}
                        </div>
                    </div>
                </div>

                {/* ─── Classification ─── */}
                <div className="space-y-7 px-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Shield size={16} />
                        </div>
                        <h5 className="text-[13px] font-black text-gray-400 uppercase tracking-[0.15em]">Account Classification</h5>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {userTypes.map(type => {
                            const active = formData[type.key];
                            return (
                                <button key={type.key} type="button"
                                    onClick={() => setFormData(p => ({ ...p, [type.key]: !p[type.key] }))}
                                    className={`group flex flex-col gap-5 p-6 rounded-2xl border-2 transition-all text-left ${active
                                        ? 'border-indigo-600 bg-indigo-50/30 shadow-[0_15px_45px_rgba(79,70,229,0.12)]'
                                        : 'border-gray-50 bg-white hover:border-gray-200'
                                    }`}>
                                    <div className="flex justify-between items-center w-full">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-all ${active ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
                                            {type.icon}
                                        </div>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${active ? 'bg-indigo-600 text-white scale-110' : 'bg-gray-100 text-gray-300'}`}>
                                            <CheckCircle size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className={`text-base font-black tracking-tight ${active ? 'text-indigo-900' : 'text-gray-900'}`}>{type.label}</p>
                                        <p className="text-xs font-medium text-gray-400 mt-1">Grants {type.label.split(' ')[0]} access level</p>
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

const LinkEmployeeDialog = ({ user, onClose, onLinked }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    // Debounced search
    useEffect(() => {
        const fetchEmployees = async () => {
            if (!searchTerm.trim()) {
                setEmployees([]);
                return;
            }
            try {
                setSearching(true);
                const response = await userService.getUnlinkedEmployees(searchTerm);
                // getUnlinkedEmployees returns response with data, but it might just return the data directly depending on interceptor
                setEmployees(response.data || response || []);
            } catch (err) {
                toast.error('Failed to search employees');
            } finally {
                setSearching(false);
            }
        };

        const timer = setTimeout(fetchEmployees, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleLink = async () => {
        if (!selectedEmployee) return;
        try {
            setLoading(true);
            await userService.linkEmployee(user.id, selectedEmployee.id);
            toast.success('Employee linked successfully');
            onLinked();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to link employee');
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose}
            title={`Link HR Profile — ${user.name}`}
            subtitle="Search and link an existing HR employee profile to this user account."
            icon={Link2} size="md" accentColor="bg-indigo-500"
            footer={
                <>
                    <Modal.CancelButton onClick={onClose} />
                    <Modal.SubmitButton 
                        onClick={handleLink} 
                        loading={loading} 
                        label="Link Profile" 
                        disabled={!selectedEmployee} 
                    />
                </>
            }
        >
            <div className="space-y-6">
                {/* Search Bar */}
                <div className="space-y-2.5">
                    <label className="text-[12px] font-black text-gray-500 uppercase tracking-widest ml-1">Search Employee Database</label>
                    <div className="relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text" 
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-[15px] font-bold text-gray-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                            value={searchTerm}
                            style={{paddingLeft:'40px', paddingRight:'10px'}}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, ID, or email..."
                        />
                        {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={18} />}
                    </div>
                </div>

                {/* Results List */}
                {searchTerm.trim() && (
                    <div className="bg-gray-50 rounded-2xl p-2 max-h-60 overflow-y-auto border border-gray-100">
                        {employees.length === 0 && !searching ? (
                            <div className="text-center py-6 text-gray-400 font-medium text-sm">
                                No unlinked employees found matching "{searchTerm}"
                            </div>
                        ) : (
                            employees.map(emp => (
                                <button
                                    key={emp.id}
                                    type="button"
                                    onClick={() => setSelectedEmployee(emp.id === selectedEmployee?.id ? null : emp)}
                                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                                        selectedEmployee?.id === emp.id 
                                        ? 'bg-indigo-600 text-white shadow-md' 
                                        : 'hover:bg-gray-100 bg-white border border-gray-100 mb-1'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                                        selectedEmployee?.id === emp.id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {emp.first_name[0]}{emp.last_name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold">{emp.first_name} {emp.last_name}</p>
                                        <p className={`text-xs font-medium ${selectedEmployee?.id === emp.id ? 'text-indigo-100' : 'text-gray-400'}`}>
                                            ID: {emp.employee_no} • {emp.official_email || emp.personal_email}
                                        </p>
                                    </div>
                                    {selectedEmployee?.id === emp.id && (
                                        <CheckCircle className="ml-auto" size={20} />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default UsersManagement;
