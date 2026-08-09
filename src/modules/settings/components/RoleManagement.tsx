import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Shield, Plus, Edit, Trash2, Users, Search, Check, X, ChevronDown,
    ChevronRight, Lock, AlertCircle, CheckCircle, RefreshCw, Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../components/common/Modal';
import { userService } from '../../../services/userService';
import { api } from '../../../services/api';

// Human-readable module name mapping
const MODULE_LABELS = {
    accounts: 'User Accounts',
    student_management: 'Admissions',
    student_settings: 'Student Settings',
    academics: 'Academics',
    workforce: 'Human Resources',
    finance: 'Finance',
    fees: 'Fees',
    payments: 'Payments',
    budgets: 'Budgets',
    invoicing: 'Invoicing',
    journals: 'Journals',
    payables: 'Payables',
    recruitment: 'Recruitment',
    course: 'Courses',
    quiz: 'Quizzes',
    result: 'Results',
    search: 'Search',
    core: 'Core System',
    auth: 'Authentication',
    contenttypes: 'Content Types',
    sessions: 'Sessions',
    admin: 'Admin',
    authtoken: 'API Tokens',
};

const RoleManagement = () => {
    const [isSuperuser, setIsSuperuser] = useState(false);
    const [roles, setRoles] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(null);
    const [seeding, setSeeding] = useState(false);

    // Form/Edit state
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', permissions: [] });
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Members modal
    const [membersRole, setMembersRole] = useState(null);
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    // Permission filter
    const [permSearch, setPermSearch] = useState('');
    const [expandedModules, setExpandedModules] = useState({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [rolesData, permsData] = await Promise.all([
                userService.getRoles(),
                userService.getPermissions(),
            ]);
            setRoles(rolesData.results || rolesData || []);
            setAllPermissions(permsData.results || permsData || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load roles');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Check if current user is superuser
    useEffect(() => {
        const checkSuperuser = async () => {
            try {
                const data = await api.getCurrentUser();
                const profile = data.success ? data.profile : data;
                setIsSuperuser(!!profile.is_superuser);
            } catch { /* not superuser */ }
        };
        checkSuperuser();
    }, []);

    // Group permissions by module
    const permissionsByModule = useMemo(() => {
        const grouped = {};
        const filtered = permSearch
            ? allPermissions.filter(p =>
                p.name.toLowerCase().includes(permSearch.toLowerCase()) ||
                p.codename.toLowerCase().includes(permSearch.toLowerCase()) ||
                (p.module || '').toLowerCase().includes(permSearch.toLowerCase())
            )
            : allPermissions;

        filtered.forEach(perm => {
            const mod = perm.module || 'other';
            if (!grouped[mod]) grouped[mod] = [];
            grouped[mod].push(perm);
        });

        // Sort modules alphabetically
        return Object.fromEntries(
            Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
        );
    }, [allPermissions, permSearch]);

    const toggleModule = (mod) => {
        setExpandedModules(prev => ({ ...prev, [mod]: !prev[mod] }));
    };

    const isPermSelected = (permId) => formData.permissions.includes(permId);

    const togglePerm = (permId) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permId)
                ? prev.permissions.filter(id => id !== permId)
                : [...prev.permissions, permId]
        }));
    };

    const toggleAllInModule = (mod) => {
        const modPermIds = (permissionsByModule[mod] || []).map(p => p.id);
        const allSelected = modPermIds.every(id => formData.permissions.includes(id));
        setFormData(prev => ({
            ...prev,
            permissions: allSelected
                ? prev.permissions.filter(id => !modPermIds.includes(id))
                : [...new Set([...prev.permissions, ...modPermIds])]
        }));
    };

    // ── CRUD ──────────────────────────────────────────────────
    const openCreateForm = () => {
        setEditingId(null);
        setFormData({ name: '', permissions: [] });
        setShowForm(true);
        setExpandedModules({});
    };

    const openEditForm = (role) => {
        setEditingId(role.id);
        setFormData({
            name: role.name,
            permissions: role.permissions || []
        });
        setShowForm(true);
        setExpandedModules({});
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Role name is required');
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await userService.updateRole(editingId, formData);
                toast.success('Role updated successfully');
            } else {
                await userService.createRole(formData);
                toast.success('Role created successfully');
            }
            setShowForm(false);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.name?.[0] || 'Failed to save role';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await userService.deleteRole(id);
            toast.success('Role deleted');
            setDeleteConfirm(null);
            fetchData();
        } catch (err) {
            toast.error('Failed to delete role');
        }
    };

    // ── Members ───────────────────────────────────────────────
    const openMembers = async (role) => {
        setMembersRole(role);
        setLoadingMembers(true);
        try {
            const data = await userService.getRoleMembers(role.id);
            setMembers(data.results || data || []);
        } catch (err) {
            toast.error('Failed to load members');
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            await userService.removeRoleMembers(membersRole.id, [userId]);
            toast.success('Member removed');
            setMembers(prev => prev.filter(m => m.id !== userId));
        } catch (err) {
            toast.error('Failed to remove member');
        }
    };

    const selectedPermCount = formData.permissions.length;

    const handleSeedRoles = async () => {
        setSeeding(true);
        try {
            const res = await api.post('/api/system/run-command/', { command: 'seed_roles' });
            toast.success(res.data?.output || 'Default roles seeded successfully!');
            await fetchData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Failed to seed roles');
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Roles & Permissions</h3>
                    <p className="text-sm text-gray-500">Define roles and assign granular permissions to control access across the system.</p>
                </div>
                <div className="flex items-center gap-3">
                    {isSuperuser && (
                        <button onClick={handleSeedRoles} disabled={seeding}
                            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                            {seeding ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                            {seeding ? 'Seeding...' : 'Seed Default Roles'}
                        </button>
                    )}
                    <button onClick={openCreateForm}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-sm">
                        <Plus size={16} /> New Role
                    </button>
                </div>
            </div>

            {/* Roles Grid */}
            {loading ? (
                <div className="py-16 text-center text-gray-400 text-sm">Loading roles...</div>
            ) : roles.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
                    <Shield size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">No roles defined yet</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first role to start assigning permissions</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map(role => (
                        <div key={role.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <Shield size={18} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{role.name}</h4>
                                        <p className="text-xs text-gray-400">{role.permissions?.length || 0} permissions</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditForm(role)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <Edit size={14} />
                                    </button>
                                    <button onClick={() => setDeleteConfirm(role)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <button onClick={() => openMembers(role)}
                                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                                    <Users size={14} />
                                    <span className="font-medium">{role.user_count || 0}</span> members
                                </button>
                                <button onClick={() => openEditForm(role)}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                    Edit Permissions →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Create/Edit Role Modal ──────────────────────── */}
            {showForm && (
                <Modal isOpen={true} onClose={() => setShowForm(false)}
                    title={editingId ? 'Edit Role' : 'Create New Role'}
                    subtitle={`Configure role name and permissions${selectedPermCount > 0 ? ` (${selectedPermCount} selected)` : ''}`}
                    icon={Shield} size="xl" accentColor="bg-indigo-500"
                    footer={
                        <>
                            <Modal.CancelButton onClick={() => setShowForm(false)} />
                            <Modal.SubmitButton onClick={handleSave} loading={saving}>
                                {editingId ? 'Update Role' : 'Create Role'}
                            </Modal.SubmitButton>
                        </>
                    }
                >
                    <div className="space-y-5">
                        {/* Role Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role Name *</label>
                            <input value={formData.name}
                                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-gray-900 text-sm font-medium"
                                placeholder="e.g. Finance Manager, Head Teacher" />
                        </div>

                        {/* Permissions Matrix */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-semibold text-gray-700">Permissions</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                        {selectedPermCount} / {allPermissions.length} selected
                                    </span>
                                </div>
                            </div>

                            {/* Permission Search */}
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input value={permSearch} onChange={e => setPermSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    placeholder="Filter permissions..." />
                            </div>

                            {/* Module Accordion */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
                                {Object.entries(permissionsByModule).map(([mod, perms]) => {
                                    const isExpanded = expandedModules[mod];
                                    const modLabel = MODULE_LABELS[mod] || mod.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                    const selectedInModule = perms.filter(p => formData.permissions.includes(p.id)).length;
                                    const allInModuleSelected = selectedInModule === perms.length;

                                    return (
                                        <div key={mod} className="border-b border-gray-100 last:border-b-0">
                                            <button onClick={() => toggleModule(mod)}
                                                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50/50 hover:bg-gray-100/60 transition-colors text-left">
                                                <div className="flex items-center gap-2">
                                                    {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                                                    <span className="text-sm font-semibold text-gray-700">{modLabel}</span>
                                                    <span className="text-xs text-gray-400">({perms.length})</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {selectedInModule > 0 && (
                                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                                                            {selectedInModule}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleAllInModule(mod); }}
                                                        className={`text-xs font-medium px-2 py-0.5 rounded-md transition-colors ${allInModuleSelected
                                                            ? 'text-red-600 hover:bg-red-50'
                                                            : 'text-indigo-600 hover:bg-indigo-50'
                                                        }`}>
                                                        {allInModuleSelected ? 'Deselect All' : 'Select All'}
                                                    </button>
                                                </div>
                                            </button>
                                            {isExpanded && (
                                                <div className="px-4 py-2 bg-white">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                                        {perms.map(perm => (
                                                            <button key={perm.id} onClick={() => togglePerm(perm.id)}
                                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all ${isPermSelected(perm.id)
                                                                    ? 'bg-indigo-50 text-indigo-800'
                                                                    : 'text-gray-600 hover:bg-gray-50'
                                                                }`}>
                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isPermSelected(perm.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                                                                    {isPermSelected(perm.id) && <Check size={10} className="text-white" />}
                                                                </div>
                                                                <span className="truncate">{perm.name}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ── Delete Confirm ──────────────────────────────── */}
            {deleteConfirm && (
                <Modal isOpen={true} onClose={() => setDeleteConfirm(null)}
                    title="Delete Role" size="sm" accentColor="bg-red-500"
                    footer={
                        <>
                            <Modal.CancelButton onClick={() => setDeleteConfirm(null)} />
                            <Modal.DangerButton onClick={() => handleDelete(deleteConfirm.id)}>
                                Delete Role
                            </Modal.DangerButton>
                        </>
                    }
                >
                    <div className="flex items-start gap-3 p-1">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                            <AlertCircle size={20} className="text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">
                                Are you sure you want to delete the role <strong>"{deleteConfirm.name}"</strong>?
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {deleteConfirm.user_count > 0
                                    ? `This role is assigned to ${deleteConfirm.user_count} user(s). They will lose these permissions.`
                                    : 'This action cannot be undone.'}
                            </p>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ── Members Modal ────────────────────────────────── */}
            {membersRole && (
                <Modal isOpen={true} onClose={() => setMembersRole(null)}
                    title={`Members — ${membersRole.name}`}
                    subtitle={`Users assigned to this role`}
                    icon={Users} size="md"
                    footer={<Modal.CancelButton onClick={() => setMembersRole(null)}>Close</Modal.CancelButton>}
                >
                    {loadingMembers ? (
                        <div className="py-12 text-center text-gray-400 text-sm">Loading...</div>
                    ) : members.length === 0 ? (
                        <div className="py-12 text-center">
                            <Users size={32} className="mx-auto mb-2 text-gray-300" />
                            <p className="text-gray-500 text-sm">No members in this role</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {members.map(user => (
                                <div key={user.id} className="flex items-center justify-between py-3 px-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                                            {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{user.full_name || user.username}</p>
                                            <p className="text-xs text-gray-400">{user.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveMember(user.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove from role">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
};

export default RoleManagement;
