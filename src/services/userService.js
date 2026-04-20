import { api } from './api';

export const userService = {
    // ─── Users CRUD ──────────────────────────────────────────────
    getUsers: (params = {}) =>
        api.get('/api/users/', { params }),

    getUser: (id) =>
        api.get(`/api/users/${id}/`),

    createUser: (data) =>
        api.post('/api/users/', data),

    updateUser: (id, data) =>
        api.patch(`/api/users/${id}/`, data),

    deleteUser: (id) =>
        api.delete(`/api/users/${id}/`),

    // ─── User Actions ────────────────────────────────────────────
    getDashboardStats: () =>
        api.get('/api/users/dashboard_stats/'),

    getFilteredList: (params = {}) =>
        api.get('/api/users/filtered_list/', { params }),

    quickAction: (id, data) =>
        api.post(`/api/users/${id}/quick_actions/`, data),

    assignRoles: (userId, groupIds) =>
        api.post(`/api/users/${userId}/assign_roles/`, { group_ids: groupIds }),

    getUserPermissions: (userId) =>
        api.get(`/api/users/${userId}/user_permissions/`),

    assignPermissions: (userId, permissionIds) =>
        api.post(`/api/users/${userId}/user_permissions/`, { permission_ids: permissionIds }),

    // ─── Roles (Groups) CRUD ─────────────────────────────────────
    getRoles: () =>
        api.get('/api/roles/'),

    getRole: (id) =>
        api.get(`/api/roles/${id}/`),

    createRole: (data) =>
        api.post('/api/roles/', data),

    updateRole: (id, data) =>
        api.put(`/api/roles/${id}/`, data),

    deleteRole: (id) =>
        api.delete(`/api/roles/${id}/`),

    getRoleMembers: (id) =>
        api.get(`/api/roles/${id}/members/`),

    addRoleMembers: (id, userIds) =>
        api.post(`/api/roles/${id}/add_members/`, { user_ids: userIds }),

    removeRoleMembers: (id, userIds) =>
        api.post(`/api/roles/${id}/remove_members/`, { user_ids: userIds }),

    // ─── Permissions (read-only) ─────────────────────────────────
    getPermissions: () =>
        api.get('/api/permissions/'),

    // ─── Employee linking ────────────────────────────────────────
    getUnlinkedEmployees: (search = '') =>
        api.get('/workforce/api/employees/unlinked/', { params: search ? { search } : {} }),

    createEmployeeUserAccount: (employeeId) =>
        api.post(`/workforce/api/employees/${employeeId}/create-user-account/`),
};

export default userService;
