import React, { useState, useEffect } from 'react';

import RoleStats from './components/RoleStats';
import RolesTable from './components/RolesTable';
import RolePermissionsMatrix from './components/RolePermissionsMatrix';
import RoleFormModal from './components/modals/RoleFormModal';
import PermissionFormModal from './components/modals/PermissionFormModal';
import AssignRoleModal from './components/modals/AssignRoleModal';
import UsersRoleAssignment from './components/UsersRoleAssignment';


import {
    Shield,
    Users,
    Key,
    Lock,
    Search,
    Filter,
    Plus,
    CheckSquare,
    Copy,
    Eye,
    AlertTriangle
} from 'lucide-react';

import { useAuth } from '../../auth/AuthProvider';
import { rolesService } from './services/rolesService';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';

const RolesManagement = () => {
    const { user } = useAuth();
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [permissionsByModule, setPermissionsByModule] = useState({});

    // Access Control
    const canAccess = user?.is_superuser;

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesData, permissionsData, usersResponse] = await Promise.all([
                rolesService.getRoles(),
                rolesService.getPermissions(),
                userService.getUsers({ limit: 100 }) // Fetch enough users for assignment
            ]);

            // Robust data extraction for roles
            let rolesList = [];
            if (Array.isArray(rolesData)) {
                rolesList = rolesData;
            } else if (rolesData && Array.isArray(rolesData.results)) {
                rolesList = rolesData.results;
            } else {
                console.warn("Unexpected roles data format:", rolesData);
                rolesList = [];
            }

            // Robust data extraction for users
            let usersList = [];
            if (Array.isArray(usersResponse)) {
                usersList = usersResponse;
            } else if (usersResponse && Array.isArray(usersResponse.users)) {
                usersList = usersResponse.users;
            } else if (usersResponse && Array.isArray(usersResponse.results)) {
                usersList = usersResponse.results;
            } else {
                usersList = [];
            }

            setRoles(rolesList);
            setPermissions(permissionsData);
            setUsers(usersList);
            setPermissionsByModule(rolesService.getPermissionsByModule(permissionsData));

            if (rolesList.length > 0) {
                // Try to keep selected role if it still exists, otherwise select first
                if (selectedRole) {
                    const stillExists = rolesList.find(r => r.id === selectedRole.id);
                    if (stillExists) setSelectedRole(stillExists);
                    else setSelectedRole(rolesList[0]);
                } else {
                    setSelectedRole(rolesList[0]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch roles data:", error);
            toast.error("Failed to load roles and permissions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (canAccess) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [canAccess]);


    // Role Management Functions
    const handleCreateRole = async (roleData) => {
        try {
            await rolesService.createRole(roleData);
            toast.success("Role created successfully");
            fetchData(); // Refresh data
            setShowRoleModal(false);
        } catch (error) {
            toast.error("Failed to create role");
        }
    };

    const handleUpdateRole = async (roleData) => {
        try {
            await rolesService.updateRole(selectedRole.id, roleData);
            toast.success("Role updated successfully");
            fetchData();
            setShowRoleModal(false);
        } catch (error) {
            toast.error("Failed to update role");
        }
    };

    const handleDeleteRole = async (roleId) => {
        if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
            try {
                await rolesService.deleteRole(roleId);
                toast.success("Role deleted successfully");
                fetchData();
            } catch (error) {
                toast.error("Failed to delete role");
            }
        }
    };

    const handleCloneRole = async (role) => {
        try {
            const newRoleData = {
                name: `${role.name} (Copy)`,
                permissions: role.permissions
            };
            await rolesService.createRole(newRoleData);
            toast.success("Role cloned successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to clone role");
        }
    };

    const handleCreatePermission = async (permissionData) => {
        // NOTE: Standard DRF ViewSet for Permission might be ReadOnly. 
        // If backend doesn't support creation, this will fail.
        // Assuming backend supports it or we restrict this.
        toast.error("Permission creation via UI is technically complex and restricted. Please define permissions in backend models.");
        setShowPermissionModal(false);
    };

    const handleUpdatePermissions = async (updatedPermissions) => {
        try {
            // updatedPermissions is list of IDs
            await rolesService.updateRole(selectedRole.id, { permissions: updatedPermissions });
            toast.success("Permissions updated");

            // Optimistic update
            setSelectedRole(prev => ({ ...prev, permissions: updatedPermissions }));
            setRoles(roles.map(r => r.id === selectedRole.id ? { ...r, permissions: updatedPermissions } : r));
        } catch (error) {
            toast.error("Failed to update permissions");
            fetchData(); // Revert on error
        }
    };

    const handleAssignRole = async (userId, roleId, assign) => {
        try {
            // We need to get the user's current roles (groups) first to add/remove
            const targetUser = users.find(u => u.id === userId);
            if (!targetUser) return;

            // Note: Users API usually returns roles as objects or IDs. 
            // My UserSerializer returns 'role' (string) and maybe not the raw groups list.
            // I need to ensure the user object has the group IDs.
            // For now, let's assume we fetch the user details or the list includes group IDs.
            // If checking fails, we might need a specific endpoint to "add user to group".

            // Since backend implementation of `assignUserRoles` in rolesService uses `groups` list replacement:
            let currentGroupIds = targetUser.groups || []; // Assuming 'groups' field exists

            let newGroupIds;
            if (assign) {
                newGroupIds = [...currentGroupIds, roleId];
            } else {
                newGroupIds = currentGroupIds.filter(id => id !== roleId);
            }

            // Using the service
            await rolesService.assignUserRoles(userId, newGroupIds);

            toast.success(assign ? "Role assigned" : "Role removed");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to assign role");
        }
    };

    // Access Denied View
    if (!canAccess) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
                <AlertTriangle size={64} className="text-warning mb-4" />
                <h2 className="mb-3">Access Restricted</h2>
                <p className="lead text-muted max-w-md mx-auto">
                    This page is restricted to Super Administrators only. <br />
                    Please contact your system administrator if you believe this is an error.
                </p>
                <button className="btn btn-primary mt-3" onClick={() => window.history.back()}>
                    Go Back
                </button>
            </div>
        );
    }

    // Filtering
    const safeRoles = Array.isArray(roles) ? roles : [];
    const filteredRoles = safeRoles.filter(role => {
        const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase());
        // Status filter might not be relevant for Groups unless Extended
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading Roles & Permissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="roles-management-wrapper">
            <div className="container-fluid py-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h2 mb-1">
                            <Shield size={28} className="me-2" />
                            Roles & Permissions Management
                        </h1>
                        <p className="text-muted mb-0">Manage system roles (groups) and permissions</p>
                    </div>
                    <div className="d-flex gap-2">
                        {/* Permission creation is often backend-code based, but kept for UI completeness if needed */}
                        {/* <button 
                            className="btn btn-outline-primary d-flex align-items-center"
                            onClick={() => setShowPermissionModal(true)}
                        >
                            <Plus size={18} className="me-2" />
                            Create Permission
                        </button> */}
                        <button
                            className="btn btn-primary d-flex align-items-center"
                            onClick={() => {
                                setSelectedRole(null);
                                setShowRoleModal(true);
                            }}
                        >
                            <Plus size={18} className="me-2" />
                            Create Role
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <RoleStats roles={roles} permissions={permissions} />

                {/* Filters */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <Search size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search roles..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6 text-end">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                    }}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* Left Panel - Roles List */}
                    <div className="col-lg-4 mb-4">
                        <div className="card h-100">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <Users className="me-2" size={20} />
                                    System Roles
                                </h5>
                                <span className="badge bg-primary">{filteredRoles.length} roles</span>
                            </div>
                            <div className="card-body p-0">
                                <RolesTable
                                    roles={filteredRoles}
                                    selectedRole={selectedRole}
                                    onSelectRole={setSelectedRole}
                                    onEditRole={(role) => {
                                        setSelectedRole(role);
                                        setShowRoleModal(true);
                                    }}
                                    onDeleteRole={handleDeleteRole}
                                    onCloneRole={handleCloneRole}
                                    onAssignPermissions={(role) => {
                                        setSelectedRole(role);
                                        setShowAssignModal(true);
                                    }}
                                />
                            </div>
                        </div>

                        {/* User Role Assignment Panel */}
                        <div className="card mt-4">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <Key className="me-2" size={20} />
                                    Quick Role Assignment
                                </h5>
                            </div>
                            <div className="card-body">
                                <UsersRoleAssignment
                                    users={users}
                                    roles={roles}
                                    onAssignRole={handleAssignRole}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Permission Matrix */}
                    <div className="col-lg-8">
                        {selectedRole ? (
                            <>
                                {/* Role Header */}
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <div className="d-flex align-items-center mb-2">
                                                    <h4 className="mb-0 me-3">{selectedRole.name}</h4>
                                                    <span className="badge bg-success">Active</span>
                                                </div>
                                                <div className="d-flex gap-4">
                                                    <div>
                                                        <small className="text-muted">Users</small>
                                                        <div className="h5 mb-0">{selectedRole.user_count || 0}</div>
                                                    </div>
                                                    <div>
                                                        <small className="text-muted">Permissions</small>
                                                        <div className="h5 mb-0">{selectedRole.permissions?.length || 0}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => setShowAssignModal(true)}
                                                    title="Assign to Users"
                                                >
                                                    <Users size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-outline-success btn-sm"
                                                    onClick={() => handleCloneRole(selectedRole)}
                                                    title="Clone Role"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-outline-warning btn-sm"
                                                    onClick={() => {
                                                        setShowRoleModal(true);
                                                    }}
                                                    title="Edit Role"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Permission Matrix */}
                                <div className="card">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">
                                            <CheckSquare className="me-2" size={20} />
                                            Permission Matrix
                                        </h5>
                                        <small className="text-muted">
                                            {selectedRole.permissions?.length || 0} permissions granted
                                        </small>
                                    </div>
                                    <div className="card-body">
                                        <RolePermissionsMatrix
                                            selectedRole={selectedRole}
                                            permissionsByModule={permissionsByModule}
                                            onUpdatePermissions={handleUpdatePermissions}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="card">
                                <div className="card-body text-center py-5">
                                    <Shield size={48} className="text-muted mb-3" />
                                    <h5>No Role Selected</h5>
                                    <p className="text-muted">Select a role from the list to view its permissions</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <RoleFormModal
                show={showRoleModal}
                onHide={() => setShowRoleModal(false)}
                role={selectedRole}
                onCreate={handleCreateRole}
                onUpdate={handleUpdateRole}
            />

            <PermissionFormModal
                show={showPermissionModal}
                onHide={() => setShowPermissionModal(false)}
                onCreate={handleCreatePermission}
                modules={Object.keys(permissionsByModule)}
                permissionTypes={['read', 'write', 'delete']}
            />

            <AssignRoleModal
                show={showAssignModal}
                onHide={() => setShowAssignModal(false)}
                users={users}
                roles={roles}
                selectedRole={selectedRole}
                onAssignRole={handleAssignRole}
            />
        </div>
    );
};

export default RolesManagement;

