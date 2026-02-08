import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { api } from '../../services/api';
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
    X,
    ChevronDown,
    Briefcase
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
            const response = await api.get('/api/users/');
            const data = response?.data;
            
            if (data) {
                const usersList = data.success ? data.results : (Array.isArray(data) ? data : []);
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
                username: userData.email.split('@')[0],
                email: userData.email,
                first_name: userData.name.split(' ')[0],
                last_name: userData.name.split(' ').slice(1).join(' ') || '',
                phone: userData.phone
            };
            
            const response = await api.post('/api/users/', payload);
            if (response?.data?.success || response?.data?.id) {
                setIsAddUserOpen(false);
                fetchUsers();
                alert('User created successfully');
            }
        } catch (error) {
            console.error('Failed to add user:', error);
            alert(error.response?.data?.message || 'Failed to add user');
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
            alert(error.response?.data?.message || 'Failed to delete user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            setSubmitting(true);
            const payload = {
                is_active: newStatus === 'Active'
            };
            
            await api.put(`/api/users/${userId}/`, payload);
            fetchUsers();
            setActiveActionDropdown(null);
            alert(`User status changed to ${newStatus}`);
        } catch (error) {
            console.error('Failed to change user status:', error);
            alert(error.response?.data?.message || 'Failed to change user status');
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
        name: '',
        email: '',
        phone: '',
        role: 'Teacher'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            setFormData({ name: '', email: '', phone: '', role: 'Teacher' });
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Add New User</h2>
                    <button onClick={onClose} className="close-btn"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                required
                                type="text"
                                className="form-control"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                required
                                type="email"
                                className="form-control"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                required
                                type="tel"
                                className="form-control"
                                placeholder="+1 234 567 890"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <div className="select-wrapper">
                                <select
                                    className="form-control"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
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
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn" style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color-light)' }} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UsersManagement;
